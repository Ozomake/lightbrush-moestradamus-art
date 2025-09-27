import { useRef, useState, useEffect, useCallback } from 'react'
import { useFrame, useThree, extend } from '@react-three/fiber'
import { Text, Html, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { useGameStore } from '../stores/gameStore'
import KitchenScene from './scenes/KitchenScene'
import KitchenCabinet from '../entities/KitchenCabinet'
import Projector from '../entities/Projector'
import PatternGenerator from '../utils/PatternGenerator'
import { ProjectionShaderMaterial } from '../shaders/ProjectionShader'

// Tutorial steps
const TUTORIAL_STEPS = [
  {
    title: "Welcome to Level 1!",
    description: "Learn the basics of projection mapping on kitchen cabinets. Click anywhere to continue.",
    position: [0, 2, 0] as [number, number, number]
  },
  {
    title: "Meet Your Projector",
    description: "This is your projection device. Drag it around to position it for optimal coverage.",
    position: [2, 2, 4] as [number, number, number]
  },
  {
    title: "Select a Pattern",
    description: "Choose from basic geometric patterns. Start with simple shapes to learn the fundamentals.",
    position: [-2, 2, 4] as [number, number, number]
  },
  {
    title: "Aim at the Cabinets",
    description: "Position your projector to illuminate the cabinet doors. Watch for the projection preview.",
    position: [0, 1, 2] as [number, number, number]
  },
  {
    title: "Perfect Your Mapping",
    description: "Adjust position and rotation until the pattern aligns perfectly with the cabinet surface.",
    position: [0, 3, 3] as [number, number, number]
  }
]

// Extend Three.js objects for React Three Fiber
extend({ ProjectionShaderMaterial })

const Level1Kitchen = () => {
  const { camera, scene, gl } = useThree()
  const [kitchenScene] = useState(() => new KitchenScene())
  const [cabinets, setCabinets] = useState<KitchenCabinet[]>([])
  const [projector, setProjector] = useState<Projector | null>(null)
  const [patternGenerator] = useState(() => new PatternGenerator(512))
  const [patterns, setPatterns] = useState<Map<string, THREE.Texture>>(new Map())
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredCabinet, setHoveredCabinet] = useState<number | null>(null)
  const [showTutorial, setShowTutorial] = useState(true)

  const timeRef = useRef(0)
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())

  // Game store
  const {
    tutorialStep,
    tutorialCompleted,
    projectorPosition,
    projectorRotation,
    selectedPattern,
    projectionParameters,
    setTutorialStep,
    completeTutorial,
    updateProjectorPosition,
    updateProjectorRotation,
    selectPattern,
    addExperience,
    unlockAchievement,
    setLevelProgress
  } = useGameStore()

  // Initialize the kitchen scene
  useEffect(() => {
    // Add kitchen scene to main scene
    scene.add(kitchenScene.getScene())

    // Create cabinets
    const cabinetConfigs = [
      // Base cabinets
      { position: new THREE.Vector3(-2.5, 0.4, -3.5), isUpper: false, index: 0, doorCount: 2 },
      { position: new THREE.Vector3(0, 0.4, -3.5), isUpper: false, index: 1, doorCount: 2 },
      { position: new THREE.Vector3(2.5, 0.4, -3.5), isUpper: false, index: 2, doorCount: 2 },
      // Upper cabinets
      { position: new THREE.Vector3(-2, 2.2, -3.3), isUpper: true, index: 3, doorCount: 2 },
      { position: new THREE.Vector3(0, 2.2, -3.3), isUpper: true, index: 4, doorCount: 2 },
      { position: new THREE.Vector3(2, 2.2, -3.3), isUpper: true, index: 5, doorCount: 2 }
    ]

    const newCabinets = cabinetConfigs.map(config => new KitchenCabinet(config))
    newCabinets.forEach(cabinet => scene.add(cabinet.getGroup()))
    setCabinets(newCabinets)

    // Create projector
    const newProjector = new Projector({
      position: new THREE.Vector3(...projectorPosition),
      rotation: new THREE.Euler(...projectorRotation),
      fov: 60,
      aspect: 1.0,
      near: 0.1,
      far: 20,
      intensity: 1.0
    })

    scene.add(newProjector.getGroup())
    scene.add(newProjector.getLight())
    scene.add(newProjector.getLight().target)
    if (newProjector.getFrustumHelper()) {
      scene.add(newProjector.getFrustumHelper()!)
    }
    setProjector(newProjector)

    // Generate patterns
    const patternMap = new Map<string, THREE.Texture>()

    // Basic patterns for level 1
    patternMap.set('simple-square', patternGenerator.generateSquarePattern('#ffffff', 0.6))
    patternMap.set('circle', patternGenerator.generateCirclePattern('#00ff88', 0.6))
    patternMap.set('triangle', patternGenerator.generateTrianglePattern('#ff6b6b', 0.6))
    patternMap.set('diamond', patternGenerator.generateDiamondPattern('#4ecdc4', 0.6))
    patternMap.set('hexagon', patternGenerator.generateHexagonPattern('#ffeaa7', 0.6))

    setPatterns(patternMap)

    return () => {
      // Cleanup
      scene.remove(kitchenScene.getScene())
      newCabinets.forEach(cabinet => {
        scene.remove(cabinet.getGroup())
        cabinet.dispose()
      })
      if (newProjector) {
        scene.remove(newProjector.getGroup())
        scene.remove(newProjector.getLight())
        scene.remove(newProjector.getLight().target)
        if (newProjector.getFrustumHelper()) {
          scene.remove(newProjector.getFrustumHelper()!)
        }
        newProjector.dispose()
      }
      kitchenScene.dispose()
      patternGenerator.dispose()
      patternMap.forEach(texture => texture.dispose())
    }
  }, [scene])

  // Update projection when pattern or projector changes
  useEffect(() => {
    if (!projector || !selectedPattern) return

    const patternTexture = patterns.get(selectedPattern)
    if (patternTexture) {
      projector.setProjectionTexture(patternTexture)

      // Apply projection to cabinet doors
      cabinets.forEach(cabinet => {
        cabinet.applyProjection(patternTexture, projectionParameters.intensity)
      })
    }
  }, [projector, selectedPattern, patterns, cabinets, projectionParameters.intensity])

  // Mouse interaction handler
  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!camera) return

    const rect = gl.domElement.getBoundingClientRect()
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.current.setFromCamera(mouse.current, camera)

    // Check cabinet door intersections for hover effects
    const cabinetMeshes: THREE.Object3D[] = []
    cabinets.forEach(cabinet => {
      cabinet.getDoors().forEach(door => cabinetMeshes.push(door))
    })

    const intersects = raycaster.current.intersectObjects(cabinetMeshes)

    if (intersects.length > 0) {
      const intersected = intersects[0].object
      const cabinetIndex = intersected.userData.cabinetIndex

      if (hoveredCabinet !== cabinetIndex) {
        // Remove previous hover
        if (hoveredCabinet !== null && cabinets[hoveredCabinet]) {
          // Remove hover effect logic here
        }

        setHoveredCabinet(cabinetIndex)

        // Add hover effect
        if (cabinets[cabinetIndex]) {
          // Add hover effect logic here
        }
      }
    } else {
      if (hoveredCabinet !== null) {
        setHoveredCabinet(null)
      }
    }
  }, [camera, gl.domElement, cabinets, hoveredCabinet])

  const handleClick = useCallback((event: PointerEvent) => {
    if (!tutorialCompleted && showTutorial) {
      // Advance tutorial
      if (tutorialStep < TUTORIAL_STEPS.length - 1) {
        setTutorialStep(tutorialStep + 1)
        addExperience(10)
      } else {
        completeTutorial()
        setShowTutorial(false)
        unlockAchievement('first-light')
      }
    }
  }, [tutorialStep, tutorialCompleted, showTutorial, setTutorialStep, completeTutorial, addExperience, unlockAchievement])

  // Add event listeners
  useEffect(() => {
    const canvas = gl.domElement
    canvas.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('click', handleClick)

    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('click', handleClick)
    }
  }, [gl.domElement, handlePointerMove, handleClick])

  // Animation loop
  useFrame((state, delta) => {
    timeRef.current += delta

    // Update projection materials animation
    cabinets.forEach(cabinet => {
      cabinet.updateProjectionAnimation(timeRef.current)
    })

    // Auto-rotate some elements for visual interest
    if (projector && !isDragging) {
      // Subtle projector adjustment
      const wobble = Math.sin(timeRef.current * 0.5) * 0.05
      projector.setRotation(new THREE.Euler(
        projectorRotation[0] + wobble,
        projectorRotation[1],
        projectorRotation[2]
      ))
    }
  })

  // Tutorial component
  const TutorialOverlay = () => {
    if (!showTutorial || tutorialCompleted) return null

    const currentStep = TUTORIAL_STEPS[tutorialStep] || TUTORIAL_STEPS[0]

    return (
      <Html
        position={currentStep.position}
        center
        distanceFactor={10}
        occlude={false}
      >
        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 max-w-xs text-center border border-blue-500/30">
          <h3 className="text-lg font-bold text-white mb-2">{currentStep.title}</h3>
          <p className="text-sm text-gray-300 mb-3">{currentStep.description}</p>
          <div className="flex justify-center space-x-2">
            <div className="flex space-x-1">
              {TUTORIAL_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index <= tutorialStep ? 'bg-blue-400' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </Html>
    )
  }

  // Pattern selection UI
  const PatternSelector = () => {
    if (showTutorial && tutorialStep < 2) return null

    return (
      <Html
        position={[-4, 2, 0]}
        center={false}
        distanceFactor={8}
        occlude={false}
      >
        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 min-w-64">
          <h4 className="text-white font-semibold mb-3">Select Pattern</h4>
          <div className="grid grid-cols-3 gap-2">
            {Array.from(patterns.keys()).map(patternId => (
              <button
                key={patternId}
                onClick={() => selectPattern(patternId)}
                className={`aspect-square rounded border-2 p-1 transition-all ${
                  selectedPattern === patternId
                    ? 'border-blue-400 bg-blue-400/20'
                    : 'border-gray-600 hover:border-gray-400 bg-gray-800/50'
                }`}
              >
                <div className="w-full h-full bg-gray-900 rounded flex items-center justify-center text-xs text-white">
                  {patternId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
              </button>
            ))}
          </div>
        </div>
      </Html>
    )
  }

  // Progress indicator
  const ProgressIndicator = () => (
    <Html
      position={[4, 3, 0]}
      center={false}
      distanceFactor={10}
      occlude={false}
    >
      <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3">
        <div className="text-white text-sm mb-2">Level Progress</div>
        <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300"
            style={{ width: `${Math.min(100, (tutorialCompleted ? 50 : tutorialStep * 10))}%` }}
          />
        </div>
      </div>
    </Html>
  )

  return (
    <>
      {/* Camera setup */}
      <PerspectiveCamera
        makeDefault
        position={[0, 2, 8]}
        fov={60}
        near={0.1}
        far={1000}
      />

      {/* Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={15}
        minDistance={3}
        maxPolarAngle={Math.PI * 0.8}
        target={[0, 1, -2]}
      />

      {/* UI Elements */}
      <TutorialOverlay />
      <PatternSelector />
      <ProgressIndicator />

      {/* Performance optimizations */}
      <color attach="background" args={['#1a1a1a']} />
      <fog attach="fog" args={['#1a1a1a', 10, 50]} />
    </>
  )
}

export default Level1Kitchen