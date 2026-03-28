## Relevant Files

- `backend/src/services/aiJudge.js` - New stub AI scoring module (to be created)
- `backend/src/store/index.js` - Update `computeScores()` and add `finalScores` persistence
- `backend/src/routes/challengeRoutes.js` - Add `GET /:code/results` route
- `backend/src/controllers/challengeController.js` - Add `getResults` controller function
- `backend/src/socket/votingHandlers.js` - Update `advanceSlide()` to store `finalScores` before broadcasting
- `frontend/src/services/api.js` - Add `getResults(code)` API helper
- `frontend/src/pages/ResultsPage.jsx` - Remove mock data, wire real scores + images
- `frontend/src/pages/ResultsPage.css` - Loading spinner / error state styles

### Notes

- The backend runs on port 5001. Ensure it is running before testing the frontend.
- The frontend proxies `/api` requests to `http://localhost:5001` via Vite config — no CORS issues in dev.
- Uploaded files are stored in `backend/uploads/` and served at `/uploads/{filename}`.
- To verify end-to-end: run a full game session locally (lobby → sprint → voting → results) and confirm the ResultsPage shows real nicknames, real images, and correct scores.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch: `git checkout -b feature/results-backend-integration`

- [x] 1.0 Create the AI Judge stub service (backend)
  - [x] 1.1 Create `backend/src/services/aiJudge.js` with a `scoreSubmission(submissionId, spec)` function
  - [x] 1.2 Implement deterministic hash-based mock scoring (range 3.0–5.0, one decimal place)
  - [x] 1.3 Add TODO comment for future Claude API replacement

- [x] 2.0 Update score computation in the backend store
  - [x] 2.1 Import `aiJudge.scoreSubmission` in `backend/src/store/index.js`
  - [x] 2.2 Update `computeScores()` to include `submissionId`, `imageUrl`, `voterScore`, `aiScore`, `combinedScore` per entry
  - [x] 2.3 Calculate `combinedScore` as `(voterAvg + aiScore) / 2` rounded to two decimals
  - [x] 2.4 Sort by `combinedScore` descending and assign `rank` (1-indexed)
  - [x] 2.5 Handle players with no submission: `voterScore: 0`, `aiScore: 0`, `combinedScore: 0`, ranked last
  - [x] 2.6 Store computed result on `room.finalScores` after calling `computeScores()`

- [x] 3.0 Add the GET /results REST endpoint (backend)
  - [x] 3.1 Add `getResults` function to `backend/src/controllers/challengeController.js`
  - [x] 3.2 Return `room.finalScores` if room exists and phase is `results`; otherwise return 404
  - [x] 3.3 Add `GET /:code/results` route to `backend/src/routes/challengeRoutes.js`

- [x] 4.0 Update the frontend API service and ResultsPage data source
  - [x] 4.1 Add `getResults(code)` function to `frontend/src/services/api.js`
  - [x] 4.2 Remove `MOCK_RESULTS` and `combinedScore` helper from `ResultsPage.jsx`
  - [x] 4.3 On mount, use `state.scores` from GameContext if available; otherwise fetch from `GET /api/challenges/:code/results`
  - [x] 4.4 Add loading spinner while fetching results
  - [x] 4.5 Add error state with message and link to home
  - [x] 4.6 Update podium, rankings list, and AI Judge section to use real data fields (`voterScore`, `aiScore`, `combinedScore`, `imageUrl`, `rank`)
  - [x] 4.7 Handle `imageUrl: null` — render "No Submission" placeholder in podium thumbnail and expand modal
  - [x] 4.8 Add loading/error CSS styles to `ResultsPage.css`

- [x] 5.0 End-to-end verification
  - [x] 5.1 Run `npm run dev` and verify both backend and frontend start without errors
  - [x] 5.2 Confirm the frontend build completes with `npx vite build`
  - [x] 5.3 Verify no `MOCK_RESULTS`, `picsum.photos`, or hardcoded nicknames remain in `ResultsPage.jsx`
