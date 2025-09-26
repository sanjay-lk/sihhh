import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  MapPinIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  TruckIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline'
import { accidentsAPI } from '../services/api'
import { formatDistanceToNow, format } from 'date-fns'
import toast from 'react-hot-toast'

const AccidentDetailsPage = () => {
  const { accidentId } = useParams()
  const navigate = useNavigate()
  const [accident, setAccident] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchAccidentDetails()
  }, [accidentId])

  const fetchAccidentDetails = async () => {
    try {
      setLoading(true)
      const response = await accidentsAPI.getAccident(accidentId)
      
      if (response.data.success) {
        setAccident(response.data.data.accident)
      }
    } catch (error) {
      toast.error('Failed to fetch accident details')
      navigate('/accidents')
    } finally {
      setLoading(false)
    }
  }

  const updateAccidentStatus = async (newStatus, reason = '') => {
    try {
      setUpdating(true)
      const data = { status: newStatus }
      if (reason) data.falseAlarmReason = reason

      const response = await accidentsAPI.updateAccidentStatus(accidentId, data)
      
      if (response.data.success) {
        setAccident(prev => ({ ...prev, status: newStatus }))
        toast.success(`Accident status updated to ${newStatus}`)
      }
    } catch (error) {
      toast.error('Failed to update accident status')
    } finally {
      setUpdating(false)
    }
  }

  const dispatchResponse = async (responseType) => {
    try {
      setUpdating(true)
      const data = {
        responseType,
        estimatedArrival: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
        notes: `Dispatched ${responseType} for ${accident.severity} accident`
      }

      const response = await accidentsAPI.addResponse(accidentId, data)
      
      if (response.data.success) {
        toast.success(`${responseType} dispatched successfully`)
        fetchAccidentDetails() // Refresh data
      }
    } catch (error) {
      toast.error(`Failed to dispatch ${responseType}`)
    } finally {
      setUpdating(false)
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-danger-600 bg-danger-50 border-danger-200'
      case 'severe': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'moderate': return 'text-warning-600 bg-warning-50 border-warning-200'
      case 'minor': return 'text-secondary-600 bg-secondary-50 border-secondary-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'badge-success'
      case 'responded': return 'badge-info'
      case 'confirmed': return 'badge-warning'
      case 'detected': return 'badge-gray'
      case 'false_alarm': return 'badge-gray'
      default: return 'badge-gray'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="loading-skeleton h-8 w-8 rounded"></div>
          <div className="loading-skeleton h-8 w-48"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-body">
                <div className="loading-skeleton h-64 w-full"></div>
              </div>
            </div>
          </div>
          <div>
            <div className="card">
              <div className="card-body">
                <div className="loading-skeleton h-32 w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!accident) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Accident not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The accident you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate('/accidents')}
          className="mt-4 btn btn-primary"
        >
          Back to Accidents
        </button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/accidents')}
          className="btn btn-ghost p-2"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Accident Details
          </h1>
          <p className="text-sm text-gray-500">
            ID: {accident.accidentId}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Accident Overview */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">
                Accident Overview
              </h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Severity</span>
                      <span className={`badge border ${getSeverityColor(accident.severity)}`}>
                        {accident.severity?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className={`badge ${getStatusColor(accident.status)}`}>
                        {accident.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Detected</span>
                      <span className="text-sm text-gray-900">
                        {format(new Date(accident.detectedAt), 'PPpp')}
                      </span>
                    </div>
                    {accident.confirmedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Confirmed</span>
                        <span className="text-sm text-gray-900">
                          {format(new Date(accident.confirmedAt), 'PPpp')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">AI Analysis</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Confidence</span>
                      <span className="text-sm font-medium text-gray-900">
                        {accident.aiAnalysis?.confidenceScore}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Impact Force</span>
                      <span className="text-sm text-gray-900">
                        {accident.aiAnalysis?.impactForce?.toFixed(1)}g
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Speed Change</span>
                      <span className="text-sm text-gray-900">
                        {accident.aiAnalysis?.speedChange?.toFixed(1)} km/h
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Detection Method</span>
                      <span className="text-sm text-gray-900 capitalize">
                        {accident.aiAnalysis?.detectionMethod}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              {accident.location && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Location</h4>
                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900">
                        {accident.location.address?.formattedAddress || 'Address not available'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {accident.location.coordinates?.latitude?.toFixed(6)}, {accident.location.coordinates?.longitude?.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              {accident.description && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Description</h4>
                  <p className="text-sm text-gray-700">{accident.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sensor Data */}
          {accident.sensorData && accident.sensorData.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">
                  Sensor Data
                </h3>
              </div>
              <div className="card-body">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acceleration (g)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Speed (km/h)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {accident.sensorData.slice(0, 5).map((data, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {format(new Date(data.timestamp), 'HH:mm:ss.SSS')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {data.accelerometer.magnitude?.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {data.speed?.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Response History */}
          {accident.responses && accident.responses.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">
                  Response History
                </h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {accident.responses.map((response, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <TruckIcon className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 capitalize">
                            {response.responseType} Dispatched
                          </h4>
                          <span className={`badge ${getStatusColor(response.status)}`}>
                            {response.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Dispatched {formatDistanceToNow(new Date(response.dispatchedAt), { addSuffix: true })}
                        </p>
                        {response.estimatedArrival && (
                          <p className="text-xs text-gray-500">
                            ETA: {format(new Date(response.estimatedArrival), 'HH:mm')}
                          </p>
                        )}
                        {response.notes && (
                          <p className="text-sm text-gray-700 mt-2">{response.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Information */}
          {accident.userId && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">
                  User Information
                </h3>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {accident.userId.firstName} {accident.userId.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{accident.userId.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <p className="text-sm text-gray-900">{accident.userId.phone}</p>
                  </div>

                  {accident.userId.medicalInfo?.bloodType && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-900 mb-2">Medical Information</p>
                      <p className="text-sm text-gray-600">
                        Blood Type: {accident.userId.medicalInfo.bloodType}
                      </p>
                      {accident.userId.medicalInfo.allergies?.length > 0 && (
                        <p className="text-sm text-gray-600">
                          Allergies: {accident.userId.medicalInfo.allergies.join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">
                Actions
              </h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                {accident.status === 'detected' && (
                  <>
                    <button
                      onClick={() => updateAccidentStatus('confirmed')}
                      disabled={updating}
                      className="btn btn-primary w-full"
                    >
                      Confirm Accident
                    </button>
                    <button
                      onClick={() => updateAccidentStatus('false_alarm', 'Manual review determined this was not an accident')}
                      disabled={updating}
                      className="btn btn-outline w-full"
                    >
                      Mark as False Alarm
                    </button>
                  </>
                )}

                {accident.status === 'confirmed' && (
                  <div className="space-y-2">
                    <button
                      onClick={() => dispatchResponse('ambulance')}
                      disabled={updating}
                      className="btn btn-secondary w-full"
                    >
                      <TruckIcon className="h-4 w-4 mr-2" />
                      Dispatch Ambulance
                    </button>
                    <button
                      onClick={() => dispatchResponse('police')}
                      disabled={updating}
                      className="btn btn-outline w-full"
                    >
                      Dispatch Police
                    </button>
                    <button
                      onClick={() => dispatchResponse('fire')}
                      disabled={updating}
                      className="btn btn-outline w-full"
                    >
                      Dispatch Fire Department
                    </button>
                  </div>
                )}

                {accident.status === 'responded' && (
                  <button
                    onClick={() => updateAccidentStatus('resolved')}
                    disabled={updating}
                    className="btn btn-success w-full"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">
                Timeline
              </h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-danger-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Accident Detected</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(accident.detectedAt), 'PPpp')}
                    </p>
                  </div>
                </div>

                {accident.confirmedAt && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-warning-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Accident Confirmed</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(accident.confirmedAt), 'PPpp')}
                      </p>
                    </div>
                  </div>
                )}

                {accident.firstResponseAt && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">First Response</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(accident.firstResponseAt), 'PPpp')}
                      </p>
                    </div>
                  </div>
                )}

                {accident.resolvedAt && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Resolved</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(accident.resolvedAt), 'PPpp')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default AccidentDetailsPage
