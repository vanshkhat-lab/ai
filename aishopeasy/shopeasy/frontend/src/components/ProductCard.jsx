import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ProductImage from "./ProductImage";
import "../css/productcard.css";

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const inStock = product.stock > 0;

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <article className="card">
      <Link className="card-image-link" to={`/product/${product._id}`}>
        <div className="card-image">
          <ProductImage product={product} />
          {!inStock && <span className="stock-badge">Out of stock</span>}
        </div>
      </Link>
      <div className="card-content">
        <p className="card-category">{product.category}</p>
        <h3>
          <Link to={`/product/${product._id}`}>{product.title}</Link>
        </h3>
        <div className="card-bottom">
          <p className="card-price">
            Rs {Number(product.price).toLocaleString("en-IN")}
          </p>
          <Link
            className="card-view"
            aria-label={`View ${product.title}`}
            to={`/product/${product._id}`}
          >
            →
          </Link>
        </div>
        <button
          className="cart-btn"
          disabled={!inStock}
          onClick={handleAddToCart}
          type="button"
        >
          {inStock ? "Add to cart" : "Unavailable"}
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
