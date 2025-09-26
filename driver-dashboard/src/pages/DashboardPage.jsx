import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'

const DashboardPage = () => {
  const { user, logout } = useAuthStore()
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [alertLevel, setAlertLevel] = useState('safe') // safe, monitoring, alert
  const [sensorData, setSensorData] = useState({
    speed: 0,
    acceleration: 1.0,
    location: 'Getting location...'
  })

  // Simulate sensor data
  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        setSensorData({
          speed: Math.random() * 60 + 20, // 20-80 km/h
          acceleration: Math.random() * 2 + 0.5, // 0.5-2.5g
          location: 'Main Street, City Center'
        })
        
        // Randomly change alert level for demo
        const random = Math.random()
        if (random > 0.95) {
          setAlertLevel('alert')
        } else if (random > 0.8) {
          setAlertLevel('monitoring')
        } else {
          setAlertLevel('safe')
        }
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [isMonitoring])

  const handleEmergencyAlert = () => {
    if (window.confirm('Are you sure you want to send an emergency alert?')) {
      alert('🚨 Emergency alert sent to nearby hospitals and emergency services!')
      setAlertLevel('alert')
    }
  }

  const getStatusInfo = () => {
    switch (alertLevel) {
      case 'alert':
        return {
          text: 'HIGH RISK DETECTED',
          color: '#ef4444',
          bgColor: '#fee2e2'
        }
      case 'monitoring':
        return {
          text: 'MONITORING ACTIVE',
          color: '#f59e0b',
          bgColor: '#fef3c7'
        }
      default:
        return {
          text: 'SAFE DRIVING',
          color: '#10b981',
          bgColor: '#dcfce7'
        }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div className="container">
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
              Hello, {user?.firstName}! 👋
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
              Stay safe on the road with SafeRide AI
            </p>
          </div>
          <button onClick={logout} className="btn" style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            Logout
          </button>
        </div>

        {/* Status Card */}
        <div className="card">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: statusInfo.color,
                animation: alertLevel === 'alert' ? 'pulse 1s infinite' : 'none'
              }} />
              <span style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: statusInfo.color
              }}>
                {statusInfo.text}
              </span>
            </div>
            
            <div style={{
              padding: '8px 16px',
              background: statusInfo.bgColor,
              color: statusInfo.color,
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {isMonitoring ? 'Live Monitoring' : 'Monitoring Disabled'}
            </div>
          </div>

          {/* Sensor Data */}
          {isMonitoring && (
            <div className="sensor-grid">
              <div className="sensor-card">
                <div className="sensor-label">Current Speed</div>
                <div className="sensor-value">{sensorData.speed.toFixed(1)} km/h</div>
              </div>
              <div className="sensor-card">
                <div className="sensor-label">G-Force</div>
                <div className="sensor-value">{sensorData.acceleration.toFixed(2)}g</div>
              </div>
              <div className="sensor-card">
                <div className="sensor-label">Location</div>
                <div style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
                  {sensorData.location}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Emergency Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          margin: '40px 0'
        }}>
          <button
            onClick={handleEmergencyAlert}
            className={`emergency-button ${alertLevel === 'alert' ? 'pulse' : ''}`}
          >
            🚨<br />EMERGENCY
          </button>
        </div>

        {/* Controls */}
        <div className="card">
          <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>
            Monitoring Controls
          </h3>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={`btn ${isMonitoring ? 'btn-danger' : 'btn-success'}`}
            >
              {isMonitoring ? '⏸️ Stop Monitoring' : '▶️ Start Monitoring'}
            </button>
            
            <button className="btn btn-primary">
              📍 Share Location
            </button>
            
            <button className="btn btn-primary">
              👥 Emergency Contacts
            </button>
          </div>
        </div>

        {/* Features Info */}
        <div className="card">
          <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>
            SafeRide AI Features
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🤖</div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>AI Detection</h4>
              <p style={{ fontSize: '14px', color: '#64748b' }}>
                Advanced AI monitors your driving patterns and detects accidents automatically
              </p>
            </div>
            
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📱</div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Instant Alerts</h4>
              <p style={{ fontSize: '14px', color: '#64748b' }}>
                Automatic SMS and notifications to emergency contacts and nearby hospitals
              </p>
            </div>
            
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚑</div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Fast Response</h4>
              <p style={{ fontSize: '14px', color: '#64748b' }}>
                Direct coordination with hospitals and ambulance services for rapid response
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
