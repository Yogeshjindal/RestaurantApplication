import ErrorHandler from "../error/error.js";
import { Menu } from "../models/menuSchema.js";

// Get all menu items
export const getAllMenuItems = async (req, res, next) => {
  try {
    console.log("=== GET ALL MENU ITEMS ===");
    console.log("Query:", req.query);
    
    const { category, isAvailable } = req.query;
    let filter = {};

    if (category) {
      filter.category = category;
    }
    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable === 'true';
    }

    const menuItems = await Menu.find(filter).sort({ category: 1, name: 1 });
    
    console.log("Found menu items:", menuItems.length);
    console.log("=========================");
    
    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems,
    });
  } catch (error) {
    console.error("Error in getAllMenuItems:", error);
    next(error);
  }
};

// Get single menu item
export const getMenuItem = async (req, res, next) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    if (!menuItem) {
      return next(new ErrorHandler("Menu item not found", 404));
    }
    res.status(200).json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    next(error);
  }
};

// Create menu item (Admin/Staff only)
export const createMenuItem = async (req, res, next) => {
  try {
    const menuItem = await Menu.create(req.body);
    res.status(201).json({
      success: true,
      message: "Menu item created successfully",
      data: menuItem,
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

// Update menu item (Admin/Staff only)
export const updateMenuItem = async (req, res, next) => {
  try {
    const menuItem = await Menu.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!menuItem) {
      return next(new ErrorHandler("Menu item not found", 404));
    }
    res.status(200).json({
      success: true,
      message: "Menu item updated successfully",
      data: menuItem,
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

// Delete menu item (Admin only)
export const deleteMenuItem = async (req, res, next) => {
  try {
    const menuItem = await Menu.findByIdAndDelete(req.params.id);
    if (!menuItem) {
      return next(new ErrorHandler("Menu item not found", 404));
    }
    res.status(200).json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Toggle menu item availability (Admin/Staff only)
export const toggleMenuItemAvailability = async (req, res, next) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    if (!menuItem) {
      return next(new ErrorHandler("Menu item not found", 404));
    }
    menuItem.isAvailable = !menuItem.isAvailable;
    await menuItem.save();
    res.status(200).json({
      success: true,
      message: `Menu item ${menuItem.isAvailable ? 'enabled' : 'disabled'} successfully`,
      data: menuItem,
    });
  } catch (error) {
    next(error);
  }
};
