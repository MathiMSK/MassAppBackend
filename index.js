import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import user from "./routers/userRouter.routes.js";
import video from "./routers/videoRouter.routes.js";
import chat from "./routers/chatRouter.routes.js";
import message from "./routers/messageRouter.routes.js";
import Chat from "./models/chatModel.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.set("strictQuery", false);
mongoose
  .connect("mongodb://127.0.0.1:27017/masssmedia")
  .then(() => console.log("You! Connected to MongoDB..."))
  .catch((err) =>
    console.error("Could not connect to MongoDB... " + err.message)
  );

app.get("/", (req, res) => {
  res.send("Welcome to Mass Media");
});

app.use("/api/user", user);
app.use("/api/video", video);
app.use("/api/message", message);
app.use("/api/chat", chat);

const port = process.env.PORT || 7373;
const server = app.listen(port, () => {
  console.log("Server connected to " + port);
});

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup",(userData) => {
    socket.join(userData?.id);
    console.log(`A user Connected ${userData?.id}`);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room)
    // console.log(`A user joined a chat ${room}`);
  });

  socket.on("new message", async(newMessageRecieved) => {
    var chat = await Chat.findById(newMessageRecieved?.data._id).populate("users").populate("lastMessage");
    if (!chat) return console.log("Chat not defined");
    chat?.users?.forEach((user) => {
      if (user?._id?.toString() == chat?.lastMessage?.sendby?.toString()) return;
      socket.in(user?._id).emit("message recieved", newMessageRecieved);
    });
  })

  // socket.on("typing", (room) => socket.in(room).emit("typing"));
  // socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
  // socket.on("disconnect", () => console.log("Disconnected from socket.io"));
  // socket.off("setup", () => {
  //   console.log("USER DISCONNECTED");
  //   socket.leave(userData._id);
  // });
});
