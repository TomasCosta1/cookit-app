import { useNavigate } from "react-router-dom";
import "./RecipeCardCompact.css";

const RecipeCardCompact = ({ recipe }) => {
  const navigate = useNavigate();

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "#28a745";
      case "medium":
        return "#ffc107";
      case "hard":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "Fácil";
      case "medium":
        return "Medio";
      case "hard":
        return "Difícil";
      default:
        return difficulty;
    }
  };

  return (
    <div
      className="recipe-card-compact"
      onClick={() => navigate(`/recipe/${recipe.id}`)}
    >
      <div className="recipe-compact-header">
        <h4 className="recipe-compact-title">{recipe.title}</h4>
        <span
          className="recipe-compact-difficulty"
          style={{ backgroundColor: getDifficultyColor(recipe.difficulty) }}
        >
          {getDifficultyText(recipe.difficulty)}
        </span>
      </div>

      {recipe.description && (
        <p className="recipe-compact-description">
          {recipe.description.length > 80
            ? `${recipe.description.substring(0, 80)}...`
            : recipe.description}
        </p>
      )}

      <div className="recipe-compact-meta">
        {recipe.cook_time && (
          <span className="recipe-compact-time">⏱️ {recipe.cook_time} min</span>
        )}
        <span className="recipe-compact-date">
          📅 {new Date(recipe.created_at).toLocaleDateString("es-ES")}
        </span>
      </div>
    </div>
  );
};

export default RecipeCardCompact;
