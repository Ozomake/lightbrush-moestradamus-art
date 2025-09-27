import { StrictMode, Suspense, useState, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
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
import { Color } from 'three'
import './index.css'
import { MetatronsCube, FlowerOfLife, Merkaba, SacredGeometryComposite } from './components/3d/SacredGeometry'

// RPG Game Modal
function RPGModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a0033 0%, #2d1b3d 100%)',
        padding: '2rem',
        borderRadius: '15px',
        border: '2px solid #8b5cf6',
        maxWidth: '800px',
        maxHeight: '600px',
        color: 'white',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '15px',
            background: 'none',
            border: 'none',
            color: '#8b5cf6',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>

        <h2 style={{ color: '#8b5cf6', marginBottom: '1rem', textAlign: 'center' }}>
          🎮 VJ CAREER RPG
        </h2>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ marginBottom: '1rem' }}>Start your journey as a projection mapping VJ!</p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              padding: '1rem',
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid #8b5cf6',
              borderRadius: '8px'
            }}>
              <h3 style={{ color: '#8b5cf6', marginBottom: '0.5rem' }}>🏛️ Venues</h3>
              <p style={{ fontSize: '0.9rem' }}>Perform at legendary venues from basement clubs to Madison Square Garden</p>
            </div>

            <div style={{
              padding: '1rem',
              background: 'rgba(236, 72, 153, 0.1)',
              border: '1px solid #ec4899',
              borderRadius: '8px'
            }}>
              <h3 style={{ color: '#ec4899', marginBottom: '0.5rem' }}>🎨 Equipment</h3>
              <p style={{ fontSize: '0.9rem' }}>Purchase and upgrade projection equipment</p>
            </div>

            <div style={{
              padding: '1rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid #10b981',
              borderRadius: '8px'
            }}>
              <h3 style={{ color: '#10b981', marginBottom: '0.5rem' }}>⭐ Reputation</h3>
              <p style={{ fontSize: '0.9rem' }}>Build your reputation in the VJ community</p>
            </div>
          </div>

          <button style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            🚀 Start Career
          </button>
        </div>
      </div>
    </div>
  )
}

