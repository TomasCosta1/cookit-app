import { useState } from 'react';
import './RatingInput.css';

const RatingInput = ({ onRatingSelect, initialRating = 0 }) => {
  const [selectedRating, setSelectedRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleStarClick = (rating) => {
    setSelectedRating(rating);
    if (onRatingSelect) {
      onRatingSelect(rating);
    }
  };

  const handleStarHover = (rating) => {
    setHoveredRating(rating);
  };

  const handleMouseLeave = () => {
    setHoveredRating(0);
  };

  const getStarColor = (starIndex) => {
    const ratingToShow = hoveredRating || selectedRating;
    if (starIndex <= ratingToShow) {
      return '#ffc107';
    }
    return '#e0e0e0';
  };

  return (
    <div className="rating-input">
      <div 
        className="rating-input__stars"
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="rating-input__star"
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            style={{ color: getStarColor(star) }}
            aria-label={`Calificar ${star} estrella${star > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
      {(selectedRating > 0 || hoveredRating > 0) && (
        <div className="rating-input__value">
          {(hoveredRating || selectedRating)} / 5
        </div>
      )}
    </div>
  );
};

export default RatingInput;

