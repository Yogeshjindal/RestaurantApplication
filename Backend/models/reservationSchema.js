import mongoose from "mongoose";
import validator from "validator";

const reservationSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minLength: [3, "At least 3 characters are required in First Nmae!"],
    maxLength: [30, "No more than 30 characters can be used in First Name!"],
  },
  lastName: {
    type: String,
    required: true,
    minLength: [3, "At least 3 characters are required in Last Nmae!"],
    maxLength: [30, "No more than 30 characters can be used in Last Name!"],
  },
  email: {
    type: String,
    required: true,
    validate: [validator.isEmail, "Provide a valid Email"],
  },
  phone: {
    type: String,
    required: true,
    minLength: [10, "Only 10 digits are required in phone!"],
    maxLength: [10, "Only 10 digits can be used in phone!"],
  },
  time: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
});

export const Reservation = mongoose.model("Reservation", reservationSchema);
