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
    if (window.confirm('🚨 EMERGENCY ALERT\n\nAre you sure you want to send an emergency alert to all nearby hospitals and emergency services?')) {
      // Simulate sending alert to hospital dashboard
      fetch('http://localhost:3001/api/emergency-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: user?.id,
          location: sensorData.location,
          severity: 'CRITICAL',
          timestamp: new Date().toISOString()
        })
      }).catch(() => {}) // Ignore errors for demo
      
      alert('🚨 EMERGENCY ALERT SENT!\n\n✅ Nearby hospitals notified\n✅ Ambulance dispatched\n✅ Emergency contacts alerted\n\nHelp is on the way!')
      setAlertLevel('alert')
      
      // Show emergency mode
      setTimeout(() => {
        alert('🚑 Ambulance ETA: 4 minutes\n📞 Emergency services contacted\n📍 Location shared with responders')
      }, 2000)
    }
  }

  const handleShareLocation = () => {
    const confirmed = window.confirm('📍 SHARE LOCATION\n\nThis will share your current location with:\n• Emergency services\n• Nearby hospitals\n• Emergency contacts\n• SafeRide AI monitoring center\n\nShare your location?')
    
    if (confirmed) {
      alert('📍 LOCATION SHARED SUCCESSFULLY!\n\n✅ Emergency services notified\n✅ Nearby hospitals alerted\n✅ Emergency contacts updated\n✅ SafeRide AI monitoring active\n\n📱 Location: Main Street, City Center\n🔄 Real-time tracking enabled\n⏱️ Last updated: Just now')
      
      // Update location in sensor data
      setSensorData(prev => ({
        ...prev,
        location: 'Main Street, City Center (SHARED)'
      }))
      
      setTimeout(() => {
        alert('📡 LOCATION UPDATE:\n\n🚑 3 ambulances within 5km radius\n🏥 2 hospitals notified of your location\n👥 Emergency contacts received SMS\n📍 GPS tracking: Active\n\n✅ You are now being monitored for safety')
      }, 2000)
    }
  }

  const handleEmergencyContacts = () => {
    const action = window.confirm('👥 EMERGENCY CONTACTS\n\nManage your emergency contacts:\n\n📞 Current Contacts:\n• John Doe (Father) - +1234567890\n• Jane Smith (Wife) - +1234567891\n• Dr. Wilson (Doctor) - +1234567892\n• City Emergency - 911\n\nWould you like to:\nOK = View Details\nCancel = Add New Contact')
    
    if (action) {
      // View details
      alert('👥 EMERGENCY CONTACTS DETAILS\n\n📞 PRIMARY CONTACTS:\n\n👨 John Doe (Father)\n📱 +1234567890\n✅ SMS alerts: Enabled\n✅ Call alerts: Enabled\n\n👩 Jane Smith (Wife)\n📱 +1234567891\n✅ SMS alerts: Enabled\n✅ Call alerts: Enabled\n\n👨‍⚕️ Dr. Wilson (Doctor)\n📱 +1234567892\n✅ Medical alerts: Enabled\n\n🚨 Emergency Services\n📱 911\n✅ Auto-dial: Enabled\n\n📊 All contacts verified and active')
    } else {
      // Add new contact
      const newContact = window.prompt('👥 ADD NEW EMERGENCY CONTACT\n\nEnter contact details:\nFormat: Name, Phone, Relationship\n\nExample: Mike Johnson, +1234567893, Brother')
      
      if (newContact) {
        alert(`✅ CONTACT ADDED SUCCESSFULLY!\n\n👤 New Contact: ${newContact}\n📱 Verification SMS sent\n🔔 Alert preferences: Default\n📋 Added to emergency list\n\n✅ Total emergency contacts: 5\n📞 All contacts will be notified in emergencies`)
      }
    }
  }

  const handleSpeedClick = () => {
    alert(`🚗 SPEED MONITORING\n\n📊 Current Speed: ${sensorData.speed.toFixed(1)} km/h\n\n📈 Speed Analytics:\n• Average today: 45.2 km/h\n• Maximum today: 78.5 km/h\n• Speed limit compliance: 94%\n• Harsh acceleration events: 2\n• Harsh braking events: 1\n\n⚠️ Safety Recommendations:\n• Maintain steady speed\n• Avoid sudden acceleration\n• Follow speed limits\n\n✅ Overall driving score: 8.5/10`)
  }

  const handleGForceClick = () => {
    alert(`⚡ G-FORCE MONITORING\n\n📊 Current G-Force: ${sensorData.acceleration.toFixed(2)}g\n\n📈 G-Force Analytics:\n• Normal range: 0.8g - 1.2g\n• Current status: ${sensorData.acceleration > 1.5 ? 'HIGH' : 'NORMAL'}\n• Peak today: 2.1g\n• Average today: 1.1g\n\n🚨 Alert Thresholds:\n• Warning: >2.0g\n• Critical: >3.0g\n• Emergency: >4.0g\n\n${sensorData.acceleration > 2.0 ? '⚠️ HIGH G-FORCE DETECTED!' : '✅ G-Force levels normal'}`)
  }

  const handleLocationClick = () => {
    alert(`📍 LOCATION SERVICES\n\n🗺️ Current Location: ${sensorData.location}\n\n📊 Location Details:\n• Coordinates: 40.7128°N, 74.0060°W\n• Accuracy: ±3 meters\n• Last updated: Just now\n• Speed: ${sensorData.speed.toFixed(1)} km/h\n\n🛰️ GPS Status:\n• Satellites: 12 connected\n• Signal strength: Excellent\n• Location sharing: ${sensorData.location.includes('SHARED') ? 'Active' : 'Disabled'}\n\n🚑 Emergency Services:\n• Nearest hospital: 2.3 km\n• Nearest ambulance: 1.8 km\n• Response time: ~4 minutes`)
  }

  const handleAIDetectionClick = () => {
    alert('🤖 AI ACCIDENT DETECTION\n\n🧠 AI System Status: ACTIVE\n\n📊 Detection Capabilities:\n• Real-time sensor analysis\n• Pattern recognition\n• Predictive modeling\n• Behavioral analysis\n\n📈 Performance Metrics:\n• Accuracy: 98.3%\n• Response time: <2 seconds\n• False positives: <2%\n• Lives saved: 1,247\n\n🔍 Current Monitoring:\n• Speed patterns ✅\n• G-force analysis ✅\n• Location tracking ✅\n• Driver behavior ✅\n\n✅ AI protection: ACTIVE')
  }

  const handleInstantAlertsClick = () => {
    alert('📱 INSTANT ALERT SYSTEM\n\n🚨 Alert Capabilities:\n• SMS notifications\n• Voice calls\n• Push notifications\n• Emergency broadcasts\n\n📞 Alert Recipients:\n• Emergency contacts: 4\n• Hospitals: 12 nearby\n• Ambulance services: 8 units\n• Police departments: 3\n\n⚡ Response Times:\n• SMS alerts: <5 seconds\n• Voice calls: <10 seconds\n• Emergency services: <30 seconds\n• Hospital notifications: <15 seconds\n\n✅ All systems operational')
  }

  const handleFastResponseClick = () => {
    alert('🚑 FAST RESPONSE COORDINATION\n\n⏱️ Response Network:\n• 12 hospitals connected\n• 25 ambulances available\n• 8 emergency units ready\n• 3 trauma centers active\n\n📊 Performance Stats:\n• Average response: 4.2 minutes\n• Fastest response: 2.1 minutes\n• Success rate: 97.8%\n• Lives saved: 1,247\n\n🗺️ Coverage Area:\n• Radius: 50km\n• Population: 2.3M\n• Response zones: 15\n• Backup units: 12\n\n✅ Full coverage active')
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
              <div 
                className="sensor-card"
                onClick={handleSpeedClick}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0px)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                <div className="sensor-label">Current Speed</div>
                <div className="sensor-value">{sensorData.speed.toFixed(1)} km/h</div>
              </div>
              <div 
                className="sensor-card"
                onClick={handleGForceClick}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0px)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                <div className="sensor-label">G-Force</div>
                <div className="sensor-value">{sensorData.acceleration.toFixed(2)}g</div>
              </div>
              <div 
                className="sensor-card"
                onClick={handleLocationClick}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0px)'
                  e.target.style.boxShadow = 'none'
                }}
              >
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
            
            <button 
              onClick={handleShareLocation}
              className="btn btn-primary"
            >
              📍 Share Location
            </button>
            
            <button 
              onClick={handleEmergencyContacts}
              className="btn btn-primary"
            >
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
            <div 
              onClick={handleAIDetectionClick}
              style={{ 
                padding: '16px', 
                background: '#f8fafc', 
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
                e.currentTarget.style.background = '#e2e8f0'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.background = '#f8fafc'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🤖</div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>AI Detection</h4>
              <p style={{ fontSize: '14px', color: '#64748b' }}>
                Advanced AI monitors your driving patterns and detects accidents automatically
              </p>
            </div>
            
            <div 
              onClick={handleInstantAlertsClick}
              style={{ 
                padding: '16px', 
                background: '#f8fafc', 
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
                e.currentTarget.style.background = '#e2e8f0'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.background = '#f8fafc'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📱</div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Instant Alerts</h4>
              <p style={{ fontSize: '14px', color: '#64748b' }}>
                Automatic SMS and notifications to emergency contacts and nearby hospitals
              </p>
            </div>
            
            <div 
              onClick={handleFastResponseClick}
              style={{ 
                padding: '16px', 
                background: '#f8fafc', 
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
                e.currentTarget.style.background = '#e2e8f0'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.background = '#f8fafc'
              }}
            >
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
