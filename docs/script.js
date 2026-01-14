const socket = io("https://web-messenger-production.up.railway.app");

const messageInput = document.getElementById("messageInput");
const messagesDiv = document.getElementById("messages");

function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;

  socket.emit("send_message", {
    text: message
  });

  messageInput.value = "";
}

socket.on("receive_message", (data) => {
  const p = document.createElement("p");
  p.innerText = data.text;
  messagesDiv.appendChild(p);
});
