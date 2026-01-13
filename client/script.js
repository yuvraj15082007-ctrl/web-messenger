// 🔗 CONNECT TO SERVER
const socket = io("https://web-messenger-92gg.onrender.com");

let currentUser = "";

// ELEMENTS
const loginBox = document.getElementById("loginBox");
const chatBox = document.getElementById("chatBox");
const loginBtn = document.getElementById("loginBtn");
const sendBtn = document.getElementById("sendBtn");

const usernameInput = document.getElementById("username");
const toUserInput = document.getElementById("toUser");
const messageInput = document.getElementById("message");
const messagesDiv = document.getElementById("messages");

// 🔐 LOGIN
loginBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();

  if (!username) {
    alert("Username required");
    return;
  }

  currentUser = username;
  socket.emit("login", username);

  loginBox.style.display = "none";
  chatBox.style.display = "block";
});

// 📤 SEND MESSAGE
sendBtn.addEventListener("click", () => {
  const message = messageInput.value.trim();
  const toUser = toUserInput.value.trim();

  if (!message || !toUser) {
    alert("Message & receiver required");
    return;
  }

  // 👉 SERVER KO BHEJO
  socket.emit("sendMessage", {
    from: currentUser,
    to: toUser,
    message: message
  });

  addMessage("You", message);
  messageInput.value = "";
});

// 📥 RECEIVE MESSAGE
socket.on("receiveMessage", (data) => {
  addMessage(data.from, data.message);
});

// 🧩 MESSAGE UI FUNCTION
function addMessage(user, msg) {
  const div = document.createElement("div");
  div.className = "msg";
  div.innerHTML = `<b>${user}:</b> ${msg}`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}