import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import "./Home.css";
import Button from "../../components/Button/Button";

const API_BASE = import.meta.env.VITE_API_URL;

export default function Home() {
  const [isGuest, setIsGuest] = useState(false);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Primero intentamos validar con el backend (sistema real)
        const res = await fetch(`${API_BASE}/api/auth/profile`, { 
          credentials: "include" 
        });
        
        if (res.ok) {
          const data = await res.json();
          setUsername(data.user.username);
          setIsGuest(false);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Error al verificar autenticación:", err);
      }

      // Si no hay sesión en el backend, marcamos como invitado
      setIsGuest(true);
      setUsername(null);
      setLoading(false);
    };

    checkAuth();
  }, [location]);

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, { 
        method: "POST", 
        credentials: "include" 
      });
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
    setUsername(null);
    setIsGuest(true);
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="home-container home-container-centered">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="home-container home-container-centered">
      <h2 className="home-title">¡Bienvenido a Cookit!</h2>

      {username ? (
        <p className="user-greeting">Hola, <b>{username}</b></p>
      ) : (
        <p className="home-desc">Explora recetas, ingredientes y mucho más.</p>
      )}

      {isGuest ? (
        <>
          <p className="guest-message">Estás navegando como <b>invitado</b>. Algunas funciones estarán limitadas.</p>
          <Button
            onClick={handleLoginRedirect}
            variant="primary"
            size="large"
          >
            Iniciar sesión
          </Button>
        </>
      ) : (
        <Button
          onClick={handleLogout}
          variant="danger"
          size="large"
        >
          Cerrar sesión
        </Button>
      )}
    </div>
  );
}
