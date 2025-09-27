import { Suspense, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import GameEnvironment3D from '../../components/3d/GameEnvironment3D'

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
    />
  </div>
)

const GamePage = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);

  const handleGameInteraction = (type: string, data?: any) => {
    console.log('Game interaction:', type, data);
    if (type === 'level_complete') {
      setScore(prev => prev + (data?.score || 1000));
      setLevel(prev => prev + 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen relative"
    >
      {/* Game Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute top-6 left-6 right-6 z-20 pointer-events-none"
      >
        <div className="container mx-auto">
          <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  VJ Career RPG
                </h1>
                <p className="text-sm text-gray-300">Professional Projection Mapping Simulator</p>
              </div>
              <div className="flex space-x-3">
                <div className="bg-black/30 rounded-lg px-3 py-1">
                  <span className="text-xs text-gray-300">Score: {score.toLocaleString()}</span>
                </div>
                <div className="bg-black/30 rounded-lg px-3 py-1">
                  <span className="text-xs text-gray-300">Level: {level}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Control Panel */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        className="absolute top-24 right-6 z-20 pointer-events-auto"
      >
        <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/10">
          <div className="space-y-3">
            <Link to="/portfolio">
              <Button size="sm" variant="outline" className="w-full">
                View Portfolio
              </Button>
            </Link>
            <Link to="/about">
              <Button size="sm" variant="ghost" className="w-full">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* 3D Game Environment - temporarily simplified */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mx-auto mb-6"
          />
          <h2 className="text-3xl font-bold text-white mb-4">VJ Career Experience</h2>
          <p className="text-gray-300">Interactive 3D Game Loading...</p>
          <div className="mt-8 space-y-2">
            <div className="text-blue-400">Level: {level}</div>
            <div className="text-purple-400">Score: {score}</div>
          </div>
        </div>
      </div>

      {/* Bottom Info Bar */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-6 left-6 right-6 z-20 pointer-events-none"
      >
        <div className="container mx-auto">
          <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <h3 className="text-lg font-semibold text-white mb-1">
                  VJ Career RPG - Level 1
                </h3>
                <p className="text-gray-400 text-sm">
                  Learn projection mapping basics with interactive kitchen cabinet tutorials
                </p>
              </div>

              <div className="flex items-center space-x-4 pointer-events-auto">
                <Link to="/">
                  <Button variant="ghost" size="sm">
                    ← Back Home
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="sm">
                    About the Game
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Particle effects overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => {
          const fixedX = (i * 50) % 1000; // Fixed X based on index
          const fixedY = (i * 40) % 800;  // Fixed Y based on index
          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30"
              animate={{
                x: [0, fixedX],
                y: [0, fixedY],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: (i % 8) + 5, // Fixed duration based on index
                repeat: Infinity,
                ease: "linear",
                delay: (i % 4) * 0.5   // Fixed delay based on index
              }}
              style={{
                left: (i * 5) % 100 + '%',    // Fixed position based on index
                top: (i * 3.7) % 100 + '%',   // Fixed position based on index
              }}
            />
          );
        })}
      </div>

      {/* Performance stats overlay (optional) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute top-24 left-6 z-10 pointer-events-none opacity-70"
      >
        <div className="text-xs text-gray-500 font-mono bg-black/10 rounded px-2 py-1">
          WebGL • Three.js • React Fiber
        </div>
      </motion.div>
    </motion.div>
  )
}

export default GamePage