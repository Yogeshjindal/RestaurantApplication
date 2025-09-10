import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { dbConnection } from "./database/dbConnection.js";
import { errorMiddleware } from "./error/error.js";
import reservationRouter from "./routes/reservationRoute.js";
import authRouter from "./routes/authRoute.js";
import menuRouter from "./routes/menuRoute.js";

const app = express();
dotenv.config({ path: "./config/config.env" });

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "Backend is running!", timestamp: new Date().toISOString() });
});

// Test auth route
app.get("/test-auth", (req, res) => {
  res.json({ 
    message: "Auth test", 
    cookies: req.cookies,
    headers: req.headers
  });
});

// Routes
app.use("/reservation", reservationRouter);
app.use("/auth", authRouter);
app.use("/menu", menuRouter);

dbConnection();
app.use(errorMiddleware);
export default app;
