import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "User not found",
        });
      }

      return next();
    } catch (error) {
      console.log(error);

      return res.status(401).json({
        success: false,
        error: "Not authorized, token failed",
      });
    }
  }

  return res.status(401).json({
    success: false,
    error: "Not authorized, no token",
  });
};

export default protect;