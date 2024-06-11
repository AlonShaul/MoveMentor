import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  if (!token) return res.status(401).json("Not authenticated");

  jwt.verify(token, "jwtkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid");

    try {
      const user = await User.findById(userInfo.id);
      if (!user) return res.status(403).json("User not found");

      req.user = user;
      next();
    } catch (error) {
      return res.status(500).json("Server error");
    }
  });
};

export const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json("Access denied, admin only");
  }
  next();
};
