import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import "./Home.css";

export default function Home() {
  const [isGuest, setIsGuest] = useState(false);
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem("cookit_user");
    if (savedUser) {
      const userObj = JSON.parse(savedUser);
      setUsername(userObj.name);
      setIsGuest(false);
      return;
    }

    const params = new URLSearchParams(location.search);
    const name = params.get("name");
    if (name) {
      setUsername(name);
      localStorage.setItem("cookit_user", JSON.stringify({ name }));
      localStorage.setItem("cookit_guest", "0");
      setIsGuest(false);
      return;
    }

    const guest = localStorage.getItem("cookit_guest");
    if (!guest) {
      localStorage.setItem("cookit_guest", "1");
      setIsGuest(true);
    } else {
      setIsGuest(guest === "1");
    }
  }, [location]);

  const handleLoginRedirect = () => {
    localStorage.removeItem("cookit_guest"); 
    navigate("/login");
  };

  const handleLogout = () => {
    localStorage.removeItem("cookit_user"); 
    localStorage.removeItem("cookit_guest"); 
    navigate("/login");
  };

  return (
    <div className="home-container" style={{ textAlign: "center", marginTop: 50 }}>
      <h2 className="home-title">¡Bienvenido a Cookit!</h2>

      {username ? (
        <p>Hola, <b>{username}</b></p>
      ) : (
        <p className="home-desc">Explora recetas, ingredientes y mucho más.</p>
      )}

      {isGuest ? (
        <>
          <p>Estás navegando como <b>invitado</b>. Algunas funciones estarán limitadas.</p>
          <button
            onClick={handleLoginRedirect}
            style={{marginTop: 20, background: "#007bff", color: "#fff", border: "none", borderRadius: 5, padding: "10px 20px", cursor: "pointer"}}
          >
            Iniciar sesión
          </button>
        </>
      ) : (
        <button
          onClick={handleLogout}
          style={{marginTop: 20, background: "#dc3545", color: "#fff", border: "none", borderRadius: 5, padding: "10px 20px", cursor: "pointer"}}
        >
          Cerrar sesión
        </button>
      )}
    </div>
  );
}
