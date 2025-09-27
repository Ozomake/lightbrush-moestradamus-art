import { useState, useRef, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Vector3 } from 'three'
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import Surface3D from './Surface3D'
import ProjectorControls from './ProjectorControls'
import ContentLibrary from './ContentLibrary'
import MappingTools from './MappingTools'
import ExportPanel from './ExportPanel'
import TutorialSystem from './TutorialSystem'
import { calculateProjection, type ProjectionConfig, type ProjectorSettings } from '../../utils/projectionMath'
import { type SurfaceType, type SurfacePreset, surfacePresets } from '../../utils/surfaceMapping'

export interface SimulatorState {
  selectedSurface: SurfaceType
  surfacePreset: SurfacePreset
  projectorSettings: ProjectorSettings
  selectedContent: string | null
  mappingMode: 'keystone' | 'edge-blend' | 'multi-projector'
  showTutorial: boolean
  exportConfig: ProjectionConfig | null
}

const ProjectionSimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeTab, setActiveTab] = useState<'surface' | 'projector' | 'content' | 'mapping' | 'export'>('surface')
  const [simulatorState, setSimulatorState] = useState<SimulatorState>({
    selectedSurface: 'building',
    surfacePreset: surfacePresets.building.modern,
    projectorSettings: {
      position: new Vector3(0, 5, 10),
      rotation: new Vector3(-15, 0, 0),
      fov: 45,
      throw_ratio: 1.2,
      brightness: 3000,
      resolution: { width: 1920, height: 1080 },
      lens_shift: { horizontal: 0, vertical: 0 }
    },
    selectedContent: null,
    mappingMode: 'keystone',
    showTutorial: false,
    exportConfig: null
  })

  const [isSimulating, setIsSimulating] = useState(false)
  const [projectionConfig, setProjectionConfig] = useState<ProjectionConfig | null>(null)

  // Calculate projection when settings change
  useEffect(() => {
    if (simulatorState.selectedContent && simulatorState.projectorSettings) {
      const config = calculateProjection(
        simulatorState.projectorSettings,
        simulatorState.surfacePreset.geometry
      )
      setProjectionConfig(config)
    }
  }, [simulatorState.projectorSettings, simulatorState.surfacePreset, simulatorState.selectedContent])

  const handleSurfaceChange = useCallback((surface: SurfaceType, preset: SurfacePreset) => {
    setSimulatorState(prev => ({
      ...prev,
      selectedSurface: surface,
      surfacePreset: preset
    }))
  }, [])

  const handleProjectorChange = useCallback((settings: ProjectorSettings) => {
    setSimulatorState(prev => ({
      ...prev,
      projectorSettings: settings
    }))
  }, [])

  const handleContentSelect = useCallback((contentId: string) => {
    setSimulatorState(prev => ({
      ...prev,
      selectedContent: contentId
    }))
  }, [])

  const handleStartSimulation = useCallback(() => {
    setIsSimulating(true)
  }, [])

  // const handleExportConfig = useCallback(() => {
  //   if (projectionConfig) {
  //     setSimulatorState(prev => ({
  //       ...prev,
  //       exportConfig: projectionConfig
  //     }))
  //     setActiveTab('export')
  //   }
  // }, [projectionConfig])

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
                onClick={() => setSimulatorState(prev => ({ ...prev, showTutorial: !prev.showTutorial }))}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Tutorial
              </button>
              <button
                onClick={handleStartSimulation}
                disabled={!simulatorState.selectedContent}
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
          {/* 3D Viewport */}
          <div className="lg:col-span-2 bg-black/40 rounded-xl border border-white/10 overflow-hidden">
            <div className="h-[600px]">
              <Canvas ref={canvasRef}>
                <PerspectiveCamera makeDefault position={[10, 10, 10]} />
                <OrbitControls enablePan enableZoom enableRotate />
                <Environment preset="studio" />

                <ambientLight intensity={0.3} />
                <directionalLight position={[10, 10, 5]} intensity={0.5} />

                <Surface3D
                  surface={simulatorState.selectedSurface}
                  preset={simulatorState.surfacePreset}
                  projectionConfig={projectionConfig}
                  selectedContent={simulatorState.selectedContent}
                  isSimulating={isSimulating}
                />

                {/* Projector visualization */}
                <mesh position={[
                  simulatorState.projectorSettings.position.x,
                  simulatorState.projectorSettings.position.y,
                  simulatorState.projectorSettings.position.z
                ]}>
                  <boxGeometry args={[0.3, 0.2, 0.4]} />
                  <meshStandardMaterial color="#444" />
                </mesh>
              </Canvas>
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
                  data-tutorial={`${tab.id}-tab`}
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
                >
                  <Surface3D.Controls
                    selectedSurface={simulatorState.selectedSurface}
                    selectedPreset={simulatorState.surfacePreset}
                    onSurfaceChange={handleSurfaceChange}
                  />
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
                >
                  <ProjectorControls
                    settings={simulatorState.projectorSettings}
                    onChange={handleProjectorChange}
                    projectionConfig={projectionConfig}
                  />
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
                >
                  <ContentLibrary
                    selectedContent={simulatorState.selectedContent}
                    onContentSelect={handleContentSelect}
                  />
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
                >
                  <MappingTools
                    mode={simulatorState.mappingMode}
                    projectorSettings={simulatorState.projectorSettings}
                    surfaceGeometry={simulatorState.surfacePreset.geometry}
                    onSettingsChange={handleProjectorChange}
                  />
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
                >
                  <ExportPanel
                    projectionConfig={projectionConfig}
                    projectorSettings={simulatorState.projectorSettings}
                    surfacePreset={simulatorState.surfacePreset}
                    selectedContent={simulatorState.selectedContent}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Tutorial System */}
      <TutorialSystem
        isVisible={simulatorState.showTutorial}
        onClose={() => setSimulatorState(prev => ({ ...prev, showTutorial: false }))}
        onTutorialComplete={(tutorialId) => {
          console.log('Tutorial completed:', tutorialId)
          setSimulatorState(prev => ({ ...prev, showTutorial: false }))
        }}
      />
    </div>
  )
}

export default ProjectionSimulator