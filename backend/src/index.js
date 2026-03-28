require('dotenv').config()
const http = require('http')
const app = require('./app')
const { initSocket } = require('./socket')

const PORT = process.env.PORT || 5001

const server = http.createServer(app)
initSocket(server)

server.listen(PORT, () => {
  console.log(`Design Dash server running on http://localhost:${PORT}`)
})
