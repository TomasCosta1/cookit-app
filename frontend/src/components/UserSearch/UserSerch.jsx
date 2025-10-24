import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UserSearch.css";

const API_BASE = import.meta.env.VITE_API_URL;

export default function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/search?q=${query}`);
        if (!res.ok) throw new Error("Error al buscar usuarios");
        const data = await res.json();
        setResults(data || []);
      } catch (err) {
        console.error(err);
        setResults([]);
      }
    }, 300); // delay tipo debounce

    return () => clearTimeout(timer);
  }, [query]);

  const goToProfile = (id) => {
    navigate(`/profile/${id}`);
    setQuery("");
    setResults([]);
  };

  return (
    <div className="user-search">
      <input
        type="text"
        placeholder="Buscar usuarios..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {results.length > 0 && (
        <div className="search-results">
          {results.map(user => (
            <div key={user.id} className="user-card" onClick={() => goToProfile(user.id)}>
              <p>{user.username}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
