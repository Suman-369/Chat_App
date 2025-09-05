const chatModel = require("../models/chat.model");
const messageModel = require("../models/message.model");

async function createChat(req, res) {
    const title = req.body.title
    const user = req.user._id

    const chat = await chatModel.create({
        user,
        title
    })

    res.status(201).json({
        message: "Chat Created Successfully",
        chat: {
            _id: chat._id,
            user,
            title,
            lastActivity: chat.lastActivity
        }
    })
}

async function getChats(req, res) {
    const user = req.user._id;
    const chats = await chatModel.find({ user }).sort({ lastActivity: -1 });
    res.status(200).json({
        chats
    });
}

async function getMessages(req, res) {
    const chatId = req.params.id;
    const user = req.user._id;
    // Ensure the chat belongs to the user
    const chat = await chatModel.findOne({ _id: chatId, user });
    if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
    }
    const messages = await messageModel.find({ chat: chatId }).sort({ createdAt: 1 });
    res.status(200).json({
        messages
    });
}

module.exports = {
    createChat,
    getChats,
    getMessages
}
