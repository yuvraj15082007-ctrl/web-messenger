// 🔗 Backend URL (Render)
const SOCKET_URL = "https://web-messenger-92gg.onrender.com";

// ================= LOGIN PAGE =================
if (document.getElementById("loginBtn")) {
  const loginBtn = document.getElementById("loginBtn");

  loginBtn.addEventListener("click", () => {
    const username = document
      .getElementById("usernameInput")
      .value.trim();

    if (!username) {
      alert("Username required");
      return;
    }

    localStorage.setItem("username", username);
    window.location.href = "chat.html";
  });
}

// ================= CHAT PAGE =================
if (document.getElementById("sendBtn")) {
  const username = localStorage.getItem("username");

  if (!username) {
    // direct access block
    window.location.href = "index.html";
  }

  const socket = io(SOCKET_URL, {
    transports: ["websocket"]
  });

  // UI elements
  document.getElementById("welcomeText").innerText =
    "Welcome, " + username;

  socket.emit("register-user", username);

  const messagesDiv = document.getElementById("messages");
  const sendBtn = document.getElementById("sendBtn");

  sendBtn.addEventListener("click", () => {
    const toUser = document.getElementById("toUser").value.trim();
    const message = document
      .getElementById("messageInput")
      .value.trim();

    if (!toUser || !message) return;

    socket.emit("private-message", {
      from: username,
      to: toUser,
      message
    });

    addMessage("You", message);
    document.getElementById("messageInput").value = "";
  });

  socket.on("private-message", ({ from, message }) => {
    addMessage(from, message);
  });

  function addMessage(user, msg) {
    const div = document.createElement("div");
    div.className = "msg";
    div.innerHTML = `<b>${user}:</b> ${msg}`;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  // LOGOUT
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("username");
    window.location.href = "index.html";
  });
}