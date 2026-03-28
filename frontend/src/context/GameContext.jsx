import { createContext, useContext, useReducer } from 'react'

const GameContext = createContext(null)

const initialState = {
  nickname: '',
  challengeCode: '',
  isHost: false,
  category: '',
  timeLimit: 600,
  players: [],
  spec: null,
  phase: 'idle', // idle | lobby | sprint | processing | voting | results
  startedAt: null,
  submittedCount: 0,
  currentSlide: 0,
  submissions: [],
  scores: [],
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_IDENTITY':
      return {
        ...state,
        nickname: action.nickname,
        isHost: action.isHost,
        challengeCode: action.code,
        category: action.category || state.category,
        timeLimit: action.timeLimit || state.timeLimit,
      }
    case 'SET_PLAYERS':
      return { ...state, players: action.players }
    case 'SET_SPEC':
      return { ...state, spec: action.spec }
    case 'SET_GAME_STARTED':
      return {
        ...state,
        spec: action.spec,
        phase: 'sprint',
        startedAt: action.startedAt,
        timeLimit: action.timeLimitSeconds,
      }
    case 'SET_SUBMITTED_COUNT':
      return { ...state, submittedCount: action.submittedCount }
    case 'SET_PHASE':
      return { ...state, phase: action.phase }
    case 'SET_SLIDE':
      return { ...state, currentSlide: action.index }
    case 'SET_SUBMISSIONS':
      return { ...state, submissions: action.submissions }
    case 'SET_SCORES':
      return { ...state, scores: action.scores }
    default:
      return state
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>')
  return ctx
}
