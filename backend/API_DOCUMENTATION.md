# SafeRide AI Backend API Documentation

## 🚨 Integrated Backend Features

### Base URL: `http://localhost:3001`

---

## 🔐 Authentication Endpoints

### POST `/api/auth/login`
**Description:** User authentication for hospital staff, drivers, and admins

**Request Body:**
```json
{
  "email": "hospital@saferide.ai",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "token_1_1234567890",
    "user": {
      "id": 1,
      "firstName": "Hospital",
      "lastName": "Staff",
      "email": "hospital@saferide.ai",
      "userType": "hospital",
      "hospitalId": "HOSP001"
    }
  }
}
```

**Demo Accounts:**
- Hospital: `hospital@saferide.ai` / `password123`
- Driver: `driver@saferide.ai` / `password123`
- Admin: `admin@saferide.ai` / `password123`

### GET `/api/auth/me`
**Description:** Get current user profile
**Headers:** `Authorization: Bearer <token>`

---

## 🚨 Emergency & Accident Endpoints

### POST `/api/emergency-alert`
**Description:** Send emergency alert from driver to hospitals

**Request Body:**
```json
{
  "driverId": "DRV001",
  "location": {
    "coordinates": { "latitude": 40.7128, "longitude": -74.0060 },
    "address": "Times Square, NYC"
  },
  "severity": "CRITICAL",
  "sensorData": {
    "speed": 65.5,
    "acceleration": 3.2,
    "impact": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Emergency alert sent to all hospitals",
  "data": {
    "alertId": "ACC-EMERGENCY-1234567890",
    "hospitalCount": 12,
    "ambulanceDispatched": true,
    "estimatedArrival": "4 minutes"
  }
}
```

### GET `/api/accidents`
**Description:** Get all accidents with pagination and filtering

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `severity` (CRITICAL, SEVERE, MODERATE)
- `status` (Emergency, Confirmed, Responded)

### GET `/api/accidents/:id`
**Description:** Get specific accident details

### PUT `/api/accidents/:id`
**Description:** Update accident status

---

## 🏥 Hospital Endpoints

### GET `/api/hospitals`
**Description:** Get all hospitals in network

**Response:**
```json
{
  "success": true,
  "data": {
    "hospitals": [
      {
        "id": "HOSP001",
        "name": "Mount Sinai Hospital",
        "location": { "latitude": 40.7903, "longitude": -73.9565 },
        "totalBeds": 50,
        "availableBeds": 15,
        "icuBeds": 20,
        "availableIcuBeds": 5,
        "status": "operational"
      }
    ]
  }
}
```

