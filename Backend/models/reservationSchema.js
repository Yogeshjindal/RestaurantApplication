import mongoose from "mongoose";
import validator from "validator";

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  specialInstructions: {
    type: String,
    maxlength: 200,
  },
});

const reservationSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    minLength: [3, "At least 3 characters are required in First Name!"],
    maxLength: [30, "No more than 30 characters can be used in First Name!"],
  },
  lastName: {
    type: String,
    required: false,
    minLength: [0, ""],
    maxLength: [30, "No more than 30 characters can be used in Last Name!"],
  },
  email: {
    type: String,
    required: true,
    validate: [validator.isEmail, "Provide a valid Email"],
  },
  phone: {
    type: String,
    required: false,
    minLength: [10, "Phone number must be at least 10 digits"],
    maxLength: [15, "Phone number cannot exceed 15 digits"],
  },
  time: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  partySize: {
    type: Number,
    required: true,
    min: 1,
    max: 20,
  },
  orderItems: [orderItemSchema],
  totalAmount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  specialRequests: {
    type: String,
    maxlength: 500,
  },
  tableNumber: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    maxlength: 500,
  },
});

export const Reservation = mongoose.model("Reservation", reservationSchema);
