import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const API_BASE = import.meta.env.VITE_API_URL;

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
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
      } catch (err) {
        console.error(err);
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
      <button onClick={handleLogout} className="logout-btn">
        Cerrar sesión
      </button>
    </div>
  );
}
