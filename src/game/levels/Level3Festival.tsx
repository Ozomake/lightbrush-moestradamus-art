import { useRef, useState, useEffect, useCallback } from 'react'
import { useFrame, useThree, extend } from '@react-three/fiber'
import { Text, Html, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { useGameStore } from '../../store/gameStore'
import { FestivalScene, type WeatherState, type TimeOfDay } from './scenes/FestivalScene'
import { FestivalStage, type StageConfig, type PerformanceSlot } from '../entities/FestivalStage'
import { FestivalCrowd, type CrowdMetrics } from '../entities/FestivalCrowd'
import { FestivalProjector, type ProjectorConfig, type ProjectionContent } from '../entities/FestivalProjector'

// Resource management interfaces
interface BudgetState {
  totalBudget: number
  spent: number
  remaining: number
  income: number
  expenses: number
  dailyBurn: number
}

interface CrewMember {
  id: string
  name: string
  type: 'tech' | 'creative' | 'manager' | 'security'
  skill: number // 1-10
  wage: number
  availability: number // 0-1
  morale: number // 0-100
  experience: number // 0-100
}

interface TimeState {
  currentTime: number // minutes from festival start
  timeOfDay: TimeOfDay
  festivalDay: number
  setupDeadline: number
  showStartTime: number
  timeScale: number // real seconds per game minute
}

interface ResourceState {
  budget: BudgetState
  crew: CrewMember[]
  projectors: FestivalProjector[]
  availableContent: ProjectionContent[]
  powerAvailable: number
  powerUsed: number
  reputation: number // 0-100
  stress: number // 0-100
}

interface GameplayMetrics {
  crowdSatisfaction: number
  artistSatisfaction: number
  technicalRating: number
  creativityScore: number
  efficiencyScore: number
  overallRating: number
  achievements: string[]
  highlights: string[]
}

// Tutorial steps for Level 3
const LEVEL3_TUTORIAL = [
  {
    title: "Welcome to the Music Festival!",
    description: "You're now a professional VJ at a major music festival. Manage resources, coordinate with artists, and create spectacular shows.",
    position: [0, 5, 10] as [number, number, number]
  },
  {
    title: "Manage Your Budget",
    description: "You have a limited budget for equipment, crew, and content. Spend wisely to maximize your impact across multiple stages.",
    position: [-20, 3, 0] as [number, number, number]
  },
  {
    title: "Hire and Manage Crew",
    description: "Your crew handles setup, operation, and maintenance. Skilled crew members are more efficient but cost more.",
    position: [20, 3, 0] as [number, number, number]
  },
  {
    title: "Plan Your Installations",
    description: "Each stage has different requirements. The main stage needs massive impact, while art installations reward creativity.",
    position: [0, 3, -15] as [number, number, number]
  },
  {
    title: "Weather Awareness",
    description: "Outdoor projections are affected by weather. Install protection or have backup plans for rain and wind.",
    position: [0, 8, 5] as [number, number, number]
  },
  {
    title: "Collaborate with Artists",
    description: "Work with musicians to synchronize visuals with their performance. Good collaboration boosts both crowd and artist satisfaction.",
    position: [0, 2, -25] as [number, number, number]
  }
]

// Extend Three.js objects for React Three Fiber
extend({ FestivalScene })

const Level3Festival = () => {
  const { camera, scene, gl } = useThree()

  // Festival systems
  const [festivalScene] = useState(() => new FestivalScene())
  const [festivalStages, setFestivalStages] = useState<Map<string, FestivalStage>>(new Map())
  const [festivalCrowd] = useState(() => new FestivalCrowd(2000))
  const [projectors, setProjectors] = useState<Map<string, FestivalProjector>>(new Map())

  // Game state
  const [resources, setResources] = useState<ResourceState>({
    budget: {
      totalBudget: 150000, // $150,000 festival budget
      spent: 0,
      remaining: 150000,
      income: 0,
      expenses: 0,
      dailyBurn: 0
    },
    crew: [],
    projectors: [],
    availableContent: [],
    powerAvailable: 5000, // 5MW available power
    powerUsed: 0,
    reputation: 60, // Start with good reputation
    stress: 20 // Low initial stress
  })

  const [timeState, setTimeState] = useState<TimeState>({
    currentTime: -180, // Start 3 hours before first show
    timeOfDay: festivalScene.getTimeOfDay(),
    festivalDay: 1,
    setupDeadline: -60, // 1 hour before show
    showStartTime: 0,
    timeScale: 0.5 // 1 real second = 2 game minutes
  })

  const [gameplayMetrics, setGameplayMetrics] = useState<GameplayMetrics>({
    crowdSatisfaction: 50,
    artistSatisfaction: 50,
    technicalRating: 70,
    creativityScore: 50,
    efficiencyScore: 50,
    overallRating: 50,
    achievements: [],
    highlights: []
  })

  // UI State
  const [showTutorial, setShowTutorial] = useState(true)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [selectedStage, setSelectedStage] = useState<string>('main_stage')
  const [showResourcePanel, setShowResourcePanel] = useState(true)
  const [showCrewPanel, setShowCrewPanel] = useState(false)
  const [showContentLibrary, setShowContentLibrary] = useState(false)
  const [showWeatherForecast, setShowWeatherForecast] = useState(false)
  const [showCollaboration, setShowCollaboration] = useState(false)
  const [showMixingInterface, setShowMixingInterface] = useState(false)

  // Performance state
  const [currentPerformances, setCurrentPerformances] = useState<Map<string, PerformanceSlot>>(new Map())
  const [upcomingPerformances, setUpcomingPerformances] = useState<PerformanceSlot[]>([])

  // Interaction state
  const [isDragging, setIsDragging] = useState(false)
  const [selectedProjector, setSelectedProjector] = useState<string | null>(null)

  // Refs
  const timeRef = useRef(0)
  const weatherUpdateInterval = useRef<NodeJS.Timeout | null>(null)
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())

  // Game store
  const {
    addNotification,
    addExperience,
    unlockAchievement,
    showDialog,
    hideDialog
  } = useGameStore()

  // Initialize festival
  useEffect(() => {
    // Add festival scene to main scene
    scene.add(festivalScene.getScene())

    // Create festival stages
    initializeFestivalStages()

    // Add crowd to scene
    scene.add(festivalCrowd.getCrowdGroup())

    // Initialize crew and resources
    initializeResources()

    // Generate initial content library
    generateContentLibrary()

    // Schedule initial performances
    schedulePerformances()

    // Start weather system
    startWeatherSystem()

    return () => {
      // Cleanup
      scene.remove(festivalScene.getScene())
      scene.remove(festivalCrowd.getCrowdGroup())
      festivalScene.dispose()
      festivalCrowd.dispose()

      if (weatherUpdateInterval.current) {
        clearInterval(weatherUpdateInterval.current)
      }
    }
  }, [scene])

  const initializeFestivalStages = (): void => {
    const stageConfigs = festivalScene.getStageConfigs()
    const newStages = new Map<string, FestivalStage>()

    stageConfigs.forEach(config => {
      const stage = new FestivalStage(config)
      newStages.set(config.id, stage)
      scene.add(stage.getGroup())
    })

    setFestivalStages(newStages)
  }

  const initializeResources = (): void => {
    // Start with basic crew
    const initialCrew: CrewMember[] = [
      {
        id: 'tech_lead',
        name: 'Alex Rodriguez',
        type: 'tech',
        skill: 8,
        wage: 800,
        availability: 1.0,
        morale: 90,
        experience: 85
      },
      {
        id: 'creative_director',
        name: 'Maya Chen',
        type: 'creative',
        skill: 9,
        wage: 1000,
        availability: 1.0,
        morale: 85,
        experience: 90
      },
      {
        id: 'junior_tech',
        name: 'Sam Wilson',
        type: 'tech',
        skill: 6,
        wage: 400,
        availability: 1.0,
        morale: 95,
        experience: 40
      }
    ]

    setResources(prev => ({
      ...prev,
      crew: initialCrew,
      expenses: initialCrew.reduce((sum, member) => sum + member.wage, 0)
    }))
  }

  const generateContentLibrary = (): void => {
    const contentLibrary: ProjectionContent[] = [
      {
        id: 'abstract_flow',
        name: 'Abstract Flow',
        type: 'generative',
        duration: 300,
        energyLevel: 6,
        complexity: 5,
        genre: 'electronic',
        tags: ['abstract', 'flowing', 'colorful'],
        popularity: 75
      },
      {
        id: 'geometric_pulse',
        name: 'Geometric Pulse',
        type: 'reactive',
        duration: 0, // Reactive content is infinite
        beatsPerMinute: 128,
        energyLevel: 8,
        complexity: 7,
        genre: 'techno',
        tags: ['geometric', 'pulse', 'reactive'],
        popularity: 85
      },
      {
        id: 'nature_fractals',
        name: 'Nature Fractals',
        type: 'generative',
        duration: 480,
        energyLevel: 4,
        complexity: 6,
        genre: 'ambient',
        tags: ['nature', 'fractals', 'organic'],
        popularity: 60
      },
      {
        id: 'laser_symphony',
        name: 'Laser Symphony',
        type: 'reactive',
        duration: 0,
        beatsPerMinute: 140,
        energyLevel: 9,
        complexity: 8,
        genre: 'electronic',
        tags: ['laser', 'intense', 'symphony'],
        popularity: 90
      },
      {
        id: 'chill_waves',
        name: 'Chill Waves',
        type: 'video',
        duration: 600,
        energyLevel: 3,
        complexity: 3,
        genre: 'chill',
        tags: ['waves', 'relaxing', 'ambient'],
        popularity: 70
      }
    ]

    setResources(prev => ({
      ...prev,
      availableContent: contentLibrary
    }))
  }

  const schedulePerformances = (): void => {
    const performances: PerformanceSlot[] = [
      {
        id: 'opening_ceremony',
        artistName: 'Festival Opening',
        genre: 'electronic',
        startTime: 0,
        duration: 30,
        expectedCrowd: 1500,
        difficulty: 7,
        energyType: 'high',
        requirements: {
          projectors: 6,
          lights: 15,
          sound: 10,
          crew: 3
        }
      },
      {
        id: 'main_headliner',
        artistName: 'Neon Dreams',
        genre: 'electronic',
        startTime: 120,
        duration: 90,
        expectedCrowd: 2000,
        difficulty: 9,
        energyType: 'high',
        requirements: {
          projectors: 8,
          lights: 20,
          sound: 12,
          crew: 4
        }
      },
      {
        id: 'art_installation',
        artistName: 'Interactive Collective',
        genre: 'ambient',
        startTime: 60,
        duration: 180,
        expectedCrowd: 300,
        difficulty: 6,
        energyType: 'medium',
        requirements: {
          projectors: 5,
          lights: 8,
          sound: 4,
          crew: 2
        }
      }
    ]

    setUpcomingPerformances(performances)

    // Schedule performances on stages
    festivalStages.forEach((stage, stageId) => {
      const stagePerformances = performances.filter(p => {
        // Simple logic to assign performances to appropriate stages
        if (stageId === 'main_stage') return p.artistName.includes('Neon') || p.artistName.includes('Opening')
        if (stageId === 'art_pavilion') return p.artistName.includes('Interactive')
        return false
      })

      stagePerformances.forEach(performance => {
        stage.schedulePerformance(performance)
      })
    })
  }

  const startWeatherSystem = (): void => {
    weatherUpdateInterval.current = setInterval(() => {
      // Update weather every 5 minutes (game time)
      const weatherTypes: WeatherState['type'][] = ['clear', 'cloudy', 'rain', 'storm']
      const newWeatherType = weatherTypes[Math.floor(Math.random() * weatherTypes.length)]

      const weatherUpdate: Partial<WeatherState> = {
        type: newWeatherType,
        intensity: Math.random() * 0.8 + 0.2,
        windSpeed: Math.random() * 20,
        windDirection: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          0,
          (Math.random() - 0.5) * 2
        ).normalize()
      }

      festivalScene.updateWeather(weatherUpdate)

      // Apply weather effects to crowd and projectors
      if (newWeatherType === 'rain' || newWeatherType === 'storm') {
        festivalCrowd.applyWeatherEffects(newWeatherType, weatherUpdate.intensity!)

        projectors.forEach(projector => {
          projector.applyWeatherEffects({
            type: newWeatherType,
            intensity: weatherUpdate.intensity!
          })
        })

        // Show weather warning
        if (newWeatherType === 'storm') {
          addNotification({
            type: 'warning',
            title: 'Storm Warning!',
            message: 'Severe weather detected. Check your equipment protection!',
            duration: 8000
          })
        }
      }
    }, 30000) // Every 30 seconds real time
  }

  // Equipment purchase and management
  const purchaseProjector = useCallback((type: FestivalProjector['config']['type'], position: THREE.Vector3): boolean => {
    const projectorCosts = {
      standard: 5000,
      high_power: 12000,
      laser: 8000,
      led_wall: 15000,
      mobile_rig: 3000
    }

    const cost = projectorCosts[type]

    if (resources.budget.remaining < cost) {
      addNotification({
        type: 'error',
        title: 'Insufficient Funds',
        message: `Need $${cost.toLocaleString()} to purchase ${type} projector`,
        duration: 5000
      })
      return false
    }

    // Create projector config
    const config: ProjectorConfig = {
      id: `projector_${Date.now()}`,
      type,
      position,
      rotation: new THREE.Euler(0, 0, 0),
      power: type === 'high_power' ? 2000 : type === 'laser' ? 800 : 1200,
      brightness: type === 'high_power' ? 20000 : type === 'laser' ? 15000 : 10000,
      resolution: { width: 1920, height: 1080 },
      throwDistance: { min: 2, max: type === 'high_power' ? 50 : 30 },
      fov: 45,
      aspect: 16/9,
      costPerHour: type === 'high_power' ? 200 : 100,
      setupTime: type === 'mobile_rig' ? 30 : 60,
      reliability: 0.9,
      weatherResistance: type === 'laser' ? 0.7 : 0.5
    }

    const projector = new FestivalProjector(config)
    projector.startSetup()

    // Add to scene and tracking
    scene.add(projector.getGroup())
    const newProjectors = new Map(projectors)
    newProjectors.set(config.id, projector)
    setProjectors(newProjectors)

    // Update budget
    setResources(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        spent: prev.budget.spent + cost,
        remaining: prev.budget.remaining - cost
      }
    }))

    addNotification({
      type: 'success',
      title: 'Equipment Purchased',
      message: `${type} projector purchased for $${cost.toLocaleString()}`,
      duration: 3000
    })

    return true
  }, [resources.budget, projectors, scene, addNotification])

  const hireCrew = useCallback((crewType: CrewMember['type']): boolean => {
    const crewCosts = {
      tech: { wage: 600, skill: 7 },
      creative: { wage: 800, skill: 8 },
      manager: { wage: 1000, skill: 6 },
      security: { wage: 400, skill: 5 }
    }

    const cost = crewCosts[crewType]

    const newMember: CrewMember = {
      id: `crew_${Date.now()}`,
      name: generateCrewName(),
      type: crewType,
      skill: cost.skill + Math.floor(Math.random() * 3) - 1, // ±1 variance
      wage: cost.wage + Math.floor(Math.random() * 200) - 100, // ±$100 variance
      availability: 1.0,
      morale: 80 + Math.random() * 20,
      experience: Math.random() * 100
    }

    setResources(prev => ({
      ...prev,
      crew: [...prev.crew, newMember],
      expenses: prev.expenses + newMember.wage
    }))

    addNotification({
      type: 'success',
      title: 'Crew Member Hired',
      message: `${newMember.name} (${crewType}) joined your team`,
      duration: 3000
    })

    return true
  }, [])

  const generateCrewName = (): string => {
    const firstNames = ['Alex', 'Jordan', 'Casey', 'Riley', 'Morgan', 'Taylor', 'Jamie', 'Avery']
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Garcia', 'Martinez']

    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
  }

  // Performance management
  const startPerformance = useCallback((stageId: string, performanceId: string): void => {
    const stage = festivalStages.get(stageId)
    if (!stage) return

    const performance = upcomingPerformances.find(p => p.id === performanceId)
    if (!performance) return

    if (stage.startPerformance(performanceId)) {
      // Start crowd reaction
      festivalCrowd.startPerformance(stageId, performance.genre, performance.energyType === 'high' ? 8 : 6)

      // Activate projectors for this stage
      const stageProjectors = Array.from(projectors.values()).filter(projector => {
        const distance = projector.getGroup().position.distanceTo(stage.getGroup().position)
        return distance < 30 // Within 30 units of stage
      })

      stageProjectors.forEach(projector => {
        if (projector.isOperational()) {
          // Load appropriate content
          const suitableContent = resources.availableContent.find(content =>
            content.genre === performance.genre ||
            content.energyLevel >= performance.difficulty - 2
          )

          if (suitableContent) {
            projector.loadContent(suitableContent)
            projector.startProjection()
          }
        }
      })

      setCurrentPerformances(prev => new Map(prev).set(stageId, performance))

      addNotification({
        type: 'info',
        title: 'Performance Started',
        message: `${performance.artistName} is now performing on ${stageId}`,
        duration: 4000
      })
    } else {
      addNotification({
        type: 'error',
        title: 'Performance Failed',
        message: 'Stage not ready or insufficient equipment',
        duration: 5000
      })
    }
  }, [festivalStages, upcomingPerformances, projectors, festivalCrowd, resources.availableContent, addNotification])

  // Mouse interaction
  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!camera) return

    const rect = gl.domElement.getBoundingClientRect()
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.current.setFromCamera(mouse.current, camera)

    // Check for projector intersections
    const projectorMeshes: THREE.Object3D[] = []
    projectors.forEach(projector => {
      projectorMeshes.push(projector.getGroup())
    })

    const intersects = raycaster.current.intersectObjects(projectorMeshes, true)

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object
      // Handle projector hover
    }
  }, [camera, gl.domElement, projectors])

  const handleClick = useCallback((event: PointerEvent) => {
    if (showTutorial) {
      // Advance tutorial
      if (tutorialStep < LEVEL3_TUTORIAL.length - 1) {
        setTutorialStep(tutorialStep + 1)
      } else {
        setShowTutorial(false)
        unlockAchievement('festival_ready')
      }
    }
  }, [showTutorial, tutorialStep, unlockAchievement])

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

  // Main update loop
  useFrame((state, deltaTime) => {
    timeRef.current += deltaTime

    // Update time system
    const newTime = timeState.currentTime + (deltaTime * 60 * timeState.timeScale)
    const newTimeOfDay = {
      ...timeState.timeOfDay,
      hour: Math.floor((newTime + 1080) / 60) % 24, // 1080 = 18:00 start time
      minute: Math.floor(newTime + 1080) % 60
    }

    setTimeState(prev => ({
      ...prev,
      currentTime: newTime,
      timeOfDay: newTimeOfDay
    }))

    // Update festival scene
    festivalScene.updateTimeOfDay(newTimeOfDay.hour, newTimeOfDay.minute)
    festivalScene.update(deltaTime)

    // Update crowd
    festivalCrowd.update(deltaTime)

    // Update stages
    festivalStages.forEach(stage => {
      stage.update(deltaTime, newTime)
    })

    // Update projectors
    projectors.forEach(projector => {
      const weather = festivalScene.getWeather()
      projector.update(deltaTime, weather.temperature, 60) // Assume 60% humidity
    })

    // Update metrics
    const crowdMetrics = festivalCrowd.getCrowdMetrics()
    setGameplayMetrics(prev => ({
      ...prev,
      crowdSatisfaction: crowdMetrics.averageSatisfaction,
      technicalRating: calculateTechnicalRating(),
      creativityScore: calculateCreativityScore(),
      efficiencyScore: calculateEfficiencyScore()
    }))

    // Check for automatic performance starts
    upcomingPerformances.forEach(performance => {
      if (performance.startTime <= newTime && !currentPerformances.has(performance.id)) {
        // Auto-start performances that are scheduled
        const appropriateStage = findAppropriateStage(performance)
        if (appropriateStage) {
          startPerformance(appropriateStage, performance.id)
        }
      }
    })

    // Update stress and reputation based on performance
    updateStressAndReputation(deltaTime)
  })

  const calculateTechnicalRating = (): number => {
    let totalRating = 0
    let count = 0

    festivalStages.forEach(stage => {
      const metrics = stage.getMetrics()
      totalRating += metrics.technicalQuality
      count++
    })

    return count > 0 ? totalRating / count : 0
  }

  const calculateCreativityScore = (): number => {
    // Based on content variety and projector utilization
    let score = 50
    const activeProjectors = Array.from(projectors.values()).filter(p => p.getStatus() === 'active')

    score += Math.min(30, activeProjectors.length * 5) // Up to 30 points for projector count
    score += Math.min(20, resources.availableContent.length * 2) // Up to 20 points for content variety

    return Math.min(100, score)
  }

  const calculateEfficiencyScore = (): number => {
    // Based on budget usage and crew efficiency
    const budgetEfficiency = (resources.budget.totalBudget - resources.budget.spent) / resources.budget.totalBudget
    const crewEfficiency = resources.crew.reduce((sum, member) => sum + (member.morale / 100), 0) / resources.crew.length

    return Math.min(100, (budgetEfficiency * 50) + (crewEfficiency * 50))
  }

  const findAppropriateStage = (performance: PerformanceSlot): string | null => {
    // Simple logic to match performances to stages
    if (performance.expectedCrowd > 1500) return 'main_stage'
    if (performance.genre === 'electronic' || performance.genre === 'techno') return 'edm_tent'
    if (performance.artistName.includes('Interactive') || performance.genre === 'ambient') return 'art_pavilion'
    return 'chill_zone'
  }

  const updateStressAndReputation = (deltaTime: number): void => {
    setResources(prev => {
      let newStress = prev.stress
      let newReputation = prev.reputation

      // Stress factors
      const budgetPressure = prev.budget.remaining < prev.budget.totalBudget * 0.2 ? 10 : 0
      const timeStress = timeState.currentTime > timeState.setupDeadline ? 15 : 0
      const weatherStress = festivalScene.getWeather().type === 'storm' ? 20 : 0

      newStress += (budgetPressure + timeStress + weatherStress - 30) * deltaTime * 0.1

      // Reputation factors
      const crowdBonus = gameplayMetrics.crowdSatisfaction > 80 ? 5 : gameplayMetrics.crowdSatisfaction < 40 ? -10 : 0
      const technicalBonus = gameplayMetrics.technicalRating > 85 ? 3 : gameplayMetrics.technicalRating < 50 ? -5 : 0

      newReputation += (crowdBonus + technicalBonus) * deltaTime * 0.05

      return {
        ...prev,
        stress: Math.max(0, Math.min(100, newStress)),
        reputation: Math.max(0, Math.min(100, newReputation))
      }
    })
  }

  // UI Components
  const TutorialOverlay = () => {
    if (!showTutorial) return null

    const currentStep = LEVEL3_TUTORIAL[tutorialStep] || LEVEL3_TUTORIAL[0]

    return (
      <Html
        position={currentStep.position}
        center
        distanceFactor={15}
        occlude={false}
      >
        <div className="bg-black/90 backdrop-blur-sm rounded-lg p-6 max-w-md text-center border border-purple-500/30">
          <h3 className="text-xl font-bold text-white mb-3">{currentStep.title}</h3>
          <p className="text-sm text-gray-300 mb-4">{currentStep.description}</p>
          <div className="flex justify-center items-center space-x-4">
            <div className="flex space-x-1">
              {LEVEL3_TUTORIAL.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index <= tutorialStep ? 'bg-purple-400' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">Click to continue</span>
          </div>
        </div>
      </Html>
    )
  }

  const ResourcePanel = () => {
    if (!showResourcePanel) return null

    return (
      <Html
        position={[-35, 15, 0]}
        center={false}
        distanceFactor={20}
        occlude={false}
      >
        <div className="bg-black/85 backdrop-blur-sm rounded-lg p-4 min-w-80 border border-blue-500/30">
          <h4 className="text-white font-bold mb-3 flex items-center justify-between">
            Festival Resources
            <button
              onClick={() => setShowResourcePanel(false)}
              className="text-gray-400 hover:text-white text-sm"
            >
              ✕
            </button>
          </h4>

          {/* Budget */}
          <div className="mb-4">
            <div className="text-sm text-gray-300 mb-1">Budget</div>
            <div className="flex justify-between text-xs">
              <span className="text-green-400">${resources.budget.remaining.toLocaleString()}</span>
              <span className="text-gray-400">/ ${resources.budget.totalBudget.toLocaleString()}</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded mt-1">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded"
                style={{ width: `${(resources.budget.remaining / resources.budget.totalBudget) * 100}%` }}
              />
            </div>
          </div>

          {/* Power */}
          <div className="mb-4">
            <div className="text-sm text-gray-300 mb-1">Power Usage</div>
            <div className="flex justify-between text-xs">
              <span className={resources.powerUsed > resources.powerAvailable * 0.9 ? 'text-red-400' : 'text-blue-400'}>
                {resources.powerUsed.toFixed(0)}kW
              </span>
              <span className="text-gray-400">/ {resources.powerAvailable.toFixed(0)}kW</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded mt-1">
              <div
                className={`h-full rounded ${
                  resources.powerUsed > resources.powerAvailable * 0.9
                    ? 'bg-red-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(100, (resources.powerUsed / resources.powerAvailable) * 100)}%` }}
              />
            </div>
          </div>

          {/* Crew Status */}
          <div className="mb-4">
            <div className="text-sm text-gray-300 mb-2">
              Crew ({resources.crew.length})
              <button
                onClick={() => setShowCrewPanel(!showCrewPanel)}
                className="ml-2 text-blue-400 hover:text-blue-300 text-xs"
              >
                Manage
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {['tech', 'creative', 'manager', 'security'].map(type => {
                const count = resources.crew.filter(member => member.type === type).length
                return (
                  <div key={type} className="flex justify-between">
                    <span className="text-gray-400 capitalize">{type}:</span>
                    <span className="text-white">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <button
              onClick={() => setShowContentLibrary(!showContentLibrary)}
              className="w-full py-1 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded"
            >
              Content Library
            </button>
            <button
              onClick={() => setShowWeatherForecast(!showWeatherForecast)}
              className="w-full py-1 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
            >
              Weather Forecast
            </button>
          </div>
        </div>
      </Html>
    )
  }

  const PerformanceSchedule = () => (
    <Html
      position={[35, 12, 0]}
      center={false}
      distanceFactor={20}
      occlude={false}
    >
      <div className="bg-black/85 backdrop-blur-sm rounded-lg p-4 min-w-72 border border-green-500/30">
        <h4 className="text-white font-bold mb-3">Performance Schedule</h4>

        {/* Time Display */}
        <div className="mb-4 text-center">
          <div className="text-lg font-mono text-cyan-400">
            {String(timeState.timeOfDay.hour).padStart(2, '0')}:
            {String(timeState.timeOfDay.minute).padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-400">
            Festival Time: {timeState.currentTime > 0 ? '+' : ''}{Math.floor(timeState.currentTime)}min
          </div>
        </div>

        {/* Upcoming Performances */}
        <div className="space-y-2">
          {upcomingPerformances
            .filter(p => p.startTime > timeState.currentTime)
            .slice(0, 4)
            .map(performance => (
              <div key={performance.id} className="bg-gray-800/50 rounded p-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-semibold text-white">{performance.artistName}</div>
                    <div className="text-xs text-gray-400">{performance.genre} • {performance.duration}min</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-cyan-400">
                      +{performance.startTime}min
                    </div>
                    <div className="text-xs text-gray-500">
                      {performance.expectedCrowd} ppl
                    </div>
                  </div>
                </div>
                {performance.startTime - timeState.currentTime < 30 && (
                  <button
                    onClick={() => {
                      const stage = findAppropriateStage(performance)
                      if (stage) startPerformance(stage, performance.id)
                    }}
                    className="mt-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded w-full"
                  >
                    Start Early
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>
    </Html>
  )

  const MetricsDisplay = () => (
    <Html
      position={[0, 20, -35]}
      center
      distanceFactor={25}
      occlude={false}
    >
      <div className="bg-black/85 backdrop-blur-sm rounded-lg p-4 min-w-96 border border-yellow-500/30">
        <h4 className="text-white font-bold mb-3 text-center">Festival Metrics</h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <MetricBar label="Crowd Satisfaction" value={gameplayMetrics.crowdSatisfaction} color="green" />
            <MetricBar label="Technical Rating" value={gameplayMetrics.technicalRating} color="blue" />
            <MetricBar label="Creativity Score" value={gameplayMetrics.creativityScore} color="purple" />
          </div>
          <div className="space-y-2">
            <MetricBar label="Efficiency Score" value={gameplayMetrics.efficiencyScore} color="cyan" />
            <MetricBar label="Reputation" value={resources.reputation} color="yellow" />
            <MetricBar label="Stress Level" value={resources.stress} color="red" inverse />
          </div>
        </div>

        <div className="mt-4 text-center">
          <div className="text-lg font-bold text-white">
            Overall Rating: {gameplayMetrics.overallRating.toFixed(1)}/100
          </div>
          <div className="text-sm text-gray-400">
            Current Crowd: {festivalCrowd.getCurrentCrowdSize()}
          </div>
        </div>
      </div>
    </Html>
  )

  const MetricBar = ({ label, value, color, inverse = false }: {
    label: string
    value: number
    color: string
    inverse?: boolean
  }) => {
    const colorClasses = {
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      cyan: 'bg-cyan-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500'
    }

    const displayValue = inverse ? 100 - value : value

    return (
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-300">{label}</span>
          <span className="text-white">{displayValue.toFixed(0)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded">
          <div
            className={`h-full rounded ${colorClasses[color as keyof typeof colorClasses]}`}
            style={{ width: `${displayValue}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Camera setup */}
      <PerspectiveCamera
        makeDefault
        position={[0, 15, 25]}
        fov={60}
        near={0.1}
        far={1000}
      />

      {/* Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={50}
        minDistance={5}
        maxPolarAngle={Math.PI * 0.45}
        target={[0, 0, -5]}
      />

      {/* UI Elements */}
      <TutorialOverlay />
      <ResourcePanel />
      <PerformanceSchedule />
      <MetricsDisplay />

      {/* Environment */}
      <color attach="background" args={['#0a0a0f']} />
      <fog attach="fog" args={['#0a0a0f', 30, 100]} />
    </>
  )
}

export default Level3Festival