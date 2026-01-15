const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// 1. CORS Setup (Zaruri hai taaki connection block na ho)
app.use(cors({ origin: "*" }));

// 2. Frontend Serve karna (Docs folder se)
// Kyuki ye file 'server' folder mein hai, hume '..' karke bahar aana padega
const staticPath = path.join(__dirname, "../docs");
app.use(express.static(staticPath));

// Root URL par index.html bhejo
app.get("/", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

// 3. Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: "*", // Kisi bhi website se allow karein (Development ke liye)
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("message", (data) => {
    // Sabko message bhejo
    io.emit("message", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// 4. PORT Configuration (Railway ke liye sabse important)
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server chalu hai PORT: ${PORT} par`);
  console.log(`📂 Frontend serve ho raha hai yahan se: ${staticPath}`);
});
