# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Design Dash** is a real-time multiplayer competitive design game. Players join synchronized design sprints, submit designs under a time limit, then vote on each other's work in a blind-voting session.

## Commands

All commands run from the repo root (`/DesignDash/`):

```bash
# Install all dependencies (root + frontend + backend)
npm run install:all

# Start both servers concurrently (recommended for development)
npm run dev
# Frontend: http://localhost:3000
# Backend:  http://localhost:5001

# Build frontend for production
npm run build

# Frontend-only commands (run from frontend/)
npm run lint       # ESLint on src/
npm run preview    # Preview production build

# Backend-only dev (run from backend/)
npm run dev        # Nodemon with auto-reload
```

Backend requires a `.env` file — copy from `backend/.env.example`:
```
PORT=5001
NODE_ENV=development
UPLOAD_DIR=uploads
```

## Architecture

This is a monorepo with two packages: `frontend/` (React + Vite) and `backend/` (Express + Socket.io).

### Communication Pattern

```
Frontend (React + Socket.io client)
    ↕ REST: POST /api/challenges, /join, /upload, /vote
    ↕ WebSocket: game state events
Backend (Express + Socket.io server)
    ↕
In-memory Store (Room objects per challenge code)
    ↕
/uploads/ (local disk via Multer)
```

Vite proxies `/api` and `/socket.io` from port 3000 → 5001 in development.

### Game Phase Flow

Phases are server-driven and transition via Socket.io broadcasts:

1. **Lobby** → players join via `JOIN_LOBBY` socket event
2. **Sprint** → `GAME_STARTED` broadcast triggers countdown + spec display
3. **Processing** → `UPLOAD_COMPLETE` events; voting starts when all players upload
4. **Voting** → `START_VOTING` broadcast; 30s per design or auto-advance on 100% votes
5. **Results** → `SHOW_RESULTS` broadcast with computed leaderboard

### Backend Structure (`backend/src/`)

- **`index.js`** — entry point; creates HTTP server, initializes Socket.io
- **`store/index.js`** — in-memory `Map` of `Room` objects; tracks phase, players, submissions, votes, scores; `computeScores()` averages ratings; `shuffleSubmissions()` randomizes voting order
- **`routes/challengeRoutes.js`** — REST endpoints: create challenge (returns 6-char code), join, upload (Multer, 10MB image limit), vote (1-5 stars)
- **`socket/`** — handlers split by phase: `lobbyHandlers.js`, `gameHandlers.js`, `votingHandlers.js`
- **`middleware/upload.js`** — Multer config with UUID filenames, image MIME filtering

### Frontend Structure (`frontend/src/`)

- **`context/GameContext.jsx`** — global `useReducer` state machine; single source of truth for nickname, challenge code, isHost, players, spec, phase, submissions, scores
- **`hooks/useSocket.js`** — wires Socket.io server events to GameContext dispatch actions
- **`services/socket.js`** — singleton Socket.io client instance
- **`services/api.js`** — Axios client with `/api` base URL
- **`pages/`** — one component per game phase, routed via React Router v6

### Key Design Decisions

- **No persistence**: In-memory store resets on server restart. Store comment suggests Redis for production multi-process deployments.
- **Blind voting**: Submissions are shuffled and player names hidden during voting; self-voting is prevented server-side.
- **Spec library**: Currently a hardcoded placeholder; PRD notes future database integration.
- **Socket.io CORS**: Currently `origin: '*'` — must be restricted before production deployment.
- **File storage**: Local disk via Multer; PRD notes S3/Cloudinary for production.
