import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ExclamationTriangleIcon,
  BuildingOffice2Icon,
  TruckIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { useSocketStore } from '../stores/socketStore'
import { accidentsAPI, hospitalsAPI } from '../services/api'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

// Components
import StatCard from '../components/Dashboard/StatCard'
import AccidentFeed from '../components/Dashboard/AccidentFeed'
import HospitalStatus from '../components/Dashboard/HospitalStatus'
import ResponseTimeChart from '../components/Dashboard/ResponseTimeChart'
import SeverityChart from '../components/Dashboard/SeverityChart'

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalAccidents: 0,
    activeAccidents: 0,
    criticalAccidents: 0,
    avgResponseTime: 0,
    totalHospitals: 0,
    availableBeds: 0,
    availableAmbulances: 0
  })
  const [recentAccidents, setRecentAccidents] = useState([])
  const [hospitalStats, setHospitalStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const { 
    activeAccidents, 
    getCriticalAccidentCount, 
    isConnected 
  } = useSocketStore()

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch accident statistics
        const [accidentStatsRes, hospitalStatsRes, recentAccidentsRes] = await Promise.all([
          accidentsAPI.getStatistics(),
          hospitalsAPI.getSystemStatistics(),
          accidentsAPI.getAccidents({ limit: 10, page: 1 })
        ])

        if (accidentStatsRes.data.success) {
          const accidentStats = accidentStatsRes.data.data.statistics
          setStats(prev => ({
            ...prev,
            totalAccidents: accidentStats.totalAccidents || 0,
            avgResponseTime: accidentStats.avgResponseTime || 0
          }))
        }

        if (hospitalStatsRes.data.success) {
          const hospitalData = hospitalStatsRes.data.data.statistics
          setHospitalStats(hospitalData)
          setStats(prev => ({
            ...prev,
            totalHospitals: hospitalData.totalHospitals || 0,
            availableBeds: hospitalData.availableBeds || 0,
            availableAmbulances: hospitalData.availableAmbulances || 0
          }))
        }

        if (recentAccidentsRes.data.success) {
          setRecentAccidents(recentAccidentsRes.data.data.accidents)
        }

      } catch (error) {
        console.error('Dashboard data fetch error:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Update real-time stats from socket
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      activeAccidents: activeAccidents.length,
      criticalAccidents: getCriticalAccidentCount()
    }))
  }, [activeAccidents, getCriticalAccidentCount])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card">
              <div className="card-body">
                <div className="loading-skeleton h-4 w-20 mb-2"></div>
                <div className="loading-skeleton h-8 w-16 mb-2"></div>
                <div className="loading-skeleton h-3 w-24"></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-body">
              <div className="loading-skeleton h-6 w-32 mb-4"></div>
              <div className="loading-skeleton h-64 w-full"></div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="loading-skeleton h-6 w-32 mb-4"></div>
              <div className="loading-skeleton h-64 w-full"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Dashboard
            </h1>
            <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-secondary-500' : 'bg-danger-500'}`} />
                {isConnected ? 'Live monitoring active' : 'Connection lost'}
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <ClockIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                Last updated: {formatDistanceToNow(new Date(), { addSuffix: true })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Accidents"
            value={stats.activeAccidents}
            icon={ExclamationTriangleIcon}
            color="primary"
            trend={stats.activeAccidents > 0 ? 'up' : 'neutral'}
            subtitle={`${stats.criticalAccidents} critical`}
          />
          
          <StatCard
            title="Available Hospitals"
            value={stats.totalHospitals}
            icon={BuildingOffice2Icon}
            color="secondary"
            trend="neutral"
            subtitle={`${stats.availableBeds} beds available`}
          />
          
          <StatCard
            title="Available Ambulances"
            value={stats.availableAmbulances}
            icon={TruckIcon}
            color="warning"
            trend="neutral"
            subtitle="Ready for dispatch"
          />
          
          <StatCard
            title="Avg Response Time"
            value={`${Math.round(stats.avgResponseTime / 60)}m`}
            icon={ClockIcon}
            color="info"
            trend={stats.avgResponseTime < 300 ? 'down' : 'up'}
            subtitle="Last 24 hours"
          />
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Accident Feed */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          {/* Live Accident Feed */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Live Accident Feed
                </h3>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-secondary-500 animate-pulse' : 'bg-gray-400'}`} />
                  <span className="text-sm text-gray-500">
                    {isConnected ? 'Live' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              <AccidentFeed accidents={activeAccidents.slice(0, 5)} />
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">
                  Response Times
                </h3>
              </div>
              <div className="card-body">
                <ResponseTimeChart />
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">
                  Accident Severity
                </h3>
              </div>
              <div className="card-body">
                <SeverityChart />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Hospital Status */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Hospital Status */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">
                Hospital Status
              </h3>
            </div>
            <div className="card-body p-0">
              <HospitalStatus stats={hospitalStats} />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Activity
              </h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {recentAccidents.slice(0, 5).map((accident) => (
                  <div key={accident._id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      accident.severity === 'critical' ? 'bg-danger-500' :
                      accident.severity === 'severe' ? 'bg-orange-500' :
                      accident.severity === 'moderate' ? 'bg-warning-500' :
                      'bg-secondary-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {accident.severity.charAt(0).toUpperCase() + accident.severity.slice(1)} accident
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(accident.detectedAt), { addSuffix: true })}
                      </p>
                    </div>
                    <span className={`badge ${
                      accident.status === 'resolved' ? 'badge-success' :
                      accident.status === 'responded' ? 'badge-info' :
                      accident.status === 'confirmed' ? 'badge-warning' :
                      'badge-gray'
                    }`}>
                      {accident.status}
                    </span>
                  </div>
                ))}
                
                {recentAccidents.length === 0 && (
                  <div className="text-center py-8">
                    <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No recent accidents</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      All clear! No accidents reported recently.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">
                Quick Actions
              </h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <button className="btn btn-primary w-full justify-start">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                  View All Accidents
                </button>
                <button className="btn btn-outline w-full justify-start">
                  <TruckIcon className="h-5 w-5 mr-2" />
                  Manage Ambulances
                </button>
                <button className="btn btn-outline w-full justify-start">
                  <BuildingOffice2Icon className="h-5 w-5 mr-2" />
                  Hospital Status
                </button>
                <button className="btn btn-outline w-full justify-start">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default DashboardPage
