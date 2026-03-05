// Todas la rutas de la app
// Cada pantalla es un archivo distinto; cada quien puede trabajar en la suya sin tocar el Login.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute.tsx'
import { useAuth } from '../context/AuthContext'

// - Pages (cada compañero agrega el import de su página aquí)
import LoginPage from '../pages/auth/Login'
// import RegisterPage from '../pages/auth/Register'
// import DashboardPage from '../pages/dashboard/Dashboard'

export default function AppRoutes() {
    const { user } = useAuth()
    return (
        <BrowserRouter>
            <Routes>
                {/* Raíz: redirigir a login o dashboard según sesión */}
                <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />

                {/* Rutas públicas */}
                <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
                {/* <Route path="/register" element={<RegisterPage />} /> */}

                {/* Rutas protegidas: solo con sesión. En desarrollo usar ?skipAuth=1 para ver sin login */}
                {/* <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} /> */}
            </Routes>
        </BrowserRouter>
    )
}