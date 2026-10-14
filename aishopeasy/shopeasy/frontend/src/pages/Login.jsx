import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useCart } from "../context/CartContext";
import "../css/form.css";

function Login() {
  const navigate = useNavigate();
  const { loginUser } = useCart();

  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await API.post("/auth/login", user);

      // Save token (axios will send it on cart API calls)
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.user.id);
      localStorage.setItem("role", response.data.user.role);

      // Load this user's cart from MongoDB
      await loginUser();

      navigate("/");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "We couldn't sign you in. Please check your details and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-page">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <p className="notice notice-error" role="alert">{error}</p>}
        <label>
          Email
          <input
            autoComplete="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={user.email}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Password
          <input
            autoComplete="current-password"
            type="password"
            name="password"
            placeholder="Your password"
            value={user.password}
            onChange={handleChange}
            required
          />
        </label>
        <button disabled={submitting} type="submit">
          {submitting ? "Signing in..." : "Sign in"}
        </button>
        <p className="link-text">
          New user? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
