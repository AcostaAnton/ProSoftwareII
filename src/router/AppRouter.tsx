// Todas la rutas de la app
// Cada pantalla es un archivo distinto; cada quien puede trabajar en la suya sin tocar el Login.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute.tsx'
import { useAuth } from '../context/AuthContext'

// - Pages (cada compañero agrega el import de su página aquí)
import LoginPage from '../pages/auth/Login'
import MainLayout from '../components/layout/MainLayout'
import DashboardPage from '../pages/dashboard/Dashboard'
import NewVisit from '../pages/visits/NewVisit'
import VisitList from '../pages/visits/VisitList'
// import RegisterPage from '../pages/auth/Register'

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

                {/* Rutas protegidas: layout con Sidebar + contenido */}
                <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="visits/new" element={<NewVisit />} />
                    <Route path="visits/list" element={<VisitList />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}