const store = require('../store')

// Events: JOIN_LOBBY, START_GAME
function registerLobbyHandlers(io, socket) {
  socket.on('JOIN_LOBBY', ({ code, nickname, isHost }) => {
    const room = store.getOrCreateRoom(code)
    room.addPlayer({ id: socket.id, nickname, isHost: !!isHost })
    socket.join(code)
    io.to(code).emit('PLAYERS_UPDATED', room.players)
  })

  socket.on('START_GAME', ({ code }) => {
    const room = store.getRoom(code)
    if (!room) return
    const spec = room.spec
    io.to(code).emit('GAME_STARTED', spec)
    room.phase = 'sprint'
  })

  socket.on('disconnecting', () => {
    socket.rooms.forEach((code) => {
      const room = store.getRoom(code)
      if (!room) return
      room.removePlayer(socket.id)
      io.to(code).emit('PLAYERS_UPDATED', room.players)
    })
  })
}

module.exports = { registerLobbyHandlers }
