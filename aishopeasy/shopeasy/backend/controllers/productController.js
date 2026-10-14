import Product from "../models/productModel.js";

// CREATE - add a new product
const addProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({
      message: "Product Added Successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ ALL - get every product
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ ONE - get product by id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product Not Found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE - edit a product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // return updated document
    );

    if (!product) {
      return res.status(404).json({ message: "Product Not Found" });
    }

    res.status(200).json({
      message: "Product Updated Successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE - remove a product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product Not Found" });
    }

    res.status(200).json({ message: "Product Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
