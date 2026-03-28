// 1–5 star rating control; disabled when viewing the player's own submission
export default function StarRating({ value, onChange, disabled }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !disabled && onChange(star)}
          disabled={disabled}
          aria-label={`${star} star`}
          style={{ color: star <= value ? 'gold' : 'gray' }}
        >
          ★
        </button>
      ))}
    </div>
  )
}
