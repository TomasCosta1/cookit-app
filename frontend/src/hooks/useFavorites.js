import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL;

export const useFavorites = (userId) => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(!!userId);
    const [error, setError] = useState(null);
    const [favoritesLoaded, setFavoritesLoaded] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    const fetchFavorites = async () => {
        if (!userId || isFetching) return;
        
        setIsFetching(true);
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`${API_BASE}/favorites/user/${userId}`);
            if (!response.ok) throw new Error('Error al cargar favoritos');
            
            const data = await response.json();
            setFavorites(data);
            setFavoritesLoaded(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setIsFetching(false);
        }
    };

    const isFavorite = (recipeId) => {
        if (!userId || !recipeId) return false;
        
        if (favoritesLoaded) {
            return favorites.some(fav => fav.id === recipeId);
        }
        return false;
    };

    const checkFavoriteStatus = async (recipeId) => {
        if (!userId || !recipeId) return false;
        
        try {
            const response = await fetch(`${API_BASE}/favorites/check/${userId}/${recipeId}`);
            if (!response.ok) return false;
            
            const data = await response.json();
            return data.isFavorite;
        } catch (err) {
            console.error('Error al verificar favorito:', err);
            return false;
        }
    };

    const addToFavorites = async (recipeId) => {
        if (!userId || !recipeId) return false;
        
        try {
            const response = await fetch(`${API_BASE}/favorites`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    recipe_id: recipeId
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al agregar favorito');
            }
            
            await fetchFavorites();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const removeFromFavorites = async (recipeId) => {
        if (!userId || !recipeId) return false;
        
        try {
            const response = await fetch(`${API_BASE}/favorites/${userId}/${recipeId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar favorito');
            }
            
            await fetchFavorites();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const toggleFavorite = async (recipeId) => {
        const isCurrentlyFavorite = favorites.some(fav => fav.id === recipeId);
        
        if (isCurrentlyFavorite) {
            return await removeFromFavorites(recipeId);
        } else {
            return await addToFavorites(recipeId);
        }
    };

    useEffect(() => {
        if (userId && !favoritesLoaded && !isFetching) {
            fetchFavorites();
        }
    }, [userId, favoritesLoaded, isFetching]);

    return {
        favorites,
        loading,
        error,
        favoritesLoaded,
        isFavorite,
        checkFavoriteStatus,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        refetch: fetchFavorites
    };
};
