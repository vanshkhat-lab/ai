import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import ProductCard from "../components/ProductCard";
import heroImage from "../assets/hero.png";
import "../css/home.css";
import "../css/productcard.css";

function Home() {
  const isAdmin = localStorage.getItem("role") === "admin";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    let active = true;

    const getProducts = async () => {
      try {
        const response = await API.get("/products");
        if (active) setProducts(response.data);
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "We couldn't load the catalog. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    getProducts();
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => ["All", ...new Set(products.map((product) => product.category))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;
      const matchesSearch =
        !query ||
        `${product.title} ${product.description} ${product.category}`
          .toLowerCase()
          .includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [products, search, selectedCategory]);

  if (loading) {
    return (
      <main className="catalog-page">
        <p className="empty" role="status">Loading the catalog...</p>
      </main>
    );
  }

  return (
    <main className="catalog-page">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">A little something for every day</span>
          <h1>Find your next favorite thing.</h1>
          <p>
            Discover thoughtfully picked finds, shop with ease, and get the
            things you love delivered to your door.
          </p>
          <a className="hero-cta" href="#catalog">Explore the collection</a>
        </div>
        <div className="hero-art">
          <img src={heroImage} alt="A colorful stack of books" />
          <div className="hero-note">
            <span>Good things</span>
            <strong>start here.</strong>
          </div>
        </div>
      </section>

      <section className="catalog-section" id="catalog">
        <div className="catalog-heading">
          <div>
            <span className="eyebrow">The collection</span>
            <h2>Shop all products</h2>
          </div>
          {isAdmin && (
            <Link className="add-product-link" to="/add-product">
              <span aria-hidden="true">+</span> Add a product
            </Link>
          )}
        </div>

        <div className="catalog-tools">
          <label className="search-box">
            <span className="visually-hidden">Search products</span>
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search by name or category"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <div className="category-list" aria-label="Filter by category">
            {categories.map((category) => (
              <button
                className={selectedCategory === category ? "active" : ""}
                key={category}
                onClick={() => setSelectedCategory(category)}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="notice notice-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">✳</span>
            <h3>Your collection starts here</h3>
            <p>
              {isAdmin
                ? "Add a product to start building your storefront."
                : "Please check back soon for new products."}
            </p>
            {isAdmin && <Link to="/add-product">Add your first product</Link>}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try another search or choose a different category.</p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p className="results-count">
              Showing {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"}
            </p>
            <div className="products">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default Home;
