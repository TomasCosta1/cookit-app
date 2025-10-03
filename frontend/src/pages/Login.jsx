import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(false);
  // const navigate = useNavigate();

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

  const navigate = useNavigate();
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/api/auth/google";
  };

  // Manejo de invitado: setear en localStorage y navegar
  const handleGuest = () => {
    localStorage.setItem('cookit_guest', '1');
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Login</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
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
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>

      <button onClick={handleGuest} style={{...styles.button, background: '#888', marginBottom: 10}}>
        Entrar como invitado
      </button>

      <div style={styles.separator}>o</div>

      <button onClick={handleGoogleLogin} style={styles.googleButton}>
        <span style={styles.googleIconWrapper}>
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            style={styles.googleIcon}
            onError={e => e.target.style.display='none'}
          />
        </span>
        <span>Iniciar sesión con Google</span>
      </button>

      <button
        type="button"
        style={styles.switchButton}
        onClick={() => navigate("/register")}
      >
        ¿No tienes cuenta? Regístrate
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
