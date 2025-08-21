import React, { useState, useEffect } from 'react'
import { Code, Heart, Sparkles, X } from 'lucide-react'

const DeveloperCredit = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHidden, setIsHidden] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isHidden) return null

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-1000 transform ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
    }`}>
      {/* Mobile: Compact floating button */}
      <div className="block sm:hidden">
        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-12 h-12 bg-gradient-to-r from-primary-800/90 to-accent-800/90 backdrop-blur-sm border border-primary-600/50 rounded-full shadow-2xl hover:shadow-accent-500/20 transition-all duration-300 hover:scale-110 active:scale-95 group flex items-center justify-center"
          >
            <div className="relative">
              <Code className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent-400 rounded-full animate-ping"></div>
            </div>
          </button>
        ) : (
          <div className="bg-gradient-to-r from-primary-800/95 to-accent-800/95 backdrop-blur-md border border-primary-600/50 rounded-2xl p-3 shadow-2xl max-w-[280px] animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center">
                  <Code className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs text-gray-300 font-medium">Developer</span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="w-6 h-6 rounded-full bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center transition-colors duration-200"
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <span className="text-xs text-gray-300">Made with</span>
                <Heart className="w-3 h-3 text-red-400 animate-pulse" />
                <span className="text-xs text-gray-300">by</span>
              </div>
              <div className="text-sm font-semibold bg-gradient-to-r from-accent-400 to-accent-300 bg-clip-text text-transparent mb-1">
                Khyruddin Hashanulla
              </div>
              <div className="text-xs text-gray-400 flex items-center justify-center space-x-1">
                <Code className="w-3 h-3" />
                <span>Software Engineer</span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-gray-600/30">
              <button
                onClick={() => setIsHidden(true)}
                className="w-full text-xs text-gray-400 hover:text-gray-300 transition-colors duration-200"
              >
                Hide permanently
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop: Original design with enhancements */}
      <div className="hidden sm:block">
        <div className="bg-gradient-to-r from-primary-800/90 to-accent-800/90 backdrop-blur-sm border border-primary-600/50 rounded-xl p-4 shadow-2xl hover:shadow-accent-500/20 transition-all duration-300 hover:scale-105 group relative">
          {/* Close button for desktop */}
          <button
            onClick={() => setIsHidden(true)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-gray-700/80 hover:bg-gray-600/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
          >
            <X className="w-3 h-3 text-gray-400" />
          </button>

          <div className="flex items-center space-x-3">
            {/* Animated Code Icon */}
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <Code className="w-4 h-4 text-white" />
              </div>
              {/* Sparkle Animation */}
              <div className="absolute -top-1 -right-1 w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Sparkles className="w-3 h-3 text-accent-400 animate-pulse" />
              </div>
            </div>

            {/* Developer Info */}
            <div className="text-sm">
              <div className="flex items-center space-x-1">
                <span className="text-gray-300 font-medium">Made with</span>
                <Heart className="w-3 h-3 text-red-400 animate-pulse" />
                <span className="text-gray-300 font-medium">by</span>
              </div>
              <div className="text-white font-semibold bg-gradient-to-r from-accent-400 to-accent-300 bg-clip-text text-transparent">
                Khyruddin Hashanulla
              </div>
              <div className="text-xs text-gray-400 flex items-center space-x-1">
                <Code className="w-3 h-3" />
                <span>Software Engineer</span>
              </div>
            </div>
          </div>

          {/* Animated Border */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent-500/20 to-primary-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
          
          {/* Floating Animation */}
          <div className="absolute inset-0 rounded-xl animate-pulse bg-gradient-to-r from-accent-500/10 to-primary-500/10 -z-20"></div>
        </div>
      </div>
    </div>
  )
}

export default DeveloperCredit
