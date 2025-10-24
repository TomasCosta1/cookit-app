import { useEffect, useState } from "react"; 
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import Modal from "../../components/Modal/Modal.jsx";
import UserSearch from "../../components/UserSearch/UserSerch.jsx";

const API_BASE = import.meta.env.VITE_API_URL;

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
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
      <div className="profile-header">
        <div className="profile-image-container">
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&size=150&background=fcba03&color=1a1a1a&bold=true`}
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

      <button onClick={handleLogout} className="logout-btn">
        Cerrar sesión
      </button>
    </div>
  );
}
