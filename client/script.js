const socket = io("https://web-messenger-92gg.onrender.com");

let myUsername = "";

function login() {
  myUsername = document.getElementById("username").value.trim();
  if (!myUsername) return alert("Enter username");

  socket.emit("login", myUsername);

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("chatBox").style.display = "block";
}

// 🔹 Suggestions
const toUser = document.getElementById("toUser");
const suggestions = document.getElementById("suggestions");

toUser.addEventListener("input", async () => {
  const q = toUser.value.trim();
  suggestions.innerHTML = "";
  if (q.length < 2) return;

  const res = await fetch(
    `https://web-messenger-92gg.onrender.com/search-users?q=${q}`
  );
  const users = await res.json();

  users.forEach(u => {
    const div = document.createElement("div");
    div.className = "suggestion-item";
    div.innerText = u;
    div.onclick = () => {
      toUser.value = u;
      suggestions.innerHTML = "";
    };
    suggestions.appendChild(div);
  });
});

// 🔹 Send message
function sendMessage() {
  const msg = document.getElementById("message").value;
  const to = toUser.value;

  if (!msg || !to) return;

  socket.emit("private-message", {
    from: myUsername,
    to,
    message: msg
  });

  document.getElementById("chat").innerHTML +=
    `<p><b>You:</b> ${msg}</p>`;

  document.getElementById("message").value = "";
}

// 🔹 Receive message
socket.on("private-message", data => {
  document.getElementById("chat").innerHTML +=
    `<p><b>${data.from}:</b> ${data.message}</p>`;
});