// Main 3D Scene
function MainScene() {
  const [showRPG, setShowRPG] = useState(false)

  const orbitalSystem = useMemo(() => {
    return [...Array(20)].map((_, i) => {
      const angle = (i / 20) * Math.PI * 2
      const radius = 6 + Math.sin(i * 0.5) * 2
      const y = Math.sin(i * 0.3) * 3
      const hue = (i / 20) * 0.3 + 0.5
      const color = new Color().setHSL(hue, 1, 0.6)

      return {
        key: i,
        position: [
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius
        ],
        size: 0.2 + ((i % 3) * 0.05),
        speed: 1 + i * 0.05,
        color
      }
    })
  }, [])

  return (
    <>
      <ambientLight intensity={0.2} />
      <spotLight position={[20, 20, 20]} angle={0.3} penumbra={1} intensity={2} castShadow />
      <directionalLight position={[-10, 10, 5]} intensity={0.5} color="#8b5cf6" />
      <pointLight position={[0, 10, 0]} intensity={1} color="#ec4899" />

      <Environment preset="city" />
      <Stars radius={200} depth={100} count={8000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={200} scale={20} size={2} speed={0.5} color="#8b5cf6" />

      <ScrollControls pages={3} damping={0.15}>
        <Scroll>
          {/* Hero Section - Sacred Geometry */}
          <group position={[0, 0, 0]}>
            {/* Central Metatron's Cube */}
            <Float speed={0.5} rotationIntensity={0.2} floatIntensity={1}>
              <MetatronsCube scale={2} color="#8b5cf6" emissiveIntensity={0.8} />
            </Float>

            {/* Flower of Life - left */}
            <Float speed={0.8} rotationIntensity={0.3} floatIntensity={0.7}>
              <group position={[-8, 2, -5]}>
                <FlowerOfLife scale={2.5} color="#ec4899" />
              </group>
            </Float>

            {/* Flower of Life - right */}
            <Float speed={0.6} rotationIntensity={0.4} floatIntensity={0.5}>
              <group position={[8, -2, -3]}>
                <FlowerOfLife scale={2} color="#f59e0b" />
              </group>
            </Float>

            {/* Merkaba - floating above */}
            <Float speed={1.2} rotationIntensity={0.5} floatIntensity={1.5}>
              <group position={[0, 6, -2]}>
                <Merkaba scale={1.5} color="#10b981" />
              </group>
            </Float>

            {/* Dynamic orbital system */}
            {orbitalSystem.map((orb) => (
              <Float key={orb.key} speed={orb.speed} floatIntensity={1}>
                <Sphere position={orb.position} args={[orb.size, 16, 16]}>
                  <MeshDistortMaterial
                    color={orb.color}
                    speed={2}
                    distort={0.4}
                    radius={1}
                    emissive={orb.color}
                    emissiveIntensity={0.5}
                    metalness={0.8}
                    roughness={0.2}
                  />
                </Sphere>
              </Float>
            ))}
          </group>

          {/* Portfolio Section with More Sacred Geometry */}
          <group position={[0, -15, 0]}>
            {/* Central RPG Portal */}
            <Float speed={1} rotationIntensity={0.5}>
              <Box
                args={[4, 2, 0.5]}
                onClick={() => setShowRPG(true)}
                onPointerOver={(e) => e.object.scale.setScalar(1.1)}
                onPointerOut={(e) => e.object.scale.setScalar(1)}
              >
                <meshPhysicalMaterial
                  color="#8b5cf6"
                  metalness={0.95}
                  roughness={0.05}
                  emissive="#8b5cf6"
                  emissiveIntensity={0.4}
                />
              </Box>
              <Text
                position={[0, 0, 0.3]}
                fontSize={0.5}
                color="white"
                anchorX="center"
              >
                🎮 PLAY VJ RPG
              </Text>
            </Float>

            {/* More Metatron's Cubes around */}
            <Float speed={0.8} rotationIntensity={0.6} floatIntensity={1.2}>
              <group position={[-10, 5, -8]}>
                <MetatronsCube scale={1.5} color="#ec4899" emissiveIntensity={0.6} />
              </group>
            </Float>

            <Float speed={1.1} rotationIntensity={0.4} floatIntensity={0.8}>
              <group position={[10, -3, -6]}>
                <MetatronsCube scale={1.8} color="#10b981" emissiveIntensity={0.7} />
              </group>
            </Float>

            {/* Additional Flower of Life patterns */}
            <Float speed={0.9} rotationIntensity={0.7} floatIntensity={1.1}>
              <group position={[-6, -6, -10]}>
                <FlowerOfLife scale={3} color="#f59e0b" />
              </group>
            </Float>

            <Float speed={0.7} rotationIntensity={0.5} floatIntensity={0.9}>
              <group position={[6, 8, -7]}>
                <FlowerOfLife scale={2.5} color="#8b5cf6" />
              </group>
            </Float>

            {/* Sacred Geometry Composite */}
            <Float speed={0.5} rotationIntensity={0.3} floatIntensity={0.7}>
              <group position={[0, -10, -12]}>
                <SacredGeometryComposite scale={1.2} />
              </group>
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

          <div style={{ height: '100vh' }} />
          <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', pointerEvents: 'auto' }}>
              <button
                onClick={() => setShowRPG(true)}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  padding: '20px 40px',
                  borderRadius: '15px',
                  color: 'white',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 0 30px rgba(139, 92, 246, 0.5)'
                }}
              >
                🎮 Launch VJ Career RPG
              </button>
            </div>
          </div>
        </Scroll>
      </ScrollControls>

      <ContactShadows
        position={[0, -5, 0]}
        opacity={0.5}
        scale={40}
        blur={2}
        color="#8b5cf6"
      />

      <RPGModal isOpen={showRPG} onClose={() => setShowRPG(false)} />
    </>
  )
}

// Main App Component
function App() {
  return (
    <>
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
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
      </div>
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
