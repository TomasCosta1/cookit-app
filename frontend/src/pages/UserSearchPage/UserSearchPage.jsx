import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UserSearchPage.css";

const API_BASE = import.meta.env.VITE_API_URL;

export default function UserSearchPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const navigate = useNavigate();

  // --- Protección de ruta (igual que en Profile.jsx) ---
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/profile`, {
          credentials: "include",
        });

        if (!res.ok) {
          setIsGuest(true);
          return;
        }

        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error("Error verificando sesión:", err);
        setIsGuest(true);
      }
    };

    checkAuth();
  }, []);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === "") {
      setUsers([]);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE}/api/users/search?q=${value}`,
        { credentials: "include" }
      );

      if (!res.ok) {
        console.error("Error en la respuesta:", res.status);
        setUsers([]);
        return;
      }

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error buscando usuarios:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToProfile = (id) => {
    navigate(`/profile/${id}`);
  };

  // --- Mismo comportamiento que Profile.jsx ---
  if (!user && !isGuest) return <p className="loading">Cargando...</p>;

  if (isGuest) {
    return (
      <div className="user-search-page guest-block">
        <h2>No has iniciado sesión</h2>
        <p>Para buscar usuarios necesitas iniciar sesión.</p>
        <button onClick={() => navigate("/login")} className="login-btn">
          Ir al login
        </button>
      </div>
    );
  }

  return (
    <div className="user-search-page">
      <h1 className="search-title">🔍 Buscar usuarios</h1>

      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Buscar por nombre de usuario..."
          value={query}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      {loading && <p className="loading-text">Buscando...</p>}

      <div className="search-results">
        {users.length === 0 && !loading && query.trim() !== "" ? (
          <p className="empty-text">No se encontraron usuarios.</p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="user-card"
              onClick={() => handleNavigateToProfile(user.id)}
            >
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.username
                )}&size=80&background=fcba03&color=1a1a1a&bold=true`}
                alt={user.username}
                className="user-avatar"
              />
              <span className="user-name">{user.username}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
