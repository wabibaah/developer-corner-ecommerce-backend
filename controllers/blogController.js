import asyncHandler from "express-async-handler";
import fs from "fs";

import Blog from "../models/BlogModel.js";
import User from "../models/UserModel.js";
import { cloudinaryUploadImg } from "../utils/cloudinary.js";
import { validateMongoDBId } from "../utils/validateMongodbId.js";

export const createBlog = asyncHandler(async (req, res) => {
  try {
    const newBlog = await Blog.create(req.body);
    res.status(201).json(newBlog);
  } catch (err) {
    throw new Error(err);
  }
});

export const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, { new: true });
    res.status(201).json(updatedBlog);
  } catch (err) {
    throw new Error(err);
  }
});

export const getSingleBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const foundBlog = await Blog.findById(id)
      .populate("likes", "firstname lastname email")
      .populate("dislikes", "firstname lastname email");
    // singleBlog.numViews += 1;
    // singleBlog.save(); // this one works too and even slightly better
    const singleBlog = await Blog.findByIdAndUpdate(
      id,
      { $inc: { numViews: 1 } },
      { new: true, runValidators: true }
    )
      .populate("likes")
      .populate("dislikes");
    res.status(200).json(singleBlog);
  } catch (err) {
    throw new Error(err);
  }
});

export const getAllBlogs = asyncHandler(async (req, res) => {
  try {
    const allBlogs = await Blog.find();
    res.status(200).json(allBlogs);
  } catch (err) {
    throw new Error(err);
  }
});

export const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const deletedBlog = await Blog.findByIdAndDelete(id);
    res.json(deletedBlog);
  } catch (err) {
    throw new Error(err);
  }
});

export const likeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  // console.log(blogId);
  validateMongoDBId(blogId);
  try {
    const blog = await Blog.findById(blogId);
    const loggedInUserId = req?.user?._id;

    const isLiked = blog?.isLiked;
    const alreadyDisliked = blog?.dislikes?.find(
      (userId) => userId.toString() === loggedInUserId?.toString()
    );
    if (alreadyDisliked) {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { dislikes: loggedInUserId },
          isDisliked: false,
        },
        { new: true }
      );
      res.json(blog);
    }
    if (isLiked) {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { likes: loggedInUserId },
          isLiked: false,
        },
        { new: true }
      );
      res.json(blog);
    } else {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $push: { likes: loggedInUserId },
          isLiked: true,
        },
        { new: true }
      );
      res.json(blog);
    }
  } catch (err) {
    throw new Error(err);
  }
});
export const dislikeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  console.log(blogId);
  validateMongoDBId(blogId);
  try {
    const blog = await Blog.findById(blogId);
    const loggedInUserId = req?.user?._id;

    const isDisliked = blog?.isDisliked;
    const alreadyLiked = blog?.likes?.find(
      (userId) => userId.toString() === loggedInUserId?.toString()
    );
    if (alreadyLiked) {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { likes: loggedInUserId },
          isLiked: false,
        },
        { new: true }
      );
      res.json(blog);
    }
    if (isDisliked) {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { dislikes: loggedInUserId },
          isDisliked: false,
        },
        { new: true }
      );
      res.json(blog);
    } else {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $push: { dislikes: loggedInUserId },
          isDisliked: true,
        },
        { new: true }
      );
      res.json(blog);
    }
  } catch (err) {
    throw new Error(err);
  }
});

export const uploadImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const uploader = (path) => cloudinaryUploadImg(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      urls.push(newPath);
      fs.unlinkSync(path);
    }
    const findBlog = await Blog.findByIdAndUpdate(
      id,
      {
        images: urls.map((file) => {
          return file;
        }),
      },
      { new: true }
    );
    res.json(findBlog);
  } catch (err) {
    throw new Error(err);
  }
});
