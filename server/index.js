// ===== IMPORTS =====
require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
<<<<<<< HEAD

// ===== APP SETUP =====
=======
const { Server } = require("socket.io");

>>>>>>> b7d517892f09089a0826cad00e8caeb8f0d10ae2
const app = express();
const server = http.createServer(app);

// ✅ Socket.io with CORS (Netlify allow)
const io = new Server(server, {
  cors: {
<<<<<<< HEAD
    origin: "*", // Netlify frontend allow
=======
    origin: "*",
>>>>>>> b7d517892f09089a0826cad00e8caeb8f0d10ae2
    methods: ["GET", "POST"]
  }
});

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

<<<<<<< HEAD
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
=======
// Test route
app.get("/", (req, res) => {
  res.send("Web Messenger Server Running");
});

// 🔑 username -> socket.id map
const users = {};
>>>>>>> b7d517892f09089a0826cad00e8caeb8f0d10ae2

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

<<<<<<< HEAD
  // Register user
  socket.on("register-user", (username) => {
=======
  // 🔐 Register username
  socket.on("register-user", (username) => {
    if (!username) return;

>>>>>>> b7d517892f09089a0826cad00e8caeb8f0d10ae2
    users[username] = socket.id;
    console.log("User registered:", username);
  });

<<<<<<< HEAD
  // Private message
  socket.on("private-message", ({ to, from, message }) => {
    const targetSocket = users[to];

    if (targetSocket) {
      io.to(targetSocket).emit("private-message", {
=======
  // 💬 Private message
  socket.on("private-message", ({ from, to, message }) => {
    console.log(`Message ${from} -> ${to}: ${message}`);

    const receiverSocketId = users[to];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("private-message", {
>>>>>>> b7d517892f09089a0826cad00e8caeb8f0d10ae2
        from,
        message
      });
    }
  });

<<<<<<< HEAD
  // Disconnect
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);

    for (const user in users) {
      if (users[user] === socket.id) {
        delete users[user];
=======
  // ❌ Disconnect cleanup
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    for (let username in users) {
      if (users[username] === socket.id) {
        delete users[username];
>>>>>>> b7d517892f09089a0826cad00e8caeb8f0d10ae2
        break;
      }
    }
  });
});

<<<<<<< HEAD
// ===== SERVER START =====
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
=======
// ✅ Render required PORT
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
>>>>>>> b7d517892f09089a0826cad00e8caeb8f0d10ae2
