// In-memory store — replace with Redis for multi-process deployments
const rooms = new Map()
const db = require('../db')
const { scoreSubmission } = require('../services/aiJudge')

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
      imageUrl: p.submissionId ? `/api/challenges/submissions/${p.submissionId}` : null,
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

  async computeScores() {
    // Score all submissions in parallel — one Gemini call per player who uploaded
    const scores = await Promise.all(this.players.map(async (p) => {
      const hasSubmission = !!p.submissionId
      const received = this.votes.filter((v) => v.submissionId === p.submissionId)
      const voterScore = hasSubmission && received.length
        ? Math.round((received.reduce((sum, v) => sum + v.stars, 0) / received.length) * 10) / 10
        : 0
      const aiScore = hasSubmission
        ? await scoreSubmission(p.submissionId, this.spec)
        : 0
      const combinedScore = hasSubmission
        ? Math.round(((voterScore + aiScore) / 2) * 100) / 100
        : 0
      return {
        playerId: p.id,
        nickname: p.nickname,
        submissionId: p.submissionId,
        imageUrl: p.submissionId ? `/api/challenges/submissions/${p.submissionId}` : null,
        voterScore,
        aiScore,
        combinedScore,
      }
    }))

    scores.sort((a, b) => b.combinedScore - a.combinedScore)
    scores.forEach((entry, i) => { entry.rank = i + 1 })

    this.finalScores = scores
    return scores
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
