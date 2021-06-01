const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

let user = {};

io.on("connection", (socket) => {
  socket.on("nickname", (nickname) => {
    user[String(socket.id)] = nickname;
    io.emit("new user", nickname);
    io.emit("active user", user);
  });

  socket.on("chat message", (msg) => {
    let nickname = user[String(socket.id)];

    // send to all user except sender
    socket.broadcast.emit("chat message", nickname + ": " + msg);
  });

  socket.on("disconnect", () => {
    let nickname = user[String(socket.id)];
    io.emit("chat message", nickname + " has left the chat");
    delete user[String(socket.id)];
    io.emit("active user", user);
    console.log("user disconnected");
  });
});

let PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Listening on *:3000");
});
