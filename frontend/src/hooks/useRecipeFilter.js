import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL;

export const useRecipeFilter = (userIngredients = [], filters = {}) => {
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [isFiltered, setIsFiltered] = useState(false);

    const filterRecipes = async (customFilters = {}) => {
        const activeFilters = { ...filters, ...customFilters };
        
        const hasIngredients = userIngredients && userIngredients.length > 0;
        const hasCategory = activeFilters.categoryId && activeFilters.categoryId !== '';
        const hasMaxTime = activeFilters.maxTime && activeFilters.maxTime > 0;
        const hasDifficulty = activeFilters.difficulty && activeFilters.difficulty !== '';
        
        if (!hasIngredients && !hasCategory && !hasMaxTime && !hasDifficulty) {
            setError('Selecciona al menos un filtro');
            return [];
        }

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            
            if (hasIngredients) {
                const ingredientIds = userIngredients.map(ing => ing.id);
                params.set('userIngredients', JSON.stringify(ingredientIds));
            }
            
            if (hasCategory) {
                params.set('categoryId', activeFilters.categoryId);
            }
            if (hasMaxTime) {
                params.set('maxTime', activeFilters.maxTime);
            }
            if (hasDifficulty) {
                params.set('difficulty', activeFilters.difficulty);
            }
            
            const response = await fetch(
                `${API_BASE}/filter/combined/1?${params.toString()}`
            );
            
            if (!response.ok) {
                throw new Error('Error al filtrar recetas');
            }

            const data = await response.json();
            
            if (data.success) {
                setFilteredRecipes(data.recipes);
                setStats({
                    total: data.total,
                    filters_applied: data.filters_applied
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

    const clearFilter = useCallback(() => {
        setFilteredRecipes([]);
        setStats(null);
        setIsFiltered(false);
        setError(null);
    }, []);

    const hasIngredients = userIngredients && userIngredients.length > 0;

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
