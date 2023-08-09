import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";

export const createMessage = async (req, res) => {
  const message = req.body.message;
  const sendby = req.user.id;
  const chatId = req.params.id;
  if (!message) {
    return res.status(400).json({ message: "Message is required" });
  }
  try {
    const chat = await Chat.findById({ _id: chatId });
    if (!chat) {
      return res.status(400).json({ message: "Chat not found" });
    }
    if (chat) {
      if (!chat?.users?.includes(sendby)) {
        return res.status(400).json({ message: "You are not a authenticated person" });
      }
      const newMessage = new Message({
        message: message,
        sendby: sendby,
      });
      await newMessage.save();
      chat.lastMessage = newMessage._id;
      chat.messages.push(newMessage);
      await chat.save();
    }
    return res.status(200).json({ message: "Message sended successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateMessage = async (req, res) => {
  const chatId = req.params.id;
  const { message } = req.body;
  try {
    const messageUpdate = await Message.findByIdAndUpdate(
      chatId,
      { message: message },
      { new: true }
    );
    if (!messageUpdate) {
      return res.status(400).json({ message: "Message not found" });
    }
    return res.status(200).json({ message: "Message updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  const chatId = req.params.id;
  const messageId  = req.query.messageId;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(400).json({ message: "Chat not found" });
    }
    const index = chat.messages.indexOf(messageId);
    chat.messages.splice(index, 1);
    await chat.save();
    const result = await Message.findByIdAndDelete(messageId);
    return res.status(200).json({ message: "Message deleted successfully", result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMessage = async (req, res) => {
  const chatId = req.params.id;
  try {
    const message = await Message.findById(chatId);
    if (!message) {
      return res.status(400).json({ message: "Message not found" });
    }
    return res.status(200).json(message);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
