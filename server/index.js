const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.status(200).send("Web messenger backend running");
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("message", (msg) => {
    io.emit("message", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 8080;

/**
 * 🔥 THIS IS THE MOST IMPORTANT LINE 🔥
 * Railway needs 0.0.0.0
 */
server.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on port", PORT);
});