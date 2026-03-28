const store = require('../store')
const { startVoting } = require('./votingHandlers')

// Events: UPLOAD_COMPLETE
// When all players upload OR timer expires, transitions to voting
function registerGameHandlers(io, socket) {
  socket.on('UPLOAD_COMPLETE', ({ code, submissionId }) => {
    const room = store.getRoom(code)
    if (!room) return
    room.markUploaded(socket.id, submissionId)

    const submittedCount = room.players.filter((p) => p.submissionId).length
    io.to(code).emit('SUBMISSIONS_UPDATED', { submittedCount, totalCount: room.players.length })

    const allUploaded = room.players.every((p) => p.submissionId)
    if (allUploaded) {
      startVoting(io, code)
    }
  })
}

module.exports = { registerGameHandlers }
