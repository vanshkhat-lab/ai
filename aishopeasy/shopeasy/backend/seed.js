// Run with: npm run seed
// Products are matched by title and category so seeding is safe to repeat.

import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import Product from "./models/productModel.js";

dotenv.config();
await connectDB();

const sampleProducts = [
  {
    title: "Wireless Headphones",
    description: "Comfortable Bluetooth headphones with clear sound.",
    price: 1999,
    category: "Electronics",
    image: "/product-photos/headphones.jpg",
    stock: 25,
  },
  {
    title: "Smart Watch",
    description: "Track fitness, heart rate, and daily steps.",
    price: 3499,
    category: "Electronics",
    image: "/product-photos/watch.jpg",
    stock: 15,
  },
  {
    title: "Running Shoes",
    description: "Lightweight shoes for everyday running.",
    price: 2499,
    category: "Fashion",
    image: "/product-photos/running-shoes.jpg",
    stock: 40,
  },
  {
    title: "Coffee Mug",
    description: "Ceramic mug, 350ml, dishwasher safe.",
    price: 299,
    category: "Home",
    image: "/product-photos/mug.jpg",
    stock: 100,
  },
  {
    title: "Backpack",
    description: "Durable backpack with laptop compartment.",
    price: 1299,
    category: "Fashion",
    image: "/product-photos/backpack.jpg",
    stock: 30,
  },
  {
    title: "Desk Lamp",
    description: "LED desk lamp with adjustable brightness.",
    price: 899,
    category: "Home",
    image: "/product-photos/lamp.jpg",
    stock: 20,
  },
  {
    title: "Nova X5 Smartphone",
    description:
      "A modern smartphone with a bright display, all-day battery, and plenty of room for photos and apps.",
    price: 18999,
    category: "Electronics",
    image: "/product-photos/phone-1.jpg",
    stock: 18,
  },
  {
    title: "PixelWave 5G Phone",
    description:
      "A fast, everyday 5G phone with a crisp screen and a versatile camera.",
    price: 27999,
    category: "Electronics",
    image: "/product-photos/phone-2.jpg",
    stock: 12,
  },
  {
    title: "Men's Oxford Casual Shirt",
    description:
      "A comfortable button-down shirt in breathable cotton for workdays and weekends.",
    price: 1199,
    category: "Men's Clothing",
    image: "/product-photos/shirt.jpg",
    stock: 32,
  },
  {
    title: "Men's Everyday Denim Jacket",
    description:
      "A versatile denim layer with a classic fit and practical front pockets.",
    price: 2299,
    category: "Men's Clothing",
    image: "/product-photos/jacket.jpg",
    stock: 16,
  },
  {
    title: "Women's Floral Midi Dress",
    description:
      "A light, easy-to-style floral dress for relaxed days and special outings.",
    price: 1899,
    category: "Women's Clothing",
    image: "/product-photos/dress.jpg",
    stock: 21,
  },
  {
    title: "Women's Soft Knit Cardigan",
    description:
      "A cozy, versatile cardigan that layers comfortably through the seasons.",
    price: 1599,
    category: "Women's Clothing",
    image: "/product-photos/cardigan.jpg",
    stock: 19,
  },
  {
    title: "Kids' Colorful Building Blocks",
    description:
      "A colorful large-piece building set for creative play. Recommended for ages 3 and up.",
    price: 899,
    category: "Toys & Games",
    image: "/product-photos/blocks.jpg",
    stock: 28,
  },
  {
    title: "Plush Dinosaur Toy",
    description:
      "A soft, huggable dinosaur friend for playtime and bedtime. Recommended for ages 3 and up.",
    price: 649,
    category: "Toys & Games",
    image: "/product-photos/plush.jpg",
    stock: 24,
  },
  {
    title: "The Little Garden Adventure",
    description:
      "An illustrated storybook about friendship and discovery, perfect for a shared bedtime read.",
    price: 399,
    category: "Books",
    image: "/product-photos/book-1.jpg",
    stock: 35,
  },
  {
    title: "Mystery at Cedar Lane",
    description:
      "A page-turning neighborhood mystery full of curious clues and unexpected turns.",
    price: 549,
    category: "Books",
    image: "/product-photos/book-2.jpg",
    stock: 22,
  },
  {
    title: "Lightweight Running Shoes",
    description:
      "Breathable everyday trainers with a cushioned sole for walks, runs, and busy days.",
    price: 2799,
    category: "Footwear",
    image: "/product-photos/running-shoes.jpg",
    stock: 26,
  },
  {
    title: "Classic Canvas Sneakers",
    description:
      "Easy-to-wear canvas sneakers with a timeless profile and a comfortable fit.",
    price: 1699,
    category: "Footwear",
    image: "/product-photos/sneakers.jpg",
    stock: 30,
  },
  {
    title: "30W USB-C Fast Charger",
    description:
      "A compact 30W USB-C wall charger for compatible phones, tablets, and accessories.",
    price: 799,
    category: "Electronics",
    image: "/product-photos/charger.jpg",
    stock: 45,
  },
  {
    title: "Braided USB-C Charging Cable",
    description:
      "A durable 1.5-metre braided USB-C cable for charging and data transfer on compatible devices.",
    price: 349,
    category: "Electronics",
    image: "/product-photos/cable.jpg",
    stock: 60,
  },
  {
    title: "Pocket Power Bank 10000mAh",
    description:
      "A portable 10000mAh battery pack to help keep your devices charged while you are out.",
    price: 1499,
    category: "Electronics",
    image: "/product-photos/power-bank.jpg",
    stock: 20,
  },
];

try {
  if (mongoose.connection.readyState !== 1) {
    throw new Error("Could not connect to MongoDB. Check the backend database configuration.");
  }

  const results = await Product.bulkWrite(
    sampleProducts.map((product) => ({
      updateOne: {
        filter: { title: product.title, category: product.category },
        update: {
          $set: { image: product.image },
          $setOnInsert: Object.fromEntries(
            Object.entries(product).filter(([key]) => key !== "image")
          ),
        },
        upsert: true,
      },
    }))
  );

  console.log(
    `Catalog seeded: ${results.upsertedCount} new products added; existing matching products were kept.`
  );
} catch (error) {
  console.error(`Could not seed products: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
