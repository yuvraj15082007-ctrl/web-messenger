// 🔗 BACKEND URL (Render)
const BACKEND_URL = "https://web-messenger-92gg.onrender.com";
const socket = io(BACKEND_URL);

// Elements
const loginBox = document.getElementById("loginBox");
const chatBox = document.getElementById("chatBox");
const inboxBox = document.getElementById("inboxBox");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");

const toInput = document.getElementById("to");
const suggestionsBox = document.getElementById("suggestions");

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");

let currentUser = "";

/* 🔐 LOGIN */
loginBtn.addEventListener("click", () => {
  const user = usernameInput.value.trim();
  const pass = passwordInput.value.trim();

  if (!user || !pass) {
    alert("Username & password required");
    return;
  }

  currentUser = user;
  socket.emit("join", currentUser);

  loginBox.style.display = "none";
  inboxBox.style.display = "block";
});

/* 📥 OPEN CHAT */
document.getElementById("inbox").addEventListener("click", () => {
  chatBox.style.display = "block";
});

/* 📩 SEND MESSAGE */
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const to = toInput.value.trim();
  const msg = messageInput.value.trim();

  if (!to || !msg) {
    alert("Send to & message required");
    return;
  }

  socket.emit("private_message", {
    from: currentUser,
    to,
    message: msg
  });

  messageInput.value = "";
}

/* 📥 RECEIVE MESSAGE */
socket.on("private_message", (data) => {
  const li = document.createElement("li");
  li.innerText = `${data.from}: ${data.message}`;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

/* 🔍 USERNAME SUGGESTIONS */
toInput.addEventListener("input", async () => {
  const q = toInput.value.trim();

  if (!q) {
    suggestionsBox.style.display = "none";
    return;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/users/search?q=${q}`);
    const users = await res.json();

    suggestionsBox.innerHTML = "";

    users.forEach(name => {
      const li = document.createElement("li");
      li.innerText = name;
      li.onclick = () => {
        toInput.value = name;
        suggestionsBox.style.display = "none";
      };
      suggestionsBox.appendChild(li);
    });

    suggestionsBox.style.display = users.length ? "block" : "none";
  } catch (err) {
    console.error("Suggestion error", err);
  }
});