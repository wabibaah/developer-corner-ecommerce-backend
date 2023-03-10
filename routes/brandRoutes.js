import express from "express";

import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
import {
  createBrand,
  updateBrand,
  deleteBrand,
  getAllBrand,
  getSingleBrand,
} from "../controllers/brandController.js";

const router = express.Router();

router.post("/", authMiddleware, isAdmin, createBrand);
router.get("/", getAllBrand);
router.put("/:id", authMiddleware, isAdmin, updateBrand);
router.delete("/:id", authMiddleware, isAdmin, deleteBrand);
router.get("/:id", getSingleBrand);

export default router;