### GET `/api/hospitals/statistics/system`
**Description:** Get hospital network statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "totalHospitals": 12,
      "totalBeds": 500,
      "availableBeds": 120,
      "totalAmbulances": 25,
      "availableAmbulances": 8,
      "avgResponseTime": 300
    }
  }
}
```

---

## 🚑 Ambulance Endpoints

### GET `/api/ambulances`
**Description:** Get all ambulances and their status

### POST `/api/ambulances/dispatch`
**Description:** Dispatch ambulance to accident

**Request Body:**
```json
{
  "accidentId": "ACC-001",
  "ambulanceId": "AMB001"
}
```

---

## 👥 Emergency Contacts Endpoints

### GET `/api/emergency-contacts/:driverId`
**Description:** Get emergency contacts for a driver

### POST `/api/emergency-contacts`
**Description:** Add new emergency contact

**Request Body:**
```json
{
  "driverId": "DRV001",
  "name": "John Doe",
  "relationship": "Father",
  "phone": "+1234567890",
  "email": "john.doe@email.com",
  "smsAlerts": true,
  "callAlerts": true
}
```

---

## 📊 Driver Sensor Endpoints

### POST `/api/driver/sensor-data`
**Description:** Send real-time sensor data from driver app

**Request Body:**
```json
{
  "driverId": "DRV001",
  "sensorData": {
    "speed": 45.5,
    "acceleration": 1.2,
    "location": "Main Street, NYC",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

### POST `/api/driver/share-location`
**Description:** Share driver location with emergency services

**Request Body:**
```json
{
  "driverId": "DRV001",
  "location": {
    "coordinates": { "latitude": 40.7128, "longitude": -74.0060 },
    "address": "Times Square, NYC"
  }
}
```

---

## 📈 Statistics Endpoints

### GET `/api/accidents/statistics/summary`
**Description:** Get accident statistics summary

**Response:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "totalAccidents": 15,
      "criticalAccidents": 3,
      "avgResponseTime": 240
    }
  }
}
```

---

## 🔄 Real-time Socket.IO Events

### Client → Server Events

#### `join_room`
```json
{
  "roomType": "emergency",
  "roomId": "global",
  "userType": "hospital"
}
```

#### `emergency_alert`
```json
{
  "driverId": "DRV001",
  "severity": "CRITICAL",
  "location": { "latitude": 40.7128, "longitude": -74.0060 }
}
```

#### `sensor_update`
```json
{
  "driverId": "DRV001",
  "speed": 45.5,
  "acceleration": 1.2,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Server → Client Events

#### `emergency_alert`
- Broadcasted when new emergency alert is received
- Sent to all hospital dashboards

#### `new_accident`
- Sent when new accident is created
- Updates accident feed in real-time

#### `accident_updated`
- Sent when accident status changes
- Updates UI across all connected clients

#### `ambulance_dispatched`
- Sent when ambulance is dispatched
- Updates ambulance status in real-time

#### `sensor_data_update`
- Real-time sensor data from drivers
- Sent to monitoring systems

#### `location_shared`
- When driver shares location
- Sent to emergency services

#### `auto_emergency_detected`
- AI-detected potential accidents
- Automatic emergency alerts

#### `live_sensor_update`
- Simulated live sensor updates (every 5 seconds)
- For demo purposes

---

## 🛡️ Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔧 Health Check

### GET `/health`
**Description:** Check backend service status

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00Z",
  "message": "SafeRide AI Backend is running",
  "services": {
    "database": "connected",
    "socketio": "active",
    "api": "operational"
  }
}
```

---

## 🚀 Integration Features

### Real-time Communication
- **Socket.IO** for instant updates
- **Emergency alerts** broadcast to all hospitals
- **Live sensor monitoring** from driver apps
- **Ambulance tracking** and dispatch updates

### Data Management
- **In-memory database** for demo (easily replaceable with MongoDB/PostgreSQL)
- **Accident tracking** with AI analysis
- **Hospital network management**
- **Emergency contact management**

### Security Features
- **JWT authentication** (simplified for demo)
- **CORS protection**
- **Input validation**
- **Error handling middleware**

### Scalability Features
- **Modular architecture**
- **RESTful API design**
- **Real-time event system**
- **Pagination support**
- **Filtering and search**

---

## 📱 Frontend Integration

### Hospital Dashboard Integration
- Real-time accident feed updates
- Emergency alert notifications
- Ambulance dispatch functionality
- Hospital statistics display

### Driver Dashboard Integration
- Emergency button functionality
- Sensor data transmission
- Location sharing
- Emergency contact management

---

## 🎯 Demo Data

The backend includes pre-populated demo data:
- **3 Users** (hospital, driver, admin)
- **3 Sample Accidents** (critical, severe, moderate)
- **2 Hospitals** with bed availability
- **2 Ambulances** (available, dispatched)
- **2 Emergency Contacts** for demo driver

---

## 🔄 Auto-Features

### Automatic Emergency Detection
- Monitors sensor data for dangerous patterns
- Auto-triggers emergency alerts for high G-force (>3.0g)
- Auto-triggers emergency alerts for excessive speed (>100 km/h)

### Real-time Simulation
- Live sensor data updates every 5 seconds
- Simulated driver behavior patterns
- Dynamic accident status changes

---

This integrated backend provides a complete foundation for the SafeRide AI system with real-time communication, comprehensive API endpoints, and seamless frontend integration.
