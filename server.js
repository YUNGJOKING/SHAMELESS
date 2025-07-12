const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

const usernamesBase = ["shameless", "yung", "atishness"];
const users = {}; // socketId => username
const vcUsers = new Set();

function getRandomUsername() {
  const base = usernamesBase[Math.floor(Math.random() * usernamesBase.length)];
  const number = Math.floor(Math.random() * 1000);
  return `${base}${number}`;
}

io.on("connection", (socket) => {
  // Assign username automatically
  let username = getRandomUsername();
  users[socket.id] = username;

  // Inform user of their username
  socket.emit("set-username", username);

  // Notify all users that someone joined
  socket.broadcast.emit("user-joined", username);

  // Join event is sent from client on page load
  socket.on("join", () => {
    // No need to do anything here now
  });

  // Chat messages
  socket.on("chat-message", (msg) => {
    if (!users[socket.id]) return;
    io.emit("chat-message", { username: users[socket.id], message: msg });
  });

  // Voice chat signaling & management
  socket.on("join-vc", () => {
    vcUsers.add(socket.id);
    io.to(socket.id).emit("vc-users", Array.from(vcUsers).filter(id => id !== socket.id));
    socket.broadcast.emit("vc-users", Array.from(vcUsers).filter(id => id !== socket.id));
  });

  socket.on("leave-vc", () => {
    vcUsers.delete(socket.id);
    socket.broadcast.emit("user-left-vc", socket.id);
  });

  socket.on("offer", ({ to, sdp }) => {
    io.to(to).emit("offer", { from: socket.id, sdp });
  });

  socket.on("answer", ({ to, sdp }) => {
    io.to(to).emit("answer", { from: socket.id, sdp });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", { from: socket.id, candidate });
  });

  socket.on("disconnect", () => {
    if (users[socket.id]) {
      const leftName = users[socket.id];
      delete users[socket.id];
      vcUsers.delete(socket.id);
      socket.broadcast.emit("user-left", leftName);
      socket.broadcast.emit("user-left-vc", socket.id);
    }
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
