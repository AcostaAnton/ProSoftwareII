// Todas la rutas de la app
// Cada pantalla es un archivo distinto; cada quien puede trabajar en la suya sin tocar el Login.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute.tsx'
import AuthGuard, { FORCE_CHANGE_PASSWORD_PATH } from './AuthGuard.tsx'
import { useAuth } from '../context/AuthContext'
import MainLayout from '../components/layout/MainLayout'
import DashboardPage from '../pages/dashboard/Dashboard'

// - Pages (cada compañero agrega el import de su página aquí)
import LoginPage from '../pages/auth/Login'
import ForceChangePasswordPage from '../pages/auth/ForceChangePassword'
import NewVisit from '../pages/visits/NewVisit'
import VisitList from '../pages/visits/VisitList'
import VisitDetail from '../pages/visits/VisitDetail'
import ScanPage from '../pages/scan/ScanPage'
import AdminUsers from '../pages/admin/AdminUsers'
import AdminGuards from '../pages/admin/AdminGuards'
import AdminStats from '../pages/admin/AdminStats'
import VisitorAccessPage from '../pages/visits/VisitorAccessPage'
import ResidentVisitList from '../pages/visits/ResidentVisitList'
// import RegisterPage from '../pages/auth/Register'

export default function AppRoutes() {
    const { user } = useAuth()
    const homeWhenLoggedIn =
        user?.mustChangePassword === true ? FORCE_CHANGE_PASSWORD_PATH : '/dashboard'
    return (
        <BrowserRouter>
            <Routes>
                {/* Raíz: redirigir a login o dashboard según sesión */}
                <Route path="/" element={<Navigate to={user ? homeWhenLoggedIn : '/login'} replace />} />

                {/* Rutas públicas */}
                <Route path="/acceso/:token" element={<VisitorAccessPage />} />
                <Route
                    path="/login"
                    element={user ? <Navigate to={homeWhenLoggedIn} replace /> : <LoginPage />}
                />
                {/* <Route path="/register" element={<RegisterPage />} /> */}

                {/* Autenticado: cambio de contraseña obligatorio o layout principal */}
                <Route path="/" element={<AuthGuard />}>
                    <Route path="account/cambiar-contrasena" element={<ForceChangePasswordPage />} />
                    <Route element={<MainLayout />}>
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="visits/new" element={<NewVisit />} />
                        <Route path="visits/list" element={<VisitList />} />
                        <Route
                            path="visits/my-visits"
                            element={
                                <ProtectedRoute allowedRoles={['resident']}>
                                    <ResidentVisitList />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="visits/:id" element={<VisitDetail />} />
                        <Route
                            path="scan"
                            element={
                                <ProtectedRoute allowedRoles={['admin', 'security']}>
                                    <ScanPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="admin/users"
                            element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <AdminUsers />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="admin/guards" element={<AdminGuards />} />
                        <Route
                            path="admin/stats"
                            element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <AdminStats />
                                </ProtectedRoute>
                            }
                        />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}