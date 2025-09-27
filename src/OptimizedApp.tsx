import React, { Suspense, useState, useRef, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
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
} from '@react-three/drei';
import { motion } from 'framer-motion';
import { Mesh, Group, Color } from 'three';

// Performance providers and optimizations
import PerformanceProvider, { usePerformance } from './components/providers/PerformanceProvider';
import { useAnimationRegistration, AnimationPriority } from './hooks/useAnimationManager';
// import { PerformanceMonitor } from './hooks/usePerformanceMonitor'; // Component moved to separate file

// Optimized lazy-loaded components
import { Lazy3DComponent } from './components/optimization/LazyLoader3D';
import {
  // LazyInteractiveHero3D,
  // LazySacredGeometry,
  // LazyVJCareerGame3D,
  preloadCriticalComponents
} from './components/optimization/CodeSplitting';

// Store and game components
import { useGameStore } from './store/gameStore';
import { SimpleGameHUD } from './components/game/SimpleGameHUD';

// Optimized Game World Component with animation manager
const OptimizedGameWorld = React.memo(({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<Mesh>(null);
  const playerRef = useRef<Mesh>(null);
  const { vjCareerGame, startNewGame, addExperience, addMoney } = useGameStore();
  const { player } = vjCareerGame;
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [projectiles, setProjectiles] = useState<Array<{id: number, pos: [number, number, number]}>>([]);

  // Memoized game targets with stable references
  const gameTargets = useMemo(() => {
    return [...Array(8)].map((_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      const hue = i / 8;
      return {
        key: i,
        position: [
          Math.cos(angle) * 5,
          Math.sin(angle) * 2,
          0
        ] as [number, number, number],
        speed: (i % 3) + 1,
        color: new Color().setHSL(hue, 1, 0.5),
        emissive: new Color().setHSL(hue, 1, 0.5)
      };
    });
  }, []);

  // Optimized animation callback with centralized animation manager
  const gameAnimationCallback = useCallback((state: { clock: { elapsedTime: number } }) => {
    if (meshRef.current && gameActive) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }

    if (playerRef.current && gameActive) {
      playerRef.current.position.x = Math.sin(state.clock.elapsedTime * 2) * 3;
      playerRef.current.position.y = Math.cos(state.clock.elapsedTime * 1.5) * 2;
      playerRef.current.rotation.z = state.clock.elapsedTime * 2;
    }
  }, [gameActive]);

  // Register with animation manager
  useAnimationRegistration(
    'game-world-animation',
    gameAnimationCallback,
    AnimationPriority.HIGH,
    45, // 45 FPS for game elements
    [gameActive]
  );

  const handleGameStart = useCallback(() => {
    setGameActive(true);
    startNewGame();
    setScore(0);
  }, [startNewGame]);

  const handleTargetClick = useCallback(() => {
    if (gameActive) {
      setScore(prev => prev + 100);
      addExperience(10);
      addMoney(5);

      const timestamp = Date.now();
      const posX = ((timestamp % 6000) / 1000) - 3;
      setProjectiles(prev => [...prev, {
        id: timestamp,
        pos: [posX, -3, 0]
      }]);
    }
  }, [gameActive, addExperience, addMoney]);

  return (
    <group position={position}>
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
          <Text position={[0, 5, 0]} fontSize={0.6} color="#10b981" anchorX="center">
            PROJECTION MAPPING GAME
          </Text>
          <Text position={[0, 4, 0]} fontSize={0.4} color="white" anchorX="center">
            Score: {score}
          </Text>
          <Text position={[0, -4, 0]} fontSize={0.3} color="yellow" anchorX="center">
            Level {player?.level || 1} • {player?.experience || 0} XP • ${player?.money || 0}
          </Text>

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

          {projectiles.map(p => (
            <Sphere key={p.id} position={p.pos} args={[0.2, 16, 16]}>
              <meshBasicMaterial color="#ffff00" />
            </Sphere>
          ))}

          <Sparkles
            count={30} // Reduced from 50
            scale={10}
            size={3}
            speed={2}
            color="#10b981"
          />
        </>
      )}
    </group>
  );
});

