import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { useSocket } from '../hooks/useSocket'
import { getImageUrl } from '../services/api'
import './VotingPage.css'

const SLIDE_DURATION_SECS = 7 // must match server SLIDE_DURATION_MS / 1000

export default function VotingPage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const socket = useSocket()
  const { state } = useGame()
  const { submissions, currentSlide, slideStartedAt, phase, spec } = state

  const totalSlides = submissions.length
  const current = submissions[currentSlide]
  const isOwnDesign = current?.playerId === socket.id

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [voteSubmitted, setVoteSubmitted] = useState(false)

  // Derive remaining seconds from server-stamped slideStartedAt
  const getSlideTimeLeft = useCallback(() => {
    if (!slideStartedAt) return SLIDE_DURATION_SECS
    return Math.max(0, SLIDE_DURATION_SECS - Math.floor((Date.now() - slideStartedAt) / 1000))
  }, [slideStartedAt])

  const [slideTimer, setSlideTimer] = useState(getSlideTimeLeft)

  // Tick every second, recomputing from server timestamp so all clients stay in sync
  useEffect(() => {
    setSlideTimer(getSlideTimeLeft())
    const id = setInterval(() => setSlideTimer(getSlideTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [getSlideTimeLeft])

  // Reset vote UI whenever the server advances to a new slide
  useEffect(() => {
    setRating(0)
    setHoverRating(0)
    setVoteSubmitted(false)
  }, [currentSlide])

  // Navigate when server moves to results
  useEffect(() => {
    if (phase === 'results') navigate(`/results/${code}`)
  }, [phase, code, navigate])

  const handleSubmitVote = () => {
    if (isOwnDesign || !current?.id || rating === 0 || voteSubmitted) return
    socket.emit('SUBMIT_VOTE', { code, submissionId: current.id, stars: rating })
    setVoteSubmitted(true)
  }

  const timerPct = slideTimer / SLIDE_DURATION_SECS

  return (
    <div className="voting-page">
      {/* Header */}
      <header className="page-header voting-header">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L4.09 12.11a1 1 0 00.7 1.71H11l-1 8.18a.5.5 0 00.86.39L19.91 12a1 1 0 00-.7-1.71H13l1-8.18a.5.5 0 00-.86-.39L13 2z" fill="#fff"/>
            </svg>
          </span>
          <span className="brand-name">Design Dash</span>
        </Link>
        <span className="voting-header-challenge">{spec?.projectName}</span>
        <span className="game-header-code">{code}</span>
      </header>

      {/* Sub-header: phase label, slide counter, timer */}
      <div className="voting-subheader">
        <span className="voting-phase-label">VOTING</span>
        <div className="voting-slide-counter">
          <span className="voting-slide-current">#{currentSlide + 1}</span>
          <span className="voting-slide-sep">/</span>
          <span className="voting-slide-total">#{totalSlides}</span>
        </div>
        <div className="voting-timer">
          <span className="voting-timer-value">{slideTimer}s</span>
          <div className="voting-timer-bar">
            <div className="voting-timer-bar-fill" style={{ width: `${timerPct * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Main: Design display */}
      <main className="voting-main">
        <div className="voting-design-card">
          {current?.imageUrl ? (
            <img
              src={getImageUrl(current.imageUrl)}
              alt={`Design #${currentSlide + 1}`}
              className="voting-design-image"
            />
          ) : (
            <div className="voting-no-submission">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
              </svg>
              <p className="voting-no-submission-text">No Submission</p>
              <p className="voting-no-submission-hint">This player did not upload a design</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer: rating + submit */}
      <footer className="voting-footer">
        <div className="voting-footer-inner">
          <div className="voting-footer-meta">
            <span className="voting-footer-label">RATE THIS DESIGN</span>
            <span className="voting-footer-author">By Anonymous</span>
          </div>

          <div className="voting-rating-area">
            {isOwnDesign ? (
              <div className="voting-own-design">
                <span className="voting-own-badge">Your Design</span>
                <p className="voting-own-text">You cannot rate your own submission</p>
              </div>
            ) : !current?.imageUrl ? (
              <div className="voting-own-design">
                <p className="voting-own-text">No submission to rate</p>
              </div>
            ) : (
              <div className="voting-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={`voting-star ${star <= (hoverRating || rating) ? 'voting-star--active' : ''} ${voteSubmitted ? 'voting-star--locked' : ''}`}
                    onClick={() => !voteSubmitted && setRating(star)}
                    onMouseEnter={() => !voteSubmitted && setHoverRating(star)}
                    onMouseLeave={() => !voteSubmitted && setHoverRating(0)}
                    disabled={voteSubmitted}
                    aria-label={`${star} star`}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        fill={star <= (hoverRating || rating) ? '#f59e0b' : 'none'}
                        stroke={star <= (hoverRating || rating) ? '#f59e0b' : '#d1d5db'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                ))}
                {rating > 0 && <span className="voting-rating-value">{rating}/5</span>}
              </div>
            )}
          </div>

          <button
            className="btn btn-dark voting-submit-btn"
            onClick={handleSubmitVote}
            disabled={isOwnDesign || !current?.imageUrl || rating === 0 || voteSubmitted}
          >
            {voteSubmitted ? 'Voted!' : 'Submit Vote'}
          </button>
        </div>
      </footer>
    </div>
  )
}
