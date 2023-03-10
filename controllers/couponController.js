import asyncHandler from "express-async-handler";

import Coupon from "../models/CouponModel.js";
import { validateMongoDBId } from "../utils/validateMongodbId.js";

export const createCoupon = asyncHandler(async (req, res) => {
  try {
    const newCoupon = await Coupon.create(req.body);
    res.status(200).json(newCoupon);
  } catch (err) {
    throw new Error(err);
  }
});

export const getAllCoupons = asyncHandler(async (req, res) => {
  try {
    const allCoupons = await Coupon.find();
    res.status(200).json(allCoupons);
  } catch (err) {
    throw new Error(err);
  }
});

export const getSingleCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const singleCoupon = await Coupon.findById(id);
    res.status(200).json(singleCoupon);
  } catch (err) {
    throw new Error(err);
  }
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedCoupon);
  } catch (err) {
    throw new Error(err);
  }
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const deletedCoupon = await Coupon.findByIdAndDelete(id);
    res.status(200).json(deletedCoupon);
  } catch (err) {
    throw new Error(err);
  }
});
