import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Header from '../components/shared/Header'
import { useGame } from '../context/GameContext'
import './LobbyPage.css'

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  return `${m} minute${m !== 1 ? 's' : ''}`
}

export default function LobbyPage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useGame()
  const [copied, setCopied] = useState(false)

  const { isHost, nickname, players, category, timeLimit, phase } = state

  // Seed mock players on mount so the lobby UI is populated
  useEffect(() => {
    if (!nickname) return
    const self = { id: 'me', nickname, isHost }
    const mocks = isHost
      ? [self, { id: 'p2', nickname: 'PixelMaster', isHost: false }, { id: 'p3', nickname: 'ColorWizard', isHost: false }]
      : [{ id: 'host', nickname: 'DesignMaster', isHost: true }, self, { id: 'p3', nickname: 'PixelMaster', isHost: false }]
    dispatch({ type: 'SET_PLAYERS', players: mocks })
  }, [nickname]) // eslint-disable-line react-hooks/exhaustive-deps

  // Navigate to game when host starts (wired up once backend is live)
  useEffect(() => {
    if (phase === 'sprint') navigate(`/game/${code}`)
  }, [phase, code, navigate])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard not available */
    }
  }

  // TODO: emit START_GAME via socket once backend is connected
  const handleStart = () => {
    dispatch({ type: 'SET_PHASE', phase: 'sprint' })
  }

  return (
    <div className="lobby-page">
      {/* Header */}
      <header className="page-header">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L4.09 12.11a1 1 0 00.7 1.71H11l-1 8.18a.5.5 0 00.86.39L19.91 12a1 1 0 00-.7-1.71H13l1-8.18a.5.5 0 00-.86-.39L13 2z" fill="#fff"/>
            </svg>
          </span>
          <span className="brand-name">Design Dash</span>
        </Link>
        <span className="lobby-header-label">Lobby</span>
      </header>

      <main className="lobby-content">
        {/* ---- Left column ---- */}
        <div className="lobby-left">
          {/* Challenge code */}
          <section className="lobby-code-section">
            <h2 className="lobby-code-heading">Challenge Code</h2>
            <div className="lobby-code-row">
              <span className="lobby-code">{code}</span>
              <button className="lobby-copy-btn" onClick={handleCopy} title="Copy code">
                {copied ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5ec6c6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                )}
              </button>
            </div>
            <p className="lobby-code-hint">Share this code with participants</p>
          </section>

          {/* Design brief hidden notice */}
          <section className="lobby-brief-box">
            <div className="lobby-brief-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5ec6c6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </div>
            <div>
              <strong className="lobby-brief-title">Design Brief: Hidden</strong>
              <p className="lobby-brief-text">
                The brief is locked and will be revealed to everyone simultaneously when the host starts the challenge. Nobody has seen it yet—not even the host!
              </p>
              <div className="lobby-brief-tags">
                {category && <span className="lobby-tag">Category: <strong>{category}</strong></span>}
                <span className="lobby-tag">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {formatTime(timeLimit)}
                </span>
              </div>
            </div>
          </section>

          {/* Before you start checklist */}
          <section className="lobby-checklist">
            <h3 className="lobby-checklist-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
              Before You Start
            </h3>
            <ol className="lobby-checklist-list">
              <li>Open your design tool (Figma, Photoshop, Canva, etc.)</li>
              <li>The full brief will appear when the timer starts—everyone sees it at the same time</li>
              <li>Design fast and upload your file (PNG or JPG) before time runs out</li>
              <li>If everyone uploads early, the voting phase starts immediately</li>
            </ol>
          </section>

          {/* Level playing field notice */}
          <section className="lobby-level-box">
            <div className="lobby-level-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b8860b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <strong className="lobby-level-title">Level Playing Field</strong>
              <p className="lobby-level-text">
                The brief has been randomly selected by the system. No one—including the host—has any advance knowledge of what you'll be designing.
              </p>
            </div>
          </section>
        </div>

        {/* ---- Right column ---- */}
        <div className="lobby-right">
          <section className="lobby-participants-card">
            <div className="lobby-participants-header">
              <h3 className="lobby-participants-title">Participants</h3>
              <span className="lobby-participants-count">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                {players.length}
              </span>
            </div>

            <ul className="lobby-players-list">
              {players.map((p) => (
                <li key={p.id} className="lobby-player">
                  <span className="lobby-player-avatar">
                    {p.nickname.charAt(0).toUpperCase()}
                  </span>
                  <span className="lobby-player-name">{p.nickname}</span>
                  {p.isHost && <span className="lobby-host-badge">HOST</span>}
                </li>
              ))}
            </ul>

            {/* Host: start button. Guest: waiting message */}
            {isHost ? (
              <div className="lobby-start-section">
                <button
                  className="btn btn-primary btn-full lobby-start-btn"
                  onClick={handleStart}
                  disabled={players.length < 2}
                >
                  Start Challenge &amp; Reveal Brief
                </button>
                <p className="lobby-start-hint">
                  This will reveal the brief to everyone and start the timer.
                </p>
              </div>
            ) : (
              <div className="lobby-waiting-section">
                <div className="lobby-waiting-indicator">
                  <span className="lobby-waiting-dot" />
                  <span className="lobby-waiting-dot" />
                  <span className="lobby-waiting-dot" />
                </div>
                <p className="lobby-waiting-text">Waiting for the host to start the challenge...</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
