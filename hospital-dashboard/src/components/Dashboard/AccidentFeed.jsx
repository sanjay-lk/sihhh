import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ExclamationTriangleIcon,
  MapPinIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'

const AccidentFeed = ({ accidents = [] }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'text-danger-600 bg-danger-50 border-danger-200'
      case 'severe':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'moderate':
        return 'text-warning-600 bg-warning-50 border-warning-200'
      case 'minor':
        return 'text-secondary-600 bg-secondary-50 border-secondary-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'badge-success'
      case 'responded':
        return 'badge-info'
      case 'confirmed':
        return 'badge-warning'
      case 'detected':
        return 'badge-gray'
      case 'false_alarm':
        return 'badge-gray'
      default:
        return 'badge-gray'
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      x: 20,
      transition: { duration: 0.2 }
    }
  }

  if (accidents.length === 0) {
    return (
      <div className="p-8 text-center">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No active accidents</h3>
        <p className="mt-1 text-sm text-gray-500">
          All clear! The system is monitoring for new incidents.
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      <AnimatePresence>
        {accidents.map((accident) => (
          <motion.div
            key={accident.accidentId || accident._id}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="p-4 hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="flex items-start space-x-4">
              {/* Severity Indicator */}
              <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                accident.severity === 'critical' ? 'bg-danger-500 animate-pulse' :
                accident.severity === 'severe' ? 'bg-orange-500' :
                accident.severity === 'moderate' ? 'bg-warning-500' :
                'bg-secondary-500'
              }`} />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(accident.severity)}`}>
                      {accident.severity?.toUpperCase()}
                    </span>
                    <span className={`badge ${getStatusColor(accident.status)}`}>
                      {accident.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {formatDistanceToNow(new Date(accident.detectedAt || accident.timestamp), { addSuffix: true })}
                  </div>
                </div>

                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900">
                    Accident ID: {accident.accidentId}
                  </p>
                  
                  {/* Location */}
                  {accident.location && (
                    <div className="flex items-center mt-1 text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">
                        {accident.location.address?.formattedAddress || 
                         `${accident.location.coordinates?.latitude?.toFixed(4)}, ${accident.location.coordinates?.longitude?.toFixed(4)}`}
                      </span>
                    </div>
                  )}

                  {/* User Info */}
                  {accident.userId && (
                    <div className="flex items-center mt-1 text-sm text-gray-600">
                      <UserIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span>
                        {accident.userName || 'Unknown User'}
                      </span>
                    </div>
                  )}

                  {/* Confidence Score */}
                  {accident.aiAnalysis?.confidenceScore && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>AI Confidence</span>
                        <span>{accident.aiAnalysis.confidenceScore}%</span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            accident.aiAnalysis.confidenceScore >= 80 ? 'bg-secondary-500' :
                            accident.aiAnalysis.confidenceScore >= 60 ? 'bg-warning-500' :
                            'bg-danger-500'
                          }`}
                          style={{ width: `${accident.aiAnalysis.confidenceScore}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-3 flex items-center space-x-2">
                  <button className="btn btn-sm btn-primary">
                    View Details
                  </button>
                  {accident.status === 'detected' && (
                    <button className="btn btn-sm btn-outline">
                      Confirm
                    </button>
                  )}
                  {accident.status === 'confirmed' && (
                    <button className="btn btn-sm btn-secondary">
                      Dispatch
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* View All Button */}
      {accidents.length > 0 && (
        <div className="p-4 bg-gray-50">
          <button className="w-full btn btn-outline btn-sm">
            View All Accidents ({accidents.length}+)
          </button>
        </div>
      )}
    </div>
  )
}

export default AccidentFeed
