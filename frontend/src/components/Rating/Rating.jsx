import React from 'react'
import './Rating.css'

export const Rating = (rating) => {
    if (!rating || rating === 0) {
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
  
      const percentage = (rating / 5) * 100;
  
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
