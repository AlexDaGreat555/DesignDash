# Design Dash

A real-time, competitive design game. Players respond to automated Specs during a synchronized sprint, then vote on each other's designs in a live-broadcast-style voting session. An AI judge (Gemini 1.5 Flash) scores every submission and contributes to the final leaderboard.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Node.js, Express 4 |
| Real-time | Socket.io 4 |
| Database | SQLite via better-sqlite3 |
| File uploads | Multer (local disk) |
| AI Judge | Google Gemini 1.5 Flash (multimodal) |
| State (server) | In-memory store (swap for Redis in production) |

---

## Prerequisites

### Required for everyone

- **Node.js >= 18** — [nodejs.org](https://nodejs.org)
- **npm >= 9** — included with Node.js
- **A C++ compiler** — required by `better-sqlite3`, which compiles native bindings during `npm install`:
  - **macOS**: Xcode Command Line Tools — run `xcode-select --install`
  - **Linux**: `sudo apt install build-essential` (Debian/Ubuntu) or equivalent
  - **Windows**: [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) — install the "Desktop development with C++" workload
- **Python** — required by `node-gyp`. Pre-installed on macOS and most Linux distros. On Windows, download from [python.org](https://www.python.org/downloads/).

> **macOS/Linux**: if Node.js is already working, `npm install` almost always succeeds without extra steps.
>
> **Windows**: the C++ build tools are the most common friction point. If `npm install` fails with a `node-gyp` error, install the Visual Studio Build Tools above and re-run.

### Required for the AI Judge

- **A Gemini API key** — free to obtain at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

---

## Getting Started

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd DesignDash
npm run install:all
```

This installs root, `frontend/`, and `backend/` dependencies in one command.

### 2. Configure environment variables

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in the values:

```env
PORT=5001
NODE_ENV=development
UPLOAD_DIR=uploads
GEMINI_API_KEY=your-gemini-api-key-here
```

**Getting a Gemini API key:**
1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with a Google account
3. Click **Create API key**
4. Copy the key and paste it as the value of `GEMINI_API_KEY` in `backend/.env`

> **Important:** Never paste your API key into `.env.example`, commit it to git, or share it in chat. Only `backend/.env` is safe — it is gitignored.

### 3. Create the uploads directory

```bash
mkdir -p backend/uploads
```

### 4. Start both servers

```bash
npm run dev
```

| Process | URL |
|---|---|
| React (Vite) | http://localhost:3000 |
| Express + Socket.io | http://localhost:5001 |

Vite proxies all `/api`, `/socket.io`, and `/uploads` requests to the backend, so the frontend only needs port 3000.

The SQLite database is created and seeded automatically on first start — no extra steps needed.

---

## How a Game Works

1. **Host** picks a design category and time limit → a random brief is pulled from the database (hidden from everyone)
2. **Players** join via a 6-character challenge code and a nickname
3. **Sprint** — the brief is revealed simultaneously and a synchronized countdown begins; players design and upload their work
4. **Voting** — all submissions appear in a randomized blind loop (7 seconds each); players rate every design 1–5 stars except their own
5. **Results** — Gemini 1.5 Flash scores each submission against the brief; the final score is the average of voter ratings and AI score; the leaderboard is revealed with both breakdowns

---

## Database & Prompts

Prompts are stored in a SQLite database at `backend/data/design_dash.db`. The database and its initial data are created automatically on first server start.

To manually re-seed (useful after editing `backend/src/db/seedData.js`):

```bash
cd backend
npm run seed
```

### Prompt API

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/prompts` | List all prompts (`?category=Branding` to filter) |
| `GET` | `/api/prompts/categories` | List all distinct categories |
| `GET` | `/api/prompts/:id` | Get a single prompt |
| `POST` | `/api/prompts` | Create a new prompt |
| `PUT` | `/api/prompts/:id` | Update a prompt (partial updates supported) |
| `DELETE` | `/api/prompts/:id` | Delete a prompt |

**Adding new prompts** — edit `backend/src/db/seedData.js` and run `npm run seed` from `backend/`. Categories must match the values in the frontend category picker (`Branding`, `UI Design`, `Illustration`, `Typography`, `Logo Design`, `Web Design`).

---

## Running Separately (optional)

```bash
# Backend only
cd backend && npm run dev

# Frontend only
cd frontend && npm run dev
```

---

## Project Structure

```
DesignDash/
├── frontend/                  # React frontend (Vite)
│   └── src/
│       ├── main.jsx            # App entry point
│       ├── App.jsx             # Route definitions
│       ├── context/
│       │   └── GameContext.jsx # Global game state (useReducer + sessionStorage)
│       ├── hooks/
│       │   └── useSocket.js    # Socket.io event wiring + auto re-join on reload
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
    ├── .env.example            # Environment variable template (no real secrets)
    ├── .env                    # Your local secrets — gitignored, never commit this
    ├── uploads/               # Uploaded design images (gitignored)
    ├── data/                  # SQLite database file (gitignored)
    └── src/
        ├── index.js            # HTTP server entry point
        ├── app.js              # Express app + middleware
        ├── store/
        │   └── index.js        # In-memory room/game state
        ├── db/
        │   ├── index.js        # SQLite connection, schema, auto-seed
        │   ├── seedData.js     # Prompt pool — edit to add/change prompts
        │   └── seed.js         # Standalone seed script (npm run seed)
        ├── services/
        │   └── aiJudge.js      # Gemini 1.5 Flash scoring logic
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
| `GET` | `/api/challenges/:code/results` | Fetch final scores (for page reload recovery) |
| `GET` | `/api/prompts` | List prompts (`?category=` to filter) |
| `GET` | `/api/prompts/categories` | List distinct categories |
| `GET` | `/api/prompts/:id` | Get a single prompt |
| `POST` | `/api/prompts` | Create a prompt |
| `PUT` | `/api/prompts/:id` | Update a prompt |
| `DELETE` | `/api/prompts/:id` | Delete a prompt |

---

## Testing With Multiple Players Locally

Each browser tab has its own `sessionStorage`, so you can simulate multiple players on the same machine without different accounts. The safest approaches:

| Method | Works |
|---|---|
| Two separate browser windows | Yes |
| Normal tab + Incognito tab | Yes |
| Two different browsers | Yes |
| Fresh new tab (Cmd+T) | Yes |
| Duplicated tab (Cmd+D) | No — copies sessionStorage, same identity |
