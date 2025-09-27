import { motion } from 'framer-motion'
import { type ReactNode, useMemo } from 'react'
import Header from './Header'
import Footer from './Footer'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  // Memoize particle data to prevent infinite re-renders
  const particles = useMemo(() => {
    return [...Array(50)].map((_, i) => ({
      key: i,
      endX: ((i * 13) % 100) * (typeof window !== 'undefined' ? window.innerWidth / 100 : 10),
      endY: ((i * 17) % 100) * (typeof window !== 'undefined' ? window.innerHeight / 100 : 10),
      duration: 10 + ((i % 10) * 2), // 10-30 seconds
      left: ((i * 7) % 100),
      top: ((i * 11) % 100)
    }))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white overflow-x-hidden">
      {/* Particle Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent)]"></div>
        <div className="absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0deg,rgba(120,119,198,0.05)_90deg,transparent_180deg,rgba(120,119,198,0.05)_270deg,transparent_360deg)]"></div>
      </div>

      {/* Animated background particles */}
      <div className="fixed inset-0 z-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.key}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-20"
            animate={{
              x: [0, particle.endX],
              y: [0, particle.endY],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              left: particle.left + '%',
              top: particle.top + '%',
            }}
          />
        ))}
      </div>

      <Header />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 min-h-screen pt-16"
      >
        {children}
      </motion.main>

      <Footer />
    </div>
  )
}

export default Layout