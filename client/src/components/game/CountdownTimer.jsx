// Displays the server-authoritative sprint countdown synced across all clients
export default function CountdownTimer({ secondsRemaining }) {
  const m = String(Math.floor(secondsRemaining / 60)).padStart(2, '0')
  const s = String(secondsRemaining % 60).padStart(2, '0')
  return <div className="countdown">{m}:{s}</div>
}
