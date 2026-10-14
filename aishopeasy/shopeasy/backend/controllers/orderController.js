import Order from "../models/orderModel.js";

// CREATE order (checkout)
const placeOrder = async (req, res) => {
  try {
    const { items, name, phone, address, city, totalAmount } 
    = req.body;

    // Basic validation
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (!name || !phone || !address || !city) {
      return res.status(400)
     .json({ message: "Please fill all shipping details" });
    }

    const order = await Order.create({
      user: req.user.id, // comes from JWT middleware
      items,
      name,
      phone,
      address,
      city,
      totalAmount,
    });

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ - get logged-in user's orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find
    ({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { placeOrder, getMyOrders };
