import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useSelector } from 'react-redux'

// Components
import Navbar from './components/Layout/Navbar'
import Footer from './components/Layout/Footer'
// --- 1. REMOVE the old LandPage import ---
// import LandPage from './pages/Services/LandPage' 
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import LoadingSpinner from './components/UI/LoadingSpinner'
import LandingPage from './pages/LandingPage';
import LandProcessesPage from './pages/Services/LandProcessesPage';

// --- 2. ADD the new LandServices import ---
import LandServices from './pages/LandServices';


function App() {
  const { loading } = useSelector((state) => state.auth)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* LandingPage is now the main entry point */}
          <Route path="/" element={<LandingPage />} />
          
          {/* --- 3. UPDATE the route to use the new page and remove protection for testing --- */}
          <Route path="/services/land" element={<LandServices />} />

          <Route path="/services/land/processes" element={<LandProcessesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* 404 Page */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-8">Page not found</p>
                <a 
                  href="/" 
                  className="btn btn-primary"
                >
                  Return Home
                </a>
              </div>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App