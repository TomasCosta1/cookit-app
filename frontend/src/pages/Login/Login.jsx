import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setSuccess(false);
    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok && (data.message === "Usuario o contraseña incorrectos" || data.message === "Usuario registrado con Google. Usa Google para iniciar sesión.")) {
        setMsg("Email y/o contraseña incorrectos");
        setSuccess(false);
        return;
      }
      setMsg(data.message);
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/"), 1000);
      }
    } catch (err) {
      setMsg("Error en el servidor");
      console.error(err);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/api/auth/google";
  };

  // Manejo de invitado: setear en localStorage y navegar
  const handleGuest = () => {
    localStorage.setItem('cookit_guest', '1');
    navigate('/');
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          className="login-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="login-btn">
          Login
        </button>
      </form>

      <button onClick={handleGuest} className="guest-btn">
        Entrar como invitado
      </button>

      <div className="login-separator">o</div>

      <button onClick={handleGoogleLogin} className="google-btn">
        <span className="google-icon-wrapper">
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="google-icon"
            onError={e => e.target.style.display='none'}
          />
        </span>
        <span>Iniciar sesión con Google</span>
      </button>

      <button
        type="button"
        className="switch-btn"
        onClick={() => navigate("/register")}
      >
        ¿No tienes cuenta? Regístrate
      </button>

      {msg && (
        <p className={`login-msg ${success ? "login-success" : "login-error"}`}>{msg}</p>
      )}
    </div>
  );
}
