import express from "express";
import {
  createReservation,
  getAllReservations,
  getReservation,
  updateReservationStatus,
  getUserReservations,
  deleteReservation,
} from "../controllers/reservation.js";
import { isAuthenticated, isAdmin, isAdminOrStaff, isCustomer } from "../middlewares/auth.js";

const router = express.Router();

// Create reservation (Customer must be authenticated)
router.post("/", isAuthenticated, isCustomer, createReservation);

// Protected routes - specific routes first
router.get("/my-reservations", isAuthenticated, isCustomer, getUserReservations);
router.get("/all", isAuthenticated, isAdminOrStaff, getAllReservations);

// Dynamic routes last (to avoid conflicts)
router.get("/:id", isAuthenticated, getReservation);
router.put("/:id/status", isAuthenticated, isAdminOrStaff, updateReservationStatus);

// Admin only routes
router.delete("/:id", isAuthenticated, isAdmin, deleteReservation);

export default router;
