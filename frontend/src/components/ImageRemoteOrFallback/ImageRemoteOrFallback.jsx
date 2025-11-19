import React from 'react';

const FALLBACK_URL = '/recipeDefault.webp';

export default function ImageRemoteOrFallback({ apiUrl, alt = '', className = '' }) {
  return (
    <div className="recipe-detail-image-wrapper">
      <img
        src={apiUrl}
        alt={alt}
        className={className}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = FALLBACK_URL;
        }}
        draggable={false}
      />
    </div>
  );
}
