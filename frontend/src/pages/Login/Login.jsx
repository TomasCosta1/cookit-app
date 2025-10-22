import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import Button from "../../components/Button/Button";

const API_BASE = import.meta.env.VITE_API_URL;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setSuccess(false);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg =
          [
            "Usuario o contraseña incorrectos",
            "Usuario registrado con Google. Usa Google para iniciar sesión.",
          ].includes(data.message)
            ? "Email y/o contraseña incorrectos"
            : data.message;
        setMsg(errorMsg);
        return;
      }

      setMsg(`Bienvenido ${data.username}`);
      setSuccess(true);

      setTimeout(() => navigate("/profile"), 1000);
    } catch (err) {
      console.error(err);
      setMsg("Error en el servidor");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/api/auth/google`;
  };

  const handleGuest = () => {
    localStorage.setItem("cookit_guest", "1");
    navigate("/profile");
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
        <Button type="submit" variant="primary" size="large" className="btn--full-width">
          Login
        </Button>
      </form>

      <Button
        onClick={handleGuest}
        variant="ghost"
        size="large"
        className="btn--full-width guest-btn"
      >
        Entrar como invitado
      </Button>

      <div className="login-separator">o</div>

      <Button
        onClick={handleGoogleLogin}
        variant="outline"
        size="large"
        className="btn--full-width google-btn"
      >
        <span className="google-icon-wrapper">
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="google-icon"
            onError={(e) => (e.target.style.display = "none")}
          />
        </span>
        <span>Iniciar sesión con Google</span>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="medium"
        className="switch-btn"
        onClick={() => navigate("/register")}
      >
        ¿No tienes cuenta? Regístrate
      </Button>

      {msg && (
        <p className={`login-msg ${success ? "login-success" : "login-error"}`}>{msg}</p>
      )}
    </div>
  );
}
