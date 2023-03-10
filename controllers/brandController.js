import asyncHandler from "express-async-handler";
import Brand from "../models/brandModel.js";

import { validateMongoDBId } from "../utils/validateMongodbId.js";

export const createBrand = asyncHandler(async (req, res) => {
  try {
    const newCategory = await Brand.create(req.body);
    res.status(201).json(newCategory);
  } catch (err) {
    throw new Error(err);
  }
});

export const updateBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const updatedBrand = await Brand.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(201).json(updatedBrand);
  } catch (err) {
    throw new Error(err);
  }
});

export const deleteBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const deletedBrand = await Brand.findByIdAndDelete(id);
    res.status(201).json(deletedBrand);
  } catch (err) {
    throw new Error(err);
  }
});

export const getAllBrand = asyncHandler(async (req, res) => {
  try {
    const allBrand = await Brand.find();
    res.status(200).json(allBrand);
  } catch (err) {
    throw new Error(err);
  }
});

export const getSingleBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const singleBrand = await Brand.findById(id);
    res.status(200).json(singleBrand);
  } catch (err) {
    throw new Error(err);
  }
});
