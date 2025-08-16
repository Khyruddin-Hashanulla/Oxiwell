import React, { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Heart, Menu, X, LayoutDashboard, User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const navigationItems = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' }
]

const PublicLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true
    }
    return location.pathname.startsWith(path) && path !== '/'
  }

  const getLinkClasses = (path) => {
    const baseClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
    const activeClasses = "text-white"
    const inactiveClasses = "text-gray-300 hover:text-white"
    
    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`
  }

  const getMobileLinkClasses = (path) => {
    const baseClasses = "block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
    const activeClasses = "text-white"
    const inactiveClasses = "text-gray-300 hover:text-white"
    
    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`
  }

  const getDashboardLink = () => {
    if (!user) return '/dashboard'
    switch (user.role) {
      case 'patient':
        return '/patient/dashboard'
      case 'doctor':
        return '/doctor/dashboard'
      case 'admin':
        return '/admin/dashboard'
      default:
        return '/dashboard'
    }
  }

  const getProfileLink = () => {
    if (!user) return '/profile'
    switch (user.role) {
      case 'patient':
        return '/patient/profile'
      case 'doctor':
        return '/doctor/profile'
      case 'admin':
        return '/admin/profile'
      default:
        return '/profile'
    }
  }

  const getSettingsLink = () => {
    if (!user) return '/settings'
    switch (user.role) {
      case 'patient':
        return '/patient/settings'
      case 'doctor':
        return '/doctor/settings'
      case 'admin':
        return '/admin/settings'
      default:
        return '/settings'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-800 to-primary-700 shadow-xl border-b border-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-accent rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Oxiwell</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={getLinkClasses(item.href)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-accent hover:shadow-lg text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300"
                  >
                    Get Started
                  </Link>
                </>
              )}
              {isAuthenticated && (
                <>
                  <Link
                    to={getDashboardLink()}
                    className="text-gray-300 hover:text-accent-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                    >
                      <User className="w-5 h-5" />
                      <span>{user.name}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {isUserMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsUserMenuOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-48 bg-primary-800 rounded-md shadow-xl border border-primary-600 py-1 z-50">
                          <Link
                            to={getProfileLink()}
                            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-primary-700 hover:text-white"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <User className="h-4 w-4 mr-3" />
                            Profile
                          </Link>
                          <Link
                            to={getSettingsLink()}
                            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-primary-700 hover:text-white"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4 mr-3" />
                            Settings
                          </Link>
                          <hr className="my-1 border-primary-600" />
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-900 hover:text-red-300"
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            Logout
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-300 hover:text-white p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-primary-600 py-4 relative z-50">
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={getMobileLinkClasses(item.href)}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                {isAuthenticated && (
                  <Link
                    to={getDashboardLink()}
                    className={getMobileLinkClasses(getDashboardLink())}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                <hr className="my-2 border-primary-600" />
                {!isAuthenticated && (
                  <>
                    <Link
                      to="/login"
                      className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-primary-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/register"
                      className="block px-3 py-2 rounded-md text-sm font-medium bg-gradient-accent text-white hover:shadow-lg mx-3"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
                {isAuthenticated && (
                  <div className="space-y-2">
                    <Link
                      to={getProfileLink()}
                      className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-primary-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to={getSettingsLink()}
                      className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-primary-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMobileMenuOpen(false)
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Oxiwell</span>
              </div>
              <p className="text-gray-300 text-sm max-w-md">
                Modern healthcare management system providing comprehensive medical services 
                with easy appointment booking, digital records, and expert care.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {navigationItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={getLinkClasses(item.href)}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Account</h3>
              <ul className="space-y-2">
                {!isAuthenticated && (
                  <>
                    <li>
                      <Link
                        to="/login"
                        className="text-sm text-gray-300 hover:text-white transition-colors"
                      >
                        Sign in
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/register"
                        className="text-sm text-gray-300 hover:text-white transition-colors"
                      >
                        Register
                      </Link>
                    </li>
                  </>
                )}
                {isAuthenticated && (
                  <li>
                    <Link
                      to={getDashboardLink()}
                      className="text-sm text-gray-300 hover:text-accent-400 transition-colors"
                    >
                      Dashboard
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-primary-600 mt-8 pt-8">
            <p className="text-sm text-gray-300 text-center">
              2025 Oxiwell Health Center. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Click outside to close mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}

export default PublicLayout
