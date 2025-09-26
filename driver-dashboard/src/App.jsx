import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import { useAuthStore } from './stores/authStore'

function App() {
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [])

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>Loading SafeRide AI...</div>
      </div>
    )
  }

  return (
    <Routes>
      {isAuthenticated ? (
        <Route path="/*" element={<DashboardPage />} />
      ) : (
        <Route path="/*" element={<LoginPage />} />
      )}
    </Routes>
  )
}

export default App
