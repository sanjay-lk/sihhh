import React from 'react'
import { motion } from 'framer-motion'
import {
  BuildingOffice2Icon,
  BedIcon,
  TruckIcon,
  SignalIcon
} from '@heroicons/react/24/outline'

const HospitalStatus = ({ stats }) => {
  if (!stats) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  const occupancyRate = stats.totalBeds > 0 
    ? Math.round(((stats.totalBeds - stats.availableBeds) / stats.totalBeds) * 100)
    : 0

  const ambulanceAvailabilityRate = stats.totalAmbulances > 0
    ? Math.round((stats.availableAmbulances / stats.totalAmbulances) * 100)
    : 0

  const getStatusColor = (rate) => {
    if (rate >= 80) return 'text-danger-600 bg-danger-50'
    if (rate >= 60) return 'text-warning-600 bg-warning-50'
    return 'text-secondary-600 bg-secondary-50'
  }

  const getProgressColor = (rate) => {
    if (rate >= 80) return 'bg-danger-500'
    if (rate >= 60) return 'bg-warning-500'
    return 'bg-secondary-500'
  }

  return (
    <div className="p-6 space-y-6">
      {/* System Overview */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-4">System Overview</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-primary-50 rounded-lg">
            <BuildingOffice2Icon className="h-6 w-6 text-primary-600 mx-auto mb-1" />
            <div className="text-lg font-semibold text-primary-600">{stats.totalHospitals}</div>
            <div className="text-xs text-primary-600">Hospitals</div>
          </div>
          <div className="text-center p-3 bg-secondary-50 rounded-lg">
            <SignalIcon className="h-6 w-6 text-secondary-600 mx-auto mb-1" />
            <div className="text-lg font-semibold text-secondary-600">
              {Math.round(stats.avgResponseTime / 60)}m
            </div>
            <div className="text-xs text-secondary-600">Avg Response</div>
          </div>
        </div>
      </div>

      {/* Bed Availability */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-900">Bed Availability</h4>
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(occupancyRate)}`}>
            {occupancyRate}% occupied
          </span>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Available Beds</span>
            <span className="font-medium">{stats.availableBeds}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Capacity</span>
            <span className="font-medium">{stats.totalBeds}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div 
              className={`h-2 rounded-full ${getProgressColor(occupancyRate)}`}
              initial={{ width: 0 }}
              animate={{ width: `${occupancyRate}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Ambulance Fleet */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-900">Ambulance Fleet</h4>
          <span className={`text-xs px-2 py-1 rounded-full ${
            ambulanceAvailabilityRate >= 70 ? 'text-secondary-600 bg-secondary-50' :
            ambulanceAvailabilityRate >= 40 ? 'text-warning-600 bg-warning-50' :
            'text-danger-600 bg-danger-50'
          }`}>
            {ambulanceAvailabilityRate}% available
          </span>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Available</span>
            <span className="font-medium text-secondary-600">{stats.availableAmbulances}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Fleet</span>
            <span className="font-medium">{stats.totalAmbulances}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div 
              className={`h-2 rounded-full ${
                ambulanceAvailabilityRate >= 70 ? 'bg-secondary-500' :
                ambulanceAvailabilityRate >= 40 ? 'bg-warning-500' :
                'bg-danger-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${ambulanceAvailabilityRate}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            />
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">System Status</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Emergency Services</span>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-secondary-500 rounded-full mr-2"></div>
              <span className="text-sm text-secondary-600">Operational</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Communication</span>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-secondary-500 rounded-full mr-2"></div>
              <span className="text-sm text-secondary-600">Connected</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">AI Detection</span>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-secondary-500 rounded-full mr-2"></div>
              <span className="text-sm text-secondary-600">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {Math.round((stats.availableBeds / stats.totalBeds) * 100)}%
            </div>
            <div className="text-xs text-gray-500">Bed Availability</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {ambulanceAvailabilityRate}%
            </div>
            <div className="text-xs text-gray-500">Fleet Ready</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HospitalStatus
