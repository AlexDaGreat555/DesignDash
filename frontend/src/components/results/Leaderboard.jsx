// Reveals designer names with their final scores, sorted descending
export default function Leaderboard({ scores }) {
  return (
    <ol>
      {scores.map((entry) => (
        <li key={entry.playerId}>
          {entry.nickname} — {entry.score.toFixed(1)} ★
        </li>
      ))}
    </ol>
  )
}
