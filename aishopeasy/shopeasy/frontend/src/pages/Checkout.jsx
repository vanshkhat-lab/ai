import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useCart } from "../context/CartContext";
import "../css/cart.css";
import "../css/form.css";

function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If cart empty, send user back
  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <h2>No items to checkout</h2>
        <Link to="/">Go to Home</Link>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // Prepare order data for backend
      const orderData = {
        name: form.name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        totalAmount: cartTotal,
        items: cart.map((item) => ({
          productId: item._id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
      };

      const response = await API.post("/orders", orderData);

      await clearCart();
      navigate("/orders", {
        state: { confirmation: response.data.message },
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "We couldn't place your order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      {/* Left: order summary */}
      <div className="checkout-summary">
        <h2>Order Summary</h2>
        {cart.map((item) => (
          <div className="summary-row" key={item._id}>
            <span>
              {item.title} x {item.quantity}
            </span>
            <span>Rs {item.price * item.quantity}</span>
          </div>
        ))}
        <h3>Total: Rs {cartTotal}</h3>
      </div>

      {/* Right: shipping form */}
      <div className="form-page checkout-form">
        <form onSubmit={handleSubmit}>
          <h2>Shipping Details</h2>
          {error && <p className="notice notice-error" role="alert">{error}</p>}
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <textarea
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            required
          />
          <button disabled={submitting} type="submit">
            {submitting ? "Placing order..." : "Place order"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Checkout;
