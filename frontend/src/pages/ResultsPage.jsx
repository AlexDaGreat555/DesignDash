import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import './ResultsPage.css'

// Mock results — in production these come from the server after voting concludes
const MOCK_RESULTS = [
  { rank: 1, nickname: 'Alex Chen',    voterScore: 4.9, aiScore: 4.7, imageUrl: 'https://picsum.photos/seed/winner1/400/300' },
  { rank: 2, nickname: 'Jordan Smith', voterScore: 4.6, aiScore: 4.4, imageUrl: 'https://picsum.photos/seed/winner2/400/300' },
  { rank: 3, nickname: 'Sam Rivera',   voterScore: 4.3, aiScore: 4.1, imageUrl: 'https://picsum.photos/seed/winner3/400/300' },
  { rank: 4, nickname: 'Taylor Kim',   voterScore: 3.9, aiScore: 3.7, imageUrl: 'https://picsum.photos/seed/player4/400/300' },
  { rank: 5, nickname: 'Morgan Davis', voterScore: 3.6, aiScore: 3.4, imageUrl: 'https://picsum.photos/seed/player5/400/300' },
]

const PODIUM_COLORS = {
  1: { bg: '#7c3aed', text: '#fff' },   // purple / gold
  2: { bg: '#6b7280', text: '#fff' },   // grey / silver
  3: { bg: '#92400e', text: '#fff' },   // brown / bronze
}

function combinedScore(r) {
  return ((r.voterScore + r.aiScore) / 2).toFixed(1)
}

export default function ResultsPage() {
  const { code } = useParams()
  const { state } = useGame()
  const results = MOCK_RESULTS
  const [expandedImage, setExpandedImage] = useState(null)

  const top3 = results.slice(0, 3)
  const rest = results.slice(3)

  // Podium order: 2nd, 1st, 3rd for visual layout
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean)

  return (
    <div className="results-page">
      {/* Header */}
      <header className="page-header results-header">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L4.09 12.11a1 1 0 00.7 1.71H11l-1 8.18a.5.5 0 00.86.39L19.91 12a1 1 0 00-.7-1.71H13l1-8.18a.5.5 0 00-.86-.39L13 2z" fill="#fff"/>
            </svg>
          </span>
          <span className="brand-name">Design Dash</span>
        </Link>
        <span className="game-header-code">{code}</span>
      </header>

      <main className="results-content">
        {/* ======== SECTION 1: Rankings ======== */}
        <section className="results-rankings-section">
          <div className="results-title-row">
            <span className="results-sparkle">✨</span>
            <h1 className="results-title">Results</h1>
            <span className="results-sparkle">✨</span>
          </div>
          <p className="results-subtitle">Final Standings</p>

          {/* Podium */}
          <div className="podium">
            {podiumOrder.map((player) => {
              const place = player.rank
              const colors = PODIUM_COLORS[place]
              const isFirst = place === 1
              return (
                <div key={player.rank} className={`podium-slot podium-slot--${place}`}>
                  {/* Design preview above podium */}
                  <button
                    className="podium-design-preview"
                    onClick={() => setExpandedImage(player.imageUrl)}
                    title="Click to expand"
                  >
                    <img src={player.imageUrl} alt={`${player.nickname}'s design`} className="podium-design-img" />
                    <span className="podium-design-expand">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                    </span>
                  </button>

                  {/* Rank circle */}
                  <div className="podium-rank-circle" style={{ background: colors.bg, color: colors.text }}>
                    {isFirst && <span className="podium-crown">👑</span>}
                    {place}
                  </div>

                  {/* Podium block */}
                  <div className="podium-block" style={{ background: colors.bg }}>
                    <div className="podium-score-row">
                      <span className="podium-star">★</span>
                      <span className="podium-score">{combinedScore(player)}</span>
                    </div>
                    <span className="podium-name">{player.nickname}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Remaining players */}
          {rest.length > 0 && (
            <div className="results-rest">
              {rest.map((player) => (
                <div key={player.rank} className="results-rest-row">
                  <span className="results-rest-rank">{player.rank}</span>
                  <span className="results-rest-name">{player.nickname}</span>
                  <span className="results-rest-score">
                    <span className="results-rest-star">★</span> {combinedScore(player)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ======== SECTION 2: AI Judge Ratings ======== */}
        <section className="ai-section">
          <div className="ai-section-header">
            <span className="ai-section-icon">✦</span>
            <h2 className="ai-section-title">AI Judge Ratings</h2>
          </div>

          <div className="ai-ratings-list">
            {results.map((player) => (
              <div key={player.rank} className="ai-rating-row">
                <span className={`ai-rank-badge ai-rank-badge--${player.rank <= 3 ? player.rank : 'default'}`}>
                  {player.rank}
                </span>
                <span className="ai-rating-name">{player.nickname}</span>
                <div className="ai-rating-scores">
                  <div className="ai-rating-score-group">
                    <span className="ai-rating-label">Voter Score</span>
                    <span className="ai-rating-value">
                      <span className="ai-rating-star">★</span> {player.voterScore.toFixed(1)}
                    </span>
                  </div>
                  <div className="ai-rating-score-group">
                    <span className="ai-rating-label ai-rating-label--ai">AI Score</span>
                    <span className="ai-rating-value ai-rating-value--ai">
                      <span className="ai-rating-star">★</span> {player.aiScore.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="ai-section-footnote">
            Combined scores calculated from voter ratings and AI judge feedback
          </p>
        </section>

        {/* Back to home */}
        <div className="results-actions">
          <Link to="/" className="btn btn-primary">Back to Home</Link>
        </div>
      </main>

      {/* Expanded image modal */}
      {expandedImage && (
        <div className="results-modal-overlay" onClick={() => setExpandedImage(null)}>
          <div className="results-modal" onClick={(e) => e.stopPropagation()}>
            <button className="results-modal-close" onClick={() => setExpandedImage(null)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <img src={expandedImage} alt="Expanded design" className="results-modal-img" />
          </div>
        </div>
      )}
    </div>
  )
}
