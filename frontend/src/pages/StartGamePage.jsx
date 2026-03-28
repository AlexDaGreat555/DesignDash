import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/shared/Header'
import { useGame } from '../context/GameContext'
import { createChallenge } from '../services/api'
import './StartGamePage.css'

const CATEGORIES = [
  'Branding',
  'UI Design',
  'Illustration',
  'Typography',
  'Logo Design',
  'Web Design',
]

const TIME_LIMITS = [
  { label: '5 minutes', value: 300 },
  { label: '10 minutes', value: 600 },
  { label: '15 minutes', value: 900 },
  { label: '20 minutes', value: 1200 },
]

export default function StartGamePage() {
  const navigate = useNavigate()
  const { dispatch } = useGame()

  const [nickname, setNickname] = useState('')
  const [category, setCategory] = useState('')
  const [timeLimit, setTimeLimit] = useState(600)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = nickname.trim() && category && !loading

  const handleCreate = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError('')
    try {
      const { data } = await createChallenge(category, timeLimit)
      dispatch({ type: 'SET_IDENTITY', nickname, isHost: true, code: data.code, category, timeLimit })
      navigate(`/lobby/${data.code}`)
    } catch {
      setError('Failed to create lobby. Is the server running?')
      setLoading(false)
    }
  }

  return (
    <div className="start-game-page">
      <Header showBack />

      <main className="start-game-content">
        <div className="start-game-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
            <path d="M16 3L8 8l8 5-8 5 8 5" stroke="#5ec6c6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 className="start-game-title">Start a Game</h1>
        <p className="start-game-subtitle">
          Pick your settings. The system will randomly select a brief that nobody sees until the game starts.
        </p>

        <div className="start-game-form">
          <div className="form-group">
            <label className="form-label">
              Your Nickname <span className="required">*</span>
            </label>
            <input
              className="form-input"
              type="text"
              placeholder="Enter your display name"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <span className="form-hint">You'll compete alongside other players</span>
          </div>

          <div className="form-group">
            <label className="form-label">
              Design Category <span className="required">*</span>
            </label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="" disabled>Choose a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Time Limit <span className="required">*</span>
            </label>
            <select
              className="form-select"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
            >
              {TIME_LIMITS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="fair-play-box">
            <div className="fair-play-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#b8860b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <strong className="fair-play-title">Fair Play Guarantee</strong>
              <p className="fair-play-text">
                The design brief will be randomly selected and hidden from everyone (including you!) until you click "Start Challenge" in the lobby.
              </p>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}
          <div className="start-game-actions">
            <button className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate} disabled={!canSubmit}>
              {loading ? 'Creating…' : 'Create Lobby'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
