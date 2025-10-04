import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import Button from "../../components/Button/Button";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const calculateStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.length >= 10) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const newPass = e.target.value;
    setPassword(newPass);
    setPasswordStrength(calculateStrength(newPass));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setSuccess(false);

    if (password !== repeatPassword) {
      setMsg("Las contraseñas no coinciden");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
        credentials: "include",
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
        setTimeout(() => navigate("/login"), 1500);
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
          onChange={handlePasswordChange}
          required
        />

        <div className="password-strength">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className={`strength-bar ${passwordStrength >= i ? "active" : ""}`}></div>
          ))}
        </div>

        <input
          className="register-input"
          type="password"
          placeholder="Repetir contraseña"
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
          required
        />

        <Button type="submit" variant="primary" size="large" className="btn--full-width">
          Registrarse
        </Button>
      </form>

      <div className="register-separator">o</div>

      <Button onClick={handleGoogleRegister} variant="outline" size="large" className="btn--full-width google-btn">
        <span className="google-icon-wrapper">
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="google-icon"
            onError={(e) => (e.target.style.display = "none")}
          />
        </span>
        <span>Registrarse con Google</span>
      </Button>

      <Button type="button" variant="ghost" size="medium" className="switch-btn" onClick={() => navigate("/login")}>
        ¿Ya tienes cuenta? Inicia sesión
      </Button>

      {msg && (
        <p className={`register-msg ${success ? "register-success" : "register-error"}`}>{msg}</p>
      )}
    </div>
  );
}
