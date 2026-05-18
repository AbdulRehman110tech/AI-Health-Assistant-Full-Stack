import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth }    from '../context/AuthContext'
import MainLayout     from '../layouts/MainLayout'
import AuthLayout     from '../layouts/AuthLayout'
import Dashboard      from '../pages/Dashboard'
import Predict        from '../pages/Predict'
import History        from '../pages/History'
import Doctors        from '../pages/Doctors'
import Reports        from '../pages/Reports'
import Reminders      from '../pages/Reminders'
import Profile        from '../pages/Profile'          // ← Phase 3G
import Login          from '../pages/Login'
import Register       from '../pages/Register'
import NotFound       from '../pages/NotFound'

function ProtectedRoute({ children }) {
  const { isAuth } = useAuth()
  return isAuth ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { isAuth } = useAuth()
  return !isAuth ? children : <Navigate to="/dashboard" replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      </Route>

      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/"           element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"  element={<Dashboard />} />
        <Route path="/predict"    element={<Predict />} />
        <Route path="/history"    element={<History />} />
        <Route path="/doctors"    element={<Doctors />} />
        <Route path="/reports"    element={<Reports />} />
        <Route path="/reminders"  element={<Reminders />} />
        <Route path="/profile"    element={<Profile />} />   {/* ← Phase 3G */}
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}