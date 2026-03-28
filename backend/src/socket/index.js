const { Server } = require('socket.io')
const { registerLobbyHandlers } = require('./lobbyHandlers')
const { registerGameHandlers } = require('./gameHandlers')
const { registerVotingHandlers } = require('./votingHandlers')

let io

function initSocket(server) {
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
    : ['http://localhost:3000']
  io = new Server(server, {
    cors: { origin: allowedOrigins, credentials: true },
  })

  io.on('connection', (socket) => {
    console.log(`[socket] connected: ${socket.id}`)

    registerLobbyHandlers(io, socket)
    registerGameHandlers(io, socket)
    registerVotingHandlers(io, socket)

    socket.on('disconnect', () => {
      console.log(`[socket] disconnected: ${socket.id}`)
    })
  })
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized')
  return io
}

module.exports = { initSocket, getIO }
