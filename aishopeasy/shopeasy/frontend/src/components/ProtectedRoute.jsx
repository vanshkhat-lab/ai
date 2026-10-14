import { Navigate } from "react-router-dom";

// If no token, send user to Login page
function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
