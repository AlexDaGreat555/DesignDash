import { io } from 'socket.io-client'

// Single shared socket instance reused across the app
const socket = io('/', { autoConnect: false })

export default socket
