import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  productRating,
  uploadImages,
  addToWishList,
} from "../controllers/productController.js";

import { productImgResize, uploadPhoto } from "../middlewares/uploadImages.js";

import { isAdmin, authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, isAdmin, createProduct);
router.get("/", getAllProducts);
router.put("/wishlist", authMiddleware, addToWishList);
router.put("/rating", authMiddleware, productRating);
router.put(
  "/upload/:id",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 10),
  productImgResize,
  uploadImages
);
router.get("/:id", getSingleProduct);
router.put("/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);

export default router;
