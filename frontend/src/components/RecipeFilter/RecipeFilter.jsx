import React, { useState, useEffect } from 'react';
import { useRecipeFilter } from '../../hooks/useRecipeFilter';
import { getMyIngredients } from '../../lib/storage';
import './RecipeFilter.css';

const API_BASE = import.meta.env.VITE_API_URL;

const RecipeFilter = ({ onFilteredRecipes, onClearFilter, isFiltered }) => {
    const [userIngredients, setUserIngredients] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    const [categories, setCategories] = useState([]);
    const [useIngredientsFilter, setUseIngredientsFilter] = useState(false);
    const [filters, setFilters] = useState({
        categoryId: '',
        maxTime: '',
        difficulty: ''
    });
    
    const loadUserIngredients = () => {
        const ingredients = getMyIngredients();
        setUserIngredients(ingredients);
    };

    const loadCategories = async () => {
        try {
            const response = await fetch(`${API_BASE}/categories`);
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Error al cargar categorías:', error);
        }
    };

    useEffect(() => {
        loadUserIngredients();
        loadCategories();
    }, []);
    
    const hasIngredients = userIngredients && userIngredients.length > 0;

    const {
        loading,
        error,
        filterRecipes,
        clearFilter
    } = useRecipeFilter(useIngredientsFilter ? userIngredients : [], filters);

    const handleFilter = async () => {
        const recipes = await filterRecipes(filters);
        if (onFilteredRecipes && recipes) {
            onFilteredRecipes(recipes);
        }
    };

    const handleClear = () => {
        setFilters({
            categoryId: '',
            maxTime: '',
            difficulty: ''
        });
        setUseIngredientsFilter(false);
        clearFilter();
        if (onClearFilter) {
            onClearFilter();
        }
    };

    const toggleFilter = () => {
        if (!showFilter) {
            loadUserIngredients();
        }
        setShowFilter(!showFilter);
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    const hasActiveFilters = () => {
        return (useIngredientsFilter && hasIngredients) || 
               filters.categoryId !== '' || 
               filters.maxTime !== '' || 
               filters.difficulty !== '';
    };

    return (
        <div className="recipe-filter">
            <div className="recipe-filter__header">
                <button 
                    className={`recipe-filter__toggle ${isFiltered ? 'recipe-filter__toggle--active' : ''}`}
                    onClick={toggleFilter}
                >
                    🔍 Filtrar recetas
                </button>
                
                {isFiltered && (
                    <button 
                        className="recipe-filter__clear"
                        onClick={handleClear}
                    >
                        ✕ Limpiar filtros
                    </button>
                )}
            </div>

            {showFilter && (
                <div className="recipe-filter__content">
                    <div className="recipe-filter__filters">
                        <div className="recipe-filter__section">
                            <label className="recipe-filter__label">
                                <input
                                    type="checkbox"
                                    checked={useIngredientsFilter}
                                    onChange={(e) => setUseIngredientsFilter(e.target.checked)}
                                    disabled={!hasIngredients}
                                />
                                <span>Filtrar por mis ingredientes disponibles</span>
                            </label>
                            {hasIngredients ? (
                                <p className="recipe-filter__info-text">
                                    {userIngredients.length} ingrediente(s) guardado(s)
                                </p>
                            ) : (
                                <p className="recipe-filter__info-text">
                                    No tienes ingredientes guardados. Ve a "Mis ingredientes" para agregar algunos.
                                </p>
                            )}
                        </div>

                        <div className="recipe-filter__section">
                            <label className="recipe-filter__label">
                                Categoría
                            </label>
                            <select
                                className="recipe-filter__select"
                                value={filters.categoryId}
                                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                            >
                                <option value="">Todas las categorías</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.category_name || cat.filter_name || `Categoría ${cat.id}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="recipe-filter__section">
                            <label className="recipe-filter__label">
                                Tiempo máximo (minutos)
                            </label>
                            <input
                                type="number"
                                className="recipe-filter__input"
                                min="1"
                                placeholder="Ej: 30"
                                value={filters.maxTime}
                                onChange={(e) => handleFilterChange('maxTime', e.target.value)}
                            />
                        </div>

                        <div className="recipe-filter__section">
                            <label className="recipe-filter__label">
                                Dificultad
                            </label>
                            <select
                                className="recipe-filter__select"
                                value={filters.difficulty}
                                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                            >
                                <option value="">Todas las dificultades</option>
                                <option value="easy">Fácil</option>
                                <option value="medium">Media</option>
                                <option value="hard">Difícil</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="recipe-filter__actions">
                        <button 
                            className="recipe-filter__apply"
                            onClick={handleFilter}
                            disabled={loading || !hasActiveFilters()}
                        >
                            {loading ? 'Filtrando...' : 'Aplicar filtros'}
                        </button>
                    </div>
                    
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
