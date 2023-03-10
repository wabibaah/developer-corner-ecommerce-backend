import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    // images: {
    //   type: Array,
    // },
    images: [],
    color: {
      type: String,
      required: true,
    },
    ratings: [
      // this is an object with stars and posted by as inside the object / you don't need to break your mongdb database for even huge changes because we kept adding to this model and nothing happens
      {
        star: Number,
        comment: String, // try and work on making it required from the backend too(not just the frontend)
        postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    brand: {
      type: String,
      required: true,
    },
    sold: {
      type: Number,
      default: 0,
      select: false,
    },
    totalRating: {
      type: String,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
