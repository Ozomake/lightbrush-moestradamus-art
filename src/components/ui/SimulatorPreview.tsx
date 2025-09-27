import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const SimulatorPreview: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            Projection Mapping Simulator
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Professional-grade simulation tool for planning and testing projection mapping setups
            before installation. Experiment with surfaces, projector placement, and content.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: '🏢', title: 'Surface Types', description: 'Buildings, objects, vehicles' },
                { icon: '📽️', title: 'Projector Setup', description: 'Position, optics, settings' },
                { icon: '🎨', title: 'Content Library', description: 'Images, videos, patterns' },
                { icon: '🔧', title: 'Mapping Tools', description: 'Keystone, edge blending' },
                { icon: '📊', title: 'Analysis', description: 'Coverage, brightness, validation' },
                { icon: '💾', title: 'Export', description: 'Professional formats, equipment lists' }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-white/10"
                >
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-6 border border-blue-500/20"
            >
              <h3 className="text-lg font-semibold text-blue-300 mb-3">Why Use the Simulator?</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Save time and money by testing setups virtually</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Generate equipment lists and cost estimates</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Export configurations to professional software</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Learn best practices with interactive tutorials</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>

          {/* Preview/CTA */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl p-8 backdrop-blur-sm border border-white/10">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-4xl">
                🎯
              </div>

              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Start Planning?
              </h3>

              <p className="text-gray-300 mb-6">
                Launch the interactive simulator and start designing your projection mapping setup with professional tools and guidance.
              </p>

              <div className="space-y-4">
                <Link to="/simulator">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold text-white transition-all duration-300 shadow-lg shadow-purple-500/25"
                  >
                    Launch Simulator
                  </motion.button>
                </Link>

                <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="text-green-400">●</span>
                    Free to use
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-blue-400">●</span>
                    No signup required
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-purple-400">●</span>
                    Professional results
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default SimulatorPreview