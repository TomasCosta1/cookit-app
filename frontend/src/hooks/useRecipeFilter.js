import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL;

export const useRecipeFilter = (userIngredients = []) => {
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [isFiltered, setIsFiltered] = useState(false);

    const filterRecipes = async () => {
        if (!userIngredients || userIngredients.length === 0) {
            setError('No hay ingredientes para filtrar');
            return [];
        }

        setLoading(true);
        setError(null);

        try {
            const ingredientIds = userIngredients.map(ing => ing.id);
            const userIngredientsParam = encodeURIComponent(JSON.stringify(ingredientIds));
            
            
            const response = await fetch(
                `${API_BASE}/filter/by-ingredients/1?userIngredients=${userIngredientsParam}`
            );
            
            if (!response.ok) {
                throw new Error('Error al filtrar recetas');
            }

            const data = await response.json();
            
            if (data.success) {
                setFilteredRecipes(data.recipes);
                setStats({
                    total: data.total,
                    userIngredientsCount: data.user_ingredients_count
                });
                setIsFiltered(true);
                return data.recipes;
            } else {
                throw new Error(data.message || 'Error al filtrar recetas');
            }
        } catch (err) {
            setError(err.message);
            setFilteredRecipes([]);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const getStats = async () => {
        if (!userIngredients || userIngredients.length === 0) return;

        try {
            const ingredientIds = userIngredients.map(ing => ing.id);
            const userIngredientsParam = encodeURIComponent(JSON.stringify(ingredientIds));
            
            const response = await fetch(
                `${API_BASE}/filter/stats/1?userIngredients=${userIngredientsParam}`
            );
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setStats(data.stats);
                }
            }
        } catch (err) {
            console.error('Error al obtener estadísticas:', err);
        }
    };

    const clearFilter = () => {
        setFilteredRecipes([]);
        setStats(null);
        setIsFiltered(false);
        setError(null);
    };

    const hasIngredients = userIngredients && userIngredients.length > 0;

    useEffect(() => {
        if (hasIngredients) {
            getStats();
        } else {
            clearFilter();
        }
    }, [userIngredients]);

    return {
        filteredRecipes,
        loading,
        error,
        stats,
        isFiltered,
        hasIngredients,
        filterRecipes,
        clearFilter
    };
};
