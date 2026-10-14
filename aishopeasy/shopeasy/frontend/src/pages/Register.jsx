import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../css/form.css";

function Register() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
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
      await API.post("/auth/register", user);
      navigate("/login");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "We couldn't create your account. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-page">
      <form onSubmit={handleSubmit}>
        <h2>Register</h2>
        {error && <p className="notice notice-error" role="alert">{error}</p>}
        <label>
          Name
          <input
            autoComplete="name"
            type="text"
            name="name"
            placeholder="Your name"
            value={user.name}
            onChange={handleChange}
            required
          />
        </label>
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
            autoComplete="new-password"
            minLength="6"
            type="password"
            name="password"
            placeholder="At least 6 characters"
            value={user.password}
            onChange={handleChange}
            required
          />
        </label>
        <button disabled={submitting} type="submit">
          {submitting ? "Creating account..." : "Create account"}
        </button>
        <p className="link-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
