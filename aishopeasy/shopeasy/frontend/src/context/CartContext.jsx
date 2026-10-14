import { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";

const CartContext = createContext();

// Convert backend cart items → simple array for UI
const formatItems = (cartDoc) => {
  if (!cartDoc || !cartDoc.items) return [];

  return cartDoc.items.map((item) => ({
    _id: item.product, // product id (used in Cart / Checkout pages)
    title: item.title,
    price: item.price,
    image: item.image,
    quantity: item.quantity,
  }));
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartError, setCartError] = useState("");

  // Load cart from backend when app opens (if logged in)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchCart();
    }
  }, []);

  const fetchCart = async () => {
    try {
      const response = await API.get("/cart");
      setCart(formatItems(response.data));
      setCartError("");
    } catch (error) {
      setCartError(
        error.response?.data?.message ||
          "Your cart couldn't be refreshed. Please try again."
      );
    }
  };

  // After login → fetch THIS user's cart from MongoDB
  const loginUser = async () => {
    await fetchCart();
  };

  // Logout → clear token + empty screen cart
  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("cart");
    setCart([]);
    setCartError("");
  };

  // ADD to cart (saved in MongoDB)
  const addToCart = async (product) => {
    try {
      const response = await API.post("/cart", {
        productId: product._id,
        title: product.title,
        price: product.price,
        image: product.image,
      });
      setCart(formatItems(response.data.cart));
      setCartError("");
    } catch (error) {
      setCartError(
        error.response?.data?.message || "Could not add this item to your cart."
      );
    }
  };

  // REMOVE one item
  const removeFromCart = async (productId) => {
    try {
      const response = await API.delete(`/cart/${productId}`);
      setCart(formatItems(response.data.cart));
      setCartError("");
    } catch (error) {
      setCartError(error.response?.data?.message || "Could not remove this item.");
    }
  };

  // UPDATE quantity
  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await API.put(`/cart/${productId}`, { quantity });
      setCart(formatItems(response.data.cart));
      setCartError("");
    } catch (error) {
      setCartError(error.response?.data?.message || "Could not update your cart.");
    }
  };

  // CLEAR cart (after checkout)
  const clearCart = async () => {
    try {
      const response = await API.delete("/cart");
      setCart(formatItems(response.data.cart));
      setCartError("");
    } catch (error) {
      setCartError(error.response?.data?.message || "Could not clear your cart.");
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        cartError,
        clearCartError: () => setCartError(""),
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        loginUser,
        logoutUser,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
