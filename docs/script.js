const socket = io(
  "https://web-messenger-production.up.railway.app",
  {
    transports: ["polling", "websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    timeout: 20000
  }
);

socket.on("connect", () => {
  console.log("✅ connected", socket.id);
});

socket.on("receive_message", (msg) => {
  const div = document.createElement("div");
  div.innerText = msg;
  document.getElementById("messages").appendChild(div);
});

function sendMessage() {
  const input = document.getElementById("messageInput");
  socket.emit("send_message", input.value);
  input.value = "";
}