import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const BasicProjectionSimulator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'surface' | 'projector' | 'content' | 'mapping' | 'export'>('surface')
  const [showTutorial, setShowTutorial] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)

  const [selectedSurface, setSelectedSurface] = useState('building-modern')
  const [selectedContent, setSelectedContent] = useState<string | null>(null)
  const [projectorSettings, setProjectorSettings] = useState({
    position: { x: 0, y: 5, z: 10 },
    rotation: { x: -15, y: 0, z: 0 },
    fov: 45,
    throw_ratio: 1.2,
    brightness: 3000,
    resolution: { width: 1920, height: 1080 }
  })

  const surfaces = [
    { id: 'building-modern', name: 'Modern Building', category: 'Building', difficulty: 'Beginner' },
    { id: 'building-historic', name: 'Historic Building', category: 'Building', difficulty: 'Advanced' },
    { id: 'object-sphere', name: 'Sphere', category: 'Object', difficulty: 'Advanced' },
    { id: 'vehicle-car', name: 'Car', category: 'Vehicle', difficulty: 'Intermediate' }
  ]

  const contentLibrary = [
    { id: 'arch-blueprint', name: 'Building Blueprint', type: 'Image', category: 'Architectural' },
    { id: 'art-abstract', name: 'Abstract Flow', type: 'Animation', category: 'Artistic' },
    { id: 'geo-tessellation', name: 'Tessellation', type: 'Pattern', category: 'Geometric' },
    { id: 'nature-forest', name: 'Forest Scene', type: 'Video', category: 'Nature' }
  ]

  const handleStartSimulation = useCallback(() => {
    setIsSimulating(!isSimulating)
  }, [isSimulating])

  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Projection Mapping Simulator
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowTutorial(!showTutorial)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Tutorial
              </button>
              <button
                onClick={handleStartSimulation}
                disabled={!selectedContent}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSimulating ? 'Stop Simulation' : 'Start Simulation'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* 3D Viewport Placeholder */}
          <div className="lg:col-span-2 bg-black/40 rounded-xl border border-white/10 overflow-hidden">
            <div className="h-[600px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center text-4xl border border-white/10">
                  🎯
                </div>
                <h3 className="text-xl font-semibold mb-2">3D Viewport</h3>
                <p className="text-white/60 max-w-md">
                  {isSimulating
                    ? `Simulating projection on ${surfaces.find(s => s.id === selectedSurface)?.name || 'selected surface'}`
                    : 'Configure your setup and click "Start Simulation" to preview'
                  }
                </p>
                {selectedContent && (
                  <div className="mt-4 p-3 bg-white/5 rounded-lg">
                    <p className="text-sm text-white/80">
                      Content: {contentLibrary.find(c => c.id === selectedContent)?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-white/60">
                      Surface: {surfaces.find(s => s.id === selectedSurface)?.name || 'Unknown'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="bg-black/40 rounded-xl border border-white/10 p-6">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { id: 'surface', label: 'Surface' },
                { id: 'projector', label: 'Projector' },
                { id: 'content', label: 'Content' },
                { id: 'mapping', label: 'Mapping' },
                { id: 'export', label: 'Export' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'surface' && (
                <motion.div
                  key="surface"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold">Surface Selection</h3>
                  <div className="space-y-2">
                    {surfaces.map((surface) => (
                      <button
                        key={surface.id}
                        onClick={() => setSelectedSurface(surface.id)}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${
                          selectedSurface === surface.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{surface.name}</div>
                            <div className="text-sm opacity-70">{surface.category}</div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded ${
                            surface.difficulty === 'Beginner'
                              ? 'bg-green-500/20 text-green-300'
                              : surface.difficulty === 'Intermediate'
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}>
                            {surface.difficulty}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'projector' && (
                <motion.div
                  key="projector"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold">Projector Settings</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-white/70 mb-1">Position</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['x', 'y', 'z'].map((axis) => (
                          <div key={axis}>
                            <span className="text-xs text-white/60">{axis.toUpperCase()}</span>
                            <input
                              type="range"
                              min={axis === 'y' ? 0 : -20}
                              max="20"
                              step="0.1"
                              value={projectorSettings.position[axis as keyof typeof projectorSettings.position]}
                              onChange={(e) => setProjectorSettings(prev => ({
                                ...prev,
                                position: { ...prev.position, [axis]: parseFloat(e.target.value) }
                              }))}
                              className="w-full"
                            />
                            <div className="text-xs text-center text-white/50">
                              {projectorSettings.position[axis as keyof typeof projectorSettings.position].toFixed(1)}m
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-white/70 mb-1">Brightness</label>
                      <input
                        type="range"
                        min="1000"
                        max="10000"
                        step="100"
                        value={projectorSettings.brightness}
                        onChange={(e) => setProjectorSettings(prev => ({
                          ...prev,
                          brightness: parseInt(e.target.value)
                        }))}
                        className="w-full"
                      />
                      <div className="text-xs text-white/60">{projectorSettings.brightness} lumens</div>
                    </div>

                    <div>
                      <label className="block text-sm text-white/70 mb-1">Field of View</label>
                      <input
                        type="range"
                        min="20"
                        max="120"
                        step="1"
                        value={projectorSettings.fov}
                        onChange={(e) => setProjectorSettings(prev => ({
                          ...prev,
                          fov: parseInt(e.target.value)
                        }))}
                        className="w-full"
                      />
                      <div className="text-xs text-white/60">{projectorSettings.fov}°</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'content' && (
                <motion.div
                  key="content"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold">Content Library</h3>
                  <div className="space-y-2">
                    {contentLibrary.map((content) => (
                      <button
                        key={content.id}
                        onClick={() => setSelectedContent(content.id)}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${
                          selectedContent === content.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{content.name}</div>
                            <div className="text-sm opacity-70">{content.category}</div>
                          </div>
                          <span className="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-300">
                            {content.type}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'mapping' && (
                <motion.div
                  key="mapping"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold">Mapping Tools</h3>
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Keystone Correction</h4>
                      <p className="text-sm text-white/60 mb-3">
                        Adjust perspective distortion caused by projector angle
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button className="px-3 py-2 bg-white/10 rounded text-sm hover:bg-white/20 transition-colors">
                          Auto Correct
                        </button>
                        <button className="px-3 py-2 bg-white/10 rounded text-sm hover:bg-white/20 transition-colors">
                          Manual Adjust
                        </button>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Edge Blending</h4>
                      <p className="text-sm text-white/60 mb-3">
                        Smooth transitions for multi-projector setups
                      </p>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Enable edge blending</span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'export' && (
                <motion.div
                  key="export"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold">Export & Share</h3>

                  {selectedContent ? (
                    <div className="space-y-4">
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                        <h4 className="font-medium text-green-300 mb-2">Setup Ready</h4>
                        <p className="text-sm text-white/80">
                          Surface: {surfaces.find(s => s.id === selectedSurface)?.name}<br/>
                          Content: {contentLibrary.find(c => c.id === selectedContent)?.name}<br/>
                          Brightness: {projectorSettings.brightness} lumens
                        </p>
                      </div>

                      <div className="space-y-2">
                        <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm">
                          💾 Export Configuration
                        </button>
                        <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm">
                          🛠️ Equipment List
                        </button>
                        <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm">
                          📱 Share Setup
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                      <p className="text-yellow-300 text-sm">
                        Select a surface and content to export your configuration.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Simple Tutorial Modal */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-slate-800 rounded-xl p-8 max-w-2xl mx-4 border border-white/20"
            >
              <h2 className="text-2xl font-bold mb-4">How to Use the Simulator</h2>
              <div className="space-y-4 text-sm text-white/80">
                <div className="flex items-start gap-3">
                  <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">1</span>
                  <div>
                    <strong>Select a Surface:</strong> Choose from buildings, objects, or vehicles
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">2</span>
                  <div>
                    <strong>Position Projector:</strong> Adjust location, angle, and settings
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">3</span>
                  <div>
                    <strong>Choose Content:</strong> Select from our library of patterns and visuals
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">4</span>
                  <div>
                    <strong>Fine-tune Mapping:</strong> Use keystone correction and edge blending
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">5</span>
                  <div>
                    <strong>Export & Share:</strong> Save your configuration and get equipment lists
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowTutorial(false)}
                className="mt-6 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BasicProjectionSimulator