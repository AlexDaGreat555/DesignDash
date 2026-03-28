// In-memory store — replace with Redis for multi-process deployments
const rooms = new Map()

class Room {
  constructor(code, spec) {
    this.code = code
    this.spec = spec
    this.phase = 'lobby' // lobby | sprint | processing | voting | results
    this.players = []
    this.submissions = []
    this.votes = [] // [{ voterId, submissionId, stars }]
    this.currentSlide = 0
    this.slideTimer = null
  }

  addPlayer(player) {
    if (!this.players.find((p) => p.id === player.id)) {
      this.players.push({ ...player, submissionId: null })
    }
  }

  removePlayer(id) {
    this.players = this.players.filter((p) => p.id !== id)
  }

  markUploaded(playerId, submissionId) {
    const player = this.players.find((p) => p.id === playerId)
    if (player) player.submissionId = submissionId
  }

  shuffleSubmissions() {
    // Build submissions list including "no submission" placeholders
    this.submissions = [...this.players].map((p) => ({
      id: p.submissionId,
      playerId: p.id,
      imageUrl: p.submissionId ? `/uploads/${p.submissionId}` : null,
    }))
    // Fisher-Yates shuffle
    for (let i = this.submissions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.submissions[i], this.submissions[j]] = [this.submissions[j], this.submissions[i]]
    }
  }

  recordVote(voterId, submissionId, stars) {
    this.votes.push({ voterId, submissionId, stars })
  }

  hasVoted(voterId, submissionId) {
    return this.votes.some((v) => v.voterId === voterId && v.submissionId === submissionId)
  }

  computeScores() {
    return this.players
      .map((p) => {
        const received = this.votes.filter((v) => v.submissionId === p.submissionId)
        const avg = received.length
          ? received.reduce((sum, v) => sum + v.stars, 0) / received.length
          : 0
        return { playerId: p.id, nickname: p.nickname, score: avg }
      })
      .sort((a, b) => b.score - a.score)
  }
}

function getOrCreateRoom(code) {
  if (!rooms.has(code)) {
    const spec = pickRandomSpec(code)
    rooms.set(code, new Room(code, spec))
  }
  return rooms.get(code)
}

function getRoom(code) {
  return rooms.get(code) || null
}

// Placeholder — replace with real spec library lookup
function pickRandomSpec(code) {
  return {
    projectName: 'Sample Brand Refresh',
    type: 'Branding',
    objective: 'Redesign the logo for a modern audience.',
    background: 'Founded in 2005, the brand feels outdated.',
    targetAudience: 'Millennials and Gen Z',
    keyMessage: 'Bold. Fresh. Timeless.',
    visualDirection: 'Minimalist with a vibrant accent color.',
  }
}

module.exports = { getOrCreateRoom, getRoom }
