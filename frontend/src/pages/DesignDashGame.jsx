import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { useSocket } from '../hooks/useSocket'
import { uploadDesign } from '../services/api'
import './DesignDashGame.css'

export default function DesignDashGame() {
  const { code } = useParams()
  const navigate = useNavigate()
  const socket = useSocket()
  const { state } = useGame()
  const { nickname, players, spec, startedAt, timeLimit, submittedCount, phase } = state

  // Derive seconds left from server-stamped startedAt so all clients stay in sync
  const getSecondsLeft = useCallback(() => {
    if (!startedAt) return timeLimit || 600
    return Math.max(0, (timeLimit || 600) - Math.floor((Date.now() - startedAt) / 1000))
  }, [startedAt, timeLimit])

  const [secondsLeft, setSecondsLeft] = useState(getSecondsLeft)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef(null)

  // Sync timer every second against the server timestamp
  useEffect(() => {
    const id = setInterval(() => setSecondsLeft(getSecondsLeft()), 1000)
    return () => clearInterval(id)
  }, [getSecondsLeft])

  // Navigate when server transitions phase
  useEffect(() => {
    if (phase === 'voting') navigate(`/voting/${code}`)
    if (phase === 'results') navigate(`/results/${code}`)
  }, [phase, code, navigate])

  const handleFile = useCallback((file) => {
    if (!file || submitted) return
    if (!file.type.startsWith('image/')) return
    setUploadedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)
  }, [submitted])

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const handleSubmit = async () => {
    if (!uploadedFile || submitted || uploading) return
    setUploading(true)
    setUploadError('')
    try {
      const formData = new FormData()
      formData.append('design', uploadedFile)
      const { data } = await uploadDesign(code, formData)
      socket.emit('UPLOAD_COMPLETE', { code, submissionId: data.submissionId })
      setSubmitted(true)
    } catch {
      setUploadError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    if (submitted) return
    setUploadedFile(null)
    setPreview(null)
  }

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const secs = String(secondsLeft % 60).padStart(2, '0')
  const totalSeconds = timeLimit || 600
  const totalMins = Math.floor(totalSeconds / 60)
  const timerPct = secondsLeft / totalSeconds
  const timerUrgent = secondsLeft <= 60
  const playerCount = players.length

  return (
    <div className="game-page">
      {/* Header */}
      <header className="page-header game-header">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L4.09 12.11a1 1 0 00.7 1.71H11l-1 8.18a.5.5 0 00.86.39L19.91 12a1 1 0 00-.7-1.71H13l1-8.18a.5.5 0 00-.86-.39L13 2z" fill="#fff"/>
            </svg>
          </span>
          <span className="brand-name">Design Dash</span>
        </Link>
        <div className="game-header-right">
          <span className="game-header-code">{code}</span>
          <div className="game-header-user">
            <span className="game-header-avatar">{(nickname || 'U').charAt(0).toUpperCase()}</span>
            <span className="game-header-nickname">{nickname || 'Player'}</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="game-content">
        {/* ---- Left: The Brief ---- */}
        <div className="game-brief">
          <span className="game-brief-label">THE BRIEF</span>
          <h1 className="game-brief-title">{spec?.projectName}</h1>
          <span className="game-brief-type-badge">{spec?.type}</span>

          <div className="game-brief-fields">
            <div className="game-brief-field">
              <span className="game-brief-field-label">OBJECTIVE</span>
              <p>{spec?.objective}</p>
            </div>
            <div className="game-brief-field">
              <span className="game-brief-field-label">BACKGROUND</span>
              <p>{spec?.background}</p>
            </div>
            <div className="game-brief-field">
              <span className="game-brief-field-label">TARGET AUDIENCE</span>
              <p>{spec?.targetAudience}</p>
            </div>
            <div className="game-brief-field">
              <span className="game-brief-field-label">KEY MESSAGE</span>
              <p>{spec?.keyMessage}</p>
            </div>
            <div className="game-brief-field">
              <span className="game-brief-field-label">CALL TO ACTION</span>
              <p>{spec?.callToAction}</p>
            </div>
            <div className="game-brief-field">
              <span className="game-brief-field-label">VISUAL DIRECTION</span>
              <p>{spec?.visualDirection}</p>
            </div>
          </div>
        </div>

        {/* ---- Right: Timer + Upload ---- */}
        <div className="game-right">
          {/* Timer */}
          <div className="game-timer-section">
            <span className="game-timer-label">TIME REMAINING</span>
            <div className={`game-timer ${timerUrgent ? 'game-timer--urgent' : ''}`}>
              <span className="game-timer-digit">{mins}</span>
              <span className="game-timer-sep">:</span>
              <span className="game-timer-digit">{secs}</span>
            </div>
            <span className="game-timer-total">{totalMins}:00 total</span>
            <div className="game-timer-bar">
              <div className="game-timer-bar-fill" style={{ width: `${timerPct * 100}%` }} />
            </div>
          </div>

          {/* Upload zone */}
          <div
            className={`game-upload-zone ${isDragging ? 'game-upload-zone--drag' : ''} ${preview ? 'game-upload-zone--has-file' : ''} ${submitted ? 'game-upload-zone--submitted' : ''}`}
            onDragOver={(e) => { e.preventDefault(); if (!submitted) setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !submitted && !preview && fileInputRef.current?.click()}
          >
            {preview ? (
              <div className="game-upload-preview">
                <img src={preview} alt="Design preview" className="game-upload-thumb" />
                <div className="game-upload-file-info">
                  <span className="game-upload-filename">{uploadedFile?.name}</span>
                  <span className="game-upload-filesize">{(uploadedFile?.size / 1024 / 1024).toFixed(1)} MB</span>
                </div>
                {!submitted && (
                  <button className="game-upload-remove" onClick={(e) => { e.stopPropagation(); removeFile() }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                )}
                {submitted && <span className="game-upload-check">✓ Submitted</span>}
              </div>
            ) : (
              <div className="game-upload-placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <p className="game-upload-cta">Drop your design here</p>
                <p className="game-upload-alt">or click to browse</p>
                <p className="game-upload-formats">PNG or JPG · Max 10MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
          {uploadError && <p className="game-upload-error">{uploadError}</p>}
        </div>
      </main>

      {/* Footer bar */}
      <footer className="game-footer">
        <div className="game-footer-inner">
          <div className="game-footer-status">
            <span className="game-footer-count">
              {submittedCount} of {playerCount} submitted
            </span>
            <div className="game-footer-dots">
              {Array.from({ length: playerCount }).map((_, i) => (
                <span key={i} className={`game-footer-dot ${i < submittedCount ? 'game-footer-dot--filled' : ''}`} />
              ))}
            </div>
          </div>
          <button
            className="btn btn-dark game-footer-submit"
            onClick={handleSubmit}
            disabled={!uploadedFile || submitted || uploading}
          >
            {uploading ? 'Uploading…' : submitted ? 'Submitted' : 'Submit Final'}
          </button>
        </div>
      </footer>
    </div>
  )
}
