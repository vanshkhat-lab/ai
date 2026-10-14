import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ProductImage from "../components/ProductImage";
import "../css/cart.css";

function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } =
    useCart();

  // Empty cart UI
  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your cart is empty</h2>
        <Link to="/">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>My Cart</h1>
        <button className="clear-btn" onClick={clearCart}>
          Clear Cart
        </button>
      </div>

      {/* List of cart items */}
      {cart.map((item) => (
        <div className="cart-item" key={item._id}>
          <ProductImage product={item} />

          <div className="cart-info">
            <h3>{item.title}</h3>
            <p>Rs {item.price}</p>
          </div>

          <div className="qty-box">
            <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>
              -
            </button>
            <span>{item.quantity}</span>
            <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>
              +
            </button>
          </div>

          <p className="item-total">Rs {item.price * item.quantity}</p>

          <button
            className="remove-btn"
            onClick={() => removeFromCart(item._id)}
          >
            Remove
          </button>
        </div>
      ))}

      {/* Total + go to checkout */}
      <div className="cart-summary">
        <h2>Total: Rs {cartTotal}</h2>
        <Link className="checkout-btn" to="/checkout">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}

export default Cart;
