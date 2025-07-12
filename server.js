const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  socket.on("set-username", (username) => {
    socket.username = username;
    socket.broadcast.emit("user-joined", username);
  });

  socket.on("chat-message", (msg) => {
    io.emit("chat-message", {
      username: socket.username,
      message: msg,
    });
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      io.emit("user-left", socket.username);
    }
  });

  // WebRTC signaling
  socket.on("signal", (data) => {
    socket.to(data.to).emit("signal", {
      from: socket.id,
      signal: data.signal,
    });
  });

  socket.on("join-vc", () => {
    socket.broadcast.emit("new-peer", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
