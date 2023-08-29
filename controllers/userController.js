import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/userModel.js";

dotenv.config();

//User routes//

export const reg = async (req, res) => {
  const saltRounds = 10;
  let username = req.body.username;
  if (!username)
    return res.status(400).json({ message: "please enter username" });
  if (!req.body.email)
    return res.status(400).json({ message: "please enter email" });
  if (!req.body.password)
    return res.status(400).json({ message: "please enter password" });
  let email = req.body.email;
  let exUserEmail = await User.findOne({ email: email });
  if (exUserEmail)
    return res.status(400).json({ message: "email already register" });
  let exName = await User.findOne({
    username: username,
  });
  if (exName) return res.status(400).json({ message: "Username already exists. Please Try Another" });

  bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
    try {
      let register = new User({
        username: username,
        email: email?.toLowerCase(),
        password: hash,
        profilePicture: req.body.profilePicture,
      });
      let userSaved = await register.save();
      res.status(201).json({ message: "Register success" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
};

export const login = async (req, res) => {
  let email = req.body.email?.toLowerCase();
  let password = req.body.password;
  let foundUser = await User.findOne({ email: email });
  if (!email)
    return res.status(400).json({ message: "please enter email" });
  if (!password)
    return res.status(400).json({ message: "please enter password" });
  if (foundUser) {
    bcrypt.compare(req.body.password, foundUser.password, (err, result) => {
      if (result) {
        try { 
          const token = jwt.sign({ id: foundUser?._id }, process.env.JWT, {
            expiresIn: "4h",
          });
          res.header("token", token).json({
            message: "login successfully",
            token: token,
            isOwner: foundUser.isOwner,
          });
        } catch (error) {
          res.status(400).json({ message: error.message });
        }
      } else {
        res.status(400).json({ message: "please enter correct password" });
      }
    });
  } else {
    res.status(404).json({ message: "user not found" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    let users = await User.find();
    res.status(200).json({ users });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateUserById = async (req, res) => {
  try {
    let user = await User.findByIdAndUpdate(
      req.params.id,
      {
        username: req.body.username,
        profilePicture: req.body.profilePicture,
      },
      { new: true }
    );
    res.status(200).json({ message: "Video updated", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteUserById = async (req, res) => {
  try {
    let user = await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//Owner routes//

export const OwnerReg = async (req, res) => {
  const saltRounds = 10;
  let username = req.body.username;
  if (!username)
    return res.status(400).json({ message: "please enter username" });
  if (!req.body.email)
    return res.status(400).json({ message: "please enter email" });
  if (!req.body.password)
    return res.status(400).json({ message: "please enter password" });
  let email = req.body.email;
  let exUserEmail = await User.findOne({ email: email });
  if (exUserEmail)
    return res.status(400).json({ message: "email already register" });
  let exName = await User.findOne({
    username: username,
  });
  if (exName)
    return res.status(400).json({ message: "username already exists. Please Try Another" });
  bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
    try {
      let register = new User({
        username: username,
        email: email?.toLowerCase(),
        password: hash,
        profilePicture: req.body.profilePicture,
        isOwner: true,
      });
      let user = await register.save();
      res.status(201).json({ message: "Register success" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
};

export const getOwner = async (req, res) => {
  try {
    let users = await User.find({ isOwner: true });
    res.status(200).json({ users });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//Profile routes//

export const Profile = async (req, res) => {
  try {
    const id = req.user._id;
    const view = await User.findById({ _id: id }).select("-password");
    if (!view) return res.status(404).json({ message: "user not found" });
    res.status(200).json({ data: view });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    let user = await User.findByIdAndUpdate(
      req.user.id,
      {
        profilePicture: req.body.profilePicture,
      },
      { new: true }
    );
    res.status(200).json({ message: "Profile updated", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//Follow routes//

export const followingUser = async (req, res) => {
  try {
    const followers = req.user.id;
    let check = await User.findOne({
      _id: req.params.id,
      followers: followers,
    });
    if (check) {
      return res.status(400).json({ message: "You already followed" });
    }
    let same = await User.findOne({ id: req.params.id });
    const sameUser = same?.following.find(
      (follow) => follow.toString() === req.params.id
    );
    if (sameUser) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }
    let user = await User.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $push: { followers: req.user.id },
      },
      { new: true }
    );
    if (user) {
      let follow = await User.findByIdAndUpdate(
        req.user.id,
        {
          $push: { following: req.params.id },
        },
        { new: true }
      );
    }
    res.status(200).json({ message: "Following added", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const unfollowingUser = async (req, res) => {
  try {
    let check = await User.findOne({
      _id: req.user.id,
      following: req.params.id,
    });
    if (!check) {
      return res.status(400).json({ message: "You already unfollowed" });
    }
    let user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $pull: { following: req.params.id },
      },
      { new: true }
    );
    if (user) {
      let follow = await User.findByIdAndUpdate(
        req.params.id,
        {
          $pull: { followers: req.user.id },
        },
        { new: true }
      );
    }
    res.status(200).json({ message: "user unFollowing you", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getFollowing = async (req, res) => {
  try {
    let user = await User.findOne({ $in: { following: req.user.id } });
    res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getFollowers = async (req, res) => {
  try {
    let user = await User.findOne({ $in: { followers: req.user.id } });
    res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
