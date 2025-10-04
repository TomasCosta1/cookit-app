import { useNavigate } from 'react-router-dom';
import './RecipeCard.css';
import Button from '../Button/Button';

const RecipeCard = ({ recipe }) => {
    const navigate = useNavigate();
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
    return (
        <div className="recipe-card">
            <div className="recipe-header">
                            <h3 className="recipe-title">{recipe.title}</h3>
                            <span 
                                className="recipe-difficulty"
                                style={{ 
                                    backgroundColor: getDifficultyColor(recipe.difficulty),
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}
                            >
                                {getDifficultyText(recipe.difficulty)}
                            </span>
                        </div>
                        
                        {recipe.description && (
                            <p className="recipe-description">{recipe.description}</p>
                        )}
                        
                        <div className="recipe-meta">
                            {recipe.cook_time && (
                                <span className="recipe-time">
                                    ⏱️ {recipe.cook_time} min
                                </span>
                            )}
                            <span className="recipe-date">
                                📅 {new Date(recipe.created_at).toLocaleDateString('es-ES')}
                            </span>
                        </div>
                        
                        {recipe.steps && (
                            <div className="recipe-steps">
                                <strong>Pasos:</strong>
                                <p>{recipe.steps.substring(0, 100)}{recipe.steps.length > 100 ? '...' : ''}</p>
                            </div>
                        )}
                        
                        <div className="recipe-actions">
                            <Button 
                                variant="primary" 
                                size="medium"
                                onClick={() => navigate(`/recipe/${recipe.id}`)}
                            >
                                Ver detalles
                            </Button>
                        </div>
        </div>
    );
};

export default RecipeCard;