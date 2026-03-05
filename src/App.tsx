// Punto de entrada de la app
// Envuelve todo en el AuthProvider



import './App.css'
import { AuthProvider } from './context/AuthContext'
import AppRoutes from './router/AppRouter'

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
