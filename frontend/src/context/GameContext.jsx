import { createContext, useContext, useReducer, useEffect } from 'react'

const GameContext = createContext(null)

const SESSION_KEY = 'dda_identity'

function loadIdentity() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const defaultState = {
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
  slideStartedAt: null,
  submissions: [],
  scores: [],
}

// Hydrate identity fields from sessionStorage so a page reload restores who the player is
const saved = loadIdentity()
const initialState = saved ? { ...defaultState, ...saved } : defaultState

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
      return { ...state, currentSlide: action.index, slideStartedAt: action.slideStartedAt }
    case 'SET_SUBMISSIONS':
      return { ...state, submissions: action.submissions, slideStartedAt: action.slideStartedAt }
    case 'SET_SCORES':
      return { ...state, scores: action.scores }
    default:
      return state
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  // Keep sessionStorage in sync so reloads can restore identity
  useEffect(() => {
    if (!state.nickname || !state.challengeCode) return
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        nickname: state.nickname,
        challengeCode: state.challengeCode,
        isHost: state.isHost,
        category: state.category,
        timeLimit: state.timeLimit,
      }))
    } catch { /* ignore */ }
  }, [state.nickname, state.challengeCode, state.isHost, state.category, state.timeLimit])

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
