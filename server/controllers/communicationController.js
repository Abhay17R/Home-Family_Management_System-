import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import Poll from "../models/pollModel.js";
import { User } from "../models/userModel.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { getSocketServerInstance } from "../socket/socket.js";
import mongoose from 'mongoose';

// @desc    Fetch chats, including a guaranteed family group and virtual 1-on-1 chats
export const getMyChats = catchAsyncError(async (req, res, next) => {
    const loggedInUser = req.user;
    if (!loggedInUser.familyId) return res.status(200).json({ success: true, chats: [] });

    // Get all family members including the current user
    const allFamilyMembers = await User.find({ familyId: loggedInUser.familyId }).select("name email avatar createdAt");
    const allFamilyMemberIds = allFamilyMembers.map(u => u._id);

    // Try to find the family group chat by custom property OR by being a group with all family members
    let familyGroupChat = await Chat.findOne({ 
        isGroupChat: true,
        $or: [
            { "customProperties.familyId": loggedInUser.familyId },
            { users: { $all: allFamilyMemberIds, $size: allFamilyMemberIds.length } }
        ]
    });

    // If still not found, create a new one
    if (!familyGroupChat) {
        familyGroupChat = await Chat.create({
            chatName: "Family Group",
            isGroupChat: true,
            users: allFamilyMemberIds,
            groupAdmin: loggedInUser._id,
            customProperties: { familyId: loggedInUser.familyId }
        });
    }

    // Populate the family group chat
    familyGroupChat = await Chat.findById(familyGroupChat._id)
        .populate("users", "-password")
        .populate({ 
            path: 'latestMessage',
            populate: { 
                path: 'sender', 
                select: 'name avatar' 
            } 
        });

    // Now, create virtual 1-on-1 chats for other family members (excluding the current user)
    const otherMembers = allFamilyMembers.filter(member => !member._id.equals(loggedInUser._id));
    const oneOnOneChatsPromises = otherMembers.map(async (member) => {
        // Try to find an existing 1-on-1 chat
        let chat = await Chat.findOne({
            isGroupChat: false,
            users: { $all: [loggedInUser._id, member._id], $size: 2 }
        })
        .populate("users", "-password")
        .populate({ 
            path: 'latestMessage',
            populate: { 
                path: 'sender', 
                select: 'name avatar' 
            } 
        });

        if (chat) {
            return chat;
        }

        // If no existing chat, create a virtual one (not saved in DB)
        return {
            _id: `virtual-${member._id}`,
            isVirtual: true,
            isGroupChat: false,
            users: [loggedInUser.toObject(), member.toObject()],
            chatName: member.name,
            latestMessage: null,
            createdAt: member.createdAt,
            updatedAt: member.createdAt
        };
    });

    const oneOnOneChats = await Promise.all(oneOnOneChatsPromises);

    // Combine the group chat and the 1-on-1 chats, then sort by update time
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
    const message = await Message.create({ sender: req.user._id, content: content, chat: targetChatId, familyId: req.user.familyId });
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
    
    // Trim and validate options
    const validOptions = options
        .map(opt => opt.trim())
        .filter(opt => opt !== '');
    
    if (!question || validOptions.length < 2) {
        return res.status(400).json({ message: "Question and at least 2 non-empty options required." });
    }
    
    const pollOptions = validOptions.map(opt => ({ text: opt, votes: [] }));
    
    const poll = await Poll.create({ 
        question, 
        options: pollOptions, 
        familyId: req.user.familyId, 
        createdBy: req.user._id 
    });
    
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

// @desc    Get detailed poll information with voters
// Get detailed poll information
export const getPollDetails = catchAsyncError(async (req, res, next) => {
    const { pollId } = req.params;
    
    // Validate poll ID format
    if (!mongoose.Types.ObjectId.isValid(pollId)) {
        return res.status(400).json({ message: "Invalid poll ID format" });
    }
    
    const poll = await Poll.findById(pollId)
        .populate('createdBy', 'name avatar')
        .populate('options.votes', 'name avatar');
    
    if (!poll) {
        return res.status(404).json({ message: "Poll not found" });
    }
    
    // Verify poll belongs to user's family
    if (poll.familyId !== req.user.familyId) {
        return res.status(403).json({ message: "You don't have permission to view this poll" });
    }
    
    res.status(200).json({ success: true, poll });
});


// @desc    Vote in a poll or change vote
export const voteInPoll = catchAsyncError(async (req, res, next) => {
    const { optionId } = req.body;
    const { pollId } = req.params;
    const userId = req.user._id;

    if (!optionId) return res.status(400).json({ message: "Option ID is required to vote." });
    
    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found." });
    
    // Remove user's vote from all options first
    poll.options.forEach(option => {
        option.votes.pull(userId);
    });
    
    // Add vote to the selected option
    const optionToVote = poll.options.id(optionId);
    if (!optionToVote) return res.status(404).json({ message: "Option not found in this poll." });
    
    optionToVote.votes.push(userId);
    await poll.save();
    
    const updatedPoll = await Poll.findById(pollId)
        .populate('createdBy', 'name avatar')
        .populate('options.votes', 'name avatar');
    
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

export const markChatAsRead = catchAsyncError(async (req, res, next) => {
    const { _id: userId } = req.user;
    const { chatId } = req.params;

    await Message.updateMany(
        { chat: chatId, readBy: { $ne: userId } },
        { $addToSet: { readBy: userId } }
    );

    res.status(200).json({
        success: true,
        message: "Messages marked as read."
    });
});