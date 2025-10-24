import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProfileView.css";

const API_BASE = import.meta.env.VITE_API_URL;

export default function ProfileView() {
  const { id } = useParams(); // ID del perfil que estamos viendo
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchUserData = async () => {
    try {
      // Usuario logueado
      const currentUserRes = await fetch(`${API_BASE}/api/auth/profile`, { credentials: "include" });
      if (!currentUserRes.ok) throw new Error("No se pudo obtener usuario actual");
      const currentUserData = await currentUserRes.json();
      setCurrentUser(currentUserData.user);

      // Perfil que estamos viendo (incluye followers y following)
      const res = await fetch(`${API_BASE}/api/users/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Usuario no encontrado");
      const data = await res.json();

      setUser(data.user);
      setFollowers(data.followers || []);
      setFollowing(data.following || []);

      // Verificar si el usuario actual sigue este perfil
      setIsFollowing((data.followers || []).some(f => f.id === currentUserData.user.id));
    } catch (err) {
      console.error("fetchUserData:", err);
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchUserData();
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

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al actualizar seguimiento");
      }

      // Refrescar datos del perfil
      await fetchUserData();

    } catch (err) {
      console.error("handleFollowToggle:", err);
      alert(err.message);
    }
  };

  const handleNavigateToProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  if (!user || !currentUser) return <p className="loading">Cargando perfil...</p>;

  return (
    <div className="profileview-container">
      <button onClick={() => navigate(-1)} className="back-btn">Volver atrás</button>

      <div className="profile-card">
        <h2>{user.username}</h2>
        {currentUser.id !== user.id && (
          <button onClick={handleFollowToggle} className="follow-btn">
            {isFollowing ? "Dejar de seguir" : "Seguir"}
          </button>
        )}
      </div>

      <div className="friends-section">
        <h3>Seguidores ({followers.length})</h3>
        <ul>
          {followers.length === 0
            ? <li>No tiene seguidores aún.</li>
            : followers.map(f => (
                <li key={f.id} className="clickable" onClick={() => handleNavigateToProfile(f.id)}>
                  {f.username}
                </li>
              ))
          }
        </ul>

        <h3>Siguiendo ({following.length})</h3>
        <ul>
          {following.length === 0
            ? <li>No sigue a nadie aún.</li>
            : following.map(f => (
                <li key={f.id} className="clickable" onClick={() => handleNavigateToProfile(f.id)}>
                  {f.username}
                </li>
              ))
          }
        </ul>
      </div>
    </div>
  );
}
