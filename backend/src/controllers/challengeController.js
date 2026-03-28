const { v4: uuidv4 } = require('uuid')
const store = require('../store')

function createChallenge(req, res) {
  const { categoryTag, timeLimitSeconds } = req.body
  const code = uuidv4().slice(0, 6).toUpperCase()
  store.getOrCreateRoom(code)
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
  res.json({ submissionId: req.file.filename })
}

function submitVote(req, res) {
  const { submissionId, stars } = req.body
  if (!submissionId || stars < 1 || stars > 5) {
    return res.status(400).json({ error: 'Invalid vote' })
  }
  res.json({ ok: true })
}

module.exports = { createChallenge, joinChallenge, uploadDesign, submitVote }
