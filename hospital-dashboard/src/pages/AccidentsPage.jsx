import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { accidentsAPI } from '../services/api'
import { useSocketStore } from '../stores/socketStore'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

const AccidentsPage = () => {
  const [accidents, setAccidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    severity: '',
    startDate: '',
    endDate: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  const { activeAccidents } = useSocketStore()

  // Fetch accidents
  const fetchAccidents = async (page = 1) => {
    try {
      setLoading(true)
      const params = {
        page,
        limit: pagination.limit,
        ...filters
      }
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key]
      })

      const response = await accidentsAPI.getAccidents(params)
      
      if (response.data.success) {
        setAccidents(response.data.data.accidents)
        setPagination(response.data.data.pagination)
      }
    } catch (error) {
      toast.error('Failed to fetch accidents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccidents()
  }, [filters])

  // Merge real-time accidents with fetched data
  const allAccidents = React.useMemo(() => {
    const fetchedIds = new Set(accidents.map(a => a.accidentId))
    const newAccidents = activeAccidents.filter(a => !fetchedIds.has(a.accidentId))
    return [...newAccidents, ...accidents]
  }, [accidents, activeAccidents])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    fetchAccidents(newPage)
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'severity-critical'
      case 'severe': return 'severity-severe'
      case 'moderate': return 'severity-moderate'
      case 'minor': return 'severity-minor'
      default: return 'badge-gray'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'status-resolved'
      case 'responded': return 'status-responded'
      case 'confirmed': return 'status-confirmed'
      case 'detected': return 'status-detected'
      case 'false_alarm': return 'status-false-alarm'
      default: return 'badge-gray'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Accidents
          </h1>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <ExclamationTriangleIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
              {allAccidents.length} total accidents
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search accidents..."
                  className="form-input pl-10"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="detected">Detected</option>
                <option value="confirmed">Confirmed</option>
                <option value="responded">Responded</option>
                <option value="resolved">Resolved</option>
                <option value="false_alarm">False Alarm</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div>
              <select
                className="form-select"
                value={filters.severity}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
              >
                <option value="">All Severities</option>
                <option value="critical">Critical</option>
                <option value="severe">Severe</option>
                <option value="moderate">Moderate</option>
                <option value="minor">Minor</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div>
              <button
                onClick={() => setFilters({
                  search: '',
                  status: '',
                  severity: '',
                  startDate: '',
                  endDate: ''
                })}
                className="btn btn-outline w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Accidents List */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading accidents...</p>
            </div>
          ) : allAccidents.length === 0 ? (
            <div className="p-8 text-center">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No accidents found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your filters or check back later.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {allAccidents.map((accident) => (
                <motion.div
                  key={accident._id || accident.accidentId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`badge border ${getSeverityColor(accident.severity)}`}>
                          {accident.severity?.toUpperCase()}
                        </span>
                        <span className={`badge border ${getStatusColor(accident.status)}`}>
                          {accident.status?.replace('_', ' ').toUpperCase()}
                        </span>
                        {accident.aiAnalysis?.confidenceScore && (
                          <span className="text-xs text-gray-500">
                            {accident.aiAnalysis.confidenceScore}% confidence
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Accident ID: {accident.accidentId}
                      </h3>

                      <div className="space-y-1 text-sm text-gray-600">
                        {accident.location && (
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">
                              {accident.location.address?.formattedAddress || 
                               `${accident.location.coordinates?.latitude?.toFixed(4)}, ${accident.location.coordinates?.longitude?.toFixed(4)}`}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>
                            {formatDistanceToNow(new Date(accident.detectedAt || accident.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                      </div>

                      {accident.description && (
                        <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                          {accident.description}
                        </p>
                      )}
                    </div>

                    <div className="ml-6 flex-shrink-0">
                      <Link
                        to={`/accidents/${accident.accidentId}`}
                        className="btn btn-primary btn-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="card-footer">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="btn btn-outline btn-sm"
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-700">
                  Page {pagination.page} of {pagination.pages}
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="btn btn-outline btn-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccidentsPage
