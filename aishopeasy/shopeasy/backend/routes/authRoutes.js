import express from "express";
import auth from "../middleware/authMiddleware.js";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

// Public routes (no token needed)
router.post("/register", register);
router.post("/login", login);

// Protected route (token needed)
router.get("/profile", auth, (req, res) => {
  res.status(200).json({
    message: "Welcome to your profile",
    user: req.user,
  });
});

export default router;
