import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setSuccess(false);
    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok && data.message) {
        setMsg(data.message);
        setSuccess(false);
        return;
      }
      setMsg(data.message || "Registro exitoso");
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 1200);
      }
    } catch (err) {
      setMsg("Error en el servidor");
      console.error(err);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = "http://localhost:3000/api/auth/google";
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Registro</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <input
          className="register-input"
          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="register-input"
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="register-input"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="register-btn">
          Registrarse
        </button>
      </form>

      <div className="register-separator">o</div>

      <button onClick={handleGoogleRegister} className="google-btn">
        <span className="google-icon-wrapper">
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="google-icon"
            onError={e => e.target.style.display='none'}
          />
        </span>
        <span>Registrarse con Google</span>
      </button>

      <button
        type="button"
        className="switch-btn"
        onClick={() => navigate("/login")}
      >
        ¿Ya tienes cuenta? Inicia sesión
      </button>

      {msg && (
        <p className={`register-msg ${success ? "register-success" : "register-error"}`}>{msg}</p>
      )}
    </div>
  );
}
