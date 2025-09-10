import jwt from "jsonwebtoken";
import ErrorHandler from "../error/error.js";
import { User } from "../models/userSchema.js";

const createTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password) {
      return next(new ErrorHandler("Please provide name, email and password", 400));
    }

    // Validate role
    const validRoles = ['admin', 'staff', 'customer'];
    if (role && !validRoles.includes(role)) {
      return next(new ErrorHandler("Invalid role. Must be admin, staff, or customer", 400));
    }

    // Phone is required for admin and staff
    if ((role === 'admin' || role === 'staff') && !phone) {
      return next(new ErrorHandler("Phone number is required for admin and staff", 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorHandler("Email already in use", 409));
    }

    const userData = { name, email, password, role: role || 'customer' };
    if (phone) userData.phone = phone;

    const user = await User.create(userData);
    createTokenAndSetCookie(user._id, res);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return next(new ErrorHandler("Please provide email and password", 400));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorHandler("Invalid credentials", 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new ErrorHandler("Account is deactivated", 401));
    }

    // If role is specified, check if user has that role
    if (role && user.role !== role) {
      return next(new ErrorHandler(`Access denied. This account is for ${user.role} role`, 403));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ErrorHandler("Invalid credentials", 401));
    }

    createTokenAndSetCookie(user._id, res);
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ success: true, message: "Logged out" });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(new ErrorHandler("User not found", 404));
    res.status(200).json({
      success: true,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        isActive: user.isActive 
      },
    });
  } catch (error) {
    next(error);
  }
};

// Separate login endpoints for different roles
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ErrorHandler("Please provide email and password", 400));
    }

    const user = await User.findOne({ email, role: 'admin' }).select("+password");
    if (!user) {
      return next(new ErrorHandler("Invalid admin credentials", 401));
    }

    if (!user.isActive) {
      return next(new ErrorHandler("Admin account is deactivated", 401));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ErrorHandler("Invalid admin credentials", 401));
    }

    createTokenAndSetCookie(user._id, res);
    res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role
      },
    });
  } catch (error) {
    next(error);
  }
};

export const staffLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ErrorHandler("Please provide email and password", 400));
    }

    const user = await User.findOne({ email, role: 'staff' }).select("+password");
    if (!user) {
      return next(new ErrorHandler("Invalid staff credentials", 401));
    }

    if (!user.isActive) {
      return next(new ErrorHandler("Staff account is deactivated", 401));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ErrorHandler("Invalid staff credentials", 401));
    }

    createTokenAndSetCookie(user._id, res);
    res.status(200).json({
      success: true,
      message: "Staff logged in successfully",
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role
      },
    });
  } catch (error) {
    next(error);
  }
};

export const customerLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ErrorHandler("Please provide email and password", 400));
    }

    const user = await User.findOne({ email, role: 'customer' }).select("+password");
    if (!user) {
      return next(new ErrorHandler("Invalid customer credentials", 401));
    }

    if (!user.isActive) {
      return next(new ErrorHandler("Customer account is deactivated", 401));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ErrorHandler("Invalid customer credentials", 401));
    }

    createTokenAndSetCookie(user._id, res);
    res.status(200).json({
      success: true,
      message: "Customer logged in successfully",
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role
      },
    });
  } catch (error) {
    next(error);
  }
};


