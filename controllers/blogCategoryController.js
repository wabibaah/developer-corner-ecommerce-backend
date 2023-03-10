import asyncHandler from "express-async-handler";
import BlogCategory from "../models/blogCategoryModel.js";

import { validateMongoDBId } from "../utils/validateMongodbId.js";

export const createBlogCategory = asyncHandler(async (req, res) => {
  try {
    const newCategory = await BlogCategory.create(req.body);
    res.status(201).json(newCategory);
  } catch (err) {
    throw new Error(err);
  }
});

export const updateBlogCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const updatedBlogCategory = await BlogCategory.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(201).json(updatedBlogCategory);
  } catch (err) {
    throw new Error(err);
  }
});

export const deleteBlogCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const deletedBlogCategory = await BlogCategory.findByIdAndDelete(id);
    res.status(201).json(deletedBlogCategory);
  } catch (err) {
    throw new Error(err);
  }
});

export const getAllBlogCategory = asyncHandler(async (req, res) => {
  try {
    const allBlogCategory = await BlogCategory.find();
    res.status(200).json(allBlogCategory);
  } catch (err) {
    throw new Error(err);
  }
});

export const getSingleBlogCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const singleBlogCategory = await BlogCategory.findById(id);
    res.status(200).json(singleBlogCategory);
  } catch (err) {
    throw new Error(err);
  }
});
