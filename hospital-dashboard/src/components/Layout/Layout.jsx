import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useSocketStore } from '../../stores/socketStore'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isConnected } = useSocketStore()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Connection Status Banner */}
      {!isConnected && (
        <div className="bg-warning-500 text-white px-4 py-2 text-center text-sm font-medium">
          ⚠️ Connection lost. Attempting to reconnect...
        </div>
      )}

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default Layout
