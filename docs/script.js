const socket = io(
  "https://web-messenger-production.up.railway.app", 
  { transports: ["websocket"] }
);

// get username from localStorage
const username = localStorage.getItem("username");

if (!username) {
  window.location.href = "index.html";
}

document.getElementById("myUsername").innerText = username;

// register user
socket.emit("register", username);

// receive private message
socket.on("private_message", (data) => {
  const chatBox = document.getElementById("chatBox");

  const div = document.createElement("div");
  div.innerText = `${data.from}: ${data.message}`;

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// send message
function sendMessage() {
  const to = document.getElementById("toUser").value;
  const msg = document.getElementById("messageInput").value;

  if (!to || !msg) {
    alert("Username aur message dono bharo");
    return;
  }

  socket.emit("private_message", {
    to,
    message: msg,
  });

  const chatBox = document.getElementById("chatBox");
  const div = document.createElement("div");
  div.innerText = `You → ${to}: ${msg}`;
  div.style.color = "blue";

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;

  document.getElementById("messageInput").value = "";
}

// enter key support
document
  .getElementById("messageInput")
  .addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

// logout
function logout() {
  localStorage.removeItem("username");
  window.location.href = "index.html";
}
