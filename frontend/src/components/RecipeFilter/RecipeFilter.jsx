import React, { useState, useEffect } from 'react';
import { useRecipeFilter } from '../../hooks/useRecipeFilter';
import { getMyIngredients } from '../../lib/storage';
import './RecipeFilter.css';

const RecipeFilter = ({ onFilteredRecipes, onClearFilter, isFiltered }) => {
    const [userIngredients, setUserIngredients] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    
    const loadUserIngredients = () => {
        const ingredients = getMyIngredients();
        setUserIngredients(ingredients);
    };

    useEffect(() => {
        loadUserIngredients();
    }, []);
    
    const {
        loading,
        error,
        hasIngredients,
        filterRecipes,
        clearFilter
    } = useRecipeFilter(userIngredients);

    const handleFilter = async () => {
        const recipes = await filterRecipes();
        if (onFilteredRecipes && recipes) {
            onFilteredRecipes(recipes);
        }
    };

    const handleClear = () => {
        clearFilter();
        if (onClearFilter) {
            onClearFilter();
        }
    };

    const toggleFilter = () => {
        setShowFilter(!showFilter);
    };

    return (
        <div className="recipe-filter">
            <div className="recipe-filter__header">
                <button 
                    className={`recipe-filter__toggle ${isFiltered ? 'recipe-filter__toggle--active' : ''}`}
                    onClick={toggleFilter}
                >
                    Filtrar por mis ingredientes
                </button>
                
                {isFiltered && (
                    <button 
                        className="recipe-filter__clear"
                        onClick={handleClear}
                    >
                        ✕ Limpiar filtro
                    </button>
                )}
            </div>

            {showFilter && (
                <div className="recipe-filter__content">
                    {!hasIngredients ? (
                        <div className="recipe-filter__empty">
                            <p>No tienes ingredientes guardados.</p>
                            <p>Ve a "Mis ingredientes" para agregar algunos.</p>
                        </div>
                    ) : (
                        <div className="recipe-filter__info">
                            <div className="recipe-filter__stats">
                                <p><strong>{userIngredients.length}</strong> ingredientes guardados</p>
                            </div>
                            
                            <div className="recipe-filter__actions">
                                <button 
                                    className="recipe-filter__apply"
                                    onClick={handleFilter}
                                    disabled={loading}
                                >
                                    {loading ? 'Filtrando...' : 'Aplicar filtro'}
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {error && (
                        <div className="recipe-filter__error">
                            <p>❌ {error}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RecipeFilter;
