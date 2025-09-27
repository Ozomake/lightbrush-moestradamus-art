import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/game', label: 'Experience' },
    { path: '/simulator', label: 'Simulator' },
    { path: '/portfolio', label: 'Portfolio' },
    { path: '/about', label: 'About' },
  ]

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
                <div className="w-6 h-6 bg-white rounded-sm transform rotate-12"></div>
              </div>
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(59, 130, 246, 0.5)',
                    '0 0 30px rgba(147, 51, 234, 0.8)',
                    '0 0 20px rgba(59, 130, 246, 0.5)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-lg"
              />
            </motion.div>
            <motion.span
              whileHover={{ letterSpacing: '0.1em' }}
              transition={{ duration: 0.2 }}
              className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
            >
              Lightbrush
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative group"
              >
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className={`transition-colors duration-200 ${
                    location.pathname === item.path
                      ? 'text-blue-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </motion.span>

                {/* Active indicator */}
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                  />
                )}

                {/* Hover glow effect */}
                <motion.div
                  className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-600/10 blur-xl"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                />
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="md:hidden relative w-6 h-6 flex flex-col justify-center items-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <motion.span
              animate={{
                rotateZ: isMenuOpen ? 45 : 0,
                y: isMenuOpen ? 0 : -4
              }}
              className="w-6 h-0.5 bg-white absolute transition-all duration-300"
            />
            <motion.span
              animate={{ opacity: isMenuOpen ? 0 : 1 }}
              className="w-6 h-0.5 bg-white absolute transition-all duration-300"
            />
            <motion.span
              animate={{
                rotateZ: isMenuOpen ? -45 : 0,
                y: isMenuOpen ? 0 : 4
              }}
              className="w-6 h-0.5 bg-white absolute transition-all duration-300"
            />
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4 pb-4 border-t border-white/10"
            >
              <div className="flex flex-col space-y-4 pt-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`transition-colors duration-200 ${
                      location.pathname === item.path
                        ? 'text-blue-400'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <motion.span
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {item.label}
                    </motion.span>
                  </Link>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}

export default Header