// Optimized Orbital System Component
const OptimizedOrbitalSystem = React.memo(() => {
  const groupRef = useRef<Group>(null);
  const { performanceLevel } = usePerformance();

  // Adaptive particle count based on performance
  const orbitalCount = useMemo(() => {
    switch (performanceLevel) {
      case 'high': return 40;
      case 'medium': return 25;
      case 'low': return 15;
      case 'critical': return 8;
      default: return 25;
    }
  }, [performanceLevel]);

  const orbitalSystem = useMemo(() => {
    return [...Array(orbitalCount)].map((_, i) => {
      const angle = (i / orbitalCount) * Math.PI * 2;
      const radius = 6 + Math.sin(i * 0.5) * 3;
      const y = Math.sin(i * 0.3) * 4;
      const hue = (i / orbitalCount) * 0.3 + 0.5;

      return {
        key: i,
        position: [
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius
        ] as [number, number, number],
        size: 0.3 + ((i % 5) * 0.04),
        speed: 2 + i * 0.1,
        color: new Color().setHSL(hue, 1, 0.6),
        emissive: new Color().setHSL(hue, 1, 0.5)
      };
    });
  }, [orbitalCount]);

  const orbitalAnimationCallback = useCallback((state: { clock: { elapsedTime: number } }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  }, []);

  useAnimationRegistration(
    'orbital-system',
    orbitalAnimationCallback,
    AnimationPriority.LOW,
    20, // 20 FPS for background elements
    []
  );

  return (
    <group ref={groupRef}>
      {orbitalSystem.map((orb) => (
        <Float key={orb.key} speed={orb.speed} floatIntensity={1}>
          <Sphere position={orb.position} args={[orb.size, 16, 16]}>
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
  );
});

// Optimized Particle Field Component
const OptimizedParticleField = React.memo(() => {
  const { performanceLevel } = usePerformance();

  const particleCount = useMemo(() => {
    switch (performanceLevel) {
      case 'high': return 150;
      case 'medium': return 100;
      case 'low': return 50;
      case 'critical': return 25;
      default: return 100;
    }
  }, [performanceLevel]);

  const particleField = useMemo(() => {
    return [...Array(particleCount)].map((_, i) => ({
      key: i,
      position: [
        ((i * 7) % 40 - 20),
        ((i * 5) % 40 - 20),
        ((i * 3) % 40 - 20)
      ] as [number, number, number],
      size: 0.2 + ((i % 5) * 0.06),
      speed: (i % 3) + 1,
      intensity: (i % 2) + 1,
      color: new Color().setHSL(i / particleCount, 1, 0.6),
      emissive: new Color().setHSL(i / particleCount, 1, 0.5)
    }));
  }, [particleCount]);

  return (
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
  );
});

// Main optimized 3D scene
const OptimizedMainScene = React.memo(() => {
  const { performanceLevel } = usePerformance();

  // Map performance level to canvas quality level
  const canvasQualityLevel = useMemo(() => {
    switch (performanceLevel) {
      case 'critical': return 'low';
      case 'low': return 'low';
      case 'medium': return 'medium';
      case 'high': return 'high';
      default: return 'medium';
    }
  }, [performanceLevel]);

  // Memoized portfolio projects
  const portfolioProjects = useMemo(() => [
    { color: '#ec4899', title: 'Urban Projection', pos: [-6, 0, 0] as [number, number, number] },
    { color: '#3b82f6', title: 'Festival Mapping', pos: [-2, 0, 0] as [number, number, number] },
    { color: '#f59e0b', title: 'Museum Display', pos: [2, 0, 0] as [number, number, number] },
    { color: '#10b981', title: 'Concert Visual', pos: [6, 0, 0] as [number, number, number] },
  ], []);

  // Adaptive environment and effects based on performance
  const environmentSettings = useMemo(() => {
    switch (performanceLevel) {
      case 'high':
        return {
          stars: { count: 8000, factor: 4 },
          sparkles: { count: 200, scale: 20 },
          shadows: true
        };
      case 'medium':
        return {
          stars: { count: 4000, factor: 3 },
          sparkles: { count: 100, scale: 15 },
          shadows: true
        };
      case 'low':
        return {
          stars: { count: 2000, factor: 2 },
          sparkles: { count: 50, scale: 10 },
          shadows: false
        };
      case 'critical':
        return {
          stars: { count: 1000, factor: 1 },
          sparkles: { count: 25, scale: 8 },
          shadows: false
        };
      default:
        return {
          stars: { count: 4000, factor: 3 },
          sparkles: { count: 100, scale: 15 },
          shadows: true
        };
    }
  }, [performanceLevel]);

  return (
    <>
      <ambientLight intensity={0.2} />
      <spotLight position={[20, 20, 20]} angle={0.3} penumbra={1} intensity={2} castShadow={environmentSettings.shadows} />
      <directionalLight position={[-10, 10, 5]} intensity={0.5} color="#8b5cf6" />
      <pointLight position={[0, 10, 0]} intensity={1} color="#ec4899" />

      <Environment preset="city" />
      <Stars
        radius={200}
        depth={100}
        count={environmentSettings.stars.count}
        factor={environmentSettings.stars.factor}
        saturation={0}
        fade
        speed={1}
      />
      <Sparkles
        count={environmentSettings.sparkles.count}
        scale={environmentSettings.sparkles.scale}
        size={2}
        speed={0.5}
        color="#8b5cf6"
      />

      <ScrollControls pages={5} damping={0.15}>
        <Scroll>
          {/* Hero Section with Lazy-loaded Sacred Geometry */}
          <group position={[0, 0, 0]}>
            <Lazy3DComponent
              componentName="sacred-geometry"
              importer={() => import('./components/3d/optimized/OptimizedSacredGeometry').then(m => ({ default: m.SacredGeometryComposite }))}
              canvasProps={{ qualityLevel: canvasQualityLevel }}
              className="w-full h-full"
            />

            {/* Orbital system */}
            <OptimizedOrbitalSystem />
          </group>

          {/* Portfolio Gallery */}
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

          {/* Lazy-loaded VJ Career Game */}
          <Lazy3DComponent
            componentName="vj-career-game"
            importer={() => import('./components/game/VJCareerGame3D')}
            canvasProps={{ qualityLevel: canvasQualityLevel }}
            className="w-full h-full"
          />

          {/* Optimized Game World */}
          <OptimizedGameWorld position={[0, -35, 0]} />

          {/* Adaptive Particle Field */}
          {performanceLevel !== 'critical' && <OptimizedParticleField />}

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

        {/* Optimized HTML Overlay */}
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

          {/* Additional scroll sections */}
          <div style={{ height: '100vh' }} />
          <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', pointerEvents: 'auto' }}>
              <h2 style={{
                color: '#8b5cf6',
                fontSize: '4rem',
                textShadow: '0 0 30px rgba(139, 92, 246, 0.8)',
                animation: 'pulse 2s infinite'
              }}>
                VJ CAREER RPG
              </h2>
              <p style={{ color: 'white', fontSize: '1.5rem', marginBottom: '1rem' }}>
                Start your journey as a projection mapping VJ!
              </p>
              <p style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>
                Click the purple crystal to begin your career
              </p>
            </div>
          </div>
          <div style={{ height: '100vh' }} />
          <div style={{ height: '100vh' }} />
        </Scroll>
      </ScrollControls>

      {environmentSettings.shadows && (
        <ContactShadows
          position={[0, -5, 0]}
          opacity={0.5}
          scale={40}
          blur={2}
          color="#8b5cf6"
        />
      )}
    </>
  );
});

// Optimized App Component with Performance Provider
function OptimizedApp() {
  // Preload critical components on app mount
  React.useEffect(() => {
    preloadCriticalComponents();
  }, []);

  return (
    <PerformanceProvider>
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
          gl={{
            powerPreference: "high-performance",
            antialias: true,
            alpha: true
          }}
          performance={{ min: 0.5 }}
        >
          <Suspense fallback={null}>
            <OptimizedMainScene />
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

        {/* Performance monitoring overlay */}
        {/* <PerformanceMonitor

        {/* RPG UI Overlays */}
        <SimpleGameHUD />
      </div>
    </PerformanceProvider>
  );
}

export default OptimizedApp;