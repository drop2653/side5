import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// HTML 제공 (정적 파일)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public'))); // public 폴더에 index.html 등

// 사용자 연결 처리
io.on('connection', (socket) => {
  const startX = 200 + Math.random() * 1600;
  const startY = 200 + Math.random() * 1100;

  socket.emit("init", { id: socket.id, x: startX, y: startY });

  socket.on("move", (data) => {
    // 상대방에게만 전송
    socket.broadcast.emit("opponentMove", { ...data, id: socket.id });
  });

  socket.on("fire", (data) => {
    socket.broadcast.emit("enemyFire", { ...data, id: socket.id });
  });
});

// ✅ 서버 시작
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ 서버 실행중: http://localhost:${PORT}`);
});


