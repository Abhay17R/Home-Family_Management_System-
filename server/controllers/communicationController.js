import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import Poll from "../models/pollModel.js";
import { User } from "../models/userModel.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { getSocketServerInstance } from "../socket/socket.js";

// @desc    Fetch chats, including a guaranteed family group and virtual 1-on-1 chats
export const getMyChats = catchAsyncError(async (req, res, next) => {
    const loggedInUser = req.user;
    if (!loggedInUser.familyId) return res.status(200).json({ success: true, chats: [] });

    const familyMembers = await User.find({ familyId: loggedInUser.familyId, _id: { $ne: loggedInUser._id } }).select("name email avatar createdAt");

    let familyGroupChat = await Chat.findOne({ isGroupChat: true, "customProperties.familyId": loggedInUser.familyId });

    if (!familyGroupChat) {
        const allFamilyMemberIds = (await User.find({ familyId: loggedInUser.familyId }).select("_id")).map(u => u._id);
        familyGroupChat = await Chat.create({
            chatName: "Family Group", isGroupChat: true, users: allFamilyMemberIds, groupAdmin: loggedInUser._id,
            customProperties: { familyId: loggedInUser.familyId }
        });
    }

    familyGroupChat = await Chat.findById(familyGroupChat._id)
        .populate("users", "-password")
        .populate({ path: 'latestMessage', populate: { path: 'sender', select: 'name avatar' } });

    const oneOnOneChatsPromises = familyMembers.map(async (member) => {
        let chat = await Chat.findOne({ isGroupChat: false, users: { $all: [loggedInUser._id, member._id], $size: 2 }})
            .populate("users", "-password")
            .populate({ path: 'latestMessage', populate: { path: 'sender', select: 'name avatar' } });
        if (chat) return chat;
        return {
            _id: `virtual-${member._id}`, isVirtual: true, isGroupChat: false, users: [loggedInUser.toObject(), member.toObject()],
            chatName: member.name, latestMessage: null, createdAt: member.createdAt, updatedAt: member.createdAt
        };
    });
    const oneOnOneChats = await Promise.all(oneOnOneChatsPromises);
    const allChats = [familyGroupChat, ...oneOnOneChats].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    res.status(200).json({ success: true, chats: allChats });
});

// @desc    Get all messages for a specific chat
export const getChatMessages = catchAsyncError(async (req, res, next) => {
    const { chatId } = req.params;
    if (String(chatId).startsWith('virtual-')) return res.status(200).json({ success: true, messages: [] });
    const messages = await Message.find({ chat: chatId }).populate("sender", "name avatar").populate("replyTo");
    res.status(200).json({ success: true, messages });
});

// @desc    Send a new message
export const sendMessage = catchAsyncError(async (req, res, next) => {
    const { content, chatId, recipientId } = req.body;
    let targetChatId = chatId;
    let isNewChat = false;
    if (String(chatId).startsWith('virtual-')) {
        if (!recipientId) return res.status(400).json({ message: "Recipient ID is required." });
        const existingChat = await Chat.findOne({ isGroupChat: false, users: { $all: [req.user._id, recipientId], $size: 2 }});
        if (existingChat) {
            targetChatId = existingChat._id;
        } else {
            const newChat = await Chat.create({ isGroupChat: false, users: [req.user._id, recipientId] });
            targetChatId = newChat._id;
            isNewChat = true;
        }
    }
    if (!content || !targetChatId) return res.status(400).json({ message: "Invalid data." });
    const message = await Message.create({ sender: req.user._id, content: content, chat: targetChatId });
    const populatedMessage = await message.populate([{ path: "sender", select: "name avatar" }, { path: "chat", populate: { path: "users", select: "name email avatar" } }]);
    await Chat.findByIdAndUpdate(targetChatId, { latestMessage: populatedMessage._id });
    const io = getSocketServerInstance();
    if (req.user.familyId) {
        if (isNewChat) io.to(req.user.familyId).emit('virtual_chat_created', { virtualId: chatId, newChat: populatedMessage.chat });
        io.to(req.user.familyId).emit('new_message', populatedMessage);
    }
    res.status(201).json(populatedMessage);
});

// --- POLL CONTROLLERS ---
export const createPoll = catchAsyncError(async (req, res, next) => {
    const { question, options } = req.body;
    if (!question || !options || !Array.isArray(options) || options.length < 2) return res.status(400).json({ message: "Question and at least 2 options required." });
    const pollOptions = options.map(opt => ({ text: opt, votes: [] }));
    const poll = await Poll.create({ question, options: pollOptions, familyId: req.user.familyId, createdBy: req.user._id });
    const populatedPoll = await poll.populate("createdBy", "name avatar");
    const io = getSocketServerInstance();
    if(req.user.familyId) io.to(req.user.familyId).emit('new_poll', populatedPoll);
    res.status(201).json({ success: true, poll: populatedPoll });
});

export const getFamilyPolls = catchAsyncError(async (req, res, next) => {
    if (!req.user.familyId) return res.status(200).json({ success: true, polls: [] });
    const polls = await Poll.find({ familyId: req.user.familyId, isActive: true }).populate('createdBy', 'name avatar').populate('options.votes', 'name avatar').sort({ createdAt: -1 });
    res.status(200).json({ success: true, polls });
});

// @desc    Vote in a poll (IMPLEMENTED)
export const voteInPoll = catchAsyncError(async (req, res, next) => {
    const { optionId } = req.body;
    const { pollId } = req.params;
    const userId = req.user._id;

    if (!optionId) return res.status(400).json({ message: "Option ID is required to vote." });
    
    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found." });
    
    // Remove user's previous vote from all options to ensure they only vote once
    poll.options.forEach(option => {
        option.votes.pull(userId);
    });
    
    // Add user's new vote to the selected option
    const optionToVote = poll.options.id(optionId);
    if (!optionToVote) return res.status(404).json({ message: "Option not found in this poll." });
    
    optionToVote.votes.push(userId);
    
    await poll.save();
    
    // Populate the updated poll to send back to clients
    const updatedPoll = await Poll.findById(pollId).populate('createdBy', 'name avatar').populate('options.votes', 'name avatar');
    
    const io = getSocketServerInstance();
    if(req.user.familyId) io.to(req.user.familyId).emit('poll_updated', updatedPoll);
    
    res.status(200).json({ success: true, poll: updatedPoll });
});

// --- PINNED NOTES ---
export const addPinnedNote = catchAsyncError(async (req, res, next) => {
    const { text, chatId } = req.body;
    if (String(chatId).startsWith('virtual-')) return res.status(400).json({ message: "Cannot pin a note in an uninitiated chat." });
    if (!text) return res.status(400).json({ message: "Note text cannot be empty" });
    const chat = await Chat.findByIdAndUpdate(chatId, { $push: { pinnedNotes: { text, pinnedBy: req.user._id, pinnedAt: new Date() } } }, { new: true }).populate("pinnedNotes.pinnedBy", "name avatar");
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    const io = getSocketServerInstance();
    io.to(req.user.familyId).emit('pinned_notes_updated', { chatId: chatId, pinnedNotes: chat.pinnedNotes });
    res.status(200).json({ success: true, pinnedNotes: chat.pinnedNotes });
});