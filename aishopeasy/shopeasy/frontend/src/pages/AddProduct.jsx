import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../css/form.css";

function AddProduct() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [product, setProduct] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    image: "",
    stock: "",
  });

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const data = {
        ...product,
        price: Number(product.price),
        stock: Number(product.stock),
        image: product.image.trim() || undefined,
      };

      const response = await API.post("/products", data);
      const createdProduct = response.data.product;
      navigate(createdProduct?._id ? `/product/${createdProduct._id}` : "/");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "We couldn't add this product. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="product-form-page">
      <div className="product-form-intro">
        <span className="eyebrow">Grow your collection</span>
        <h1>Add a new product</h1>
        <p>Share the details so customers can discover and shop your product.</p>
      </div>
      <form className="product-form" onSubmit={handleSubmit}>
        {error && <p className="notice notice-error" role="alert">{error}</p>}
        <label>
          Product name
          <input
            autoComplete="off"
            maxLength="120"
            name="title"
            onChange={handleChange}
            placeholder="e.g. Everyday Canvas Backpack"
            required
            value={product.title}
          />
        </label>
        <label>
          Description
          <textarea
            maxLength="2000"
            name="description"
            onChange={handleChange}
            placeholder="What makes this product special?"
            required
            rows="5"
            value={product.description}
          />
        </label>
        <div className="form-row">
          <label>
            Price (Rs)
            <input
              min="0.01"
              name="price"
              onChange={handleChange}
              placeholder="0.00"
              required
              step="0.01"
              type="number"
              value={product.price}
            />
          </label>
          <label>
            Available stock
            <input
              min="0"
              name="stock"
              onChange={handleChange}
              placeholder="0"
              required
              step="1"
              type="number"
              value={product.stock}
            />
          </label>
        </div>
        <label>
          Category
          <input
            maxLength="80"
            name="category"
            onChange={handleChange}
            placeholder="e.g. Home, Fashion, Electronics"
            required
            value={product.category}
          />
        </label>
        <label>
          Product image URL <span className="optional-label">Optional</span>
          <input
            name="image"
            onChange={handleChange}
            placeholder="https://example.com/product-image.jpg"
            type="url"
            value={product.image}
          />
        </label>
        <div className="form-actions">
          <Link className="form-cancel" to="/">Cancel</Link>
          <button disabled={submitting} type="submit">
            {submitting ? "Adding product..." : "Add product"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default AddProduct;
