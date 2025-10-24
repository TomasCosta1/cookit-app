import { useEffect, useState } from "react"; 
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import Modal from "../../components/Modal/Modal.jsx";
import UserSearch from "../../components/UserSearch/UserSerch.jsx";
import RecipeCardCompact from "../../components/RecipeCardCompact/RecipeCardCompact.jsx";

const API_BASE = import.meta.env.VITE_API_URL;

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [myRecipes, setMyRecipes] = useState([]);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const navigate = useNavigate();

  const fetchFollowData = async (userId) => {
    try {
      const [followersRes, followingRes] = await Promise.all([
        fetch(`${API_BASE}/api/users/${userId}/followers`, { credentials: "include" }),
        fetch(`${API_BASE}/api/users/${userId}/following`, { credentials: "include" })
      ]);

      const followersData = followersRes.ok ? await followersRes.json() : { followers: [] };
      const followingData = followingRes.ok ? await followingRes.json() : { following: [] };

      setFollowers(followersData.followers || []);
      setFollowing(followingData.following || []);
    } catch (err) {
      console.error("Error al cargar seguidores/siguiendo:", err);
    }
  };

  const fetchMyRecipes = async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/recipes`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      const mine = Array.isArray(data) ? data.filter(r => Number(r.user_id) === Number(userId)) : [];
      setMyRecipes(mine);
    } catch (err) {
      console.error("Error al cargar mis recetas:", err);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/profile`, { credentials: "include" });
        if (!res.ok) {
          setIsGuest(true);
          return;
        }

        const data = await res.json();
        setUser(data.user);
  await fetchFollowData(data.user.id);
  await fetchMyRecipes(data.user.id);

      } catch (err) {
        console.error("Error al cargar perfil:", err);
        setIsGuest(true);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await fetch(`${API_BASE}/api/auth/logout`, { method: "POST", credentials: "include" });
    setUser(null);
    setIsGuest(true);
  };

  const handleNavigateToProfile = (id) => {
    navigate(`/profile/${id}`);
  };

  if (!user && !isGuest) return <p className="loading">Cargando perfil...</p>;

  if (isGuest) {
    return (
      <div className="profile-container guest">
        <h2>Estás navegando como invitado</h2>
        <p>No has iniciado sesión. Para acceder a tu perfil, inicia sesión con tu cuenta.</p>
        <button onClick={() => navigate("/login")} className="login-btn">
          Ir al login
        </button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Logout icon (top-right) */}
      <button
        className="logout-icon-btn"
        onClick={handleLogout}
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
          <path d="M16 13v-2H7V8l-5 4 5 4v-3h9zM20 3h-8c-1.1 0-2 .9-2 2v4h2V5h8v14h-8v-4h-2v4c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
        </svg>
      </button>
      <div className="profile-header">
        <div className="profile-image-container">
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&size=100&background=fcba03&color=1a1a1a&bold=true`}
            alt={user.username}
            className="profile-image"
          />
        </div>
        <div className="profile-info">
          <h2 className="profile-username">{user.username}</h2>
          <p className="profile-email">{user.email}</p>
          <div className="profile-stats">
            <div className="stat-item" onClick={() => setShowFollowersModal(true)}>
              <span className="stat-number">{followers.length}</span>
              <span className="stat-label">Seguidores</span>
            </div>
            <div className="stat-item" onClick={() => setShowFollowingModal(true)}>
              <span className="stat-number">{following.length}</span>
              <span className="stat-label">Siguiendo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Buscador de usuarios */}
      <div className="search-section">
        <h3>Buscar usuarios</h3>
        <UserSearch />
      </div>

      {/* Mis recetas */}
      <div className="my-recipes-section">
        <h3>Mis recetas ({myRecipes.length})</h3>
        <div className="my-recipes-grid">
          <button
            type="button"
            className="create-recipe-card"
            onClick={() => navigate('/recipes/create')}
            aria-label="Crear receta"
            title="Crear receta"
          >
            <div className="create-recipe-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/>
              </svg>
            </div>
            <span className="create-recipe-text">Crear receta</span>
          </button>

          {myRecipes.map(recipe => (
            <RecipeCardCompact key={recipe.id} recipe={recipe} />
          ))}
        </div>
        {myRecipes.length === 0 && (
          <p className="empty-message">Todavía no tienes recetas creadas.</p>
        )}
      </div>

      {/* Modal de Seguidores */}
      <Modal
        open={showFollowersModal}
        title={`Seguidores (${followers.length})`}
        onClose={() => setShowFollowersModal(false)}
      >
        {followers.length === 0 ? (
          <p className="empty-message">No tienes seguidores aún.</p>
        ) : (
          <div className="users-list">
            {followers.map(f => (
              <div
                key={f.id}
                className="user-item"
                onClick={() => {
                  handleNavigateToProfile(f.id);
                  setShowFollowersModal(false);
                }}
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(f.username)}&size=50&background=fef3c7&color=1a1a1a`}
                  alt={f.username}
                  className="user-avatar"
                />
                <span className="user-name">{f.username}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Modal de Siguiendo */}
      <Modal
        open={showFollowingModal}
        title={`Siguiendo (${following.length})`}
        onClose={() => setShowFollowingModal(false)}
      >
        {following.length === 0 ? (
          <p className="empty-message">No sigues a nadie aún.</p>
        ) : (
          <div className="users-list">
            {following.map(f => (
              <div
                key={f.id}
                className="user-item"
                onClick={() => {
                  handleNavigateToProfile(f.id);
                  setShowFollowingModal(false);
                }}
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(f.username)}&size=50&background=fef3c7&color=1a1a1a`}
                  alt={f.username}
                  className="user-avatar"
                />
                <span className="user-name">{f.username}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
