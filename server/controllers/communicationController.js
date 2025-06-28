import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import Poll from "../models/pollModel.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js"; // Assuming you have this

// @desc    Fetch all chats for the logged-in user
// @route   GET /api/communication/chats
export const getMyChats = catchAsyncError(async (req, res, next) => {
    let chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
        .populate("users", "-password") // userModel se 'password' chhodkar sab le aao
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({ updatedAt: -1 });
    
    // latestMessage ke sender ka data bhi populate karna hoga
    chats = await User.populate(chats, {
        path: "latestMessage.sender",
        select: "name avatar",
    });

    res.status(200).json({ success: true, chats });
});

// @desc    Get all messages for a single chat
// @route   GET /api/communication/messages/:chatId
export const getChatMessages = catchAsyncError(async (req, res, next) => {
    const messages = await Message.find({ chat: req.params.chatId })
        .populate("sender", "name avatar") // Message bhejne wale ka naam aur photo
        .populate("replyTo"); // Jisko reply kiya, uss message ka data

    res.status(200).json({ success: true, messages });
});


// @desc    Send a new message
// @route   POST /api/communication/messages
export const sendMessage = catchAsyncError(async (req, res, next) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        return res.status(400).json({ message: "Invalid data passed into request" });
    }

    let newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
    };

    let message = await Message.create(newMessage);
    
    // Populate karke bhejo taaki frontend me turant dikha sake
    message = await message.populate("sender", "name avatar");
    message = await message.populate("chat");
    message = await User.populate(message, { // Chat ke users ko bhi populate karlo
        path: "chat.users",
        select: "name avatar",
    });

    // Uss chat ka 'latestMessage' update karo
    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.status(201).json(message);
});

// @desc    Create a new poll
// @route   POST /api/communication/polls
export const createPoll = catchAsyncError(async (req, res, next) => {
    const { question, options, chatId } = req.body; // options should be an array of strings like ["Option 1", "Option 2"]

    if (!question || !options || options.length < 2 || !chatId) {
        return res.status(400).json({ message: "Please provide a question, at least 2 options, and a chat ID" });
    }

    const pollOptions = options.map(opt => ({ text: opt, votes: [] }));

    const poll = await Poll.create({
        question,
        options: pollOptions,
        chat: chatId,
        createdBy: req.user._id,
    });

    // TODO: Socket.io se naye poll ka event bhej sakte ho taaki sabko real-time me dikhe
    
    res.status(201).json({ success: true, poll });
});

// @desc    Add a pinned note to a chat
// @route   POST /api/communication/pins/:chatId
export const addPinnedNote = catchAsyncError(async (req, res, next) => {
    const { text } = req.body;
    const { chatId } = req.params;

    const chat = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: {
                pinnedNotes: { text, pinnedBy: req.user._id }
            }
        },
        { new: true } // Taaki updated document return ho
    ).populate("pinnedNotes.pinnedBy", "name");

    if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json({ success: true, pinnedNotes: chat.pinnedNotes });
});

// Baki ke functions (voteInPoll, getChatPolls) bhi isi tarah banenge
export const voteInPoll = catchAsyncError(async (req, res, next) => { /* Logic to vote */ });
export const getChatPolls = catchAsyncError(async (req, res, next) => { /* Logic to get polls */ });