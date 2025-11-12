import React from 'react'
import './Rating.css'

export const Rating = ({ rating = 0 }) => {
    const safeRating = Number(rating) || 0;

    if (safeRating <= 0) {
        return (
          <div className="star-rating">
            <div className="star-rating__filled" style={{ width: "0%" }}>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className="star">★</span>
              ))}
            </div>
            <div className="star-rating__empty">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className="star">★</span>
              ))}
            </div>
          </div>
        );
      }
  
      const percentage = Math.max(0, Math.min(100, (safeRating / 5) * 100));
  
      return (
        <div className="star-rating">
          <div className="star-rating__filled" style={{ width: `${percentage}%` }}>
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className="star">★</span>
            ))}
          </div>
          <div className="star-rating__empty">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className="star">★</span>
            ))}
          </div>
        </div>
      );
}
