import express from "express";
import auth, { adminOnly } from "../middleware/authMiddleware.js";
import {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

// Anyone logged in can view products
router.get("/", auth, getProducts);
router.get("/:id", auth, getProductById);

// Product management is restricted to administrators.
router.post("/", auth, adminOnly, addProduct);
router.put("/:id", auth, adminOnly, updateProduct);
router.delete("/:id", auth, adminOnly, deleteProduct);

export default router;
