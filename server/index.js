// ===== IMPORTS =====
require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

// ===== APP SETUP =====
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Netlify frontend allow
    methods: ["GET", "POST"]
  }
});

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== TEST ROUTE =====
app.get("/", (req, res) => {
  res.send("Web Messenger Backend Running 🚀");
});

// ===== MONGODB CONNECT =====
mongoose
  .connect("mongodb+srv://yuvraj15082007_db_user:app123@cluster0.julwlcf.mongodb.net/?appName=Cluster0")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  });

// ===== SOCKET.IO LOGIC =====
const users = {}; // { username: socketId }

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // Register user
  socket.on("register-user", (username) => {
    users[username] = socket.id;
    console.log("User registered:", username);
  });

  // Private message
  socket.on("private-message", ({ to, from, message }) => {
    const targetSocket = users[to];

    if (targetSocket) {
      io.to(targetSocket).emit("private-message", {
        from,
        message
      });
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);

    for (const user in users) {
      if (users[user] === socket.id) {
        delete users[user];
        break;
      }
    }
  });
});

// ===== SERVER START =====
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
