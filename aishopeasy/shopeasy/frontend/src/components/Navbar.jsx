import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../css/navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("role") === "admin";
  const { cartCount, cartError, clearCartError, logoutUser } = useCart();

  const logout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <>
      <nav className="site-nav">
        <Link aria-label="ShopEasy home" className="brand" to="/">
        <span className="brand-mark" aria-hidden="true">S</span>
        <span>ShopEasy</span>
        </Link>
        <div className="nav-links">
        {token ? (
          <>
            <Link to="/">Home</Link>
            {isAdmin && <Link to="/add-product">Add product</Link>}
            <Link to="/cart">
              Cart <span className="cart-count">{cartCount}</span>
            </Link>
            <Link to="/orders">Orders</Link>
            <button className="nav-logout" onClick={logout} type="button">
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link className="nav-register" to="/register">Create account</Link>
          </>
        )}
        </div>
      </nav>
      {cartError && (
        <div className="global-cart-error" role="alert">
        <span>{cartError}</span>
        <button
          aria-label="Dismiss cart message"
          onClick={clearCartError}
          type="button"
        >
          ×
        </button>
        </div>
      )}
    </>
  );
}

export default Navbar;
