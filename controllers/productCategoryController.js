import asyncHandler from "express-async-handler";
import ProductCategory from "../models/productCategoryModel.js";

import { validateMongoDBId } from "../utils/validateMongodbId.js";

export const createProductCategory = asyncHandler(async (req, res) => {
  try {
    const newCategory = await ProductCategory.create(req.body);
    res.status(201).json(newCategory);
  } catch (err) {
    throw new Error(err);
  }
});

export const updateProductCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const updatedProductCategory = await ProductCategory.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(201).json(updatedProductCategory);
  } catch (err) {
    throw new Error(err);
  }
});

export const deleteProductCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const deletedProductCategory = await ProductCategory.findByIdAndDelete(id);
    res.status(201).json(deletedProductCategory);
  } catch (err) {
    throw new Error(err);
  }
});

export const getAllProductCategory = asyncHandler(async (req, res) => {
  try {
    const allProductCategory = await ProductCategory.find();
    res.status(200).json(allProductCategory);
  } catch (err) {
    throw new Error(err);
  }
});

export const getSingleProductCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const singleProductCategory = await ProductCategory.findById(id);
    res.status(200).json(singleProductCategory);
  } catch (err) {
    throw new Error(err);
  }
});
