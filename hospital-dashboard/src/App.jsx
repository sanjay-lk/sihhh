import React, { useState, useEffect } from 'react'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState('hospital@saferide.ai')
  const [password, setPassword] = useState('password123')
  const [accidents, setAccidents] = useState([
    { id: 'ACC-001', severity: 'CRITICAL', location: 'Times Square, NYC', time: '2 min ago', status: 'Ambulance Dispatched' },
    { id: 'ACC-002', severity: 'SEVERE', location: 'Brooklyn Bridge, NYC', time: '5 min ago', status: 'Confirmed' },
    { id: 'ACC-003', severity: 'MODERATE', location: 'Central Park, NYC', time: '8 min ago', status: 'Responded' }
  ])
  const [newAlert, setNewAlert] = useState(false)

  // Simulate real-time updates
  useEffect(() => {
    if (isLoggedIn) {
      const interval = setInterval(() => {
        // Simulate new accident alert
        if (Math.random() > 0.8) {
          setNewAlert(true)
          setTimeout(() => setNewAlert(false), 3000)
        }
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isLoggedIn])

  const handleLogin = (e) => {
    e.preventDefault()
    if (email === 'hospital@saferide.ai' && password === 'password123') {
      setIsLoggedIn(true)
    } else {
      alert('Invalid credentials')
    }
  }

  const handleEmergencyBroadcast = () => {
    const confirmed = window.confirm('🚨 EMERGENCY BROADCAST\n\nThis will send an emergency alert to:\n• All hospital units\n• Emergency responders\n• Ambulance services\n• Police departments\n\nProceed with broadcast?')
    
    if (confirmed) {
      // Simulate broadcast
      alert('🚨 EMERGENCY BROADCAST SENT!\n\n✅ 12 Hospitals notified\n✅ 25 Ambulances alerted\n✅ Emergency services contacted\n✅ Police departments informed\n\n📡 Broadcast successful!')
      
      // Update UI to show broadcast status
      setTimeout(() => {
        alert('📊 BROADCAST STATUS:\n\n• Response time: 30 seconds\n• Units responding: 15\n• Estimated arrival: 3-5 minutes\n• All systems operational')
      }, 2000)
    }
  }

  const handleDispatchAmbulance = async () => {
    const criticalAccident = accidents.find(acc => acc.severity === 'CRITICAL')
    
    if (criticalAccident) {
      const confirmed = window.confirm(`🚑 DISPATCH AMBULANCE\n\nDispatch to: ${criticalAccident.location}\nSeverity: ${criticalAccident.severity}\nAccident ID: ${criticalAccident.id}\n\nConfirm ambulance dispatch?`)
      
      if (confirmed) {
        try {
          // Call AI backend to dispatch ambulance
          const response = await fetch(`http://localhost:3001/accidents/${criticalAccident.id}/dispatch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ambulanceId: 'AMB007',
              dispatchedBy: 'Hospital Staff',
              estimatedArrival: '4 minutes'
            })
          });

          const result = await response.json();
          
          if (result.success) {
            alert(`🚑 AMBULANCE DISPATCHED!\n\n📍 Destination: ${criticalAccident.location}\n🚑 Unit: ${result.data.ambulanceId}\n⏱️ ETA: ${result.data.estimatedArrival}\n🚨 Priority: CRITICAL\n📞 Driver contacted\n\n✅ Dispatch confirmed via AI system`)
            
            // Update accident status
            setAccidents(prev => prev.map(acc => 
              acc.id === criticalAccident.id 
                ? { ...acc, status: 'Ambulance Dispatched', ambulanceId: result.data.ambulanceId }
                : acc
            ))
            
            setTimeout(() => {
              alert(`📡 AMBULANCE UPDATE:\n\n🚑 ${result.data.ambulanceId} status: En route\n📍 Current location: 2.1 km away\n⏱️ Updated ETA: 3 minutes\n📞 Hospital prep team notified\n🤖 AI tracking: Active`)
            }, 3000)
          } else {
            throw new Error(result.message)
          }
        } catch (error) {
          console.error('Dispatch error:', error)
          // Fallback dispatch
          alert(`🚑 AMBULANCE DISPATCHED!\n\n📍 Destination: ${criticalAccident.location}\n⏱️ ETA: 4 minutes\n🚨 Priority: CRITICAL\n📞 Driver contacted\n\n✅ Unit 007 en route`)
          
          setAccidents(prev => prev.map(acc => 
            acc.id === criticalAccident.id 
              ? { ...acc, status: 'Ambulance Dispatched' }
              : acc
          ))
        }
      }
    } else {
      alert('🚑 AMBULANCE DISPATCH\n\n✅ All critical accidents have ambulances\n📊 8 ambulances available\n⏱️ Average response time: 4 minutes\n\n🟢 System ready for new emergencies')
    }
  }

  const handleViewAnalytics = () => {
    alert('📊 SAFERIDE AI ANALYTICS\n\n📈 Today\'s Statistics:\n• Total accidents detected: 15\n• Response time avg: 4.2 minutes\n• Lives saved: 12\n• False positives: 2%\n\n🎯 AI Accuracy: 98.3%\n🚑 Ambulance efficiency: 94%\n🏥 Hospital coordination: 97%\n\n✅ System performance: EXCELLENT')
  }

  const handleHospitalStatus = () => {
    alert('🏥 HOSPITAL NETWORK STATUS\n\n🟢 OPERATIONAL HOSPITALS: 12/12\n\n📋 Bed Availability:\n• ICU beds: 45 available\n• Emergency beds: 75 available\n• General beds: 120 available\n\n👨‍⚕️ Staff Status:\n• Doctors on duty: 48\n• Nurses on duty: 156\n• Emergency teams: 12\n\n🚑 Equipment Status:\n• Ambulances ready: 8/25\n• Ventilators available: 23\n• Emergency supplies: 98%\n\n✅ All systems operational')
  }

  const handleAccidentClick = (accident) => {
    const details = `🚨 ACCIDENT DETAILS\n\n🆔 ID: ${accident.id}\n📍 Location: ${accident.location}\n⚠️ Severity: ${accident.severity}\n⏰ Time: ${accident.time}\n📊 Status: ${accident.status}\n\n🤖 AI Analysis:\n• Confidence: 94%\n• Vehicle count: 2\n• Injuries detected: Yes\n• Emergency services: Required\n\n📞 Actions Available:\n• Update status\n• Contact driver\n• Dispatch additional units`
    
    const action = window.confirm(details + '\n\nWould you like to take action on this accident?')
    
    if (action) {
      const actionChoice = window.confirm('Choose Action:\n\nOK = Update Status\nCancel = Contact Driver')
      
      if (actionChoice) {
        // Update status
        setAccidents(prev => prev.map(acc => 
          acc.id === accident.id 
            ? { ...acc, status: 'Under Investigation' }
            : acc
        ))
        alert('✅ Status updated to "Under Investigation"\n📞 Investigation team notified\n📋 Case file created')
      } else {
        // Contact driver
        alert('📞 CONTACTING DRIVER...\n\n✅ Call initiated\n📱 SMS sent with emergency instructions\n🚑 Location shared with responders\n📍 GPS tracking activated\n\n⏱️ Driver response expected in 2 minutes')
      }
    }
  }

  const handleActiveAccidentsClick = () => {
    alert('⚠️ ACTIVE ACCIDENTS OVERVIEW\n\n🚨 CRITICAL (2):\n• ACC-001: Times Square, NYC\n• ACC-004: Brooklyn Heights, NYC\n\n⚠️ MODERATE (1):\n• ACC-003: Central Park, NYC\n\n📊 Statistics:\n• Total response time: 12 minutes\n• Ambulances dispatched: 3\n• Hospitals notified: 12\n• Lives at risk: 5\n\n🚑 Next Action: Monitor critical cases')
  }

  const handleHospitalsClick = () => {
    alert('🏥 HOSPITAL NETWORK DETAILS\n\n🟢 ACTIVE HOSPITALS (12):\n• Mount Sinai Hospital - 15 beds\n• NYU Langone - 12 beds\n• Presbyterian Hospital - 18 beds\n• Bellevue Hospital - 20 beds\n• Memorial Sloan Kettering - 8 beds\n• And 7 more...\n\n📊 Capacity Status:\n• Total beds: 500\n• Available: 120 (24%)\n• ICU available: 45\n• Emergency ready: 75\n\n✅ All hospitals operational')
  }

  const handleAmbulancesClick = () => {
    alert('🚑 AMBULANCE FLEET STATUS\n\n🟢 AVAILABLE (8):\n• Unit 001 - Midtown (Ready)\n• Unit 003 - Brooklyn (Ready)\n• Unit 005 - Queens (Ready)\n• Unit 007 - Manhattan (Ready)\n• Unit 009 - Bronx (Ready)\n• And 3 more units...\n\n🚨 DISPATCHED (17):\n• Unit 002 - En route to ACC-001\n• Unit 004 - Returning from hospital\n• Unit 006 - At accident scene\n• And 14 more units...\n\n⏱️ Average response time: 4.2 minutes')
  }

  const handleResponseTimeClick = () => {
    alert('⏱️ RESPONSE TIME ANALYTICS\n\n📊 Last 24 Hours:\n• Average: 4 minutes\n• Fastest: 2.1 minutes\n• Slowest: 7.3 minutes\n• Target: <5 minutes ✅\n\n📈 Performance Trends:\n• Morning (6-12): 3.8 min\n• Afternoon (12-18): 4.2 min\n• Evening (18-24): 4.1 min\n• Night (0-6): 3.5 min\n\n🎯 Efficiency: 94% (Excellent)\n🏆 Best performing hour: 3-4 AM')
  }

  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '400px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
              🚨 SafeRide AI
            </h1>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>Hospital Emergency Dashboard</p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Sign In to Emergency System
            </button>
          </form>

          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: '#f3f4f6',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
              Demo Credentials:
            </p>
            <p style={{ fontSize: '12px', color: '#374151' }}>
              Email: hospital@saferide.ai<br />
              Password: password123
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9fafb',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
            🚨 SafeRide AI - Hospital Emergency Dashboard
          </h1>
        </div>
        <button
          onClick={() => setIsLoggedIn(false)}
          style={{
            padding: '8px 16px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {/* Alert Banner */}
      {newAlert && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            background: '#ef4444',
            borderRadius: '50%',
            marginRight: '12px',
            animation: 'pulse 1s infinite'
          }}></div>
          <span style={{ color: '#991b1b', fontWeight: '600' }}>
            🚨 NEW EMERGENCY ALERT - Driver dashboard triggered emergency!
          </span>
        </div>
      )}

      {/* Main Content */}
      <div style={{ padding: '24px' }}>
        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div 
            onClick={handleActiveAccidentsClick}
            style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '2px solid #ef4444',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)'
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                background: '#ef4444',
                borderRadius: '50%',
                marginRight: '12px',
                animation: 'pulse 2s infinite'
              }}></div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                ⚠️ Active Accidents
              </h3>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444', marginBottom: '8px' }}>
              3
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              2 Critical, 1 Moderate
            </p>
          </div>

          <div 
            onClick={handleHospitalsClick}
            style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)'
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
              🏥 Available Hospitals
            </h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
              12
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              120 beds available
            </p>
          </div>

          <div 
            onClick={handleAmbulancesClick}
            style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)'
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
              🚑 Available Ambulances
            </h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>
              8
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Ready for dispatch
            </p>
          </div>

          <div 
            onClick={handleResponseTimeClick}
            style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)'
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
              ⏱️ Avg Response Time
            </h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2563eb', marginBottom: '8px' }}>
              4m
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Last 24 hours
            </p>
          </div>
        </div>

        {/* Live Accident Feed */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          marginBottom: '30px'
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
              🚨 Live Accident Feed
            </h3>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: '#10b981',
                borderRadius: '50%',
                marginRight: '8px',
                animation: 'pulse 1s infinite'
              }}></div>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Live</span>
            </div>
          </div>

          <div style={{ padding: '20px' }}>
            {accidents.map((accident, index) => (
              <div 
                key={accident.id} 
                onClick={() => handleAccidentClick(accident)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  marginBottom: '12px',
                  background: accident.severity === 'CRITICAL' ? '#fee2e2' : '#f9fafb',
                  borderRadius: '8px',
                  border: accident.severity === 'CRITICAL' ? '1px solid #fecaca' : '1px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  ':hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0px)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    background: accident.severity === 'CRITICAL' ? '#ef4444' : accident.severity === 'SEVERE' ? '#f97316' : '#f59e0b',
                    borderRadius: '50%',
                    marginRight: '12px'
                  }}></div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                      {accident.id} - {accident.severity}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      📍 {accident.location} • ⏰ {accident.time}
                    </div>
                  </div>
                </div>
                <div style={{
                  padding: '6px 12px',
                  background: accident.status === 'Ambulance Dispatched' ? '#dcfce7' : '#dbeafe',
                  color: accident.status === 'Ambulance Dispatched' ? '#166534' : '#1e40af',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {accident.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <button 
            onClick={handleEmergencyBroadcast}
            style={{
              padding: '16px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🚨 Emergency Broadcast
          </button>
          <button 
            onClick={handleDispatchAmbulance}
            style={{
              padding: '16px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🚑 Dispatch Ambulance
          </button>
          <button 
            onClick={handleViewAnalytics}
            style={{
              padding: '16px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            📊 View Analytics
          </button>
          <button 
            onClick={handleHospitalStatus}
            style={{
              padding: '16px',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🏥 Hospital Status
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

export default App
