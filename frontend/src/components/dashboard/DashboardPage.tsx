import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Sidebar } from './Sidebar'
import { DashboardStats } from './DashboardStats'
import { RecentActivity } from './RecentActivity'
import { Search, Play } from 'lucide-react'

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
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar user={user} />

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Top Header */}
          <header className="bg-background/80 backdrop-blur-sm border-b border-border lg:pl-6">
            <div className="flex items-center justify-between h-16 px-4 lg:px-6">
              <div className="flex items-center space-x-4 lg:ml-12">
                <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Main Dashboard Content */}
          <main className="p-4 lg:p-6 lg:ml-12">
            {/* Welcome Message */}
            {welcomeMessage && (
              <div className="mb-6 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-green-600 dark:text-green-400">{welcomeMessage}</p>
              </div>
            )}

            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Welcome back, {user.name}! 👋
              </h2>
              <p className="text-muted-foreground">
                Here's what's happening with your movie journey today.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="mb-8">
              <DashboardStats />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Quick Actions */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Button className="h-auto p-4 justify-start">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Search className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">Get Recommendations</div>
                          <div className="text-xs text-muted-foreground">Find your next favorite</div>
                        </div>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 justify-start">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center">
                          <Play className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">Browse Movies</div>
                          <div className="text-xs text-muted-foreground">Explore our catalog</div>
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Simple Chart Placeholder */}
                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Viewing Activity</h3>
                  <div className="h-48 bg-muted/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl mb-2">📊</div>
                      <p className="text-sm text-muted-foreground">Chart coming soon</p>
                      <p className="text-xs text-muted-foreground">Track your viewing patterns</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <RecentActivity />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}