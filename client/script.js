// 🔗 BACKEND SOCKET URL
const socket = io("https://web-messenger-92gg.onrender.com");

// Elements
const loginBox = document.getElementById("loginBox");
const chatBox = document.getElementById("chatBox");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");

let currentUser = "";

// 🔐 LOGIN
loginBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    alert("Username & Password required");
    return;
  }

  currentUser = username;

  socket.emit("login", { username, password });

  loginBox.style.display = "none";
  chatBox.style.display = "block";
});

// 📩 SEND MESSAGE
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const msg = messageInput.value.trim();
  if (!msg) return;

  socket.emit("chatMessage", {
    user: currentUser,
    message: msg,
  });

  messageInput.value = "";
}

// 📥 RECEIVE MESSAGE
socket.on("chatMessage", (data) => {
  const li = document.createElement("li");

  if (data.user === currentUser) {
    li.classList.add("my-msg");
  } else {
    li.classList.add("other-msg");
  }

  li.innerHTML = `<strong>${data.user}:</strong> ${data.message}`;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});