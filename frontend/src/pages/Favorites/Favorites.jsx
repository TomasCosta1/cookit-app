import { useEffect, useMemo, useState } from "react";
import "./Favorites.css";
import RecipeCard from "../../components/RecipeCard/RecipeCard";
import SearchInput from "../../components/SearchInput/SearchInput";
import Button from "../../components/Button/Button";
import { useAuth } from "../../hooks/useAuth";
import { useFavorites } from "../../hooks/useFavorites";

export default function Favorites() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const { favorites, loading: favoritesLoading, error } = useFavorites(user?.id);
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    const filteredFavorites = useMemo(() => {
        if (!q) return favorites;
        return favorites.filter(recipe => 
            recipe.title?.toLowerCase().includes(q.toLowerCase()) ||
            recipe.description?.toLowerCase().includes(q.toLowerCase())
        );
    }, [favorites, q]);

    const paginatedFavorites = useMemo(() => {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        return filteredFavorites.slice(startIndex, endIndex);
    }, [filteredFavorites, page, limit]);

    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil(filteredFavorites.length / limit));
    }, [filteredFavorites.length, limit]);

    useEffect(() => {
        if (page > totalPages && totalPages > 0) {
            setPage(1);
        }
    }, [totalPages, page]);


    if (authLoading) {
        return (
            <div className="favorites-page">
                <div className="loading">
                    <p>Cargando...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="favorites-page">
                <div className="not-authenticated">
                    <h2>Favoritos</h2>
                    <p>Debes iniciar sesión para ver tus recetas favoritas.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="favorites-page">
            <h2>Mis Favoritos</h2>
            
            <SearchInput
                value={q}
                onChange={setQ}
                placeholder="Buscar en favoritos..."
                onPageReset={() => setPage(1)}
            />

            {favoritesLoading && <p>Cargando favoritos...</p>}
            {error && <p style={{ color: "red" }}>Error: {error}</p>}
            
            <div className="favorites-pager">
                <Button
                    variant="ghost"
                    size="small"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                >
                    Anterior
                </Button>
                <span className="page-info">Página {page} de {totalPages}</span>
                <Button
                    variant="ghost"
                    size="small"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                >
                    Siguiente
                </Button>
            </div>

            <ul className="favorites-list">
                {paginatedFavorites.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
            </ul>

            {paginatedFavorites.length === 0 && !favoritesLoading && (
                <div className="no-results">
                    {favorites.length === 0 ? (
                        <>
                            <p>No tienes recetas favoritas aún</p>
                            <p>¡Explora las recetas y marca tus favoritas con la estrella!</p>
                        </>
                    ) : (
                        <>
                            <p>No se encontraron favoritos</p>
                            {q && <p>Intenta con otros términos de búsqueda</p>}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
