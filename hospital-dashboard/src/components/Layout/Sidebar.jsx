import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HomeIcon,
  ExclamationTriangleIcon,
  BuildingOffice2Icon,
  TruckIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  XMarkIcon,
  BellIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../../stores/authStore'
import { useSocketStore } from '../../stores/socketStore'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    permission: 'view_accidents'
  },
  {
    name: 'Accidents',
    href: '/accidents',
    icon: ExclamationTriangleIcon,
    permission: 'view_accidents'
  },
  {
    name: 'Hospitals',
    href: '/hospitals',
    icon: BuildingOffice2Icon,
    permission: 'view_hospitals'
  },
  {
    name: 'Ambulances',
    href: '/ambulances',
    icon: TruckIcon,
    permission: 'view_ambulances'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: ChartBarIcon,
    permission: 'view_analytics'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Cog6ToothIcon,
    permission: null // Always accessible
  }
]

const Sidebar = ({ open, setOpen }) => {
  const location = useLocation()
  const { user, hasPermission, logout } = useAuthStore()
  const { 
    isConnected, 
    getActiveAccidentCount, 
    getCriticalAccidentCount 
  } = useSocketStore()

  const activeAccidents = getActiveAccidentCount()
  const criticalAccidents = getCriticalAccidentCount()

  const handleLogout = async () => {
    await logout()
  }

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SafeRide AI</h1>
                <p className="text-xs text-gray-500">Hospital Dashboard</p>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-50">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-secondary-500' : 'bg-danger-500'}`} />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Live Stats */}
          {isConnected && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary-50 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-primary-600">
                  {activeAccidents}
                </div>
                <div className="text-xs text-primary-600">Active</div>
              </div>
              <div className="bg-danger-50 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-danger-600">
                  {criticalAccidents}
                </div>
                <div className="text-xs text-danger-600">Critical</div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    // Check permissions
                    if (item.permission && !hasPermission(item.permission)) {
                      return null
                    }

                    const isActive = location.pathname === item.href || 
                                   (item.href !== '/dashboard' && location.pathname.startsWith(item.href))

                    return (
                      <li key={item.name}>
                        <NavLink
                          to={item.href}
                          className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors duration-200 ${
                            isActive
                              ? 'bg-primary-600 text-white'
                              : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                          }`}
                        >
                          <item.icon
                            className={`h-6 w-6 shrink-0 ${
                              isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary-600'
                            }`}
                          />
                          {item.name}
                          
                          {/* Badge for accidents */}
                          {item.name === 'Accidents' && activeAccidents > 0 && (
                            <span className={`ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full ${
                              isActive ? 'bg-white text-primary-600' : 'bg-danger-100 text-danger-800'
                            }`}>
                              {activeAccidents}
                            </span>
                          )}
                        </NavLink>
                      </li>
                    )
                  })}
                </ul>
              </li>

              {/* User Info */}
              <li className="mt-auto">
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-900">
                    <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user?.userType?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
                  >
                    Sign out
                  </button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="fixed inset-y-0 z-50 flex w-72 flex-col lg:hidden"
          >
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-xl">
              {/* Mobile Header */}
              <div className="flex h-16 shrink-0 items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">SafeRide AI</h1>
                    <p className="text-xs text-gray-500">Hospital Dashboard</p>
                  </div>
                </div>
                
                <button
                  type="button"
                  className="rounded-md p-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Mobile Navigation - Same as desktop */}
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navigation.map((item) => {
                        if (item.permission && !hasPermission(item.permission)) {
                          return null
                        }

                        const isActive = location.pathname === item.href || 
                                       (item.href !== '/dashboard' && location.pathname.startsWith(item.href))

                        return (
                          <li key={item.name}>
                            <NavLink
                              to={item.href}
                              onClick={() => setOpen(false)}
                              className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors duration-200 ${
                                isActive
                                  ? 'bg-primary-600 text-white'
                                  : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                              }`}
                            >
                              <item.icon
                                className={`h-6 w-6 shrink-0 ${
                                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary-600'
                                }`}
                              />
                              {item.name}
                              
                              {item.name === 'Accidents' && activeAccidents > 0 && (
                                <span className={`ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full ${
                                  isActive ? 'bg-white text-primary-600' : 'bg-danger-100 text-danger-800'
                                }`}>
                                  {activeAccidents}
                                </span>
                              )}
                            </NavLink>
                          </li>
                        )
                      })}
                    </ul>
                  </li>

                  {/* Mobile User Info */}
                  <li className="mt-auto">
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-900">
                        <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {user?.userType?.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
                      >
                        Sign out
                      </button>
                    </div>
                  </li>
                </ul>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar
