const { v4: uuidv4 } = require('uuid')
const store = require('../store')
const db = require('../db')

function createChallenge(req, res) {
  const { categoryTag, timeLimitSeconds } = req.body
  const code = uuidv4().slice(0, 6).toUpperCase()
  store.getOrCreateRoom(code, timeLimitSeconds, categoryTag)
  res.status(201).json({ code, categoryTag, timeLimitSeconds })
}

function joinChallenge(req, res) {
  const { code } = req.params
  const { nickname } = req.body
  const room = store.getRoom(code)
  if (!room) return res.status(404).json({ error: 'Challenge not found' })
  res.json({ code, nickname })
}

function uploadDesign(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

  const id = uuidv4()
  db.prepare('INSERT INTO submissions (id, mime_type, data) VALUES (?, ?, ?)').run(
    id,
    req.file.mimetype,
    req.file.buffer
  )

  res.json({ submissionId: id })
}

function serveSubmission(req, res) {
  const row = db.prepare('SELECT mime_type, data FROM submissions WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).end()
  res.setHeader('Content-Type', row.mime_type)
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  res.send(row.data)
}

function submitVote(req, res) {
  const { submissionId, stars } = req.body
  if (!submissionId || stars < 1 || stars > 5) {
    return res.status(400).json({ error: 'Invalid vote' })
  }
  res.json({ ok: true })
}

function getResults(req, res) {
  const { code } = req.params
  const room = store.getRoom(code)
  if (!room || room.phase !== 'results' || !room.finalScores) {
    return res.status(404).json({ error: 'Results not available' })
  }
  res.json(room.finalScores)
}

module.exports = { createChallenge, joinChallenge, uploadDesign, serveSubmission, submitVote, getResults }
