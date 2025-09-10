import express from "express";
import { 
  login, 
  logout, 
  register, 
  getMe, 
  adminLogin, 
  staffLogin, 
  customerLogin 
} from "../controllers/authController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// General auth routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", isAuthenticated, getMe);

// Role-specific login routes
router.post("/admin/login", adminLogin);
router.post("/staff/login", staffLogin);
router.post("/customer/login", customerLogin);

export default router;


