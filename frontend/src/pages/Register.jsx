import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setSuccess(false);

    if (password !== confirmPassword) {
      setMsg("Las contraseñas no coinciden");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      setMsg(data.message);
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 1000);
      }
    } catch (err) {
      setMsg("Error en el servidor");
      console.error(err);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = "http://localhost:3000/api/auth/google";
  };

  // Función para calcular la fuerza de la contraseña
  function getPasswordStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  }

  const strengthLabels = ["Muy débil", "Débil", "Media", "Fuerte", "Muy fuerte"];
  const strengthColors = ["#e74c3c", "#e67e22", "#f1c40f", "#2ecc71", "#27ae60"];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Register</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordStrength(getPasswordStrength(e.target.value));
          }}
          required
        />
        <div style={{ height: 8, background: '#eee', borderRadius: 4, marginBottom: 6 }}>
          <div style={{
            width: `${(passwordStrength / 4) * 100}%`,
            height: 8,
            background: strengthColors[passwordStrength],
            borderRadius: 4,
            transition: 'width 0.3s'
          }} />
        </div>
        <div style={{ color: strengthColors[passwordStrength], fontWeight: 600, marginBottom: 8, fontSize: 13 }}>
          {password ? strengthLabels[passwordStrength] : ''}
        </div>
        <input
          style={styles.input}
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" style={styles.button}>
          Register
        </button>
      </form>

      <div style={styles.separator}>o</div>


      <button onClick={handleGoogleRegister} style={styles.googleButton}>
        <span style={styles.googleIconWrapper}>
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            style={styles.googleIcon}
            onError={e => e.target.style.display='none'}
          />
        </span>
        <span style={{ fontWeight: 600 }}>Registrarse con Google</span>
      </button>

      <button
        type="button"
        style={styles.switchButton}
        onClick={() => navigate("/login")}
      >
        ¿Ya tienes cuenta? Inicia sesión
      </button>

      {msg && (
        <p style={{ ...styles.msg, color: success ? "green" : "red" }}>{msg}</p>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 400,
    width: '100%',
    margin: '32px auto',
    padding: '24px 16px',
    borderRadius: 16,
    background: '#fff',
    boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
    textAlign: 'center',
    fontFamily: 'inherit',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  title: { marginBottom: 24, color: '#222', fontWeight: 700, fontSize: 28 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  input: {
    padding: '12px',
    marginBottom: 0,
    borderRadius: 8,
    border: '1px solid #e0e0e0',
    fontSize: 16,
    background: '#fafafa',
    outline: 'none',
    marginTop: 0,
  },
  button: {
    padding: '12px',
    backgroundColor: '#FFC107',
    color: '#222',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 0,
    marginTop: 8,
    boxShadow: '0 2px 6px rgba(255,193,7,0.08)',
    transition: 'background 0.2s, color 0.2s',
  },
  separator: {
    margin: '18px 0 12px 0',
    fontWeight: 'bold',
    color: '#888',
    fontSize: 15,
  },
  googleButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: '12px 20px',
    background: '#fff',
    color: '#444',
    border: '1px solid #db4437',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 600,
    boxShadow: '0 2px 8px rgba(219,68,55,0.08)',
    transition: 'background 0.2s, color 0.2s',
    marginBottom: 0,
  },
  googleIconWrapper: {
    background: '#fff',
    borderRadius: '50%',
    padding: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  googleIcon: { width: 24, height: 24 },
  switchButton: {
    marginTop: 16,
    background: 'none',
    border: 'none',
    color: '#222',
    cursor: 'pointer',
    fontSize: 15,
    textDecoration: 'underline',
    fontWeight: 500,
  },
  msg: { marginTop: 18, fontWeight: 600, fontSize: 15 },
  '@media (max-width: 600px)': {
    container: {
      maxWidth: '98vw',
      padding: '12px 2vw',
      minHeight: '100vh',
    },
    title: { fontSize: 22 },
    input: { fontSize: 15 },
    button: { fontSize: 15 },
  },
};
