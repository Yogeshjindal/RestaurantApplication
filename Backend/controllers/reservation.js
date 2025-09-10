import ErrorHandler from "../error/error.js";
import { Reservation } from "../models/reservationSchema.js";
import { Menu } from "../models/menuSchema.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { io } from "../server.js";
dotenv.config({ path: "./config/config.env" });

const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
});

const sendStatusEmail = async (toEmail, name, status, date, time) => {
  if (!toEmail) return;
  const from = process.env.SMTP_FROM || 'no-reply@example.com';
  const subject = `Your reservation is ${status}`;
  const text = `Hello ${name || ''},\n\nYour reservation on ${date} at ${time} is now ${status}.\n\nThank you.`;
  try { await mailTransporter.sendMail({ from, to: toEmail, subject, text }); } catch (_) { /* ignore mail errors */ }
};

// Create a reservation
export const createReservation = async (req, res, next) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      date, 
      time, 
      partySize, 
      orderItems, 
      specialRequests 
    } = req.body;

    // Check required fields
    const missingFields = [];
    const userName = req.user?.name || "";
    const [userFirstName, ...userLastParts] = userName.split(" ");
    const userLastName = userLastParts.join(" ");

    const resolvedFirstName = firstName || userFirstName;
    const resolvedLastName = lastName || userLastName || "";
    const resolvedEmail = email || req.user?.email;

    if (!resolvedFirstName) missingFields.push("firstName");
    // lastName is optional
    if (!resolvedEmail) missingFields.push("email");
    if (!date) missingFields.push("date");
    if (!time) missingFields.push("time");
    
    if (!partySize) missingFields.push("partySize");

    if (missingFields.length > 0) {
      return next(new ErrorHandler(`Missing required fields: ${missingFields.join(", ")}`, 400));
    }

    // Calculate total amount if order items are provided
    let totalAmount = 0;
    if (orderItems && orderItems.length > 0) {
      for (const item of orderItems) {
        const menuItem = await Menu.findById(item.menuItem);
        if (!menuItem) {
          return next(new ErrorHandler(`Menu item with ID ${item.menuItem} not found`, 404));
        }
        if (!menuItem.isAvailable) {
          return next(new ErrorHandler(`Menu item ${menuItem.name} is not available`, 400));
        }
        totalAmount += menuItem.price * item.quantity;
        item.price = menuItem.price;
      }
    }

    const reservationData = {
      customer: req.user?.id,
      firstName: resolvedFirstName,
      lastName: resolvedLastName,
      email: resolvedEmail,
      date,
      time,
      partySize,
      orderItems: orderItems || [],
      totalAmount,
      specialRequests,
    };

    const reservation = await Reservation.create(reservationData);
    res.status(201).json({
      success: true,
      message: "Reservation created successfully!",
      data: reservation,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return next(new ErrorHandler(validationErrors.join(", "), 400));
    }
    next(error);
  }
};

// Get all reservations (Admin/Staff only)
export const getAllReservations = async (req, res, next) => {
  try {
    console.log("=== GET ALL RESERVATIONS ===");
    console.log("User:", req.user);
    console.log("Query:", req.query);
    
    const { status, date } = req.query;
    let filter = {};

    if (status) {
      filter.status = status;
    }
    if (date) {
      filter.date = date;
    }

    const reservations = await Reservation.find(filter)
      .populate('customer', 'name email')
      .populate('orderItems.menuItem', 'name price')
      .sort({ date: -1, time: -1 });

    console.log("Found reservations:", reservations.length);
    console.log("===========================");

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    console.error("Error in getAllReservations:", error);
    next(error);
  }
};

// Get single reservation
export const getReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('orderItems.menuItem', 'name price description');

    if (!reservation) {
      return next(new ErrorHandler("Reservation not found", 404));
    }

    // Check if user can access this reservation
    if (req.user.role === 'customer' && reservation.customer._id.toString() !== req.user.id) {
      return next(new ErrorHandler("Access denied", 403));
    }

    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

// Update reservation status (Admin/Staff only)
export const updateReservationStatus = async (req, res, next) => {
  try {
    const { status, tableNumber, notes } = req.body;
    
    if (!status) {
      return next(new ErrorHandler("Status is required", 400));
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return next(new ErrorHandler("Invalid status", 400));
    }

    const updateData = { status };
    if (tableNumber) updateData.tableNumber = tableNumber;
    if (notes) updateData.notes = notes;

    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('customer', 'name email');

    if (!reservation) {
      return next(new ErrorHandler("Reservation not found", 404));
    }

    // Notify customer via email (best-effort)
    try {
      await sendStatusEmail(
        reservation.customer?.email,
        reservation.customer?.name,
        reservation.status,
        reservation.date,
        reservation.time
      );
    } catch (_) {}

    res.status(200).json({
      success: true,
      message: "Reservation updated successfully",
      data: reservation,
    });

    // Emit realtime event to connected clients (e.g., admin/staff dashboards)
    try {
      io.emit("reservation:updated", {
        id: reservation._id,
        status: reservation.status,
        date: reservation.date,
        time: reservation.time,
      });
    } catch (_) {}
  } catch (error) {
    next(error);
  }
};

// Get user's reservations (Customer only)
export const getUserReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ customer: req.user.id })
      .populate('orderItems.menuItem', 'name price')
      .sort({ date: -1, time: -1 });

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    next(error);
  }
};

// Delete reservation (Admin only)
export const deleteReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) {
      return next(new ErrorHandler("Reservation not found", 404));
    }
    res.status(200).json({
      success: true,
      message: "Reservation deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
