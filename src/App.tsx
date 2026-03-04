import './App.css'

function App() {
  return (
    <div className="construction-wrapper">
      <div className="construction-card">
        <div className="construction-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="construction-title">PasaYa</h1>
        <p className="construction-subtitle">Estamos construyendo algo increíble</p>
        <div className="construction-divider" />
        <p className="construction-message">
          Nuestra aplicación está en desarrollo. Volveremos muy pronto con novedades.
        </p>
        <div className="construction-progress">
          <div className="construction-progress-bar" />
        </div>
        <p className="construction-footer">Gracias por tu paciencia</p>
      </div>
    </div>
  )
}

export default App
