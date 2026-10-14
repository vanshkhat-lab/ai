require("dotenv").config();
const mongoose = require("mongoose");
const SportsItem = require("../models/SportsItem");
const User = require("../models/User");

const products = [
  {
    name: "Professional Jersey",
    description: "Lightweight, breathable jersey for training and match day.",
    price: 469.99,
    stock: 20,
    category: "Apparel",
    image: "/uploads/starter-jersey.jpg",
  },
  {
    name: "Road Runner Shoes",
    description: "Cushioned everyday running shoes designed for comfortable miles.",
    price: 2499,
    stock: 12,
    category: "Running",
    image: "/uploads/starter-running-shoes.jpg",
  },
  {
    name: "Court Basketball",
    description: "Durable, grippy basketball for indoor and outdoor court sessions.",
    price: 899,
    stock: 15,
    category: "Basketball",
    image: "/uploads/starter-basketball.jpg",
  },
  {
    name: "Club Tennis Racket",
    description: "Balanced all-round racket for practice and club matches.",
    price: 1899,
    stock: 8,
    category: "Tennis",
    image: "/uploads/starter-tennis-racket.jpg",
  },
  {
    name: "Training Dumbbells",
    description: "Versatile hand weights for strength sessions at home or the gym.",
    price: 1299,
    stock: 10,
    category: "Fitness",
    image: "/uploads/starter-dumbbells.jpg",
  },
  {
    name: "Everyday Yoga Mat",
    description: "Comfortable, grippy mat for stretching, yoga and floor workouts.",
    price: 799,
    stock: 18,
    category: "Fitness",
    image: "/uploads/starter-yoga-mat.jpg",
  },
];

async function seedProducts() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from the backend environment.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const admin = await User.findOne({ role: "admin" }).sort({ createdAt: 1 });
  if (!admin) {
    throw new Error("No admin user exists. Create an admin account before seeding products.");
  }

  const added = [];
  const updated = [];

  for (const product of products) {
    const existing = await SportsItem.findOne({
      name: product.name,
      isActive: true,
    });

    if (existing) {
      if (existing.image !== product.image) {
        existing.image = product.image;
        await existing.save();
        updated.push(product.name);
      }
      continue;
    }

    await SportsItem.create({
      ...product,
      createdBy: admin._id,
    });
    added.push(product.name);
  }

  console.log(`Added ${added.length} products: ${added.join(", ") || "none"}`);
  console.log(`Updated product photos for ${updated.length} products: ${updated.join(", ") || "none"}`);
}

seedProducts()
  .catch((error) => {
    console.error(`Product seeding failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
