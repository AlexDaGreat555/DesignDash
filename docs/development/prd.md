PRD: Design Dash (V1.3)
1. Introduction/Overview
Project Name: Design Dash

Goal: A real-time, competitive design game where participants respond to automated Specs and engage in a synchronized, "live-broadcast" style voting session.

2. Goals
Synchronized Competition: Ensure all players move through the game phases (Sprint -> Voting -> Results) at the exact same time.

Spec-Driven Design: Automate the challenge discovery to ensure a level playing field for the Host and participants.

Fairness & Completion: Guarantee every submission is processed before voting begins and every voter sees every design for the same duration.

3. Functional Requirements
3.1 Host / Challenge Creation
Host Inputs: The Host selects only the Category Tag and Time Limit.

Automated Spec Selection: The system pulls a random set of Specs from the library matching the category.

Spec Secrecy: The Specs remain hidden from everyone (including the Host) until the game starts.

3.2 Lobby & Identity
Users join via Nickname and a unique Challenge Code.

The Host has the "Start Game" trigger once the lobby is full.

3.3 The Design Phase & Upload Logic
The Reveal: When the game starts, the system displays the Full Specs: Project Name, Type, Objective, Background, Target Audience, Key Message, and Visual Direction.

Global Timer: A synchronized countdown for the design sprint.

The 0:00 Transition: When the timer hits zero:

The UI transitions to a "Processing" state.

The Storage Buffer: The system must verify that all images currently being uploaded are successfully stored before proceeding.

Auto-Priority: If 100% of participants upload before the timer hits 0:00, the system triggers the transition immediately.

3.4 Synchronized Blind Voting
Uniform View: All players see the exact same design at the same time in a randomized loop.

The "Wall of Shame": Designers who failed to upload appear as a "No Submission" placeholder.

Per-Design Timer: Each design is shown for a maximum of 30 seconds.

The "Next" Trigger: The system transitions everyone to the next design simultaneously when:

A: 30 seconds have elapsed.

OR B: 100% of active players have submitted their rating (1–5 stars).

Self-Voting: The rating UI is disabled when a player's own design is shown in the loop.

3.5 Results & Leaderboard
The Reveal: After the last design is voted on, the system reveals the names behind the designs and the final scores.

Session Leaderboard: Displays cumulative wins/points for the current lobby session based on the previous blind voting phase. In addition, an ai judge also provides a star rating for each design, which also adds to teh cumulative score. The ai agent's score should be revealed below the results for additional context

4. Technical Considerations (For the Developer)
WebSockets (Socket.io): Use a central "Source of Truth" on the server to push state changes (START_VOTING, NEXT_SLIDE, SHOW_RESULTS) to all clients.

Spec Library: A database table/collection containing pre-written Specs categorized by tags.

Asset Management: Ensure high-resolution uploads are optimized or center-cropped for the voting slideshow so they look consistent across different screen sizes.

5. Non-Goals
Permanent user accounts/profiles.

Manual editing of Specs by the Host.

In-app drawing or layout tools.

6. Success Metrics
Sync Accuracy: All players stay within a tight margin of the current voting slide.

Frictionless Start: Time from "Lobby Creation" to "Game Start" is under 15 seconds.