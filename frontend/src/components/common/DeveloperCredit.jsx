import React, { useState, useEffect } from 'react'
import { Code, Heart, Sparkles } from 'lucide-react'

const DeveloperCredit = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-1000 transform ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
    }`}>
      <div className="bg-gradient-to-r from-primary-800/90 to-accent-800/90 backdrop-blur-sm border border-primary-600/50 rounded-xl p-4 shadow-2xl hover:shadow-accent-500/20 transition-all duration-300 hover:scale-105 group">
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
  )
}

export default DeveloperCredit
