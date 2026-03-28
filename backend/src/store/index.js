// In-memory store — replace with Redis for multi-process deployments
const rooms = new Map()
const db = require('../db')

class Room {
  constructor(code, spec, timeLimitSeconds) {
    this.code = code
    this.spec = spec
    this.timeLimitSeconds = timeLimitSeconds || 600
    this.startedAt = null
    this.sprintTimer = null
    this.phase = 'lobby' // lobby | sprint | processing | voting | results
    this.players = []
    this.submissions = []
    this.votes = [] // [{ voterId, submissionId, stars }]
    this.currentSlide = 0
    this.slideStartedAt = null
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

function getOrCreateRoom(code, timeLimitSeconds, categoryTag) {
  if (!rooms.has(code)) {
    const spec = pickRandomSpec(categoryTag)
    rooms.set(code, new Room(code, spec, timeLimitSeconds))
  }
  return rooms.get(code)
}

function getRoom(code) {
  return rooms.get(code) || null
}

// Picks a random prompt from the DB matching the given category.
// Falls back to any category if no prompts exist for the requested one.
function pickRandomSpec(categoryTag) {
  let row = categoryTag
    ? db.prepare('SELECT * FROM prompts WHERE category = ? ORDER BY RANDOM() LIMIT 1').get(categoryTag)
    : null

  if (!row) {
    row = db.prepare('SELECT * FROM prompts ORDER BY RANDOM() LIMIT 1').get()
  }

  if (!row) return null

  return {
    projectName:     row.project_name,
    type:            row.type,
    objective:       row.objective,
    background:      row.background,
    targetAudience:  row.target_audience,
    keyMessage:      row.key_message,
    callToAction:    row.call_to_action,
    visualDirection: row.visual_direction,
  }
}

module.exports = { getOrCreateRoom, getRoom }
