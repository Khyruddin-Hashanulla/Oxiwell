import React, { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../ui/LoadingSpinner'
import { 
  Home, 
  LogOut, 
  User, 
  Settings, 
  ChevronDown,
  Menu,
  X,
  FileText
} from 'lucide-react'

const DashboardLayout = () => {
  const { user, logout, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getDashboardLink = () => {
    switch (user?.role) {
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

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true
    }
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
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

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Home', href: '/', icon: Home }
    ]
    
    switch (user?.role) {
      case 'patient':
        return [
          ...baseItems,
          { name: 'Dashboard', href: '/patient/dashboard' },
          { name: 'Appointments', href: '/patient/appointments' },
          { name: 'Prescriptions', href: '/patient/prescriptions' },
          { name: 'Reports', href: '/patient/reports' }
        ]
      case 'doctor':
        return [
          ...baseItems,
          { name: 'Dashboard', href: '/doctor/dashboard' },
          { name: 'Appointments', href: '/doctor/appointments' },
          { name: 'Patients', href: '/doctor/patients' },
          { name: 'Prescriptions', href: '/doctor/prescriptions' },
          { name: 'Reports', href: '/doctor/reports', icon: FileText }
        ]
      case 'admin':
        return [
          ...baseItems,
          { name: 'Dashboard', href: '/admin/dashboard' },
          { name: 'Users', href: '/admin/users' },
          { name: 'Analytics', href: '/admin/analytics' },
          { name: 'Settings', href: '/admin/settings' }
        ]
      default:
        return baseItems
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  const navigationItems = getNavigationItems()

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-4">
                <Link 
                  to={getDashboardLink()} 
                  className="text-2xl font-bold text-white hover:text-gray-300 transition-colors"
                >
                  Oxiwell
                </Link>
                {user && (
                  <span className="px-3 py-1 bg-gray-700 text-gray-300 text-sm font-medium rounded-full capitalize">
                    {user.role}
                  </span>
                )}
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-6">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${getLinkClasses(item.href)} flex items-center space-x-2`}
                    >
                      {IconComponent && <IconComponent className="h-4 w-4" />}
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
            
            {/* Right side - User Menu */}
            {user && (
              <div className="flex items-center space-x-4">
                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>

                {/* User dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 p-2 hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </span>
                      </div>
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-medium text-gray-300">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {user.role}
                        </p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-300" />
                    </div>
                  </button>

                  {/* Dropdown menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-700">
                      <Link
                        to={getDashboardLink()}
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Home className="h-4 w-4 mr-3" />
                        Dashboard
                      </Link>
                      <Link
                        to={`/${user.role}/profile`}
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-3" />
                        Profile
                      </Link>
                      <Link
                        to={`/${user.role}/settings`}
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-red-600 hover:text-white transition-colors duration-200"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-700 py-4 relative z-50">
              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${getMobileLinkClasses(item.href)} flex items-center space-x-3 cursor-pointer`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {IconComponent && <IconComponent className="h-4 w-4" />}
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>

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

export default DashboardLayout
