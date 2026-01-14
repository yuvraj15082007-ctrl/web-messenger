// ✅ Render backend URL
const socket = io("https://web-messenger-92gg.onrender.com");

let currentUser = "";

// LOGIN
document.getElementById("loginBtn").addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();

  if (!username) {
    alert("Enter username");
    return;
  }

  currentUser = username;
  socket.emit("register-user", username);

  alert("Logged in as " + username);
});

// SEND MESSAGE
document.getElementById("sendBtn").addEventListener("click", () => {
  const to = document.getElementById("toUser").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!to || !message) return;

  socket.emit("private-message", {
    from: currentUser,
    to,
    message
  });

  addMessage(`You → ${to}: ${message}`);
  document.getElementById("message").value = "";
});

// RECEIVE MESSAGE
socket.on("private-message", ({ from, message }) => {
  addMessage(`${from}: ${message}`);
});

// UI helper
function addMessage(text) {
  const li = document.createElement("li");
  li.textContent = text;
  document.getElementById("chat").appendChild(li);
}
