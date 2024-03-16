const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const moment = require("moment");

// creating order schema
const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  address: {
    city: {
      type: String,
      required: true,
    },
    zipcode: {
      type: Number,
      required: true,
    },
    streetAddress: {
      type: String,
      required: true,
    },
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  status: {
    type: String,
    default: 'Pending'  
  },
  payment: {
    type: String,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    default: () => moment().format("ddd, MMM D, YYYY, h:mmA"),
  },
  createdOn: {
    type: Date,
    default: new Date(),
  },
});

module.exports = mongoose.model("Orders", orderSchema);
