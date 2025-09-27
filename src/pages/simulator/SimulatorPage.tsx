import { motion } from 'framer-motion'
// import { Suspense } from 'react' // Commented out to fix unused import
// import ProjectionMappingSimulator from '../../components/3d/ProjectionMappingSimulator' // Commented out to fix unused import

const SimulatorPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900"
    >
      <div className="container mx-auto px-6 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Professional Simulator
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Experience our cutting-edge projection mapping simulator. Plan, test, and visualize
            your installations in a fully interactive 3D environment.
          </p>
        </motion.div>

        {/* 3D Simulator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          {/* Temporarily show a placeholder while we fix 3D */}
          <div className="flex items-center justify-center h-[80vh] bg-gray-900 rounded-lg">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-gray-300">Advanced 3D Simulator Coming Soon</p>
              <p className="text-sm text-gray-500 mt-2">We're optimizing the experience</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default SimulatorPage