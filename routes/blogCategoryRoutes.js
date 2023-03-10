import express from "express";

import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
import {
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  getAllBlogCategory,
  getSingleBlogCategory,
} from "../controllers/blogCategoryController.js";

const router = express.Router();

router.post("/", authMiddleware, isAdmin, createBlogCategory);
router.get("/", getAllBlogCategory);
router.put("/:id", authMiddleware, isAdmin, updateBlogCategory);
router.delete("/:id", authMiddleware, isAdmin, deleteBlogCategory);
router.get("/:id", getSingleBlogCategory);

export default router;
