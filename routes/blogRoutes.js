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

router.post("/", createBlog);
router.get("/", getAllBlogs);
router.put("/likes", likeBlog);
router.put("/dislikes", dislikeBlog);
router.put(
  "/upload/:id",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 2),
  blogImgResize,
  uploadImages
);
router.put("/:id", updateBlog);
router.get("/:id", getSingleBlog);
router.delete("/:id", deleteBlog);

export default router;
