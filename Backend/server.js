import app from "./app.js";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
dotenv.config();  // must be at the very top

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  // Optionally, rooms per role/user could be added later
  socket.on("disconnect", () => {});
});

server.listen(process.env.PORT, () => {
  console.log(`server running on port ${process.env.PORT}`);
});
