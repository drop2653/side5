import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

let playerCount = 0;

io.on("connection", (socket) => {
  console.log("🚀 새 유저 연결됨:", socket.id);
  playerCount++;

  socket.on("move", (data) => {
    socket.broadcast.emit("opponentMove", data);
  });

  socket.on("fire", (data) => {
    socket.broadcast.emit("enemyFire", data);
  });

  socket.on("disconnect", () => {
    playerCount--;
    console.log("❌ 유저 연결 해제:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🌐 서버 실행 중: http://localhost:${PORT}`);
});