import express from "express";
const router = express.Router();

import {
  createUser,
  deleteUser,
  getAllUsers,
  getSingleUser,
  loginUser,
  updateUser,
  blockUser,
  unBlockUser,
  handleRefreshToken,
  logoutUser,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  getWishlist,
  saveAddress,
  userCart,
  getUserCart,
  emptyCart,
  createCashOrder,
  getOrders,
  updateOrderStatus,
} from "../controllers/userController.js";

import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/admin-login", loginAdmin);
router.get("/all-users", authMiddleware, isAdmin, getAllUsers);
router.get("/refresh", handleRefreshToken); // must be here so that it will not use refresh as an id to say invalid
router.get("/logout", logoutUser);
router.get("/wishlist", authMiddleware, getWishlist);
router.put("/password", authMiddleware, updatePassword);
router.post("/cart", authMiddleware, userCart);
router.get("/cart", authMiddleware, getUserCart);
router.delete("/cart", authMiddleware, emptyCart);
router.post("/cart/cash-order", authMiddleware, createCashOrder);
router.get("/cart/get-order", authMiddleware, getOrders);
router.put("/order/update-order/:id", authMiddleware, isAdmin, updateOrderStatus);
router.post("/forgot-password-token", forgotPasswordToken);
router.put("/reset-password/:token", resetPassword);
router.put("/edit-user", authMiddleware, updateUser);
router.put("/save-address", authMiddleware, saveAddress);
router.get("/:id", getSingleUser);
router.delete("/:id", deleteUser);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unBlockUser);

export default router;
