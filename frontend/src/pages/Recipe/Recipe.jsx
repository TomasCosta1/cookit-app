import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Recipe.css";

const API_BASE = "http://localhost:3000";

export default function Recipe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id || isNaN(id)) {
            setError("ID de receta inválido");
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError("");

        fetch(`${API_BASE}/recipes/${id}`)
            .then(async (r) => {
                if (!r.ok) {
                    if (r.status === 404) {
                        throw new Error("Receta no encontrada");
                    }
                    throw new Error("Error al cargar la receta");
                }
                const data = await r.json();
                if (!cancelled) {
                    setRecipe(data);
                }
            })
            .catch((e) => !cancelled && setError(e.message))
            .finally(() => !cancelled && setLoading(false));

        return () => {
            cancelled = true;
        };
    }, [id]);

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return '#28a745';
            case 'medium': return '#ffc107';
            case 'hard': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const getDifficultyText = (difficulty) => {
        switch (difficulty) {
            case 'easy': return 'Fácil';
            case 'medium': return 'Medio';
            case 'hard': return 'Difícil';
            default: return difficulty;
        }
    };

    const handleGoBack = () => {
        navigate('/recipes');
    };

    if (loading) {
        return (
            <div className="recipe-page">
                <div className="loading">
                    <p>Cargando receta...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="recipe-page">
                <div className="error">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={handleGoBack}>
                        Volver a recetas
                    </button>
                </div>
            </div>
        );
    }

    if (!recipe) {
        return (
            <div className="recipe-page">
                <div className="error">
                    <h2>Receta no encontrada</h2>
                    <p>La receta que buscas no existe.</p>
                    <button className="btn btn-primary" onClick={handleGoBack}>
                        Volver a recetas
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="recipe-page">
            <div className="recipe-header-actions">
                <button className="btn btn-primary" onClick={handleGoBack}>
                    ← Volver a recetas
                </button>
            </div>

            <div className="recipe-detail">
                <div className="recipe-detail-header">
                    <h1 className="recipe-detail-title">{recipe.title}</h1>
                    <span 
                        className="recipe-detail-difficulty"
                        style={{ 
                            backgroundColor: getDifficultyColor(recipe.difficulty),
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                    >
                        {getDifficultyText(recipe.difficulty)}
                    </span>
                </div>

                <div className="recipe-detail-meta">
                    {recipe.cook_time && (
                        <div className="recipe-detail-meta-item">
                            <span className="icon">⏱️</span>
                            <span>Tiempo de cocción: {recipe.cook_time} minutos</span>
                        </div>
                    )}
                    <div className="recipe-detail-meta-item">
                        <span className="icon">📅</span>
                        <span>Creado: {new Date(recipe.created_at).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="recipe-detail-meta-item">
                        <span className="icon">👤</span>
                        <span>Usuario ID: {recipe.user_id}</span>
                    </div>
                </div>

                {recipe.description && (
                    <div className="recipe-detail-section">
                        <h3>Descripción</h3>
                        <p className="recipe-detail-description">{recipe.description}</p>
                    </div>
                )}

                {recipe.steps && (
                    <div className="recipe-detail-section">
                        <h3>Instrucciones</h3>
                        <div className="recipe-detail-steps">
                            {recipe.steps.split('\n').map((step, index) => {
                                const trimmedStep = step.trim();
                                if (!trimmedStep) return null;
                                
                                return (
                                    <div key={index} className="recipe-step">
                                        <div className="recipe-step-number">{index + 1}</div>
                                        <div className="recipe-step-content">{trimmedStep}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}