const jwt = require("jsonwebtoken");
const User = require("../models/User/user");
const dotenv = require("dotenv");

dotenv.config({ path: ".././src/config/config.env" });

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ success: false, message: "Not logged in" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded._id);
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const isAdmin = async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
}

const isModerator = async (req, res, next) => {
  if (req.user.role !== "moderator") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
}

const isUser = async (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
}

module.exports = {isAuthenticated, isAdmin, isModerator, isUser};
