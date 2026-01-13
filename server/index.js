const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const User = require("./models/User");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.use(cors());
app.use(express.json());

// 🔹 MongoDB
mongoose.connectMONGO_URI(mongodb+srv://yuvraj15082007_db_user:app123@cluster0.julwlcf.mongodb.net/?appName=Cluster0)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// 🔹 USER SEARCH (suggestions)
app.get("/search-users", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.json([]);

  const users = await User.find({
    username: { $regex: q, $options: "i" }
  }).limit(5);

  res.json(users.map(u => u.username));
});

// 🔹 SOCKET
const onlineUsers = {};

io.on("connection", socket => {
  console.log("User connected");

  socket.on("login", async username => {
    onlineUsers[username] = socket.id;
    await User.findOneAndUpdate(
      { username },
      { username },
      { upsert: true }
    );
  });

  socket.on("private-message", ({ to, message, from }) => {
    const target = onlineUsers[to];
    if (target) {
      io.to(target).emit("private-message", { from, message });
    }
  });

  socket.on("disconnect", () => {
    for (let user in onlineUsers) {
      if (onlineUsers[user] === socket.id) {
        delete onlineUsers[user];
      }
    }
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});