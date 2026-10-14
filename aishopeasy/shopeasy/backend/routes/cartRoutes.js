import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";

const router = express.Router();

// All cart routes need login
router.get("/", auth, getCart);
router.post("/", auth, addToCart);
router.put("/:productId", auth, updateCartItem);
router.delete("/:productId", auth, removeFromCart);
router.delete("/", auth, clearCart);

export default router;
