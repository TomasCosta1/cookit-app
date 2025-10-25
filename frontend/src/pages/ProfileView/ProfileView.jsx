import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Modal from "../../components/Modal/Modal.jsx";
import RecipeCardCompact from "../../components/RecipeCardCompact/RecipeCardCompact.jsx";
import "./ProfileView.css";

const API_BASE = import.meta.env.VITE_API_URL;

export default function ProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [yourRecipes, setYourRecipes] = useState([]);

  const fetchUserData = async () => {
    try {
      const currentUserRes = await fetch(`${API_BASE}/api/auth/profile`, { credentials: "include" });
      if (!currentUserRes.ok) throw new Error("No se pudo obtener usuario actual");
      const currentUserData = await currentUserRes.json();
      setCurrentUser(currentUserData.user);

      const res = await fetch(`${API_BASE}/api/users/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Usuario no encontrado");
      const data = await res.json();

      setUser(data.user);
      setFollowers(data.followers || []);
      setFollowing(data.following || []);
      setIsFollowing((data.followers || []).some(f => f.id === currentUserData.user.id));
    } catch (err) {
      console.error("fetchUserData:", err);
    }
  };

    const fetchYourRecipes = async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/recipes`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      const mine = Array.isArray(data) ? data.filter(r => Number(r.user_id) === Number(userId)) : [];
      setYourRecipes(mine);
    } catch (err) {
      console.error("Error al cargar mis recetas:", err);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchYourRecipes(user.id);
  }, [id]);

  const handleFollowToggle = async () => {
    if (!currentUser) return;
    try {
      const endpoint = isFollowing ? "unfollow" : "follow";
      const res = await fetch(`${API_BASE}/api/${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followerId: currentUser.id,
          followedId: Number(id)
        }),
      });

      if (!res.ok) throw new Error("Error al actualizar seguimiento");
      await fetchUserData();
    } catch (err) {
      console.error("handleFollowToggle:", err);
    }
  };

  const handleNavigateToProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  if (!user || !currentUser) return <p className="loading">Cargando perfil...</p>;

  return (
    <div className="profile-container">
      {/* Botón atrás */}
      <button
        className="back-icon-btn"
        onClick={() => navigate(-1)}
        aria-label="Volver atrás"
        title="Volver atrás"
      >
        ←
      </button>

      {/* Header */}
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

          {/* Botón seguir/dejar de seguir */}
          {currentUser.id !== user.id && (
            <button
              onClick={handleFollowToggle}
              className={`follow-toggle-btn ${isFollowing ? "unfollow" : "follow"}`}
            >
              {isFollowing ? "Dejar de seguir" : "Seguir"}
            </button>
          )}
        </div>
      </div>

      {/* Mis recetas */}
      <div className="my-recipes-section">
        <h3>Mis recetas ({yourRecipes.length})</h3>
        <div className="my-recipes-grid">
          {yourRecipes.map(recipe => (
            <RecipeCardCompact key={recipe.id} recipe={recipe} />
          ))}
        </div>
        {yourRecipes.length === 0 && (
          <p className="empty-message">Todavía no tienes recetas creadas.</p>
        )}
      </div>

      {/* Modales */}
      <Modal
        open={showFollowersModal}
        title={`Seguidores (${followers.length})`}
        onClose={() => setShowFollowersModal(false)}
      >
        {followers.length === 0 ? (
          <p className="empty-message">No tiene seguidores aún.</p>
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

      <Modal
        open={showFollowingModal}
        title={`Siguiendo (${following.length})`}
        onClose={() => setShowFollowingModal(false)}
      >
        {following.length === 0 ? (
          <p className="empty-message">No sigue a nadie aún.</p>
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
