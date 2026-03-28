const store = require('../store')

const SLIDE_DURATION_MS = 30_000

// Events: SUBMIT_VOTE
function registerVotingHandlers(io, socket) {
  socket.on('SUBMIT_VOTE', ({ code, submissionId, stars }) => {
    const room = store.getRoom(code)
    if (!room || room.phase !== 'voting') return

    room.recordVote(socket.id, submissionId, stars)

    const currentSubmission = room.submissions[room.currentSlide]
    const eligibleVoters = room.players.filter((p) => p.submissionId !== currentSubmission?.id)
    const allVoted = eligibleVoters.every((p) => room.hasVoted(p.id, currentSubmission?.id))

    if (allVoted) advanceSlide(io, code)
  })
}

function startVoting(io, code) {
  const room = store.getRoom(code)
  if (!room) return
  room.phase = 'voting'
  room.currentSlide = 0
  room.shuffleSubmissions()
  io.to(code).emit('START_VOTING', room.submissions)
  scheduleSlideAdvance(io, code)
}

function scheduleSlideAdvance(io, code) {
  const room = store.getRoom(code)
  if (!room) return
  room.slideTimer = setTimeout(() => advanceSlide(io, code), SLIDE_DURATION_MS)
}

function advanceSlide(io, code) {
  const room = store.getRoom(code)
  if (!room) return
  clearTimeout(room.slideTimer)

  if (room.currentSlide + 1 >= room.submissions.length) {
    room.phase = 'results'
    io.to(code).emit('SHOW_RESULTS', room.computeScores())
    return
  }

  room.currentSlide += 1
  io.to(code).emit('NEXT_SLIDE', room.currentSlide)
  scheduleSlideAdvance(io, code)
}

module.exports = { registerVotingHandlers, startVoting }
