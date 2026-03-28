const express = require('express')
const cors = require('cors')
const path = require('path')
const challengeRoutes = require('./routes/challengeRoutes')
const promptRoutes = require('./routes/promptRoutes')

const app = express()

app.use(cors())
app.use(express.json())

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

app.use('/api/challenges', challengeRoutes)
app.use('/api/prompts', promptRoutes)

module.exports = app
