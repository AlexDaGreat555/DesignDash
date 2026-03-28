require('dotenv').config()
const fs = require('fs')
const path = require('path')
const http = require('http')
const app = require('./app')
const { initSocket } = require('./socket')

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const PORT = process.env.PORT || 5001

const server = http.createServer(app)
initSocket(server)

server.listen(PORT, () => {
  console.log(`Design Dash server running on http://localhost:${PORT}`)
})
