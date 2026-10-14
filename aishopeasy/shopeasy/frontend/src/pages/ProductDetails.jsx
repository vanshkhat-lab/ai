import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import { useCart } from "../context/CartContext";
import ProductImage from "../components/ProductImage";
import "../css/details.css";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const isAdmin = localStorage.getItem("role") === "admin";

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    API.get(`/products/${id}`)
      .then((response) => {
        if (active) setProduct(response.data);
      })
      .catch((requestError) => {
        if (active) {
          setProduct(null);
          setError(
            requestError.response?.data?.message ||
              "We couldn't load this product."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleAddToCart = async () => {
    setActionError("");
    try {
      await addToCart(product);
    } catch (requestError) {
      setActionError(
        requestError.response?.data?.message || "Could not add this product."
      );
    }
  };

  const deleteProduct = async () => {
    const ok = window.confirm("Delete this product?");
    if (!ok) return;

    try {
      await API.delete(`/products/${id}`);
      navigate("/");
    } catch (requestError) {
      setActionError(
        requestError.response?.data?.message || "Could not delete this product."
      );
    }
  };

  if (loading) {
    return <p className="loading" role="status">Loading product...</p>;
  }

  if (!product) {
    return (
      <main className="product-not-found">
        <h1>Product unavailable</h1>
        <p>{error || "This product could not be found."}</p>
        <Link to="/">Back to the collection</Link>
      </main>
    );
  }

  return (
    <main className="details-page">
      <Link className="details-back" to="/">← Back to collection</Link>
      <section className="details">
        <div className="details-image">
          <ProductImage product={product} loading="eager" />
        </div>
        <div className="details-copy">
          <p className="category">{product.category}</p>
          <h1>{product.title}</h1>
          <p className="description">{product.description}</p>
          <h2 className="price">Rs {Number(product.price).toLocaleString("en-IN")}</h2>
          <p className={`stock ${product.stock > 0 ? "in-stock" : "out-stock"}`}>
            {product.stock > 0
              ? `${product.stock} available`
              : "Currently out of stock"}
          </p>
          {actionError && (
            <p className="notice notice-error" role="alert">{actionError}</p>
          )}
          <div className="actions">
            <button
              className="add-cart"
              disabled={product.stock < 1}
              onClick={handleAddToCart}
              type="button"
            >
              {product.stock > 0 ? "Add to cart" : "Out of stock"}
            </button>
            {isAdmin && (
              <button className="delete" onClick={deleteProduct} type="button">
                Delete product
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default ProductDetails;
