const store = require('../store')

const SLIDE_DURATION_MS = 7_000

// Events: SUBMIT_VOTE
function registerVotingHandlers(io, socket) {
  socket.on('SUBMIT_VOTE', ({ code, submissionId, stars }) => {
    const room = store.getRoom(code)
    if (!room || room.phase !== 'voting') return

    room.recordVote(socket.id, submissionId, stars)

    const currentSubmission = room.submissions[room.currentSlide]
    const eligibleVoters = room.players.filter((p) => p.submissionId !== currentSubmission?.id)
    const allVoted = eligibleVoters.every((p) => room.hasVoted(p.id, currentSubmission?.id))

    if (allVoted) {
      advanceSlide(io, code).catch((err) =>
        console.error('[voting] advanceSlide error:', err)
      )
    }
  })
}

function startVoting(io, code) {
  const room = store.getRoom(code)
  if (!room || room.phase === 'voting' || room.phase === 'results') return
  clearTimeout(room.sprintTimer)
  room.phase = 'voting'
  room.currentSlide = 0
  room.slideStartedAt = Date.now()
  room.shuffleSubmissions()
  io.to(code).emit('START_VOTING', {
    submissions: room.submissions,
    slideStartedAt: room.slideStartedAt,
  })
  scheduleSlideAdvance(io, code)
}

function scheduleSlideAdvance(io, code) {
  const room = store.getRoom(code)
  if (!room) return
  room.slideTimer = setTimeout(() => {
    advanceSlide(io, code).catch((err) =>
      console.error('[voting] advanceSlide error:', err)
    )
  }, SLIDE_DURATION_MS)
}

async function advanceSlide(io, code) {
  const room = store.getRoom(code)
  if (!room) return
  clearTimeout(room.slideTimer)

  if (room.currentSlide + 1 >= room.submissions.length) {
    room.phase = 'results'
    // Score all submissions with Gemini before revealing results
    const scores = await room.computeScores()
    io.to(code).emit('SHOW_RESULTS', scores)
    return
  }

  room.currentSlide += 1
  room.slideStartedAt = Date.now()
  io.to(code).emit('NEXT_SLIDE', { index: room.currentSlide, slideStartedAt: room.slideStartedAt })
  scheduleSlideAdvance(io, code)
}

module.exports = { registerVotingHandlers, startVoting }
