const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// 🔥 socket.io init (IMPORTANT)
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

// 🔥 serve client
app.use(express.static(path.join(__dirname, "../client")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// 🔥 MongoDB (already working)
mongoose.connect("mongodb+srv://yuvraj15082007_db_user:app123@cluster0.julwlcf.mongodb.net/?appName=Cluster0")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

// 🔥 socket logic
const users = {}; // username -> socketId

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("join", (username) => {
    users[username] = socket.id;
    console.log("Joined:", username);
  });

  socket.on("private_message", ({ from, to, message }) => {
    console.log("MSG:", from, "->", to, message);

    const target = users[to];

    if (target) {
      io.to(target).emit("private_message", { from, message });
    }

    // sender ko bhi dikhana
    socket.emit("private_message", { from: "You", message });
  });

  socket.on("disconnect", () => {
    for (let u in users) {
      if (users[u] === socket.id) delete users[u];
    }
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});