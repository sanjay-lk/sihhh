import React, { useState } from 'react'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState('hospital@saferide.ai')
  const [password, setPassword] = useState('password123')

  const handleLogin = (e) => {
    e.preventDefault()
    if (email === 'hospital@saferide.ai' && password === 'password123') {
      setIsLoggedIn(true)
    } else {
      alert('Invalid credentials')
    }
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
            <p style={{ color: '#6b7280', fontSize: '16px' }}>Hospital Dashboard</p>
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
              Sign In
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
            🚨 SafeRide AI - Hospital Dashboard
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

      {/* Main Content */}
      <div style={{ padding: '24px' }}>
        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '2px solid #ef4444'
          }}>
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
                Active Accidents
              </h3>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444', marginBottom: '8px' }}>
              3
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              2 Critical, 1 Moderate
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
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

          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
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

          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
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
            {[
              { id: 'ACC-001', severity: 'CRITICAL', location: 'Times Square, NYC', time: '2 min ago', status: 'Ambulance Dispatched' },
              { id: 'ACC-002', severity: 'SEVERE', location: 'Brooklyn Bridge, NYC', time: '5 min ago', status: 'Confirmed' },
              { id: 'ACC-003', severity: 'MODERATE', location: 'Central Park, NYC', time: '8 min ago', status: 'Responded' }
            ].map((accident, index) => (
              <div key={accident.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                marginBottom: '12px',
                background: accident.severity === 'CRITICAL' ? '#fee2e2' : '#f9fafb',
                borderRadius: '8px',
                border: accident.severity === 'CRITICAL' ? '1px solid #fecaca' : '1px solid #e5e7eb'
              }}>
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
          <button style={{
            padding: '16px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            🚨 Emergency Broadcast
          </button>
          <button style={{
            padding: '16px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            🚑 Dispatch Ambulance
          </button>
          <button style={{
            padding: '16px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            📊 View Analytics
          </button>
          <button style={{
            padding: '16px',
            background: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
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
