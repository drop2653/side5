// ✅ server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

// 현재 파일 경로 구하기 (ESM 전용)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Render 환경에서 프론트엔드 접근 허용
  },
});

// 📂 정적 파일 서비스 (index.html, mp3 파일 포함)
app.use(express.static(path.join(__dirname, "public")));

// ✅ 방 시스템 (2인 매칭)
const rooms = {};

io.on("connection", (socket) => {
  console.log("클라이언트 접속:", socket.id);
  let joinedRoom = null;

  // 방 자동 배정 (2명까지)
  for (const room in rooms) {
    if (rooms[room].players.length < 2) {
      joinedRoom = room;
      break;
    }
  }
  if (!joinedRoom) {
    joinedRoom = "room_" + Math.random().toString(36).substr(2, 5);
    rooms[joinedRoom] = { players: [], ready: {}, gameStarted: false };
  }

  socket.join(joinedRoom);
  rooms[joinedRoom].players.push(socket.id);
  const isHost = rooms[joinedRoom].players.length === 1;

  // 방 참가 정보 전달
  socket.emit("roomJoined", { room: joinedRoom, isHost });

  // 준비 이벤트 처리
  socket.on("ready", () => {
    rooms[joinedRoom].ready[socket.id] = true;

    const allReady =
      rooms[joinedRoom].players.length === 2 &&
      rooms[joinedRoom].players.every((pid) => rooms[joinedRoom].ready[pid]);

    if (allReady && !rooms[joinedRoom].gameStarted) {
      rooms[joinedRoom].gameStarted = true;
      io.to(joinedRoom).emit("startGame", { countdown: 5 });
    }
  });

  // 이동 / 발사 이벤트 중계
  socket.on("move", (data) => {
    socket.broadcast.to(joinedRoom).emit("opponentMove", {
      ...data,
      id: socket.id,
    });
  });

  socket.on("fire", (data) => {
    socket.broadcast.to(joinedRoom).emit("enemyFire", {
      ...data,
      id: socket.id,
    });
  });

  socket.on("disconnect", () => {
    console.log("연결 종료:", socket.id);
    if (joinedRoom && rooms[joinedRoom]) {
      rooms[joinedRoom].players = rooms[joinedRoom].players.filter(
        (id) => id !== socket.id
      );
      io.to(joinedRoom).emit("playerLeft");
      if (rooms[joinedRoom].players.length === 0) {
        delete rooms[joinedRoom];
      }
    }
  });
});

// ✅ Render에서 자동 포트 사용
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`✅ 서버 실행 중: ${PORT}`));




