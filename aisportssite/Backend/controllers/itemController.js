const SportsItem = require("../models/SportsItem");

const resolveItemImage = (req) => {
  if (req.file) {
    return `/uploads/${req.file.filename}`;
  }

  const imageUrl =
    typeof req.body.imageUrl === "string"
      ? req.body.imageUrl.trim()
      : typeof req.body.image === "string"
        ? req.body.image.trim()
        : "";

  if (!imageUrl) {
    return null;
  }

  try {
    const parsedUrl = new URL(imageUrl);
    if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
      return imageUrl;
    }
  } catch {
    return null;
  }

  return null;
};

const createItem = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

    if (!name || !description || !price) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, description, and price",
      });
    }

    const image = resolveItemImage(req);
    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Please upload an item image or provide a valid HTTP(S) image URL",
      });
    }

    const item = await SportsItem.create({
      name,
      description,
      price: Number(price),
      stock: stock ? Number(stock) : 1,
      category: category || "General",
      image,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Sports item created successfully",
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllItems = async (_req, res) => {
  try {
    const items = await SportsItem.find({ isActive: true })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getItemById = async (req, res) => {
  try {
    const item = await SportsItem.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!item || !item.isActive) {
      return res.status(404).json({
        success: false,
        message: "Sports item not found",
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await SportsItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Sports item not found",
      });
    }

    const { name, description, price, stock, category, isActive } = req.body;
    const imageInputProvided =
      req.file ||
      (typeof req.body.image === "string" && req.body.image.trim()) ||
      (typeof req.body.imageUrl === "string" && req.body.imageUrl.trim());
    const image = imageInputProvided ? resolveItemImage(req) : null;

    if (imageInputProvided && !image) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid HTTP(S) image URL or upload an image file",
      });
    }

    if (name) item.name = name;
    if (description) item.description = description;
    if (price !== undefined) item.price = Number(price);
    if (stock !== undefined) item.stock = Number(stock);
    if (category) item.category = category;
    if (isActive !== undefined) item.isActive = isActive === "true" || isActive === true;
    if (image) item.image = image;

    await item.save();

    res.status(200).json({
      success: true,
      message: "Sports item updated successfully",
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await SportsItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Sports item not found",
      });
    }

    item.isActive = false;
    await item.save();

    res.status(200).json({
      success: true,
      message: "Sports item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
};
