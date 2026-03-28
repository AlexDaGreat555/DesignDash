# Design Dash

A real-time, competitive design game. Players respond to automated Specs during a synchronized sprint, then vote on each other's designs in a live-broadcast-style voting session.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Node.js, Express 4 |
| Real-time | Socket.io 4 |
| File uploads | Multer (local disk) |
| State (server) | In-memory store (swap for Redis in production) |

---

## Prerequisites

- Node.js >= 18
- npm >= 9

---

## Running Locally

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd DesignDash
npm run install:all
```

This installs root, `frontend/`, and `backend/` dependencies in one command.

### 2. Configure the backend environment

```bash
cp backend/.env.example backend/.env
```

The defaults work out of the box for local development — no changes needed.

### 3. Create the uploads directory

```bash
mkdir -p backend/uploads
```

### 4. Start both servers

```bash
npm run dev
```

This runs both processes concurrently:

| Process | URL |
|---|---|
| React (Vite) | http://localhost:3000 |
| Express + Socket.io | http://localhost:5001 |

Vite proxies all `/api` and `/socket.io` requests to the Express backend, so the frontend only needs to talk to port 3000.

---

## Running Separately (optional)

**Backend only:**
```bash
cd backend
npm run dev
```

**Frontend only:**
```bash
cd frontend
npm run dev
```

---

## Project Structure

```
DesignDash/
├── frontend/                  # React frontend (Vite)
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx            # App entry point
│       ├── App.jsx             # Route definitions
│       ├── index.css
│       ├── context/
│       │   └── GameContext.jsx # Global game state (useReducer)
│       ├── hooks/
│       │   └── useSocket.js    # Socket.io event wiring
│       ├── services/
│       │   ├── socket.js       # Shared socket instance
│       │   └── api.js          # Axios REST helpers
│       ├── pages/
│       │   ├── HomePage.jsx    # Create / join challenge
│       │   ├── LobbyPage.jsx   # Waiting room
│       │   ├── GamePage.jsx    # Design sprint + upload
│       │   ├── VotingPage.jsx  # Synchronized blind voting
│       │   └── ResultsPage.jsx # Leaderboard reveal
│       └── components/
│           ├── lobby/
│           │   ├── PlayerList.jsx
│           │   └── StartButton.jsx
│           ├── game/
│           │   ├── SpecCard.jsx
│           │   ├── CountdownTimer.jsx
│           │   └── UploadZone.jsx
│           ├── voting/
│           │   ├── DesignSlide.jsx
│           │   ├── StarRating.jsx
│           │   └── SlideTimer.jsx
│           └── results/
│               └── Leaderboard.jsx
│
└── backend/                   # Express + Socket.io backend
    ├── .env.example
    ├── uploads/               # Local file storage (gitignored)
    └── src/
        ├── index.js            # HTTP server entry point
        ├── app.js              # Express app + middleware
        ├── store/
        │   └── index.js        # In-memory room/game state
        ├── routes/
        │   └── challengeRoutes.js
        ├── controllers/
        │   └── challengeController.js
        ├── middleware/
        │   └── upload.js       # Multer config
        └── socket/
            ├── index.js        # Socket.io init + connection
            ├── lobbyHandlers.js   # JOIN_LOBBY, START_GAME
            ├── gameHandlers.js    # UPLOAD_COMPLETE → voting trigger
            └── votingHandlers.js  # SUBMIT_VOTE, slide advance, SHOW_RESULTS
```

---

## Socket.io Events Reference

### Frontend → Backend

| Event | Payload | Description |
|---|---|---|
| `JOIN_LOBBY` | `{ code, nickname, isHost }` | Join a challenge room |
| `START_GAME` | `{ code }` | Host triggers the sprint |
| `UPLOAD_COMPLETE` | `{ code, submissionId }` | Notify backend upload is done |
| `SUBMIT_VOTE` | `{ code, submissionId, stars }` | Cast a 1–5 star vote |

### Backend → Frontend

| Event | Payload | Description |
|---|---|---|
| `PLAYERS_UPDATED` | `players[]` | Lobby headcount changed |
| `GAME_STARTED` | `spec` | Sprint begins, Spec revealed |
| `START_VOTING` | `submissions[]` | All uploads received, voting opens |
| `NEXT_SLIDE` | `index` | Advance all clients to the next design |
| `SHOW_RESULTS` | `scores[]` | Voting complete, leaderboard revealed |

---

## REST API Reference

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/challenges` | Create a challenge, returns `{ code }` |
| `POST` | `/api/challenges/:code/join` | Validate code + nickname |
| `POST` | `/api/challenges/:code/upload` | Upload design image (`multipart/form-data`) |
| `POST` | `/api/challenges/:code/vote` | Record a star rating |
