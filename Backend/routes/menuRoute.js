import express from "express";
import {
  getAllMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
} from "../controllers/menuController.js";
import { isAuthenticated, isAdmin, isAdminOrStaff } from "../middlewares/auth.js";

const router = express.Router();

// Public routes
router.get("/", getAllMenuItems);
router.get("/:id", getMenuItem);

// Protected routes - Admin/Staff only
router.post("/", isAuthenticated, isAdminOrStaff, createMenuItem);
router.put("/:id", isAuthenticated, isAdminOrStaff, updateMenuItem);
router.patch("/:id/toggle", isAuthenticated, isAdminOrStaff, toggleMenuItemAvailability);

// Admin only routes
router.delete("/:id", isAuthenticated, isAdmin, deleteMenuItem);

export default router;

