import { useRef, useState, useEffect, useCallback } from 'react'
import { useFrame, useThree, extend } from '@react-three/fiber'
import { Text, Html, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { useGameStore } from '../../store/gameStore'
import { usePlayerStore } from '../../store/playerStore'
import ParkingLotScene from './scenes/ParkingLotScene'
import BuildingWall from '../entities/BuildingWall'
import SecurityGuard from '../entities/SecurityGuard'
import UrbanProjector from '../entities/UrbanProjector'
import PatternGenerator from '../utils/PatternGenerator'

// Stealth gameplay states
export type StealthState = 'hidden' | 'exposed' | 'detected' | 'safe'

// Social media mechanics
interface SocialPost {
  id: string
  image: string
  likes: number
  views: number
  viralScore: number
  timestamp: number
}

// Achievement definitions for Level 2
const LEVEL2_ACHIEVEMENTS = [
  { id: 'street-artist', name: 'Street Artist', description: 'Complete your first guerrilla projection' },
  { id: 'stealth-master', name: 'Stealth Master', description: 'Complete 5 projections without being detected' },
  { id: 'viral-moment', name: 'Viral Moment', description: 'Get 1000+ views on a social media post' },
  { id: 'lightbomb-specialist', name: 'Lightbomb Specialist', description: 'Create a spectacular multi-surface projection' },
  { id: 'shadow-walker', name: 'Shadow Walker', description: 'Hide in shadows for 60 cumulative seconds' },
  { id: 'time-pressure-pro', name: 'Time Pressure Pro', description: 'Complete a projection with less than 10 seconds to spare' }
]

const Level2ParkingLot = () => {
  const { camera, scene, gl } = useThree()

  // Scene and entity references
  const [parkingLotScene] = useState(() => new ParkingLotScene())
  const [buildingWalls, setBuildingWalls] = useState<BuildingWall[]>([])
  const [securityGuards, setSecurityGuards] = useState<SecurityGuard[]>([])
  const [urbanProjector, setUrbanProjector] = useState<UrbanProjector | null>(null)
  const [patternGenerator] = useState(() => new PatternGenerator(1024))
  const [patterns, setPatterns] = useState<Map<string, THREE.Texture>>(new Map())

  // Game state
  const [stealthState, setStealthState] = useState<StealthState>('safe')
  const [isProjectorSetup, setIsProjectorSetup] = useState(false)
  const [setupProgress, setSetupProgress] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(300) // 5 minutes initial time
  const [currentObjective, setCurrentObjective] = useState('Find a good projection spot')
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([])
  const [reputation, setReputation] = useState(0)
  const [detectionLevel, setDetectionLevel] = useState(0)
  const [isInShadows, setIsInShadows] = useState(false)
  const [shadowTime, setShadowTime] = useState(0)

  // Equipment state
  const [projectorBrightness, setProjectorBrightness] = useState(1.0)
  const [setupSpeed, setSetupSpeed] = useState(1.0)
  const [stealthBonus, setStealthBonus] = useState(0)

  // Photography system
  const [photoMode, setPhotoMode] = useState(false)
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([])

  // Refs for game loop
  const timeRef = useRef(0)
  const detectionCheckRef = useRef(0)
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())

  // Game store
  const { addNotification } = useGameStore()

  // Player store
  const {
    player,
    addExperience,
    achievements,
    checkAchievements
  } = usePlayerStore()

  // Achievement system (simulated since not all methods exist)
  const unlockAchievement = (achievementId: string) => {
    addNotification({
      type: 'success',
      title: 'Achievement Unlocked!',
      message: `You earned: ${achievementId.replace('-', ' ').toUpperCase()}`
    })
    checkAchievements()
  }

  const setLevelProgress = (progress: number) => {
    // This would normally update level progress, for now just log
    console.log(`Level 2 Progress: ${progress}%`)
  }

  // Initialize the parking lot scene
  useEffect(() => {
    // Add parking lot scene to main scene
    scene.add(parkingLotScene.getScene())

    // Create building walls for projection surfaces
    const wallConfigs = [
      // Main building wall (large surface)
      {
        position: new THREE.Vector3(0, 3, -10),
        dimensions: new THREE.Vector3(12, 6, 0.3),
        surfaceType: 'brick',
        reflectivity: 0.8
      },
      // Side building
      {
        position: new THREE.Vector3(-15, 2.5, -5),
        dimensions: new THREE.Vector3(8, 5, 0.3),
        surfaceType: 'concrete',
        reflectivity: 0.6
      },
      // Warehouse wall
      {
        position: new THREE.Vector3(15, 4, 0),
        dimensions: new THREE.Vector3(10, 8, 0.3),
        surfaceType: 'metal',
        reflectivity: 0.9
      },
      // Corner building
      {
        position: new THREE.Vector3(-8, 2, 8),
        dimensions: new THREE.Vector3(6, 4, 0.3),
        surfaceType: 'painted',
        reflectivity: 0.7
      }
    ]

    const newWalls = wallConfigs.map((config, index) => new BuildingWall({
      id: `wall_${index}`,
      position: config.position,
      dimensions: config.dimensions,
      surfaceType: config.surfaceType,
      reflectivity: config.reflectivity
    }))

    newWalls.forEach(wall => scene.add(wall.getGroup()))
    setBuildingWalls(newWalls)

    // Create security guards with patrol routes
    const guardConfigs = [
      {
        id: 'guard_1',
        position: new THREE.Vector3(-20, 0, -15),
        patrolRoute: [
          new THREE.Vector3(-20, 0, -15),
          new THREE.Vector3(-5, 0, -15),
          new THREE.Vector3(-5, 0, -5),
          new THREE.Vector3(-20, 0, -5)
        ],
        visionRange: 8,
        visionAngle: Math.PI / 3,
        speed: 0.8
      },
      {
        id: 'guard_2',
        position: new THREE.Vector3(20, 0, 10),
        patrolRoute: [
          new THREE.Vector3(20, 0, 10),
          new THREE.Vector3(10, 0, 10),
          new THREE.Vector3(10, 0, -5),
          new THREE.Vector3(20, 0, -5)
        ],
        visionRange: 10,
        visionAngle: Math.PI / 4,
        speed: 0.6
      }
    ]

    const newGuards = guardConfigs.map(config => new SecurityGuard(config))
    newGuards.forEach(guard => scene.add(guard.getGroup()))
    setSecurityGuards(newGuards)

    // Create urban projector
    const newProjector = new UrbanProjector({
      position: new THREE.Vector3(2, 1, 5),
      setupTime: 3.0, // 3 seconds base setup time
      brightness: projectorBrightness,
      isPortable: true,
      stealthMode: true
    })

    scene.add(newProjector.getGroup())
    setUrbanProjector(newProjector)

    // Generate street art patterns
    const patternMap = new Map<string, THREE.Texture>()

    // Urban-themed patterns
    patternMap.set('neon-grid', patternGenerator.generateNeonGridPattern('#00ff88', '#ff006b'))
    patternMap.set('cyber-skull', patternGenerator.generateSkullPattern('#ff4757', '#3742fa'))
    patternMap.set('glitch-text', patternGenerator.generateGlitchTextPattern('REBEL', '#ffa502'))
    patternMap.set('circuit-board', patternGenerator.generateCircuitPattern('#2ed573', '#1e90ff'))
    patternMap.set('urban-camo', patternGenerator.generateUrbanCamoPattern('#5f27cd', '#ff3838'))
    patternMap.set('neon-waves', patternGenerator.generateWavePattern('#18dcff', '#7d5fff'))
    patternMap.set('street-tag', patternGenerator.generateGraffitiPattern('#ff6b6b', '#4ecdc4'))

    setPatterns(patternMap)

    return () => {
      // Cleanup
      scene.remove(parkingLotScene.getScene())
      newWalls.forEach(wall => {
        scene.remove(wall.getGroup())
        wall.dispose()
      })
      newGuards.forEach(guard => {
        scene.remove(guard.getGroup())
        guard.dispose()
      })
      if (newProjector) {
        scene.remove(newProjector.getGroup())
        newProjector.dispose()
      }
      parkingLotScene.dispose()
      patternGenerator.dispose()
      patternMap.forEach(texture => texture.dispose())
    }
  }, [scene])

  // Stealth detection system
  const checkStealthStatus = useCallback(() => {
    if (!urbanProjector || !player) return

    const playerPos = player.getPosition()
    const playerVector3 = new THREE.Vector3(playerPos.x, 0, playerPos.y) // Convert 2D position to 3D
    let isHidden = false
    let nearestGuardDistance = Infinity

    // Check if player is in shadows
    const shadowAreas = parkingLotScene.getShadowAreas()
    const inShadowArea = shadowAreas.some(area => {
      const distance = playerVector3.distanceTo(area.position)
      return distance < area.radius
    })

    setIsInShadows(inShadowArea)

    // Check detection by security guards
    securityGuards.forEach(guard => {
      const guardPos = guard.getPosition()
      const distanceToGuard = playerVector3.distanceTo(guardPos)
      nearestGuardDistance = Math.min(nearestGuardDistance, distanceToGuard)

      // Check if player is in guard's vision cone
      if (guard.canSeePosition(playerVector3)) {
        if (inShadowArea) {
          // Reduced detection in shadows
          setDetectionLevel(prev => Math.min(100, prev + 0.5))
        } else {
          // Normal detection
          setDetectionLevel(prev => Math.min(100, prev + 2))
        }
        isHidden = false
      }
    })

    // Determine stealth state
    if (detectionLevel >= 100) {
      setStealthState('detected')
    } else if (detectionLevel > 50) {
      setStealthState('exposed')
    } else if (isHidden || inShadowArea) {
      setStealthState('hidden')
      setDetectionLevel(prev => Math.max(0, prev - 1)) // Slowly reduce detection
    } else {
      setStealthState('safe')
      setDetectionLevel(prev => Math.max(0, prev - 0.5))
    }

    return { isHidden: inShadowArea, nearestGuardDistance, detectionLevel }
  }, [urbanProjector, player, securityGuards, parkingLotScene, detectionLevel])

  // Projector setup mini-game
  const handleProjectorSetup = useCallback(() => {
    if (!urbanProjector || isProjectorSetup) return

    const setupDuration = 3000 / setupSpeed // Base 3 seconds, modified by equipment
    let progress = 0

    const setupInterval = setInterval(() => {
      progress += (100 / setupDuration) * 16 // 60fps updates
      setSetupProgress(progress)

      if (progress >= 100) {
        clearInterval(setupInterval)
        setIsProjectorSetup(true)
        setSetupProgress(100)
        addExperience(25)
        addNotification({
          type: 'success',
          title: 'Projector Ready!',
          message: 'Your projector is set up and ready to project'
        })
      }
    }, 16)

    addNotification({
      type: 'info',
      title: 'Setting up projector...',
      message: 'Stay hidden while your equipment initializes'
    })
  }, [urbanProjector, isProjectorSetup, setupSpeed, addExperience, addNotification])

  // Photography system for social media
  const captureProjection = useCallback(() => {
    if (!urbanProjector || !isProjectorSetup) return

    // Simulate taking a photo of the projection
    const photoId = `photo_${Date.now()}`
    setCapturedPhotos(prev => [...prev, photoId])

    // Calculate viral potential based on various factors
    const projectionComplexity = 0.8 // Based on pattern complexity
    const locationBonus = stealthState === 'hidden' ? 0.3 : 0.1 // Bonus for risky locations
    const timingBonus = timeRemaining < 60 ? 0.2 : 0 // Bonus for time pressure
    const stealthBonus = detectionLevel < 20 ? 0.2 : 0 // Bonus for staying hidden

    const viralScore = Math.min(100,
      (projectionComplexity + locationBonus + timingBonus + stealthBonus) * 100
    )

    const post: SocialPost = {
      id: photoId,
      image: photoId, // Would be actual image data in real implementation
      likes: Math.floor(Math.random() * (viralScore * 10)) + 10,
      views: Math.floor(Math.random() * (viralScore * 50)) + 50,
      viralScore,
      timestamp: Date.now()
    }

    setSocialPosts(prev => [...prev, post])
    setReputation(prev => prev + Math.floor(viralScore / 10))

    // Check for viral moment achievement
    if (post.views > 1000) {
      unlockAchievement('viral-moment')
    }

    addExperience(Math.floor(viralScore / 2))
    addNotification({
      type: 'success',
      title: 'Photo Captured!',
      message: `Viral Score: ${Math.floor(viralScore)}% | +${post.likes} likes`
    })
  }, [urbanProjector, isProjectorSetup, stealthState, timeRemaining, detectionLevel, unlockAchievement, addExperience, addNotification])

  // Handle level completion
  const checkLevelCompletion = useCallback(() => {
    const objectives = {
      firstProjection: capturedPhotos.length > 0,
      reputationThreshold: reputation >= 100,
      stealthMastery: detectionLevel < 30,
      timeManagement: timeRemaining > 0
    }

    const completedObjectives = Object.values(objectives).filter(Boolean).length
    const progress = (completedObjectives / Object.keys(objectives).length) * 100

    setLevelProgress(progress)

    if (completedObjectives === Object.keys(objectives).length) {
      // Level completed!
      unlockAchievement('street-artist')
      addNotification({
        type: 'success',
        title: 'Level 2 Complete!',
        message: 'You\'ve mastered guerrilla projection mapping!'
      })
    }
  }, [capturedPhotos.length, reputation, detectionLevel, timeRemaining, setLevelProgress, unlockAchievement, addNotification])

  // Game loop
  useFrame((state, delta) => {
    timeRef.current += delta

    // Update time remaining
    setTimeRemaining(prev => Math.max(0, prev - delta))

    // Track shadow time for achievement
    if (isInShadows) {
      setShadowTime(prev => prev + delta)
      if (shadowTime >= 60) {
        unlockAchievement('shadow-walker')
      }
    }

    // Update security guards
    securityGuards.forEach(guard => guard.update(delta))

    // Check stealth status every 100ms
    detectionCheckRef.current += delta
    if (detectionCheckRef.current >= 0.1) {
      checkStealthStatus()
      detectionCheckRef.current = 0
    }

    // Update urban projector
    if (urbanProjector) {
      urbanProjector.update(delta)
    }

    // Check level completion
    checkLevelCompletion()

    // Handle detection consequences
    if (stealthState === 'detected') {
      addNotification({
        type: 'warning',
        title: 'DETECTED!',
        message: 'Guards are investigating your location!'
      })
      setTimeRemaining(prev => Math.max(0, prev - delta * 3)) // Penalty time loss
    }
  })

  // Mouse/click handlers
  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!camera) return

    const rect = gl.domElement.getBoundingClientRect()
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }, [camera, gl.domElement])

  const handleClick = useCallback((event: PointerEvent) => {
    if (photoMode && urbanProjector && isProjectorSetup) {
      captureProjection()
      setPhotoMode(false)
    }
  }, [photoMode, urbanProjector, isProjectorSetup, captureProjection])

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

  // UI Components
  const StealthIndicator = () => (
    <Html position={[-8, 6, 0]} center={false} distanceFactor={10} occlude={false}>
      <div className="bg-black/90 backdrop-blur-sm rounded-lg p-3 border border-red-500/30">
        <div className="text-white text-sm mb-2 flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            stealthState === 'hidden' ? 'bg-green-400' :
            stealthState === 'safe' ? 'bg-blue-400' :
            stealthState === 'exposed' ? 'bg-yellow-400' :
            'bg-red-400'
          }`} />
          Stealth: {stealthState.toUpperCase()}
        </div>
        <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 transition-all duration-300"
            style={{ width: `${detectionLevel}%` }}
          />
        </div>
        <div className="text-xs text-gray-300">
          Detection: {Math.floor(detectionLevel)}%
        </div>
      </div>
    </Html>
  )

  const ObjectivePanel = () => (
    <Html position={[8, 6, 0]} center={false} distanceFactor={10} occlude={false}>
      <div className="bg-black/90 backdrop-blur-sm rounded-lg p-4 min-w-64">
        <h4 className="text-white font-semibold mb-3 text-lg">Mission Objectives</h4>
        <div className="space-y-2 text-sm">
          <div className={`flex items-center ${capturedPhotos.length > 0 ? 'text-green-400' : 'text-gray-300'}`}>
            <div className="w-2 h-2 bg-current rounded-full mr-2" />
            Create your first projection ({capturedPhotos.length}/1)
          </div>
          <div className={`flex items-center ${reputation >= 100 ? 'text-green-400' : 'text-gray-300'}`}>
            <div className="w-2 h-2 bg-current rounded-full mr-2" />
            Build reputation to 100 ({reputation}/100)
          </div>
          <div className={`flex items-center ${detectionLevel < 30 ? 'text-green-400' : 'text-gray-300'}`}>
            <div className="w-2 h-2 bg-current rounded-full mr-2" />
            Stay stealthy (Detection: {Math.floor(detectionLevel)}%)
          </div>
          <div className={`flex items-center ${timeRemaining > 0 ? 'text-green-400' : 'text-red-400'}`}>
            <div className="w-2 h-2 bg-current rounded-full mr-2" />
            Time remaining: {Math.floor(timeRemaining / 60)}:{String(Math.floor(timeRemaining % 60)).padStart(2, '0')}
          </div>
        </div>
      </div>
    </Html>
  )

  const EquipmentPanel = () => (
    <Html position={[-8, -4, 0]} center={false} distanceFactor={8} occlude={false}>
      <div className="bg-black/90 backdrop-blur-sm rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3">Equipment</h4>
        <div className="space-y-3">
          {!isProjectorSetup ? (
            <button
              onClick={handleProjectorSetup}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Setup Projector ({Math.floor(setupProgress)}%)
            </button>
          ) : (
            <div className="text-green-400 text-sm">✓ Projector Ready</div>
          )}

          <button
            onClick={() => setPhotoMode(!photoMode)}
            className={`w-full px-4 py-2 rounded transition-colors ${
              photoMode
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : 'bg-gray-600 hover:bg-gray-700'
            } text-white`}
          >
            {photoMode ? 'Cancel Photo' : 'Photo Mode'}
          </button>

          <div className="text-xs text-gray-400">
            Photos captured: {capturedPhotos.length}
          </div>
        </div>
      </div>
    </Html>
  )

  const PatternSelector = () => (
    <Html position={[8, -4, 0]} center={false} distanceFactor={8} occlude={false}>
      <div className="bg-black/90 backdrop-blur-sm rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3">Street Art Patterns</h4>
        <div className="grid grid-cols-2 gap-2 max-w-xs">
          {Array.from(patterns.keys()).map(patternId => (
            <button
              key={patternId}
              onClick={() => {
                if (urbanProjector && isProjectorSetup) {
                  const texture = patterns.get(patternId)
                  if (texture) {
                    urbanProjector.setProjectionTexture(texture)
                  }
                }
              }}
              className="aspect-square rounded border-2 border-gray-600 hover:border-gray-400 bg-gray-800/50 p-1 transition-all text-xs text-white"
            >
              {patternId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>
    </Html>
  )

  return (
    <>
      {/* Camera setup */}
      <PerspectiveCamera
        makeDefault
        position={[0, 8, 20]}
        fov={60}
        near={0.1}
        far={1000}
      />

      {/* Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={30}
        minDistance={5}
        maxPolarAngle={Math.PI * 0.8}
        target={[0, 2, 0]}
      />

      {/* UI Elements */}
      <StealthIndicator />
      <ObjectivePanel />
      <EquipmentPanel />
      <PatternSelector />

      {/* Cyberpunk atmosphere */}
      <color attach="background" args={['#0a0a0a']} />
      <fog attach="fog" args={['#000011', 20, 80]} />

      {/* Ambient lighting for nighttime scene */}
      <ambientLight intensity={0.1} color="#1a1a2e" />
      <directionalLight
        position={[10, 20, 5]}
        intensity={0.3}
        color="#4a4a8a"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </>
  )
}

export default Level2ParkingLot