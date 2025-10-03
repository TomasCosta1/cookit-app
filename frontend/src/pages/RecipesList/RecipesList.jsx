import { useEffect, useMemo, useState } from "react";
import "./RecipesList.css";
import RecipeCard from "../../components/RecipeCard/RecipeCard";
import SearchInput from "../../components/SearchInput/SearchInput";

const API_BASE = "http://localhost:3000";

export default function RecipesList() {
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const url = useMemo(() => {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        params.set("page", String(page));
        params.set("limit", String(limit));
        return `${API_BASE}/recipes?${params.toString()}`;
    }, [q, page, limit]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        fetch(url)
            .then(async (r) => {
                if (!r.ok) throw new Error("Network error");
                const data = await r.json();
                if (!cancelled) {
                    const list = Array.isArray(data) ? data : [];
                    setRows(list);
                    setTotal(list.length);
                }
            })
            .catch((e) => !cancelled && setError(e.message))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [url, limit]);

    // Filtro local por búsqueda
    const filteredRows = useMemo(() => {
        if (!q) return rows;
        return rows.filter(recipe => 
            recipe.title?.toLowerCase().includes(q.toLowerCase()) ||
            recipe.description?.toLowerCase().includes(q.toLowerCase())
        );
    }, [rows, q]);

    // Paginación
    const paginatedRows = useMemo(() => {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        return filteredRows.slice(startIndex, endIndex);
    }, [filteredRows, page, limit]);

    // TotalPages basado en resultados filtrados
    useEffect(() => {
        const newTotalPages = Math.max(1, Math.ceil(filteredRows.length / limit));
        setTotalPages(newTotalPages);
        
        if (page > newTotalPages && newTotalPages > 0) {
            setPage(1);
        }
    }, [filteredRows.length, limit, page]);

    return (
        <div className="recipes-page">
            <h2>Recetas</h2>
            
            <SearchInput
                value={q}
                onChange={setQ}
                placeholder="Buscar recetas..."
                onPageReset={() => setPage(1)}
            />

            {loading && <p>Cargando recetas...</p>}
            {error && <p style={{ color: "red" }}>Error: {error}</p>}
            
            <div className="recipes-pager" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 12, 
                opacity: 0.9,
                marginBottom: '20px'
            }}>
                <button
                    className="btn"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    aria-label="Página anterior"
                >
                    Anterior
                </button>
                <span>Página {page} de {totalPages}</span>
                <button
                    className="btn"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    aria-label="Página siguiente"
                >
                    Siguiente
                </button>
            </div>

            <ul className="recipes-list">
                {paginatedRows.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
            </ul>

            {paginatedRows.length === 0 && !loading && (
                <div className="no-results">
                    <p>No se encontraron recetas</p>
                    {q && <p>Intenta con otros términos de búsqueda</p>}
                </div>
            )}
        </div>
    );
}
