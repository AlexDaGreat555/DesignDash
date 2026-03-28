// Renders the list of joined players in the lobby waiting room
export default function PlayerList({ players }) {
  return <ul>{players.map((p) => <li key={p.id}>{p.nickname}</li>)}</ul>
}
