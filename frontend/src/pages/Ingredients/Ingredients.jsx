import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  addMyIngredient,
  isInMyIngredients,
  removeMyIngredient,
} from "../../lib/storage.js";
import "./Ingredients.css";
import { IngredientsCard } from "../../components/IngredientsCard/IngredientsCard.jsx";
import SearchInput from "../../components/SearchInput/SearchInput";

const API_BASE = "http://localhost:3000";

export default function Ingredients() {
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
    return `${API_BASE}/ingredients?${params.toString()}`;
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
          const list = Array.isArray(data?.data) ? data.data : data;
          setRows(list);
          if (typeof data?.total === "number") setTotal(data.total);
          if (typeof data?.totalPages === "number")
            setTotalPages(Math.max(1, data.totalPages));
          if (typeof data?.page === "number" && data.page !== page)
            setPage(Math.max(1, data.page));
        }
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className="ingredients-page">
      <h2>Ingredientes</h2>
      <div className="ingredients-actions">
        <Link to="/my-ingredients" className="btn btn-primary">Mis ingredientes</Link>
      </div>
      <SearchInput
        value={q}
        onChange={setQ}
        placeholder="Buscar ingredientes..."
        onPageReset={() => setPage(1)}
      />

      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="ingredients-pager" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, opacity: 0.9 }}>
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

      <ul className="ingredients-list">
        {rows.map((it) => {
          const id = it.id;
          const name = it.name ?? it.nombre;
          const selected = isInMyIngredients(id);
          return (
            <IngredientsCard
              key={id}
              id={id}
              name={name}
              selected={selected}
              removeMyIngredient={removeMyIngredient}
              setRows={setRows}
              addMyIngredient={addMyIngredient}
            />
          );
        })}
      </ul>
    </div>
  );
}
