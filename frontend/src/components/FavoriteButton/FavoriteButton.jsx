import { useState, useEffect } from 'react';
import './FavoriteButton.css';

const FavoriteButton = ({ 
    recipeId, 
    isFavorite: initialIsFavorite = false, 
    onToggle, 
    size = 'medium',
    disabled = false 
}) => {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsFavorite(initialIsFavorite);
    }, [initialIsFavorite]);

    const handleClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (disabled || isLoading) return;

        setIsLoading(true);
        
        try {
            const success = await onToggle(recipeId);
            if (success) {
                setIsFavorite(!isFavorite);
            }
        } catch (error) {
            console.error('Error al cambiar favorito:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            className={`favorite-button ${isFavorite ? 'favorite-button--active' : ''} favorite-button--${size}`}
            onClick={handleClick}
            disabled={disabled || isLoading}
            title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
            <svg 
                className="favorite-icon" 
                viewBox="0 0 24 24" 
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
            >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            {isLoading && <div className="favorite-button__loading">...</div>}
        </button>
    );
};

export default FavoriteButton;
