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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Obtener usuario logueado
        const currentUserRes = await fetch(`${API_BASE}/api/auth/profile`, { credentials: "include" });
        if (!currentUserRes.ok) throw new Error("No se pudo obtener usuario actual");
        const currentUserData = await currentUserRes.json();
        setCurrentUser(currentUserData.user);

        // Obtener datos del perfil que estamos viendo
        const res = await fetch(`${API_BASE}/api/users/${id}`, { credentials: "include" });
        if (!res.ok) throw new Error("Usuario no encontrado");
        const data = await res.json();
        setUser(data.user);

        // Obtener seguidores y siguiendo
        const [followersRes, followingRes] = await Promise.all([
          fetch(`${API_BASE}/api/users/${id}/followers`, { credentials: "include" }),
          fetch(`${API_BASE}/api/users/${id}/following`, { credentials: "include" })
        ]);

        const followersData = followersRes.ok ? await followersRes.json() : { followers: [] };
        const followingData = followingRes.ok ? await followingRes.json() : { following: [] };

        setFollowers(followersData.followers || []);
        setFollowing(followingData.following || []);

        // Verificar si el usuario actual sigue este perfil
        setIsFollowing(followersData.followers.some(f => f.id === currentUserData.user.id));
      } catch (err) {
        console.error("fetchUserData:", err);
        alert(err.message);
      }
    };

    fetchUserData();
  }, [id]);

  const handleFollowToggle = async () => {
    try {
      if (!currentUser) throw new Error("No se pudo determinar el usuario actual");

      const endpoint = isFollowing ? "unfollow" : "follow";
      const url = `${API_BASE}/api/${endpoint}`;

      const res = await fetch(url, {
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

      setIsFollowing(!isFollowing);

      // Actualizar lista de seguidores del perfil que estamos viendo
      const followersRes = await fetch(`${API_BASE}/api/users/${id}/followers`, { credentials: "include" });
      if (followersRes.ok) {
        const data = await followersRes.json();
        setFollowers(data.followers || []);
      }
    } catch (err) {
      console.error("handleFollowToggle:", err);
      alert(err.message);
    }
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
            : followers.map(f => <li key={f.id}>{f.username}</li>)
          }
        </ul>

        <h3>Siguiendo ({following.length})</h3>
        <ul>
          {following.length === 0 
            ? <li>No sigue a nadie aún.</li> 
            : following.map(f => <li key={f.id}>{f.username}</li>)
          }
        </ul>
      </div>
    </div>
  );
}
