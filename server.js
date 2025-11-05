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
  console.log('연결됨:', socket.id);
  socket.emit('init', { id: socket.id });

  socket.on('move', (data) => {
    socket.broadcast.emit('opponentMove', data);
  });

  socket.on('fire', (data) => {
    socket.broadcast.emit('enemyFire', data);
  });
});

// ✅ 서버 시작
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ 서버 실행중: http://localhost:${PORT}`);
});

