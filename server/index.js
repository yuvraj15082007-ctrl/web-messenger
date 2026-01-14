const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const users = {}; // username -> socket.id

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (username) => {
    users[username] = socket.id;
    socket.username = username;
    console.log(`${username} joined`);
  });

  socket.on("private_message", ({ to, message }) => {
    const targetSocket = users[to];
    if (targetSocket) {
      io.to(targetSocket).emit("private_message", {
        from: socket.username,
        message
      });
    }
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      delete users[socket.username];
      console.log(`${socket.username} disconnected`);
    }
  });
});

app.get("/", (req, res) => {
  res.send("Web Messenger Backend Running 🚀");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});