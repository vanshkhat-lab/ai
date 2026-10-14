const express = require("express");
const {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/", getAllItems);
router.get("/:id", getItemById);

router.post("/", protect, adminOnly, upload.single("image"), createItem);
router.put("/:id", protect, adminOnly, upload.single("image"), updateItem);
router.delete("/:id", protect, adminOnly, deleteItem);

module.exports = router;
