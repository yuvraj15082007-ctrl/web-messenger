// 🔥 DO NOT FORCE websocket only
const socket = io(
  "https://web-messenger-production.up.railway.app",
  {
    path: "/socket.io",
    transports: ["polling", "websocket"]
  }
);

const messageInput = document.getElementById("messageInput");
const messagesDiv = document.getElementById("messages");

socket.on("connect", () => {
  console.log("✅ connected to server:", socket.id);
});

socket.on("receive_message", (data) => {
  const div = document.createElement("div");
  div.innerText = data;
  messagesDiv.appendChild(div);
});

function sendMessage() {
  const msg = messageInput.value;
  if (!msg) return;

  socket.emit("send_message", msg);
  messageInput.value = "";
}

function logout() {
  window.location.href = "index.html";
}
