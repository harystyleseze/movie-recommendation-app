import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { Navigation } from '@/components/common/Navigation'
import { LandingPage } from '@/components/landing/LandingPage'
import { RegisterPage } from '@/components/auth/RegisterPage'
import { LoginPage } from '@/components/auth/LoginPage'
import { DashboardPage } from '@/components/dashboard/DashboardPage'
import { MovieDiscovery } from '@/components/movies/MovieDiscovery'
import { MovieDetails } from '@/components/movies/MovieDetails'
import { FavoritesPage } from '@/components/favorites/FavoritesPage'
import { WatchlistsPage } from '@/components/watchlists/WatchlistsPage'
import { RatingsPage } from '@/components/ratings/RatingsPage'
import { ProfilePage } from '@/components/profile/ProfilePage'

function AppContent() {
  const location = useLocation()
  const isAuthPage = ['/login', '/register'].includes(location.pathname)

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAuthPage && <Navigation />}
      <main className="pt-0">
        <Routes>
          <Route path="/" element={<LandingPage />} />

          {/* Auth routes - redirect if already authenticated */}
          <Route
            path="/register"
            element={
              <ProtectedRoute requireAuth={false}>
                <RegisterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <ProtectedRoute requireAuth={false}>
                <LoginPage />
              </ProtectedRoute>
            }
          />

          {/* Protected routes - require authentication */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watchlists"
            element={
              <ProtectedRoute>
                <WatchlistsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ratings"
            element={
              <ProtectedRoute>
                <RatingsPage />
              </ProtectedRoute>
            }
          />

          {/* Public movie discovery routes */}
          <Route path="/movies" element={<MovieDiscovery />} />
          <Route path="/movies/:movieId" element={<MovieDetails />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
