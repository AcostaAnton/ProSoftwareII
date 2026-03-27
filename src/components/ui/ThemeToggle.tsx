import { useTheme } from '../../context/ThemeContext'
import './ThemeToggle.css'

function IconMoon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconSun() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div
      className={`theme-toggle ${isDark ? 'theme-toggle--dark' : 'theme-toggle--light'}`}
      role="group"
      aria-label="Tema de la aplicación"
    >
      <span className="theme-toggle__glider" aria-hidden />
      <button
        type="button"
        className="theme-toggle__btn"
        aria-pressed={isDark}
        aria-label="Modo oscuro"
        title="Modo oscuro"
        onClick={() => setTheme('dark')}
      >
        <IconMoon />
      </button>
      <button
        type="button"
        className="theme-toggle__btn"
        aria-pressed={!isDark}
        aria-label="Modo claro"
        title="Modo claro"
        onClick={() => setTheme('light')}
      >
        <IconSun />
      </button>
    </div>
  )
}
