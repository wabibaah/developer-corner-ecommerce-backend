import express from "express";

import {
  createBlog,
  getSingleBlog,
  updateBlog,
  getAllBlogs,
  deleteBlog,
  likeBlog,
  dislikeBlog,
  uploadImages,
} from "../controllers/blogController.js";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
import { blogImgResize, uploadPhoto } from "../middlewares/uploadImages.js";

const router = express.Router();

router.post("/", authMiddleware, isAdmin, createBlog);
router.get("/", getAllBlogs);
router.put("/likes", authMiddleware, likeBlog);
router.put("/dislikes", authMiddleware, dislikeBlog);
router.put(
  "/upload/:id",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 2),
  blogImgResize,
  uploadImages
);
router.put("/:id", authMiddleware, isAdmin, updateBlog);
router.get("/:id", getSingleBlog);
router.delete("/:id", authMiddleware, isAdmin, deleteBlog);

export default router;
