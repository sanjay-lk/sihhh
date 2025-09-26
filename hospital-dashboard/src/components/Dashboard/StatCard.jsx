import React from 'react'
import { motion } from 'framer-motion'
import {
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline'

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'primary', 
  trend = 'neutral', 
  subtitle,
  onClick 
}) => {
  const colorClasses = {
    primary: {
      bg: 'bg-primary-50',
      icon: 'text-primary-600',
      text: 'text-primary-600'
    },
    secondary: {
      bg: 'bg-secondary-50',
      icon: 'text-secondary-600',
      text: 'text-secondary-600'
    },
    warning: {
      bg: 'bg-warning-50',
      icon: 'text-warning-600',
      text: 'text-warning-600'
    },
    danger: {
      bg: 'bg-danger-50',
      icon: 'text-danger-600',
      text: 'text-danger-600'
    },
    info: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      text: 'text-blue-600'
    }
  }

  const trendIcons = {
    up: ArrowUpIcon,
    down: ArrowDownIcon,
    neutral: MinusIcon
  }

  const trendColors = {
    up: 'text-danger-500',
    down: 'text-secondary-500',
    neutral: 'text-gray-400'
  }

  const colors = colorClasses[color] || colorClasses.primary
  const TrendIcon = trendIcons[trend]

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`card cursor-pointer transition-all duration-200 hover:shadow-medium ${
        onClick ? 'hover:bg-gray-50' : ''
      }`}
      onClick={onClick}
    >
      <div className="card-body">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
              <Icon className={`h-6 w-6 ${colors.icon}`} />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className={`text-2xl font-bold ${colors.text}`}>
                  {typeof value === 'number' && value > 999 
                    ? `${(value / 1000).toFixed(1)}k` 
                    : value
                  }
                </p>
                {subtitle && (
                  <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
                )}
              </div>
              {trend !== 'neutral' && (
                <div className="flex-shrink-0">
                  <TrendIcon className={`h-5 w-5 ${trendColors[trend]}`} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default StatCard
