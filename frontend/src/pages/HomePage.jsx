import { Link } from 'react-router-dom'
import './HomePage.css'

export default function HomePage() {
  return (
    <div className="home">
      <div className="home-brand">
        <span className="brand-icon brand-icon--lg">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L4.09 12.11a1 1 0 00.7 1.71H11l-1 8.18a.5.5 0 00.86.39L19.91 12a1 1 0 00-.7-1.71H13l1-8.18a.5.5 0 00-.86-.39L13 2z" fill="#fff"/>
          </svg>
        </span>
        <span className="brand-name brand-name--lg">Design Dash</span>
      </div>

      <h1 className="home-headline">Race. Design. Win.</h1>

      <p className="home-subtitle">
        Compete in real-time design challenges where everyone starts on equal
        footing. No prep, no advantage—just pure creativity under pressure.
      </p>

      <div className="home-actions">
        <Link to="/start" className="btn btn-primary">Start Game</Link>
        <Link to="/join" className="btn btn-outline">Join Game</Link>
      </div>
    </div>
  )
}
