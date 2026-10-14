import { useEffect, useState } from "react";

const productArtwork = [
  { match: /men'?s (clothing|oxford|everyday denim)/, image: "menswear.svg" },
  { match: /women'?s (clothing|floral|soft knit)/, image: "womenswear.svg" },
  { match: /toy|game|kids|children/, image: "toys.svg" },
  { match: /book/, image: "books.svg" },
  { match: /footwear|shoe/, image: "footwear.svg" },
  { match: /home|mug|lamp/, image: "home.svg" },
  { match: /fashion/, image: "fashion.svg" },
  { match: /sport/, image: "sports.svg" },
  { match: /electronic|phone|charger|cable|power bank|headphone|watch/, image: "electronics.svg" },
];

function getFallbackImage(product) {
  const details = `${product.category || ""} ${product.title || ""}`.toLowerCase();
  const artwork = productArtwork.find(({ match }) => match.test(details));
  return `${import.meta.env.BASE_URL}products/${artwork?.image || "product.svg"}`;
}

function ProductImage({ product, className, loading = "lazy" }) {
  const fallback = getFallbackImage(product);
  const [src, setSrc] = useState(product.image || fallback);

  useEffect(() => {
    setSrc(product.image || fallback);
  }, [product.image, fallback]);

  return (
    <img
      alt={product.title}
      className={className}
      loading={loading}
      onError={() => {
        if (src !== fallback) setSrc(fallback);
      }}
      src={src}
    />
  );
}

export default ProductImage;
