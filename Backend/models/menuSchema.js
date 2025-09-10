import mongoose from "mongoose";

const menuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: ['appetizer', 'main_course', 'dessert', 'beverage', 'salad', 'soup'],
    },
    image: {
      type: String,
      default: '',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    preparationTime: {
      type: Number, // in minutes
      default: 15,
    },
    ingredients: [{
      type: String,
      trim: true,
    }],
    allergens: [{
      type: String,
      trim: true,
    }],
    nutritionInfo: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
    },
  },
  { timestamps: true }
);

export const Menu = mongoose.model("Menu", menuSchema);

