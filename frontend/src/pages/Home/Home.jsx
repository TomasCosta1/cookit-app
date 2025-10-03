import "./Home.css";

export default function Home() {
  const isGuest = localStorage.getItem('cookit_guest') === '1';
  return (
    <div className="home-container" style={{textAlign: 'center', marginTop: 50}}>
      <h2 className="home-title">¡Bienvenido a Cookit!</h2>
      <p className="home-desc">
        Explora recetas, ingredientes y mucho más.
      </p>
      {isGuest ? (
        <>
          <p>Estás navegando como <b>invitado</b>. Algunas funciones estarán limitadas.</p>
          <button onClick={() => { localStorage.removeItem('cookit_guest'); window.location.reload(); }} style={{marginTop: 20, background: '#007bff', color: '#fff', border: 'none', borderRadius: 5, padding: '10px 20px', cursor: 'pointer'}}>Salir de modo invitado</button>
        </>
      ) : (
        <p>Has iniciado sesión correctamente.</p>
      )}
    </div>
  );
}
