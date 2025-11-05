// 서버 방 관리 구조
const rooms = {};

io.on('connection', (socket) => {
  let joinedRoom = null;

  // 방 자동 배정 (최대 2인)
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

  // 클라이언트에 방 정보 전송
  socket.emit("roomJoined", { room: joinedRoom, isHost });

  // 준비 상태 수신
  socket.on("ready", () => {
    rooms[joinedRoom].ready[socket.id] = true;

    // 2명 다 준비 시 게임 시작
    if (
      rooms[joinedRoom].players.length === 2 &&
      rooms[joinedRoom].players.every(pid => rooms[joinedRoom].ready[pid])
    ) {
      rooms[joinedRoom].gameStarted = true;
      io.to(joinedRoom).emit("startGame", { countdown: 5 });
    }
  });

  // 기존 이동 / 발사 이벤트 그대로 처리
});


