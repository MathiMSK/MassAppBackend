import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";

//single chat//

export const createSingleChat = async (req, res) => {
  const { newUsers } = req.body;
  const user = req.user.id;
  let users = [newUsers, user];
  try {
    if (users.length > 2) {
      return res
        .status(400)
        .json({ message: "You can't create a chat with more than 2 users" });
    }
    if (users[0] === users[1]) {
      return res
        .status(400)
        .json({ message: "You can't create a chat with yourself" });
    }
    const chat = await Chat.findOne({ users: users, isGroup: false });
    if (chat) {
      return res
        .status(400)
        .json({ message: "You already have a chat with this user" });
    }
    const newChat = new Chat({
      users: users,
    });
    let saved = await newChat.save();
    let getChat = await Chat.findById(saved._id).populate("users");
    return res
      .status(200)
      .json({ message: "Chat created successfully", data: getChat });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getChatbyuser = async (req, res) => {
  const userId = req.user.id;
  try {
    const chats = await Chat.find({ users: userId })
      .populate("users", "name lastname username profilePicture")
      .populate("messages", "message sendby createdAt")
      .populate({
        path: "messages",
        populate: { path: "sendby", select: "_id username" },
      });
    if (!chats) {
      return res.status(400).json({ message: "Chats not found" });
    }
    let chat = chats.map((chat) => {
      let usering;
      if (chat.isGroup === false) {
        usering = chat.users.filter((user) => user._id.toString() !== userId);
      }
      if (chat.isGroup === true) {
        usering = chat.users.filter((user) => user._id.toString() === userId);
      }
      return {
        _id: chat._id,
        users: usering,
        groupName: chat.groupName,
        messages: chat.messages,
        updatedAt: chat.updatedAt,
        groupDp: chat.groupDp,
        isGroup: chat.isGroup,
      };
    });
    return res.status(200).json(chat);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getChat = async (req, res) => {
  const id = req.params.id;
  try {
    const chat = await Chat.findById({ _id: id })
      .populate("users", "name lastname username profilePicture")
      .populate("messages", "message sendby createdAt")
      .populate({
        path: "messages",
        populate: { path: "sendby", select: "_id username" },
      });
    if (!chat) {
      return res.status(400).json({ message: "Chat not found" });
    }
    return res.status(200).json(chat);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const getChatbyId = async (req, res) => {
  const chatId = req.params.id;
  const userId = req.user.id;
  try {
    const chat = await Chat.findById({ _id: chatId })
      .populate("users", "name lastname username profilePicture")
      .populate("messages", "message sendby createdAt")
      .populate({
        path: "messages",
        populate: { path: "sendby", select: "_id username" },
      });
    if (!chat) {
      return res.status(400).json({ message: "Chat not found" });
    }
    let forMap = [];
    forMap.push(chat);
    let chats = forMap?.map((chat) => {
      let usering;
      if (chat.isGroup === false) {
        usering = chat.users.filter((user) => user._id.toString() !== userId);
      }
      if (chat.isGroup === true) {
        usering = chat.users.filter((user) => user._id.toString() !== userId);
      }
      return {
        _id: chat._id,
        users: usering,
        messages: chat.messages,
        groupDp: chat.groupDp,
        groupAdmin:chat.groupAdmin
      };
    });
    return res.status(200).json(chats);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//group chat//

export const createGroup = async (req, res) => {
  const { groupName, users } = req.body;
  const groupCreator = req.user.id;
  let usersArray = [...users, groupCreator];
  console.log(users);
  if (users.length === 0)
    return res.status(400).json({ message: "Please add atleast one user" });
  try {
    const group = await Chat.findOne({ groupName: groupName });
    if (group) {
      return res.status(400).json({ message: "Group name already exists" });
    }
    const chat = new Chat({
      groupName: groupName,
      groupCreator: groupCreator,
      users: usersArray,
      isGroup: true,
    });

    await chat.save();
    return res.status(200).json({ message: "Group created successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getGroupChatbyUser = async (req, res) => {
  const userId = req.user.id;
  try {
    const chats = await Chat.find({ users: userId, isGroup: true })
      .populate("users", "name lastname username profilePicture")
      .populate("messages", "message sendby createdAt")
      .populate({
        path: "messages",
        populate: { path: "sendby", select: "_id username" },
      });
    if (!chats) {
      return res.status(400).json({ message: "Chats not found" });
    }
    // let forMap = [];
    // forMap.push(chat);
    let chat = chats.map((chat) => {
      let usering;
      if (chat.isGroup === true) {
        usering = chat.users.filter((user) => user._id.toString() !== userId);
      }
      return {
        _id: chat._id,
        users: usering,
        groupName: chat.groupName,
        messages: chat.messages,
        updatedAt: chat.updatedAt,
        groupDp: chat.groupDp,
        isGroup: chat.isGroup,
      };
    });
    return res.status(200).json(chat);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getGroupChatbyId = async (req, res) => {
  const chatId = req.params.id;
  const userId = req.user.id;
  try {
    const chats = await Chat.findById(chatId, { isGroup: true })
      .populate("users", "name lastname username profilePicture")
      .populate("messages", "message sendby createdAt")
      .populate({
        path: "messages",
        populate: { path: "sendby", select: "_id username" },
      })
      .populate("lastMessage")
      .populate("groupAdmin","username")
    if (!chats) {
      return res.status(400).json({ message: "Chats not found" });
    }
    let forMap = [];
    forMap.push(chats);
    let chat = forMap?.map((chat) => {
      let usering;
      if (chat.isGroup === true) {
        usering = chat.users.filter((user) => user._id.toString() !== userId);
      }
      console.log(chats);
      return {
        _id: chat._id,
        users: usering,
        groupAdmin:chat.groupAdmin,
        groupName: chat.groupName,
        messages: chat.messages,
        updatedAt: chat.updatedAt,
        groupDp: chat.groupDp,
        isGroup: chat.isGroup,
        lastMessage: chat.lastMessage,
      };
    });
    return res.status(200).json(chat);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateGroupChat = async (req, res) => {
  const groupId = req.params.id;
  const { groupName, users } = req.body;
  try {
    const chat = await Chat.findById(groupId);
    chat.groupName = groupName;
    chat.users = users;
    await chat.save();
    return res.status(200).json({ message: "Chat updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateDp = async (req, res) => {
  const groupId = req.params.id;
  const { groupDp } = req.body;
  try {
    const chat = await Chat.findById(groupId);
    chat.groupDp = groupDp;
    await chat.save();
    return res.status(200).json({ message: "Group dp updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const addGroupAdmin = async (req, res) => {
  const groupId = req.params.id;
  const { userId } = req.body;
  try {
    const chat = await Chat.findById(groupId);
    chat.groupAdmin.push(userId);
    await chat.save();
    return res.status(200).json({ message: "Group admin added successfully",chat:chat });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const removeGroupAdmin = async (req, res) => {
  const groupId = req.params.id;
  const { userId } = req.body;
  try {
    const chat = await Chat.findById(groupId);
    const index = chat.groupAdmin.indexOf(userId);
    chat.groupAdmin.splice(index, 1);
    await chat.save();
    return res
      .status(200)
      .json({ message: "Group admin removed successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const addGroupUser = async (req, res) => {
  const groupId = req.params.id;
  const userId = req.body.userId;
  if (userId === req.user.id) {
    return res.status(400).json({ message: "You can't add yourself" });
  }
  const chat = await Chat.findById(groupId);
  if (chat?.users?.includes(userId)) {
    return res.status(400).json({ message: "User already added" });
  }
  try {
    const chat = await Chat.findById(groupId);
    const iterator = userId.values();
    for (const data of iterator) {
      chat?.users?.push(data);
    }

    await chat.save();
    return res.status(200).json({ message: "Group user added successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const removeGroupUser = async (req, res) => {
  const groupId = req.params.id;
  const userId = req.body.userId;
  try {
    if (userId === req.user.id) {
      return res.status(400).json({ message: "You can't remove yourself" });
    }
    const chat = await Chat.findByIdAndUpdate(groupId);
    if (!chat) {
      return res.status(400).json({ message: "Chat not found" });
    }
    const iterator = userId.values();
    for (const data of iterator) {
      chat?.users?.pull(data);
    }
  
    await chat.save();
    return res.status(200).json({ message: "Group users removed successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const addMessage = async (req, res) => {
  const message = req.body.message;
  const sendby = req.user.id;
  const groupId = req.params.id;
  if (!message) {
    return res.status(400).json({ message: "Message is required" });
  }
  try {
    const chat = await Chat.findById({ _id: groupId });
    if (!chat) {
      return res.status(400).json({ message: "Chat not found" });
    }
    if (chat) {
      if (!chat.users.includes(sendby)) {
        return res
          .status(400)
          .json({ message: "You are not a member of this chat" });
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

export const deleteMessage = async (req, res) => {
  const groupId = req.params.id;
  const { messageId } = req.body;
  try {
    const chat = await Chat.findById(groupId);
    const index = chat.messages.indexOf(messageId);
    chat.messages.splice(index, 1);
    await chat.save();
    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateMessage = async (req, res) => {
  const groupId = req.params.id;
  const { messageId, message } = req.body;
  try {
    const chat = await Chat.findById(groupId);
    const index = chat.messages.indexOf(messageId);
    chat.messages[index] = message;
    const messageUpdate = await Message.findByIdAndUpdate(
      messageId,
      { message: message },
      { new: true }
    );
    if (!messageUpdate) {
      return res.status(400).json({ message: "Message not found" });
    }
    await chat.save();
    return res.status(200).json({ message: "Message updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//common for both single and group chat//

export const deleteChat = async (req, res) => {
  const groupId = req.params.id;
  try {
    await Chat.findByGroupIdAndDelete(groupId);
    return res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
