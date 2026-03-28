const express = require('express')
const cors = require('cors')
const challengeRoutes = require('./routes/challengeRoutes')
const promptRoutes = require('./routes/promptRoutes')

const app = express()

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
  : ['http://localhost:3000']
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())

app.use('/api/challenges', challengeRoutes)
app.use('/api/prompts', promptRoutes)

module.exports = app
