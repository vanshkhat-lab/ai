const express = require("express");
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
} = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/all", protect, adminOnly, getAllOrders);
router.get("/:id", protect, getOrderById);

module.exports = router;
