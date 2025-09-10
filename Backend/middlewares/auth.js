import jwt from "jsonwebtoken";
import ErrorHandler from "../error/error.js";
import { User } from "../models/userSchema.js";

export const isAuthenticated = async (req, res, next) => {
  const token = req.cookies?.token;
  console.log("=== AUTHENTICATION MIDDLEWARE ===");
  console.log("Token:", token ? "Present" : "Missing");
  console.log("Cookies:", req.cookies);
  
  if (!token) {
    console.log("No token found");
    return next(new ErrorHandler("Not authenticated", 401));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    
    const user = await User.findById(decoded.id);
    console.log("Found user:", user ? `${user.name} (${user.role})` : "Not found");
    
    if (!user || !user.isActive) {
      console.log("User not found or inactive");
      return next(new ErrorHandler("User not found or inactive", 401));
    }
    req.user = { id: decoded.id, role: user.role, name: user.name, email: user.email };
    console.log("Authentication successful for:", user.role);
    console.log("=================================");
    next();
  } catch (error) {
    console.log("Token verification failed:", error.message);
    return next(new ErrorHandler("Invalid or expired token", 401));
  }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorHandler("Not authenticated", 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ErrorHandler(`Access denied. Required role: ${roles.join(' or ')}`, 403));
    }
    next();
  };
};

// Specific role middlewares
export const isAdmin = authorize('admin');
export const isStaff = authorize('staff');
export const isCustomer = authorize('customer');
export const isAdminOrStaff = authorize('admin', 'staff');


