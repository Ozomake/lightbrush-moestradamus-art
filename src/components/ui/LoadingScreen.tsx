import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'

const LoadingScreen = () => {
  const [loadingText, setLoadingText] = useState('Initializing...')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const steps = [
      { text: 'Initializing...', duration: 800 },
      { text: 'Loading shaders...', duration: 600 },
      { text: 'Preparing canvas...', duration: 500 },
      { text: 'Calibrating projectors...', duration: 700 },
      { text: 'Almost ready...', duration: 500 },
    ]

    let currentStep = 0
    let currentProgress = 0

    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setLoadingText(steps[currentStep].text)

        const stepProgress = (currentStep + 1) / steps.length * 100
        const progressInterval = setInterval(() => {
          currentProgress += 2
          if (currentProgress >= stepProgress) {
            clearInterval(progressInterval)
            currentStep++
          } else {
            setProgress(currentProgress)
          }
        }, steps[currentStep].duration / 50)

        setTimeout(() => {
          clearInterval(progressInterval)
        }, steps[currentStep].duration)
      }
    }, 800)

    return () => clearInterval(interval)
  }, [])

  // Generate particle positions - memoize to prevent infinite re-renders
  const particles = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: ((i * 7) % 100), // Fixed position based on index
    y: ((i * 11) % 100), // Fixed position based on index
    size: 1 + ((i % 4)), // Fixed size based on index (1-4)
    delay: (i % 20) / 10, // Fixed delay based on index (0-2)
  })), [])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center overflow-hidden"
      >
        {/* Animated background gradient */}
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(120,119,198,0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(168,85,247,0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 20%, rgba(59,130,246,0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 80%, rgba(168,85,247,0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(120,119,198,0.2) 0%, transparent 50%)',
            ]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0"
        />

        {/* Particles */}
        <div className="absolute inset-0">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
              }}
              animate={{
                background: [
                  'rgba(59, 130, 246, 0.8)',
                  'rgba(168, 85, 247, 0.8)',
                  'rgba(236, 72, 153, 0.8)',
                  'rgba(59, 130, 246, 0.8)',
                ],
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
                boxShadow: [
                  '0 0 10px rgba(59, 130, 246, 0.5)',
                  '0 0 20px rgba(168, 85, 247, 0.8)',
                  '0 0 10px rgba(236, 72, 153, 0.5)',
                  '0 0 10px rgba(59, 130, 246, 0.5)',
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: particle.delay,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Central content */}
        <div className="relative z-10 text-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              duration: 1,
              type: "spring",
              stiffness: 200,
              damping: 15
            }}
            className="mb-8 flex justify-center"
          >
            <div className="relative">
              <motion.div
                animate={{
                  rotate: 360,
                  boxShadow: [
                    '0 0 30px rgba(59, 130, 246, 0.5)',
                    '0 0 60px rgba(168, 85, 247, 1)',
                    '0 0 30px rgba(59, 130, 246, 0.5)',
                  ]
                }}
                transition={{
                  rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                  boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 bg-white rounded-lg transform rotate-12"
                />
              </motion.div>

              {/* Orbit rings */}
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  className="absolute inset-0 border border-white/20 rounded-full"
                  style={{
                    width: `${100 + ring * 20}px`,
                    height: `${100 + ring * 20}px`,
                    left: `${-10 * ring}px`,
                    top: `${-10 * ring}px`,
                  }}
                  animate={{ rotate: ring % 2 === 0 ? 360 : -360 }}
                  transition={{
                    duration: 6 + ring * 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Brand name */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6"
          >
            Lightbrush
          </motion.h1>

          {/* Loading text */}
          <motion.p
            key={loadingText}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-gray-300 text-lg mb-8"
          >
            {loadingText}
          </motion.p>

          {/* Progress bar */}
          <div className="w-80 max-w-xs mx-auto">
            <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />

              {/* Shimmer effect */}
              <motion.div
                className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: [-80, 320] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-gray-400 text-sm mt-2 text-center"
            >
              {Math.round(progress)}% Complete
            </motion.p>
          </div>

          {/* Pulsing dots */}
          <div className="flex justify-center space-x-1 mt-8">
            {[0, 1, 2].map((dot) => (
              <motion.div
                key={dot}
                className="w-2 h-2 bg-blue-400 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: dot * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </motion.div>
    </AnimatePresence>
  )
}

export default LoadingScreen