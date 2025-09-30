import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LandingPage } from '@/components/landing/LandingPage'
import { RegisterPage } from '@/components/auth/RegisterPage'
import { LoginPage } from '@/components/auth/LoginPage'
import { DashboardPage } from '@/components/dashboard/DashboardPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  )
}

export default App
