import React from 'react'

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 xl:px-12 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
        <div className="mx-auto w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <svg
                className="w-7 h-7 text-primary-600"
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
              <h1 className="text-2xl font-bold text-white">SafeRide AI</h1>
              <p className="text-primary-200 text-sm">Hospital Dashboard</p>
            </div>
          </div>

          {/* Hero Content */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white leading-tight">
              Save Lives with
              <br />
              Real-Time Response
            </h2>
            
            <p className="text-lg text-primary-100 leading-relaxed">
              Monitor accidents in real-time, coordinate emergency responses, 
              and manage hospital resources efficiently with our AI-powered platform.
            </p>

            {/* Features */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-primary-100">Real-time accident detection</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-primary-100">Automated emergency dispatch</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-primary-100">Hospital resource management</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-primary-100">Advanced analytics & reporting</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-8 mt-8 border-t border-primary-500">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">95%</div>
              <div className="text-xs text-primary-200">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">&lt;30s</div>
              <div className="text-xs text-primary-200">Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-xs text-primary-200">Monitoring</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
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
                <p className="text-sm text-gray-500">Hospital Dashboard</p>
              </div>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
