import express from "express";
import auth from "../middleware/authMiddleware.js";
import { placeOrder, getMyOrders } from "../controllers/orderController.js";

const router = express.Router();

// Both routes need login (JWT token)
router.post("/", auth, placeOrder);
router.get("/my-orders", auth, getMyOrders);

export default router;
