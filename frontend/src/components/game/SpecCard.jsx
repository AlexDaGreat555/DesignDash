// Displays the full Spec revealed at game start:
// Project Name, Type, Objective, Background, Target Audience, Key Message, Visual Direction
export default function SpecCard({ spec }) {
  if (!spec) return null
  return (
    <article>
      <h2>{spec.projectName}</h2>
      <p><strong>Type:</strong> {spec.type}</p>
      <p><strong>Objective:</strong> {spec.objective}</p>
      <p><strong>Background:</strong> {spec.background}</p>
      <p><strong>Target Audience:</strong> {spec.targetAudience}</p>
      <p><strong>Key Message:</strong> {spec.keyMessage}</p>
      <p><strong>Visual Direction:</strong> {spec.visualDirection}</p>
    </article>
  )
}
