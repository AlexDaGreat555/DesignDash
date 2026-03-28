import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import StartGamePage from './pages/StartGamePage'
import JoinGamePage from './pages/JoinGamePage'
import LobbyPage from './pages/LobbyPage'
import DesignDashGame from './pages/DesignDashGame'
import VotingPage from './pages/VotingPage'
import ResultsPage from './pages/ResultsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/start" element={<StartGamePage />} />
      <Route path="/join" element={<JoinGamePage />} />
      <Route path="/lobby/:code" element={<LobbyPage />} />
      <Route path="/game/:code" element={<DesignDashGame />} />
      <Route path="/voting/:code" element={<VotingPage />} />
      <Route path="/results/:code" element={<ResultsPage />} />
    </Routes>
  )
}
