import { useEffect } from 'react'
import socket from '../services/socket'
import { useGame } from '../context/GameContext'

// Connects the socket and wires server-driven state transitions to GameContext.
// Does NOT disconnect on unmount so the socket survives page navigation within a session.
export function useSocket() {
  const { dispatch } = useGame()

  useEffect(() => {
    socket.connect()

    const onPlayersUpdated = (players) => dispatch({ type: 'SET_PLAYERS', players })
    const onGameStarted = ({ spec, startedAt, timeLimitSeconds }) =>
      dispatch({ type: 'SET_GAME_STARTED', spec, startedAt, timeLimitSeconds })
    const onStartVoting = (submissions) => {
      dispatch({ type: 'SET_SUBMISSIONS', submissions })
      dispatch({ type: 'SET_PHASE', phase: 'voting' })
    }
    const onNextSlide = (index) => dispatch({ type: 'SET_SLIDE', index })
    const onShowResults = (scores) => {
      dispatch({ type: 'SET_SCORES', scores })
      dispatch({ type: 'SET_PHASE', phase: 'results' })
    }
    const onSubmissionsUpdated = ({ submittedCount }) =>
      dispatch({ type: 'SET_SUBMITTED_COUNT', submittedCount })

    socket.on('PLAYERS_UPDATED', onPlayersUpdated)
    socket.on('GAME_STARTED', onGameStarted)
    socket.on('START_VOTING', onStartVoting)
    socket.on('NEXT_SLIDE', onNextSlide)
    socket.on('SHOW_RESULTS', onShowResults)
    socket.on('SUBMISSIONS_UPDATED', onSubmissionsUpdated)

    return () => {
      socket.off('PLAYERS_UPDATED', onPlayersUpdated)
      socket.off('GAME_STARTED', onGameStarted)
      socket.off('START_VOTING', onStartVoting)
      socket.off('NEXT_SLIDE', onNextSlide)
      socket.off('SHOW_RESULTS', onShowResults)
      socket.off('SUBMISSIONS_UPDATED', onSubmissionsUpdated)
    }
  }, [dispatch])

  return socket
}
