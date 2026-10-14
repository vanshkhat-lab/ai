const Order = require("../models/Order");
const SportsItem = require("../models/SportsItem");

const createOrder = async (req, res) => {
  try {
    const { itemId, quantity = 1, shippingAddress } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Please provide itemId",
      });
    }

    const item = await SportsItem.findById(itemId);

    if (!item || !item.isActive) {
      return res.status(404).json({
        success: false,
        message: "Sports item not found",
      });
    }

    const orderQuantity = Number(quantity) || 1;

    if (item.stock < orderQuantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${item.stock} available`,
      });
    }

    const totalPrice = item.price * orderQuantity;

    const order = await Order.create({
      user: req.user._id,
      item: item._id,
      quantity: orderQuantity,
      totalPrice,
      shippingAddress: shippingAddress || {},
    });

    item.stock -= orderQuantity;
    await item.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "name email")
      .populate("item", "name price image");

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: populatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("item", "name price image description")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllOrders = async (_req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("item", "name price image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("item", "name price image description");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
};
