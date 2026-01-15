const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// ✅ VERY IMPORTANT: CORS
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// ✅ HEALTH CHECK (MOST IMPORTANT)
app.get("/", (req, res) => {
  res.status(200).send("Web Messenger Backend Running ✅");
});

// ✅ SOCKET
io.on("connection", (socket) => {
  console.log("✅ user connected:", socket.id);

  socket.on("send_message", (data) => {
    console.log("📩 message:", data);
    io.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ user disconnected:", socket.id);
  });
});

// ✅ PORT + HOST (CRITICAL)
const PORT = process.env.PORT || 8080;

server.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on port", PORT);
});
