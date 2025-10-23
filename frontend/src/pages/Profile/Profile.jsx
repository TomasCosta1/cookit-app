import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import UserSearch from "../../components/UserSearch/userSerch.jsx";

const API_BASE = import.meta.env.VITE_API_URL;

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
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

        const [followersRes, followingRes] = await Promise.all([
          fetch(`${API_BASE}/api/users/followers/${data.user.id}`, { credentials: "include" }),
          fetch(`${API_BASE}/api/users/following/${data.user.id}`, { credentials: "include" })
        ]);

        let followersData = [];
        let followingData = [];

        if (followersRes.ok) {
          followersData = await followersRes.json();
        } else {
          console.warn("No se pudieron obtener los seguidores");
        }

        if (followingRes.ok) {
          followingData = await followingRes.json();
        } else {
          console.warn("No se pudieron obtener los seguidos");
        }

        setFollowers(followersData.followers || []);
        setFollowing(followingData.following || []);

      } catch (err) {
        console.error("Error al cargar perfil:", err);
        setIsGuest(true);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    setIsGuest(true);
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
      <h2>Mi Perfil</h2>
      <div className="profile-card">
        <p>
          <strong>Nombre:</strong> {user.username}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
      </div>

      {/* Buscador de usuarios */}
        <UserSearch />

      <div className="friends-section">
        <h3>Seguidores ({followers.length})</h3>
        <ul>
          {followers.length === 0 ? (
            <li>No tienes seguidores aún.</li>
          ) : (
            followers.map(f => (
              <li key={f.id}>{f.username}</li>
            ))
          )}
        </ul>

        <h3>Siguiendo ({following.length})</h3>
        <ul>
          {following.length === 0 ? (
            <li>No sigues a nadie aún.</li>
          ) : (
            following.map(f => (
              <li key={f.id}>{f.username}</li>
            ))
          )}
        </ul>
      </div>

      <button onClick={handleLogout} className="logout-btn">
        Cerrar sesión
      </button>
    </div>
  );
}
