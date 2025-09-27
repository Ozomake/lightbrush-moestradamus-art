import { Suspense, useState, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  Loader,
  ScrollControls,
  Scroll,
  Environment,
  ContactShadows,
  Stars,
  Float,
  Text,
  Box,
  Sphere,
  MeshDistortMaterial,
  Sparkles
} from '@react-three/drei'
import { motion } from 'framer-motion'
import { Mesh, Color } from 'three'
import { useGameStore } from './store/gameStore'
import VJCareerGame3D from './components/game/VJCareerGame3D'
import { SimpleGameHUD } from './components/game/SimpleGameHUD'
// import { SkillTree } from './components/game/SkillTree'
// import { Inventory } from './components/game/Inventory'
import { FlowerOfLife, Merkaba, SacredGeometryComposite } from './components/3d/SacredGeometry'

// Simple placeholder for the old game
function GameWorld({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<Mesh>(null)
  const playerRef = useRef<Mesh>(null)
  const { vjCareerGame, startNewGame, addExperience, addMoney } = useGameStore()
  const { player } = vjCareerGame
  const [gameActive, setGameActive] = useState(false)
  const [score, setScore] = useState(0)
  const [projectiles, setProjectiles] = useState<Array<{id: number, pos: [number, number, number]}>>([])

  // Memoize game targets to prevent infinite re-renders
  const gameTargets = useMemo(() => {
    return [...Array(8)].map((_, i) => {
      const angle = (i / 8) * Math.PI * 2
      const hue = i / 8
      const color = new Color().setHSL(hue, 1, 0.5)
      const emissive = new Color().setHSL(hue, 1, 0.5)

      return {
        key: i,
        position: [
          Math.cos(angle) * 5,
          Math.sin(angle) * 2,
          0
        ] as [number, number, number],
        speed: (i % 3) + 1,
        color,
        emissive
      }
    })
  }, [])

  useFrame((state) => {
    if (meshRef.current && gameActive) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
    }

    // Move player with sine wave
    if (playerRef.current && gameActive) {
      playerRef.current.position.x = Math.sin(state.clock.elapsedTime * 2) * 3
      playerRef.current.position.y = Math.cos(state.clock.elapsedTime * 1.5) * 2
      playerRef.current.rotation.z = state.clock.elapsedTime * 2
    }

    // Remove the projectile state updates from useFrame to prevent infinite loops
    // Projectiles will be managed through user interactions only
  })

  const handleGameStart = () => {
    setGameActive(true)
    startNewGame()
    setScore(0)
  }

  const handleTargetClick = () => {
    if (gameActive) {
      setScore(prev => prev + 100)
      addExperience(10)
      addMoney(5)

      // Launch projectile with fixed position based on timestamp
      const timestamp = Date.now()
      const posX = ((timestamp % 6000) / 1000) - 3 // Range: -3 to 3
      setProjectiles(prev => [...prev, {
        id: timestamp,
        pos: [posX, -3, 0]
      }])
    }
  }

  return (
    <group position={position}>
      {/* Game Controller Crystal */}
      <Float speed={2} rotationIntensity={0.5}>
        <mesh ref={meshRef} onClick={handleGameStart}>
          <octahedronGeometry args={[2, 0]} />
          <meshPhysicalMaterial
            color="#10b981"
            metalness={0.9}
            roughness={0.1}
            emissive="#10b981"
            emissiveIntensity={gameActive ? 0.8 : 0.2}
            wireframe={gameActive}
          />
        </mesh>
      </Float>

      {!gameActive && (
        <Text position={[0, 3, 0]} fontSize={0.5} color="#10b981" anchorX="center">
          CLICK TO START GAME
        </Text>
      )}

      {gameActive && (
        <>
          {/* Game UI */}
          <Text position={[0, 5, 0]} fontSize={0.6} color="#10b981" anchorX="center">
            PROJECTION MAPPING GAME
          </Text>
          <Text position={[0, 4, 0]} fontSize={0.4} color="white" anchorX="center">
            Score: {score}
          </Text>
          <Text position={[0, -4, 0]} fontSize={0.3} color="yellow" anchorX="center">
            Level {player?.level || 1} • {player?.experience || 0} XP • ${player?.money || 0}
          </Text>

          {/* Player Avatar */}
          <mesh ref={playerRef} position={[0, 0, 2]}>
            <coneGeometry args={[0.5, 1, 8]} />
            <meshPhysicalMaterial
              color="#ec4899"
              metalness={1}
              roughness={0}
              emissive="#ec4899"
              emissiveIntensity={0.5}
            />
          </mesh>

          {/* Game Targets */}
          {gameTargets.map((target) => (
            <Float key={target.key} speed={target.speed} floatIntensity={2}>
              <Box
                position={target.position}
                args={[0.8, 0.8, 0.8]}
                onClick={handleTargetClick}
              >
                <meshPhysicalMaterial
                  color={target.color}
                  emissive={target.emissive}
                  emissiveIntensity={0.6}
                  metalness={0.8}
                  roughness={0.2}
                />
              </Box>
            </Float>
          ))}

          {/* Projectiles */}
          {projectiles.map(p => (
            <Sphere key={p.id} position={p.pos} args={[0.2, 16, 16]}>
              <meshBasicMaterial color="#ffff00" />
            </Sphere>
          ))}

          {/* Particle Effects */}
          <Sparkles
            count={50}
            scale={10}
            size={3}
            speed={2}
            color="#10b981"
          />
        </>
      )}
    </group>
  )
}

