import { useEffect } from 'react'
import socket from '../services/socket'
import { useGame } from '../context/GameContext'

// Connects the socket and wires server-driven state transitions to GameContext
export function useSocket() {
  const { dispatch } = useGame()

  useEffect(() => {
    socket.connect()

    socket.on('PLAYERS_UPDATED', (players) => dispatch({ type: 'SET_PLAYERS', players }))
    socket.on('GAME_STARTED', (spec) => { dispatch({ type: 'SET_SPEC', spec }); dispatch({ type: 'SET_PHASE', phase: 'sprint' }) })
    socket.on('START_VOTING', (submissions) => { dispatch({ type: 'SET_SUBMISSIONS', submissions }); dispatch({ type: 'SET_PHASE', phase: 'voting' }) })
    socket.on('NEXT_SLIDE', (index) => dispatch({ type: 'SET_SLIDE', index }))
    socket.on('SHOW_RESULTS', (scores) => { dispatch({ type: 'SET_SCORES', scores }); dispatch({ type: 'SET_PHASE', phase: 'results' }) })

    return () => socket.disconnect()
  }, [dispatch])

  return socket
}
