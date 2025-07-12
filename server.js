const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

const allowedNames = ["shameless", "yung", "atishness"];

let users = {}; // socket.id => { username, inVC }

function generateRandomUsername() {
  // Choose a random name + a random number suffix to avoid clashes
  const name = allowedNames[Math.floor(Math.random() * allowedNames.length)];
  const suffix = Math.floor(Math.random() * 1000);
  return `${name}${suffix}`;
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Assign username when requested
  socket.on("request-username", () => {
    let username = generateRandomUsername();
    // Ensure uniqueness in current users:
    while (Object.values(users).some(u => u.username === username)) {
      username = generateRandomUsername();
    }
    users[socket.id] = { username, inVC: false };
    socket.emit("assign-username", username);
    socket.broadcast.emit("user-joined", username);
  });

  socket.on("chat-message", (msg) => {
    const user = users[socket.id];
    if (!user) {
      socket.emit("error-message", "Username not assigned yet.");
      return;
    }
    io.emit("chat-message", { username: user.username, message: msg });
  });

  // Voice Chat signaling
  socket.on("join-vc", () => {
    if (!users[socket.id]) return;
    users[socket.id].inVC = true;
    // Notify others about new VC user
    socket.broadcast.emit("vc-user-joined", socket.id);
  });

  socket.on("leave-vc", () => {
    if (!users[socket.id]) return;
    users[socket.id].inVC = false;
    socket.broadcast.emit("vc-user-left", socket.id);
  });

  socket.on("vc-signal", ({ to, from, description, candidate }) => {
    if (to && io.sockets.sockets.has(to)) {
      io.to(to).emit("vc-signal", { from, description, candidate });
    }
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      socket.broadcast.emit("user-left", user.username);
      if (user.inVC) {
        socket.broadcast.emit("vc-user-left", socket.id);
      }
      delete users[socket.id];
    }
    console.log("User disconnected:", socket.id);
  });
});

app.use(express.static("public")); // serve index.html and socket.io client

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