// Main 3D Scene
function MainScene() {
  // Memoize orbital system to prevent infinite re-renders
  const orbitalSystem = useMemo(() => {
    return [...Array(40)].map((_, i) => {
      const angle = (i / 40) * Math.PI * 2
      const radius = 6 + Math.sin(i * 0.5) * 3
      const y = Math.sin(i * 0.3) * 4
      const hue = (i / 40) * 0.3 + 0.5
      const color = new Color().setHSL(hue, 1, 0.6)
      const emissive = new Color().setHSL(hue, 1, 0.5)

      return {
        key: i,
        position: [
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius
        ] as [number, number, number],
        size: 0.3 + ((i % 5) * 0.04),
        speed: 2 + i * 0.1,
        color,
        emissive
      }
    })
  }, [])

  // Memoize particle field to prevent infinite re-renders
  const particleField = useMemo(() => {
    return [...Array(150)].map((_, i) => {
      const speed = (i % 3) + 1         // Fixed speed based on index (1-3)
      const intensity = (i % 2) + 1     // Fixed intensity based on index (1-2)
      const posX = ((i * 7) % 40 - 20)  // Fixed position X
      const posY = ((i * 5) % 40 - 20)  // Fixed position Y
      const posZ = ((i * 3) % 40 - 20)  // Fixed position Z
      const size = 0.2 + ((i % 5) * 0.06) // Fixed size (0.2-0.44)
      const hue = (i / 150)              // Fixed hue based on index
      const color = new Color().setHSL(hue, 1, 0.6)
      const emissive = new Color().setHSL(hue, 1, 0.5)

      return {
        key: i,
        position: [posX, posY, posZ] as [number, number, number],
        size,
        speed,
        intensity,
        color,
        emissive
      }
    })
  }, [])

  // Memoize portfolio projects to prevent infinite re-renders
  const portfolioProjects = useMemo(() => [
    { color: '#ec4899', title: 'Urban Projection', pos: [-6, 0, 0] as [number, number, number] },
    { color: '#3b82f6', title: 'Festival Mapping', pos: [-2, 0, 0] as [number, number, number] },
    { color: '#f59e0b', title: 'Museum Display', pos: [2, 0, 0] as [number, number, number] },
    { color: '#10b981', title: 'Concert Visual', pos: [6, 0, 0] as [number, number, number] },
  ], [])

  return (
    <>
      <ambientLight intensity={0.2} />
      <spotLight position={[20, 20, 20]} angle={0.3} penumbra={1} intensity={2} castShadow />
      <directionalLight position={[-10, 10, 5]} intensity={0.5} color="#8b5cf6" />
      <pointLight position={[0, 10, 0]} intensity={1} color="#ec4899" />

      <Environment preset="city" />
      <Stars radius={200} depth={100} count={8000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={200} scale={20} size={2} speed={0.5} color="#8b5cf6" />

      <ScrollControls pages={5} damping={0.15}>
        <Scroll>
          {/* Hero Section - Sacred Geometry */}
          <group position={[0, 0, 0]}>
            <Float speed={0.5} rotationIntensity={0.2} floatIntensity={1}>
              <SacredGeometryComposite scale={1.5} />
            </Float>

            {/* Additional sacred geometry elements */}
            <Float speed={1} rotationIntensity={0.3} floatIntensity={0.5}>
              <group position={[5, 2, -3]}>
                <Merkaba scale={0.5} color="#f59e0b" />
              </group>
            </Float>

            <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.7}>
              <group position={[-5, -2, -3]}>
                <FlowerOfLife scale={0.8} color="#3b82f6" />
              </group>
            </Float>

            {/* Dynamic orbital system */}
            {orbitalSystem.map((orb) => (
              <Float key={orb.key} speed={orb.speed} floatIntensity={1}>
                <Sphere
                  position={orb.position}
                  args={[orb.size, 32, 32]}
                >
                  <MeshDistortMaterial
                    color={orb.color}
                    speed={2}
                    distort={0.4}
                    radius={1}
                    emissive={orb.emissive}
                    emissiveIntensity={0.5}
                    metalness={0.8}
                    roughness={0.2}
                  />
                </Sphere>
              </Float>
            ))}
          </group>

          {/* Portfolio Gallery - 3D Cards */}
          <group position={[0, -10, 0]}>
            <Text position={[0, 4, 0]} fontSize={1} color="white" anchorX="center">
              PORTFOLIO
            </Text>
            {portfolioProjects.map((project, i) => (
              <Float key={i} speed={1 + i * 0.2} rotationIntensity={0.5}>
                <group position={project.pos}>
                  <Box args={[2.5, 3.5, 0.3]}>
                    <meshPhysicalMaterial
                      color={project.color}
                      metalness={0.9}
                      roughness={0.1}
                      clearcoat={1}
                      emissive={project.color}
                      emissiveIntensity={0.3}
                    />
                  </Box>
                  <Text
                    position={[0, 0, 0.2]}
                    fontSize={0.3}
                    color="white"
                    anchorX="center"
                  >
                    {project.title}
                  </Text>
                </group>
              </Float>
            ))}
          </group>

          {/* VJ Career RPG Game */}
          <VJCareerGame3D position={[0, -20, 0]} />

          {/* Simple game world for additional gameplay */}
          <GameWorld position={[0, -35, 0]} />

          {/* Particle Field */}
          <group position={[0, -30, 0]}>
            {particleField.map((particle) => (
              <Float key={particle.key} speed={particle.speed} floatIntensity={particle.intensity}>
                <mesh position={particle.position}>
                  <icosahedronGeometry args={[particle.size, 0]} />
                  <meshPhysicalMaterial
                    color={particle.color}
                    metalness={1}
                    roughness={0}
                    emissive={particle.emissive}
                    emissiveIntensity={0.5}
                  />
                </mesh>
              </Float>
            ))}
          </group>

          {/* Contact Section */}
          <group position={[0, -40, 0]}>
            <Float speed={1} rotationIntensity={0.5}>
              <Box args={[5, 2.5, 0.5]}>
                <meshPhysicalMaterial
                  color="#ec4899"
                  metalness={0.95}
                  roughness={0.05}
                  emissive="#ec4899"
                  emissiveIntensity={0.4}
                />
              </Box>
              <Text
                position={[0, 0, 0.3]}
                fontSize={0.6}
                color="white"
                anchorX="center"
              >
                START A PROJECT
              </Text>
            </Float>
          </group>
        </Scroll>

        {/* HTML Overlay */}
        <Scroll html style={{ width: '100%', pointerEvents: 'none' }}>
          <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{ textAlign: 'center' }}
            >
              <h1 style={{
                fontSize: 'clamp(4rem, 10vw, 10rem)',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #feca57 75%, #667eea 100%)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'gradient 5s ease infinite',
                marginBottom: '1rem',
                textShadow: '0 0 80px rgba(139, 92, 246, 0.5)'
              }}>
                LIGHTBRUSH
              </h1>
              <p style={{
                fontSize: 'clamp(1rem, 3vw, 2rem)',
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 300,
                letterSpacing: '0.2em'
              }}>
                IMMERSIVE 3D EXPERIENCES
              </p>
            </motion.div>
          </div>

          {/* Spacers for scroll sections */}
          <div style={{ height: '100vh' }} />
          <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', pointerEvents: 'auto' }}>
              <h2 style={{
                color: '#8b5cf6',
                fontSize: '4rem',
                textShadow: '0 0 30px rgba(139, 92, 246, 0.8)',
                animation: 'pulse 2s infinite'
              }}>
                🎮 VJ CAREER RPG
              </h2>
              <p style={{ color: 'white', fontSize: '1.5rem', marginBottom: '1rem' }}>
                Start your journey as a projection mapping VJ!
              </p>
              <p style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>
                Click the purple crystal to begin your career
              </p>
              <div style={{
                marginTop: '2rem',
                padding: '1rem',
                background: 'rgba(139, 92, 246, 0.1)',
                borderRadius: '10px',
                border: '2px solid #8b5cf6'
              }}>
                <p style={{ color: 'white', fontSize: '1rem', marginBottom: '0.5rem' }}>
                  🏛️ Perform at legendary venues from basement clubs to Madison Square Garden
                </p>
                <p style={{ color: 'white', fontSize: '1rem', marginBottom: '0.5rem' }}>
                  🎨 Purchase and upgrade projection equipment
                </p>
                <p style={{ color: 'white', fontSize: '1rem' }}>
                  ⭐ Build your reputation in the VJ community
                </p>
              </div>
            </div>
          </div>
          <div style={{ height: '100vh' }} />
          <div style={{ height: '100vh' }} />
        </Scroll>
      </ScrollControls>

      <ContactShadows
        position={[0, -5, 0]}
        opacity={0.5}
        scale={40}
        blur={2}
        color="#8b5cf6"
      />
    </>
  )
}

// Main App Component - Full 3D Experience
function App() {
  return (
    <>
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
        * {
          cursor: crosshair;
        }
      `}</style>

      <div style={{
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(ellipse at center, #1a0033 0%, #000000 100%)',
        position: 'fixed',
        top: 0,
        left: 0
      }}>
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 2, 10], fov: 50 }}
        >
          <Suspense fallback={null}>
            <MainScene />
          </Suspense>
        </Canvas>

        <Loader
          containerStyles={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
          barStyles={{
            background: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)'
          }}
          dataStyles={{ color: 'white', fontSize: '1.2rem' }}
        />

        {/* RPG UI Overlays */}
        <SimpleGameHUD />
        {/* <SkillTree />
        <Inventory /> */}
      </div>
    </>
  )
}

export default App