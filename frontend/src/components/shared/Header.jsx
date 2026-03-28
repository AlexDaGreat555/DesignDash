import { Link, useNavigate } from 'react-router-dom'

export default function Header({ showBack = false }) {
  const navigate = useNavigate()

  return (
    <header className="page-header">
      <div>
        {showBack && (
          <button className="back-link" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <span>&larr;</span> Back
          </button>
        )}
      </div>
      <Link to="/" className="brand">
        <span className="brand-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L4.09 12.11a1 1 0 00.7 1.71H11l-1 8.18a.5.5 0 00.86.39L19.91 12a1 1 0 00-.7-1.71H13l1-8.18a.5.5 0 00-.86-.39L13 2z" fill="#fff"/>
          </svg>
        </span>
        <span className="brand-name">Design Dash</span>
      </Link>
    </header>
  )
}
