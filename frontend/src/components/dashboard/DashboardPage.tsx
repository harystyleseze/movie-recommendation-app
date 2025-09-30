import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface User {
  id: string
  name: string
  email: string
}

export function DashboardPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [welcomeMessage, setWelcomeMessage] = useState('')

  useEffect(() => {
    // Check for welcome message from login
    if (location.state?.message) {
      setWelcomeMessage(location.state.message)
      // Clear the message from location state
      window.history.replaceState({}, '')
    }

    // Check if user is logged in
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      // Redirect to login if not authenticated
      navigate('/login', {
        state: {
          message: 'Please log in to access your dashboard.'
        }
      })
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    } catch (error) {
      console.error('Error parsing user data:', error)
      navigate('/login')
    }
  }, [location.state, navigate])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    navigate('/', {
      state: {
        message: 'You have been logged out successfully.'
      }
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-border">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-primary-foreground font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold text-foreground">Moveere</span>
            </Link>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                Sign Out
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        {welcomeMessage && (
          <div className="mb-6 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-green-600 dark:text-green-400">{welcomeMessage}</p>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Movie Dashboard</h1>
          <p className="text-muted-foreground">
            Discover personalized movie recommendations just for you.
          </p>
        </div>

        {/* User Info Card */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">Account Info</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Name:</span> {user.name}</p>
              <p><span className="text-muted-foreground">Email:</span> {user.email}</p>
              <p><span className="text-muted-foreground">Member since:</span> Today</p>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Movies Rated:</span> 0</p>
              <p><span className="text-muted-foreground">Watchlist:</span> 0</p>
              <p><span className="text-muted-foreground">Recommendations:</span> Ready</p>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">Next Steps</h3>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">1. Rate some movies</p>
              <p className="text-muted-foreground">2. Get recommendations</p>
              <p className="text-muted-foreground">3. Build your watchlist</p>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-lg border border-border p-8 text-center">
            <div className="text-4xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Get Recommendations</h3>
            <p className="text-muted-foreground mb-4">
              Discover your next favorite movie with our AI-powered recommendations.
            </p>
            <Button className="w-full">Start Discovering</Button>
          </div>

          <div className="bg-gradient-to-br from-blue-600/10 to-cyan-600/10 rounded-lg border border-border p-8 text-center">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Rate Movies</h3>
            <p className="text-muted-foreground mb-4">
              Rate movies you've seen to improve your personalized recommendations.
            </p>
            <Button variant="outline" className="w-full">Rate Movies</Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4 opacity-30">📽️</div>
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No activity yet</h3>
              <p className="text-sm text-muted-foreground">
                Start rating movies and getting recommendations to see your activity here.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}