import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
  try {
    let token = req.header("token");
    if (!token)
      return res.status(400).json({ message: "Invalid Authentication" });
    const decoded = jwt.verify(token, process.env.JWT);
    if (!decoded) return res.status(400).json({ message: "Token invalid" });
    let user = await User.findOne({ _id: decoded.id });
    req.user = user;   
    next();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default auth;
