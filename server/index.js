const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);

/* 🔥 Socket.io */
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

/* 🔥 Middleware */
app.use(express.json());

/* 🔥 Health check (Railway loves this) */
app.get("/", (req, res) => {
  res.send("✅ Web Messenger Backend Running");
});

/* 🔥 Socket logic */
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("send_message", (data) => {
    console.log("📩 Message received:", data);
    io.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

/* 🔥 PORT */
const PORT = process.env.PORT || 8080;

server.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server listening on port", PORT);
});