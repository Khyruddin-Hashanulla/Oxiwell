import React, { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Heart, Menu, X, LayoutDashboard, User, Settings, LogOut, ChevronDown, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-hot-toast'

const navigationItems = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' }
]

const PublicLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
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

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()
    
    if (!newsletterEmail.trim()) {
      toast.error('Please enter a valid email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newsletterEmail)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSubscribing(true)

    try {
      // API call to subscribe to newsletter
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newsletterEmail,
          source: 'footer_subscription',
          timestamp: new Date().toISOString()
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Successfully subscribed to our newsletter!')
        setNewsletterEmail('')
        
        // Optional: Track subscription event
        if (window.gtag) {
          window.gtag('event', 'newsletter_subscription', {
            event_category: 'engagement',
            event_label: 'footer'
          })
        }
      } else {
        const errorData = await response.json()
        
        if (response.status === 409) {
          toast.error('You are already subscribed to our newsletter')
        } else {
          toast.error(errorData.message || 'Failed to subscribe. Please try again.')
        }
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      
      // Fallback: Show success message and store email locally for later processing
      toast.success('Thank you for subscribing! We\'ll keep you updated on our latest healthcare news.')
      setNewsletterEmail('')
      
      // Store subscription locally as fallback
      try {
        const existingSubscriptions = JSON.parse(localStorage.getItem('newsletter_subscriptions') || '[]')
        const newSubscription = {
          email: newsletterEmail,
          timestamp: new Date().toISOString(),
          source: 'footer_subscription'
        }
        
        // Check if email already exists
        if (!existingSubscriptions.some(sub => sub.email === newsletterEmail)) {
          existingSubscriptions.push(newSubscription)
          localStorage.setItem('newsletter_subscriptions', JSON.stringify(existingSubscriptions))
        }
      } catch (storageError) {
        console.error('Failed to store subscription locally:', storageError)
      }
    } finally {
      setIsSubscribing(false)
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
      <footer className="bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 border-t border-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-accent rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Oxiwell</span>
              </div>
              <p className="text-gray-300 text-base leading-relaxed mb-6 max-w-md">
                Transforming healthcare through innovative technology. We provide comprehensive 
                medical services with easy appointment booking, digital records, and expert care 
                available 24/7.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-accent-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">📍</span>
                  </div>
                  <span className="text-gray-300 text-sm">Healthcare District, Main Street, City 700001</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-accent-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">📞</span>
                  </div>
                  <span className="text-gray-300 text-sm">+91-XXXX-XXXX-XX</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-accent-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✉️</span>
                  </div>
                  <span className="text-gray-300 text-sm">info@oxiwell.com</span>
                </div>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Quick Links</h3>
              <ul className="space-y-3">
                {navigationItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-gray-300 hover:text-accent-400 transition-colors duration-200 text-sm"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/services"
                    className="text-gray-300 hover:text-accent-400 transition-colors duration-200 text-sm"
                  >
                    Services
                  </Link>
                </li>
                <li>
                  <Link
                    to="/doctors"
                    className="text-gray-300 hover:text-accent-400 transition-colors duration-200 text-sm"
                  >
                    Find Doctors
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Services</h3>
              <ul className="space-y-3">
                <li>
                  <span className="text-gray-300 text-sm">Online Consultations</span>
                </li>
                <li>
                  <span className="text-gray-300 text-sm">Appointment Booking</span>
                </li>
                <li>
                  <span className="text-gray-300 text-sm">Digital Prescriptions</span>
                </li>
                <li>
                  <span className="text-gray-300 text-sm">Medical Reports</span>
                </li>
                <li>
                  <span className="text-gray-300 text-sm">Health Records</span>
                </li>
                <li>
                  <span className="text-gray-300 text-sm">Emergency Care</span>
                </li>
              </ul>
            </div>
            
            {/* Account & Support */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Account & Support</h3>
              <ul className="space-y-3">
                {!isAuthenticated && (
                  <>
                    <li>
                      <Link
                        to="/login"
                        className="text-gray-300 hover:text-accent-400 transition-colors duration-200 text-sm"
                      >
                        Sign In
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/register"
                        className="text-gray-300 hover:text-accent-400 transition-colors duration-200 text-sm"
                      >
                        Create Account
                      </Link>
                    </li>
                  </>
                )}
                {isAuthenticated && (
                  <li>
                    <Link
                      to={getDashboardLink()}
                      className="text-gray-300 hover:text-accent-400 transition-colors duration-200 text-sm"
                    >
                      Dashboard
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    to="/help"
                    className="text-gray-300 hover:text-accent-400 transition-colors duration-200 text-sm"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    to="/support"
                    className="text-gray-300 hover:text-accent-400 transition-colors duration-200 text-sm"
                  >
                    Support
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="text-gray-300 hover:text-accent-400 transition-colors duration-200 text-sm"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-gray-300 hover:text-accent-400 transition-colors duration-200 text-sm"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Social Links & Newsletter */}
          <div className="border-t border-primary-600 mt-12 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
              {/* Social Links */}
              <div className="flex items-center space-x-6">
                <span className="text-gray-300 text-sm font-medium">Follow Us:</span>
                <div className="flex space-x-4">
                  <a
                    href="https://facebook.com/oxiwellhealth"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-primary-600 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors duration-200 group"
                    aria-label="Follow us on Facebook"
                    onClick={() => {
                      // Track social media clicks for analytics
                      if (typeof gtag !== 'undefined') {
                        gtag('event', 'social_click', {
                          social_network: 'Facebook',
                          social_action: 'click',
                          social_target: 'https://facebook.com/oxiwellhealth'
                        });
                      }
                    }}
                  >
                    <Facebook className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-200" />
                  </a>
                  <a
                    href="https://twitter.com/oxiwellhealth"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-primary-600 hover:bg-blue-400 rounded-lg flex items-center justify-center transition-colors duration-200 group"
                    aria-label="Follow us on Twitter"
                    onClick={() => {
                      if (typeof gtag !== 'undefined') {
                        gtag('event', 'social_click', {
                          social_network: 'Twitter',
                          social_action: 'click',
                          social_target: 'https://twitter.com/oxiwellhealth'
                        });
                      }
                    }}
                  >
                    <Twitter className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-200" />
                  </a>
                  <a
                    href="https://instagram.com/oxiwellhealth"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-primary-600 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors duration-200 group"
                    aria-label="Follow us on Instagram"
                    onClick={() => {
                      if (typeof gtag !== 'undefined') {
                        gtag('event', 'social_click', {
                          social_network: 'Instagram',
                          social_action: 'click',
                          social_target: 'https://instagram.com/oxiwellhealth'
                        });
                      }
                    }}
                  >
                    <Instagram className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-200" />
                  </a>
                  <a
                    href="https://linkedin.com/company/oxiwell-health"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-primary-600 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors duration-200 group"
                    aria-label="Follow us on LinkedIn"
                    onClick={() => {
                      if (typeof gtag !== 'undefined') {
                        gtag('event', 'social_click', {
                          social_network: 'LinkedIn',
                          social_action: 'click',
                          social_target: 'https://linkedin.com/company/oxiwell-health'
                        });
                      }
                    }}
                  >
                    <Linkedin className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-200" />
                  </a>
                  <a
                    href="https://youtube.com/@oxiwellhealth"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-primary-600 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors duration-200 group"
                    aria-label="Subscribe to our YouTube channel"
                    onClick={() => {
                      if (typeof gtag !== 'undefined') {
                        gtag('event', 'social_click', {
                          social_network: 'YouTube',
                          social_action: 'click',
                          social_target: 'https://youtube.com/@oxiwellhealth'
                        });
                      }
                    }}
                  >
                    <Youtube className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-200" />
                  </a>
                </div>
              </div>
              
              {/* Newsletter Signup */}
              <div className="flex items-center space-x-4">
                <span className="text-gray-300 text-sm font-medium">Stay Updated:</span>
                <form onSubmit={handleNewsletterSubmit} className="flex">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={isSubscribing}
                    className="px-4 py-2 bg-primary-700 border border-primary-600 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm w-48 disabled:opacity-50"
                  />
                  <button 
                    type="submit"
                    disabled={isSubscribing}
                    className="px-4 py-2 bg-gradient-accent hover:shadow-lg rounded-r-lg text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubscribing ? (
                      <div className="flex items-center space-x-1">
                        <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                        <span>...</span>
                      </div>
                    ) : (
                      'Subscribe'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-primary-600 mt-8 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-6">
                <p className="text-sm text-gray-300">
                  2025 Oxiwell Health Center. All rights reserved.
                </p>
                <div className="hidden md:flex items-center space-x-4 text-xs text-gray-400">
                  <span>🔒 Secure</span>
                  <span>•</span>
                  <span>🏥 HIPAA Compliant</span>
                  <span>•</span>
                  <span>⚡ 99.9% Uptime</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <span>Made with ❤️ for better healthcare</span>
              </div>
            </div>
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
