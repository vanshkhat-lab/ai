import Cart from "../models/cartModel.js";

// Helper: find cart or create one for this user
const findOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// GET /api/cart - get logged-in user's cart
const getCart = async (req, res) => {
  try {
    const cart = await findOrCreateCart(req.user.id);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/cart - add product to cart
const addToCart = async (req, res) => {
  try {
    const { productId, title, price, image } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const cart = await findOrCreateCart(req.user.id);

    // Check if product already in cart
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({
        product: productId,
        title,
        price,
        image,
        quantity: 1,
      });
    }

    await cart.save();

    res.status(200).json({
      message: "Added to cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/cart/:productId - update quantity
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await findOrCreateCart(req.user.id);
    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // If quantity < 1 → remove item
    if (quantity < 1) {
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );
    } else {
      item.quantity = quantity;
    }

    await cart.save();

    res.status(200).json({
      message: "Cart updated",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/cart/:productId - remove one item
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await findOrCreateCart(req.user.id);
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    res.status(200).json({
      message: "Item removed",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/cart - clear whole cart
const clearCart = async (req, res) => {
  try {
    const cart = await findOrCreateCart(req.user.id);
    cart.items = [];
    await cart.save();

    res.status(200).json({
      message: "Cart cleared",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
