import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import API from "../services/api";
import "../css/cart.css";

function Orders() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    API.get("/orders/my-orders")
      .then((response) => {
        if (active) setOrders(response.data);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "We couldn't load your order history."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <p className="cart-empty" role="status">Loading orders...</p>;
  }

  if (error) {
    return (
      <div className="cart-empty" role="alert">
        <h2>Order history unavailable</h2>
        <p>{error}</p>
        <Link to="/">Return to the shop</Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="cart-empty">
        <h2>No orders yet</h2>
        <Link to="/">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1>My Orders</h1>
      {location.state?.confirmation && (
        <p className="order-confirmation" role="status">
          {location.state.confirmation}
        </p>
      )}

      {orders.map((order) => (
        <div className="order-card" key={order._id}>
          <div className="order-top">
            <p>
              <strong>Order placed:</strong>{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <span className="status">{order.status}</span>
          </div>

          <p>
            <strong>Name:</strong> {order.name}
          </p>
          <p>
            <strong>Address:</strong> {order.address}, {order.city}
          </p>
          <p>
            <strong>Phone:</strong> {order.phone}
          </p>

          <div className="order-items">
            {order.items.map((item, index) => (
              <p key={index}>
                {item.title} x {item.quantity} — Rs {item.price * item.quantity}
              </p>
            ))}
          </div>

          <h3>Total: Rs {order.totalAmount}</h3>
        </div>
      ))}
    </div>
  );
}

export default Orders;
