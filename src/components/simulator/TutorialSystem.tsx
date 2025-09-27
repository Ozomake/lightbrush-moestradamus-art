import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TutorialStep {
  id: string
  title: string
  description: string
  content: React.ReactNode
  targetElement?: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: 'click' | 'hover' | 'input' | 'wait'
  validationFn?: () => boolean
}

interface Tutorial {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number // in minutes
  steps: TutorialStep[]
  category: 'basics' | 'advanced' | 'troubleshooting' | 'best-practices'
}

interface TutorialSystemProps {
  isVisible: boolean
  onClose: () => void
  onTutorialComplete?: (tutorialId: string) => void
}

const tutorials: Tutorial[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with Projection Mapping',
    description: 'Learn the basics of projection mapping setup and configuration',
    difficulty: 'beginner',
    estimatedTime: 10,
    category: 'basics',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to Projection Mapping!',
        description: 'Learn the fundamentals of projection mapping simulation',
        position: 'center',
        content: (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-purple-300">What is Projection Mapping?</h3>
            <p className="text-white/80">
              Projection mapping, also known as video mapping, is a technology used to project video
              onto irregularly shaped objects, turning common objects into display surfaces.
            </p>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">You'll learn:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-white/70">
                <li>How to select appropriate surfaces</li>
                <li>Projector positioning and settings</li>
                <li>Content selection and preparation</li>
                <li>Keystone correction and mapping</li>
                <li>Export your final configuration</li>
              </ul>
            </div>
          </div>
        )
      },
      {
        id: 'surface-selection',
        title: 'Step 1: Choose Your Surface',
        description: 'Select the object you want to project onto',
        targetElement: '[data-tutorial="surface-tab"]',
        position: 'bottom',
        action: 'click',
        content: (
          <div className="space-y-3">
            <p className="text-white/80">
              The surface you choose determines everything else about your projection setup.
            </p>
            <div className="bg-blue-500/10 rounded-lg p-3">
              <h4 className="font-medium text-blue-300 mb-2">Surface Types:</h4>
              <ul className="text-sm space-y-1 text-white/70">
                <li><strong>Buildings:</strong> Large, flat surfaces - easiest for beginners</li>
                <li><strong>Objects:</strong> 3D shapes with multiple faces - more complex</li>
                <li><strong>Vehicles:</strong> Curved surfaces - advanced mapping required</li>
              </ul>
            </div>
            <p className="text-sm text-white/60">
              👆 Click on the "Surface" tab to start selecting your projection target.
            </p>
          </div>
        )
      },
      {
        id: 'projector-setup',
        title: 'Step 2: Position Your Projector',
        description: 'Configure projector location and optics',
        targetElement: '[data-tutorial="projector-tab"]',
        position: 'bottom',
        action: 'click',
        content: (
          <div className="space-y-3">
            <p className="text-white/80">
              Projector positioning is critical for image quality and coverage.
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-green-500/10 rounded p-2">
                <h5 className="font-medium text-green-300">Good Position:</h5>
                <ul className="text-white/70 text-xs mt-1">
                  <li>• Perpendicular to surface</li>
                  <li>• Adequate throw distance</li>
                  <li>• Minimal keystone needed</li>
                </ul>
              </div>
              <div className="bg-red-500/10 rounded p-2">
                <h5 className="font-medium text-red-300">Avoid:</h5>
                <ul className="text-white/70 text-xs mt-1">
                  <li>• Extreme angles (&gt;30°)</li>
                  <li>• Too close/far</li>
                  <li>• Obstructed view</li>
                </ul>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'content-selection',
        title: 'Step 3: Choose Your Content',
        description: 'Select images, videos, or patterns to project',
        targetElement: '[data-tutorial="content-tab"]',
        position: 'bottom',
        action: 'click',
        content: (
          <div className="space-y-3">
            <p className="text-white/80">
              Content choice affects both visual impact and technical requirements.
            </p>
            <div className="bg-purple-500/10 rounded-lg p-3">
              <h4 className="font-medium text-purple-300 mb-2">Content Guidelines:</h4>
              <ul className="text-sm space-y-1 text-white/70">
                <li><strong>Resolution:</strong> Match projector capability</li>
                <li><strong>Contrast:</strong> High contrast works best</li>
                <li><strong>Colors:</strong> Consider surface color</li>
                <li><strong>Motion:</strong> Smooth motion reduces artifacts</li>
              </ul>
            </div>
          </div>
        )
      },
      {
        id: 'mapping-tools',
        title: 'Step 4: Fine-tune Your Mapping',
        description: 'Use keystone correction and edge blending',
        targetElement: '[data-tutorial="mapping-tab"]',
        position: 'bottom',
        action: 'click',
        content: (
          <div className="space-y-3">
            <p className="text-white/80">
              Mapping tools help correct distortion and optimize image quality.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-yellow-400">🔧</span>
                <div>
                  <strong>Keystone Correction:</strong> Fixes perspective distortion
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400">🌐</span>
                <div>
                  <strong>Edge Blending:</strong> Smooths brightness at edges
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400">📽️</span>
                <div>
                  <strong>Multi-projector:</strong> Setup multiple projectors
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'export-setup',
        title: 'Step 5: Export Your Configuration',
        description: 'Save and share your projection setup',
        targetElement: '[data-tutorial="export-tab"]',
        position: 'bottom',
        action: 'click',
        content: (
          <div className="space-y-3">
            <p className="text-white/80">
              Export your setup for use in professional projection mapping software.
            </p>
            <div className="bg-green-500/10 rounded-lg p-3">
              <h4 className="font-medium text-green-300 mb-2">Export Options:</h4>
              <ul className="text-sm space-y-1 text-white/70">
                <li>• Configuration files for software import</li>
                <li>• Equipment recommendations and costs</li>
                <li>• Setup diagrams and documentation</li>
                <li>• Social media sharing</li>
              </ul>
            </div>
            <p className="text-xs text-white/60">
              Pro tip: Always export your configuration before making major changes!
            </p>
          </div>
        )
      }
    ]
  },
  {
    id: 'advanced-mapping',
    title: 'Advanced Mapping Techniques',
    description: 'Master complex projection scenarios and multi-projector setups',
    difficulty: 'advanced',
    estimatedTime: 20,
    category: 'advanced',
    steps: [
      {
        id: 'multi-projector-intro',
        title: 'Multi-Projector Systems',
        description: 'Learn when and how to use multiple projectors',
        position: 'center',
        content: (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-purple-300">When to Use Multiple Projectors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-500/10 rounded-lg p-4">
                <h4 className="font-medium text-blue-300 mb-2">Large Surfaces</h4>
                <p className="text-sm text-white/70">
                  Surfaces wider than 15m typically need multiple projectors for adequate brightness and resolution.
                </p>
              </div>
              <div className="bg-green-500/10 rounded-lg p-4">
                <h4 className="font-medium text-green-300 mb-2">Complex Geometry</h4>
                <p className="text-sm text-white/70">
                  3D objects with multiple faces often require projectors from different angles.
                </p>
              </div>
              <div className="bg-purple-500/10 rounded-lg p-4">
                <h4 className="font-medium text-purple-300 mb-2">High Resolution</h4>
                <p className="text-sm text-white/70">
                  8K+ content may require multiple 4K projectors with edge blending.
                </p>
              </div>
              <div className="bg-orange-500/10 rounded-lg p-4">
                <h4 className="font-medium text-orange-300 mb-2">Brightness Requirements</h4>
                <p className="text-sm text-white/70">
                  Outdoor or high-ambient environments need combined brightness from multiple units.
                </p>
              </div>
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Common Issues & Solutions',
    description: 'Diagnose and fix projection mapping problems',
    difficulty: 'intermediate',
    estimatedTime: 15,
    category: 'troubleshooting',
    steps: [
      {
        id: 'image-distortion',
        title: 'Fixing Image Distortion',
        description: 'Common causes and solutions for distorted projections',
        position: 'center',
        content: (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-red-300">Image Distortion Problems</h3>
            <div className="space-y-3">
              {[
                {
                  problem: 'Keystone Distortion',
                  cause: 'Projector not perpendicular to surface',
                  solution: 'Adjust projector angle or use keystone correction',
                  severity: 'common'
                },
                {
                  problem: 'Barrel/Pincushion',
                  cause: 'Lens distortion or extreme angles',
                  solution: 'Use lens correction settings or reposition projector',
                  severity: 'moderate'
                },
                {
                  problem: 'Focus Issues',
                  cause: 'Surface not at uniform distance',
                  solution: 'Adjust focus zones or use shorter throw lens',
                  severity: 'common'
                },
                {
                  problem: 'Color Shifting',
                  cause: 'Surface material or ambient light',
                  solution: 'Adjust color correction or use brighter projector',
                  severity: 'rare'
                }
              ].map((issue, index) => (
                <div key={index} className={`border-l-4 pl-4 ${
                  issue.severity === 'common' ? 'border-red-500' :
                  issue.severity === 'moderate' ? 'border-yellow-500' : 'border-blue-500'
                }`}>
                  <h4 className="font-medium text-white">{issue.problem}</h4>
                  <p className="text-sm text-white/70">Cause: {issue.cause}</p>
                  <p className="text-sm text-white/90">Solution: {issue.solution}</p>
                </div>
              ))}
            </div>
          </div>
        )
      }
    ]
  }
]

const TutorialSystem: React.FC<TutorialSystemProps> = ({
  isVisible,
  onClose,
  onTutorialComplete
}) => {
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([])

  const currentStep = selectedTutorial?.steps[currentStepIndex]

  const handleTutorialSelect = useCallback((tutorial: Tutorial) => {
    setSelectedTutorial(tutorial)
    setCurrentStepIndex(0)
  }, [])

  const handleNextStep = useCallback(() => {
    if (!selectedTutorial) return

    if (currentStepIndex < selectedTutorial.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
    } else {
      // Tutorial completed
      setCompletedTutorials(prev => [...prev, selectedTutorial.id])
      onTutorialComplete?.(selectedTutorial.id)
      setSelectedTutorial(null)
      setCurrentStepIndex(0)
    }
  }, [selectedTutorial, currentStepIndex, onTutorialComplete])

  const handlePrevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }, [currentStepIndex])

  const handleSkipTutorial = useCallback(() => {
    setSelectedTutorial(null)
    setCurrentStepIndex(0)
  }, [])

  if (!isVisible) return null

  return (
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
        className="bg-slate-800 rounded-xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">
            {selectedTutorial ? selectedTutorial.title : 'Interactive Tutorials'}
          </h2>
          <button
            onClick={selectedTutorial ? handleSkipTutorial : onClose}
            className="text-white/60 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!selectedTutorial ? (
            /* Tutorial Selection */
            <div className="p-6">
              <div className="mb-6">
                <p className="text-white/80">
                  Learn projection mapping with our interactive tutorials. Each tutorial guides you
                  through real scenarios with hands-on practice.
                </p>
              </div>

              {/* Tutorial Categories */}
              {Object.entries(
                tutorials.reduce((groups, tutorial) => {
                  if (!groups[tutorial.category]) groups[tutorial.category] = []
                  groups[tutorial.category].push(tutorial)
                  return groups
                }, {} as Record<string, Tutorial[]>)
              ).map(([category, categoryTutorials]) => (
                <div key={category} className="mb-8">
                  <h3 className="text-lg font-semibold text-white/90 mb-4 capitalize">
                    {category.replace('-', ' ')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryTutorials.map((tutorial) => (
                      <motion.div
                        key={tutorial.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white/5 rounded-lg p-4 cursor-pointer border border-white/10 hover:border-purple-400/40 transition-colors"
                        onClick={() => handleTutorialSelect(tutorial)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-white">{tutorial.title}</h4>
                          {completedTutorials.includes(tutorial.id) && (
                            <span className="text-green-400 text-sm">✓</span>
                          )}
                        </div>

                        <p className="text-sm text-white/70 mb-3">
                          {tutorial.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              tutorial.difficulty === 'beginner'
                                ? 'bg-green-500/20 text-green-300'
                                : tutorial.difficulty === 'intermediate'
                                ? 'bg-yellow-500/20 text-yellow-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}>
                              {tutorial.difficulty}
                            </span>
                            <span className="text-xs text-white/60">
                              ~{tutorial.estimatedTime} min
                            </span>
                          </div>
                          <span className="text-xs text-white/50">
                            {tutorial.steps.length} steps
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Tutorial Content */
            <div className="p-6">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/70">
                    Step {currentStepIndex + 1} of {selectedTutorial.steps.length}
                  </span>
                  <span className="text-sm text-white/70">
                    {Math.round(((currentStepIndex + 1) / selectedTutorial.steps.length) * 100)}% Complete
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStepIndex + 1) / selectedTutorial.steps.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                {currentStep && (
                  <motion.div
                    key={currentStep.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-xl font-bold text-white mb-2">
                      {currentStep.title}
                    </h3>
                    <p className="text-white/80 mb-4">
                      {currentStep.description}
                    </p>
                    <div className="bg-white/5 rounded-lg p-4 mb-6">
                      {currentStep.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedTutorial && (
          <div className="flex items-center justify-between p-6 border-t border-white/10">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSkipTutorial}
                className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
              >
                Skip Tutorial
              </button>
              <button
                onClick={handleNextStep}
                className="px-6 py-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-colors"
              >
                {currentStepIndex === selectedTutorial.steps.length - 1 ? 'Complete' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default TutorialSystem