import express from "express";
import {
  createGroup,
  getChatbyuser,
  updateGroupChat,
  deleteChat,
  addMessage,
  deleteMessage,
  updateMessage,
  addGroupAdmin,
  removeGroupAdmin,
  addGroupUser,
  removeGroupUser,
  getChatbyId,
  updateDp,
  createSingleChat,
  getGroupChatbyUser,
  getGroupChatbyId,
  getChat,
} from "../controllers/chatController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

//Single chat //
router.post("/createsinglechat", auth, createSingleChat);
router.get("/getchatbyuser", auth, getChatbyuser);
router.get("/getchatbyid/:id", auth, getChatbyId);
router.get("/getchat/:id", auth, getChat);
//group chat//
router.post("/creategroupchat", auth, createGroup);
router.put("/updategroupchat/:id", auth, updateGroupChat);
router.get("/getgroupchatbyuser", auth, getGroupChatbyUser);
router.get("/getgroupchatbyid/:id", auth, getGroupChatbyId);
router.put("/updatedp/:id", auth, updateDp);
router.post("/addmessage/:id", auth, addMessage);
router.delete("/deletemessage/:id", auth, deleteMessage);
router.put("/updatemessage/:id", auth, updateMessage);
router.post("/addadmin/:id", auth, addGroupAdmin);
router.delete("/removeadmin/:id", auth, removeGroupAdmin);
router.post("/adduser/:id", auth, addGroupUser);
router.put("/removeuser/:id", auth, removeGroupUser);

//common for both single and group chat//
router.delete("/deletechat/:id", auth, deleteChat);

export default router;
