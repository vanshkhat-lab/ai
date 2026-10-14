import jwt from "jsonwebtoken";

// Check if request has a valid JWT token
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Token should look like: "Bearer eyJhbGciOi..."
  if (!authHeader) {
    return res.status(401).json({ message: "No Token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // save user info for next functions
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid Token" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};

export { adminOnly };
export default auth;
