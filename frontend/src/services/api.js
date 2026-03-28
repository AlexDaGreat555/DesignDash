import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''
const api = axios.create({ baseURL: `${BACKEND_URL}/api` })

export const createChallenge = (categoryTag, timeLimitSeconds) =>
  api.post('/challenges', { categoryTag, timeLimitSeconds })

export const joinChallenge = (code, nickname) =>
  api.post(`/challenges/${code}/join`, { nickname })

export const uploadDesign = (code, formData) =>
  api.post(`/challenges/${code}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const submitVote = (code, submissionId, stars) =>
  api.post(`/challenges/${code}/vote`, { submissionId, stars })

export const getResults = (code) =>
  api.get(`/challenges/${code}/results`)

export const getImageUrl = (relativePath) =>
  relativePath ? `${BACKEND_URL}${relativePath}` : null

export default api
