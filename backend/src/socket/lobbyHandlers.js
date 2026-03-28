const store = require('../store')
const { startVoting } = require('./votingHandlers')

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
    if (!room || room.phase !== 'lobby') return
    room.phase = 'sprint'
    room.startedAt = Date.now()
    io.to(code).emit('GAME_STARTED', {
      spec: room.spec,
      startedAt: room.startedAt,
      timeLimitSeconds: room.timeLimitSeconds,
    })
    // Server-side sprint timer: transition to voting when time runs out
    room.sprintTimer = setTimeout(() => startVoting(io, code), room.timeLimitSeconds * 1000)
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
