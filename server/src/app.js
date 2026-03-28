const express = require('express')
const cors = require('cors')
const path = require('path')
const challengeRoutes = require('./routes/challengeRoutes')

const app = express()

app.use(cors())
app.use(express.json())

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

app.use('/api/challenges', challengeRoutes)

module.exports = app
