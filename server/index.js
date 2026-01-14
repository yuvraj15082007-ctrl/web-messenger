const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// ✅ Socket.io with CORS (Netlify allow)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Web Messenger Server Running");
});

// 🔑 username -> socket.id map
const users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // 🔐 Register username
  socket.on("register-user", (username) => {
    if (!username) return;

    users[username] = socket.id;
    console.log("User registered:", username);
  });

  // 💬 Private message
  socket.on("private-message", ({ from, to, message }) => {
    console.log(`Message ${from} -> ${to}: ${message}`);

    const receiverSocketId = users[to];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("private-message", {
        from,
        message
      });
    }
  });

  // ❌ Disconnect cleanup
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    for (let username in users) {
      if (users[username] === socket.id) {
        delete users[username];
        break;
      }
    }
  });
});

// ✅ Render required PORT
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

