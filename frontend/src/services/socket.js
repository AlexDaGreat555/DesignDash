import { io } from 'socket.io-client'

// In production, connect to the deployed backend URL.
// In dev, Vite proxies '/' to the local backend.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '/'

const socket = io(BACKEND_URL, { autoConnect: false })

export default socket
