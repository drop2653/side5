import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

// ✅ 정적 파일 제공 (HTML 포함)
app.use(express.static("public"));

// ✅ WebSocket 연결 처리
io.on("connection", (socket) => {
  console.log("🚀 연결됨:", socket.id);

  io.on("connection", (socket) => {
  console.log("연결됨:", socket.id);
  socket.emit("init", { id: socket.id });  // 클라이언트에게 자신의 ID 전달

  socket.on("move", (data) => {
    socket.broadcast.emit("opponentMove", data);
  });

  socket.on("fire", (data) => {
    socket.broadcast.emit("enemyFire", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ 연결 해제:", socket.id);
  });
});

// ✅ 서버 실행
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🌐 서버 실행 중: http://localhost:${PORT}`);
});

