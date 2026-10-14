import mongoose from "mongoose";

// One order = customer info + list of products bought
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Snapshot of cart items at checkout time
    items: [
      {
        productId: String,
        title: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],
    // Shipping / customer details
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    // Money
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
