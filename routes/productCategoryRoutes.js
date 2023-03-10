import express from "express";

import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
import {
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
  getAllProductCategory,
  getSingleProductCategory,
} from "../controllers/productCategoryController.js";

const router = express.Router();

router.post("/", authMiddleware, isAdmin, createProductCategory);
router.get("/", getAllProductCategory);
router.put("/:id", authMiddleware, isAdmin, updateProductCategory);
router.delete("/:id", authMiddleware, isAdmin, deleteProductCategory);
router.get("/:id", getSingleProductCategory);

export default router;
