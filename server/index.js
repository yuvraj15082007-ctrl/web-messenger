const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// 🔥 IMPORTANT: CORS + socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// health check
app.get("/", (req, res) => {
  res.send("Web messenger backend running 🚀");
});

io.on("connection", (socket) => {
  console.log("✅ user connected:", socket.id);

  socket.on("send_message", (data) => {
    console.log("📩 message:", data);
    io.emit("receive_message", data); // broadcast to all
  });

  socket.on("disconnect", () => {
    console.log("❌ user disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on port", PORT);
});
