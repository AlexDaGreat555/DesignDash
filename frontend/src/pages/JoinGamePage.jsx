import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/shared/Header'
import { useGame } from '../context/GameContext'
import { joinChallenge } from '../services/api'
import './JoinGamePage.css'

export default function JoinGamePage() {
  const navigate = useNavigate()
  const { dispatch } = useGame()

  const [code, setCode] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = code.trim() && nickname.trim() && !loading

  const handleJoin = async () => {
    if (!canSubmit) return
    const trimmedCode = code.trim().toUpperCase()
    setLoading(true)
    setError('')
    try {
      await joinChallenge(trimmedCode, nickname.trim())
      dispatch({ type: 'SET_IDENTITY', nickname: nickname.trim(), isHost: false, code: trimmedCode })
      navigate(`/lobby/${trimmedCode}`)
    } catch (err) {
      setError(err.response?.status === 404 ? 'Challenge not found. Check the code and try again.' : 'Failed to join. Is the server running?')
      setLoading(false)
    }
  }

  return (
    <div className="join-game-page">
      <Header showBack />

      <main className="join-game-content">
        <div className="join-game-card">
          <h1 className="join-game-title">Join Challenge</h1>
          <p className="join-game-subtitle">Enter the challenge code from your host</p>

          <div className="join-game-form">
            <div className="form-group">
              <label className="form-label">Challenge Code</label>
              <input
                className="form-input join-code-input"
                type="text"
                placeholder="DX-XXX"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Your Nickname</label>
              <input
                className="form-input"
                type="text"
                placeholder="Enter your display name"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>

            {error && <p className="form-error">{error}</p>}
            <button className="btn btn-primary btn-full" onClick={handleJoin} disabled={!canSubmit}>
              {loading ? 'Joining…' : 'Join Lobby'}
            </button>

            <p className="join-game-alt">
              Don't have a code? <Link to="/start" className="join-game-link">Host your own game</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
