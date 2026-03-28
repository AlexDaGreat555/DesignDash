const express = require('express')
const cors = require('cors')
const challengeRoutes = require('./routes/challengeRoutes')
const promptRoutes = require('./routes/promptRoutes')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/challenges', challengeRoutes)
app.use('/api/prompts', promptRoutes)

module.exports = app
