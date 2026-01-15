const socket = io(
  "https://web-messenger-production.up.railway.app",
  {
    path: "/socket.io",
    transports: ["polling", "websocket"] // polling FIRST
  }
);

const messageInput = document.getElementById("messageInput");
const messagesDiv = document.getElementById("messages");

socket.on("connect", () => {
  console.log("✅ Connected to server:", socket.id);
});

function sendMessage() {
  const msg = messageInput.value.trim();
  if (!msg) return;

  socket.emit("send_message", {
    text: msg
  });

  messageInput.value = "";
}

socket.on("receive_message", (data) => {
  const p = document.createElement("p");
  p.innerText = data.text;
  messagesDiv.appendChild(p);
});
