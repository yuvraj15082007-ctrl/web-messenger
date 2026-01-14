const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.get("/", (req, res) => {
  res.send("Web messenger backend running");
});

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("send_message", (data) => {
    console.log("📩 Message:", data);
    io.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 8080;

// ❗ IMPORTANT — server.listen must be LAST LINE
server.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
