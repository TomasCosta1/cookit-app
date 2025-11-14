import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Home.css";

const API_BASE = import.meta.env.VITE_API_URL;

export default function Home() {
  const [isGuest, setIsGuest] = useState(false);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/profile`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUsername(data.user.username);
          setIsGuest(false);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Error al verificar autenticación:", err);
      }

      setIsGuest(true);
      setUsername(null);
      setLoading(false);
    };

    checkAuth();
  }, [location]);

  const [categoriesState, setCategoriesState] = useState([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [catsError, setCatsError] = useState(null);

  const rawCategoryImages = import.meta.glob('../../assets/imgCategories/*.webp', { as: 'url', eager: true });
  const imagesMap = Object.fromEntries(
    Object.entries(rawCategoryImages).map(([p, url]) => {
      const file = p.split('/').pop();
      const id = file ? file.split('.')[0] : null;
      return [id, url];
    }).filter(([k]) => k !== null)
  );

  useEffect(() => {
    let cancelled = false;
    const fetchCategories = async () => {
      setCatsLoading(true);
      setCatsError(null);
      try {
        const res = await fetch(`${API_BASE}/categories`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setCategoriesState(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) setCatsError(err.message || 'Error al obtener categorías');
      } finally {
        if (!cancelled) setCatsLoading(false);
      }
    };

    fetchCategories();
    return () => { cancelled = true; };
  }, []);

  const handleCategoryClick = (category) => {
    if (category && category.id) {
      navigate(`/recipes?categoryId=${encodeURIComponent(category.id)}`);
    } else if (category && (category.category_name || category.name)) {
      const name = category.category_name || category.name;
      navigate(`/recipes?category=${encodeURIComponent(name)}`);
    }
  };

  if (loading) {
    return (
      <div className="home-container home-container-centered">
        <p>Cargando...</p>
      </div>
    );
  }

  const colorForIndex = (idx) => {
    const hue = (idx * 137.508) % 360;
    return `hsl(${hue.toFixed(1)}, 70%, 60%)`;
  };

  const sizeForIndex = (idx, name) => {
    if (name && name.length <= 6) return 'large';
    return (idx % 4 === 0) ? 'large' : 'small';
  };

  const categories = categoriesState.length > 0 ? categoriesState.map((cat, idx) => ({
    id: cat.id,
    category_name: cat.category_name || cat.name || `Categoría ${cat.id}`,
    color: cat.color || colorForIndex(idx),
    size: cat.size || sizeForIndex(idx, cat.category_name || cat.name)
  })) : [];

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-title">Explora recetas por categoría</h1>
        <p className="home-subtitle">Elige una categoría para ver todas las recetas relacionadas</p>
      </header>

      <main className="categories-wrapper">
        <div className="categories-grid">
          {catsLoading && <p>Cargando categorías...</p>}
          {catsError && <p style={{ color: 'red' }}>Error: {catsError}</p>}
          {!catsLoading && !catsError && categories.length === 0 && (
            <p>No hay categorías disponibles</p>
          )}
          {!catsLoading && categories.map((cat) => (
            <div
              key={cat.id}
              className={`category-tile ${cat.size === "large" ? "tile--large" : "tile--small"}`}
              style={{ background: cat.color }}
              role="button"
              tabIndex={0}
              onClick={() => handleCategoryClick(cat)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCategoryClick(cat); }}
              aria-label={`Ver recetas de ${cat.category_name}`}
            >
              {imagesMap[String(cat.id)] && (
                <img
                  src={imagesMap[String(cat.id)]}
                  alt={cat.category_name}
                  className="category-image"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  draggable={false}
                />
              )}
              <div className="category-overlay">
                <span className="category-name">{cat.category_name}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
