# Design Dash

A real-time, competitive design game. Players respond to automated Specs during a synchronized sprint, then vote on each other's designs in a live-broadcast-style voting session.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Node.js, Express 4 |
| Real-time | Socket.io 4 |
| Database | SQLite via better-sqlite3 |
| File uploads | Multer (local disk) |
| State (server) | In-memory store (swap for Redis in production) |

---

## Prerequisites

- **Node.js >= 18**
- **npm >= 9**
- **A C++ compiler** — required by `better-sqlite3`, which compiles native bindings during `npm install`:
  - **macOS**: Xcode Command Line Tools — run `xcode-select --install` if not already installed
  - **Linux**: `sudo apt install build-essential` (Debian/Ubuntu) or equivalent
  - **Windows**: [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) — install the "Desktop development with C++" workload
- **Python** — also required by `node-gyp` (the C++ build tool). Pre-installed on macOS and most Linux distros. On Windows, download from [python.org](https://www.python.org/downloads/).

> **macOS/Linux users**: if Node.js is already working on your machine, `npm install` will almost always succeed without any extra steps — the compiler tools are typically already present.
>
> **Windows users**: the C++ build tools are the most common friction point. If `npm install` fails with a `node-gyp` error, install the Visual Studio Build Tools linked above and re-run.

---

## Running Locally

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd DesignDash
npm run install:all
```

This installs root, `frontend/`, and `backend/` dependencies in one command. The SQLite database is created and seeded automatically the first time the backend starts — no manual setup needed.

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

Vite proxies all `/api`, `/socket.io`, and `/uploads` requests to the Express backend, so the frontend only needs to talk to port 3000.

---

## Database

Prompt data is stored in a SQLite database at `backend/data/design_dash.db`.

**The database is created and seeded automatically** on first server start — you do not need to run anything manually for a fresh setup.

To manually re-seed (useful after editing `backend/src/db/seedData.js`):

```bash
cd backend
npm run seed
```

This clears the `prompts` table and re-inserts all entries from `seedData.js`.

### Prompt API

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/prompts` | List all prompts (`?category=Branding` to filter) |
| `GET` | `/api/prompts/categories` | List all distinct categories |
| `GET` | `/api/prompts/:id` | Get a single prompt |
| `POST` | `/api/prompts` | Create a new prompt |
| `PUT` | `/api/prompts/:id` | Update a prompt (partial updates supported) |
| `DELETE` | `/api/prompts/:id` | Delete a prompt |

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
│       ├── context/
│       │   └── GameContext.jsx # Global game state (useReducer + sessionStorage)
│       ├── hooks/
│       │   └── useSocket.js    # Socket.io event wiring + auto re-join
│       ├── services/
│       │   ├── socket.js       # Shared socket instance
│       │   └── api.js          # Axios REST helpers
│       └── pages/
│           ├── HomePage.jsx
│           ├── StartGamePage.jsx
│           ├── JoinGamePage.jsx
│           ├── LobbyPage.jsx
│           ├── DesignDashGame.jsx  # Design sprint + upload
│           ├── VotingPage.jsx
│           └── ResultsPage.jsx
│
└── backend/                   # Express + Socket.io backend
    ├── .env.example
    ├── uploads/               # Uploaded design images (gitignored)
    ├── data/                  # SQLite database file (gitignored)
    └── src/
        ├── index.js            # HTTP server entry point
        ├── app.js              # Express app + middleware
        ├── store/
        │   └── index.js        # In-memory room/game state
        ├── db/
        │   ├── index.js        # SQLite connection, schema, auto-seed
        │   ├── seedData.js     # Prompt pool (edit to add/change prompts)
        │   └── seed.js         # Standalone seed script (npm run seed)
        ├── routes/
        │   ├── challengeRoutes.js
        │   └── promptRoutes.js
        ├── controllers/
        │   ├── challengeController.js
        │   └── promptController.js
        ├── middleware/
        │   └── upload.js       # Multer config
        └── socket/
            ├── index.js           # Socket.io init
            ├── lobbyHandlers.js   # JOIN_LOBBY, START_GAME
            ├── gameHandlers.js    # UPLOAD_COMPLETE → voting trigger
            └── votingHandlers.js  # SUBMIT_VOTE, slide advance, SHOW_RESULTS
```

---

## Socket.io Events Reference

### Frontend → Backend

| Event | Payload | Description |
|---|---|---|
| `JOIN_LOBBY` | `{ code, nickname, isHost }` | Join or re-join a challenge room |
| `START_GAME` | `{ code }` | Host triggers the sprint |
| `UPLOAD_COMPLETE` | `{ code, submissionId }` | Notify backend upload is done |
| `SUBMIT_VOTE` | `{ code, submissionId, stars }` | Cast a 1–5 star vote |

### Backend → Frontend

| Event | Payload | Description |
|---|---|---|
| `PLAYERS_UPDATED` | `players[]` | Lobby headcount changed |
| `GAME_STARTED` | `{ spec, startedAt, timeLimitSeconds }` | Sprint begins, spec revealed |
| `SUBMISSIONS_UPDATED` | `{ submittedCount, totalCount }` | A player uploaded their design |
| `START_VOTING` | `{ submissions[], slideStartedAt }` | All uploads in, voting opens |
| `NEXT_SLIDE` | `{ index, slideStartedAt }` | Advance all clients to the next design |
| `SHOW_RESULTS` | `scores[]` | Voting complete, leaderboard revealed |

---

## REST API Reference

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/challenges` | Create a challenge, returns `{ code }` |
| `POST` | `/api/challenges/:code/join` | Validate code + nickname |
| `POST` | `/api/challenges/:code/upload` | Upload design image (`multipart/form-data`) |
| `POST` | `/api/challenges/:code/vote` | Record a star rating |
| `GET` | `/api/prompts` | List prompts (`?category=` to filter) |
| `GET` | `/api/prompts/categories` | List distinct categories |
| `GET` | `/api/prompts/:id` | Get a single prompt |
| `POST` | `/api/prompts` | Create a prompt |
| `PUT` | `/api/prompts/:id` | Update a prompt |
| `DELETE` | `/api/prompts/:id` | Delete a prompt |
