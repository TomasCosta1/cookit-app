import { useNavigate } from "react-router-dom";
import "./RecipeCard.css";
import Button from "../Button/Button";
import FavoriteButton from "../FavoriteButton/FavoriteButton";
import { useAuth } from "../../hooks/useAuth";
import { useFavorites } from "../../hooks/useFavorites";
import { useRating } from "../../hooks/useRating";
import { Rating } from "../Rating/Rating";

const RecipeCard = ({ recipe }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites(user?.id);
  const {rating} = useRating(recipe.id)

  const hasFilterInfo = recipe.matching_ingredients !== undefined;

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

  const renderIngredientIcons = (matching, total) => {
    const missing = total - matching;

    const matchingCarrots = Array.from({ length: matching }, (_, i) => (
      <span key={`match-${i}`} title="Ingrediente que tienes">
        🥕
      </span>
    ));

    const missingCarrots = Array.from({ length: missing }, (_, i) => (
      <span
        key={`miss-${i}`}
        style={{ filter: "grayscale(100%)", opacity: 0.6 }}
        title="Ingrediente faltante"
      >
        🥕
      </span>
    ));

    return (
      <>
        {matchingCarrots}
        {missingCarrots}
      </>
    );
  };
  
  return (
    <div className="recipe-card">
      <div className="recipe-header">
        <div className="recipe-title-container">
          <h3 className="recipe-title">{recipe.title}</h3>
          {isAuthenticated && (
            <FavoriteButton
              recipeId={recipe.id}
              isFavorite={isFavorite(recipe.id)}
              onToggle={toggleFavorite}
              size="small"
            />
          )}
        </div>
        <span
          className="recipe-difficulty"
          style={{
            backgroundColor: getDifficultyColor(recipe.difficulty),
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "bold",
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
          <span className="recipe-time">⏱️ {recipe.cook_time} min</span>
        )}
        <span className="recipe-date">
          📅 {new Date(recipe.created_at).toLocaleDateString("es-ES")}
        </span>
        {rating !== 0 ? (
          <span className="recipe-rating">
            {<Rating rating={rating}/>}
          </span>
        ) : (
          <span className="recipe-rating">Sin calificar</span>
        )}
        {hasFilterInfo && (
          <>
            <span className="match-count">Ingredientes:</span>
            <span className="match-symbols">
              {renderIngredientIcons(
                recipe.matching_ingredients,
                recipe.total_ingredients
              )}
            </span>
          </>
        )}
      </div>

      {recipe.steps && (
        <div className="recipe-steps">
          <strong>Pasos:</strong>
          <p>
            {recipe.steps.substring(0, 100)}
            {recipe.steps.length > 100 ? "..." : ""}
          </p>
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
