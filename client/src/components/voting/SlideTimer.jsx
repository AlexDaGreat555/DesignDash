// Per-design 30-second countdown during voting; transitions advance on server signal
export default function SlideTimer({ secondsRemaining }) {
  return <div className="slide-timer">{secondsRemaining}s</div>
}
