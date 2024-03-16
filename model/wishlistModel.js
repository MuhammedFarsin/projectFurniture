const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  product_id: {
    type: ObjectId,
    required: true,
  },
  user_id: {
    type: ObjectId,
    default: null,
  },
  price: {
    type: Number,
    required: true,
  },
  inStock: {
      type: Boolean,
      required: true,
    // Add more stock details if needed
  },
});

module.exports = mongoose.model("Wishlist", wishlistSchema);
