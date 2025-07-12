const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

const users = {}; // socket.id => username

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("set-username", (name) => {
    if (typeof name !== "string" || name.trim().length < 3) {
      socket.emit("error-message", "Username must be at least 3 characters");
      return;
    }
    const username = name.trim();
    users[socket.id] = username;
    console.log(`User set username: ${username}`);

    socket.broadcast.emit("user-joined", username);
    socket.emit("welcome", `Welcome ${username}!`);
  });

  socket.on("chat-message", (msg) => {
    const username = users[socket.id];
    if (!username) {
      socket.emit("error-message", "Set username first");
      return;
    }
    if (typeof msg !== "string" || msg.trim().length === 0) return;

    const message = msg.trim();
    io.emit("chat-message", { username, message });
  });

  socket.on("join-vc", () => {
    const username = users[socket.id];
    if (!username) return;
    socket.broadcast.emit("new-peer", socket.id);
  });

  socket.on("signal", ({ to, signal }) => {
    if (users[to]) {
      io.to(to).emit("signal", { from: socket.id, signal });
    }
  });

  socket.on("disconnect", () => {
    const username = users[socket.id];
    if (username) {
      console.log(`User disconnected: ${username}`);
      socket.broadcast.emit("user-left", username);
      delete users[socket.id];
    }
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
