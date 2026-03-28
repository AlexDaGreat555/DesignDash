// Shows one design (or "No Submission" placeholder) during blind voting
export default function DesignSlide({ submission }) {
  if (!submission || !submission.imageUrl) {
    return <div className="no-submission">No Submission</div>
  }
  return <img src={submission.imageUrl} alt="Design submission" style={{ maxWidth: '100%' }} />
}
