import React, { Suspense, lazy, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Loader, ScrollControls, Scroll, useScroll, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei'
import { motion } from 'framer-motion'
import { Color } from 'three'

const SimpleHero3D = lazy(() => import('../../components/3d/SimpleHero3D'))

const HomePage = () => {
  // Memoize random positions and colors to prevent infinite re-renders
  const floatingOrbs = useMemo(() => {
    return [...Array(20)].map((_, i) => {
      const angle = (i / 20) * Math.PI * 2
      const radius = 4 + (i * 0.1) % 2 // Fixed radius based on index
      const hue = i / 20 // Fixed hue based on index
      const color = new Color().setHSL(hue, 1, 0.5)
      const emissive = new Color().setHSL(hue, 1, 0.3)

      return {
        key: i,
        position: [
          Math.cos(angle) * radius,
          Math.sin(i) * 2,
          Math.sin(angle) * radius
        ] as [number, number, number],
        color,
        emissive
      }
    })
  }, [])

  const interactiveElements = useMemo(() => {
    return [...Array(50)].map((_, i) => {
      const color = new Color().setHSL(0.6 + (i % 5) * 0.04, 1, 0.5) // Fixed based on index
      return {
        key: i,
        position: [
          ((i * 7) % 40 - 20) * 0.25, // Fixed position based on index
          ((i * 5) % 40 - 20) * 0.25,
          ((i * 3) % 40 - 20) * 0.25
        ] as [number, number, number],
        color
      }
    })
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black', position: 'relative', overflow: 'hidden' }}>
      {/* Full-screen 3D Canvas */}
      <Canvas shadows dpr={[1, 2]} style={{ position: 'absolute', top: 0, left: 0 }}>
        <PerspectiveCamera makeDefault position={[0, 2, 10]} fov={50} />

        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <spotLight position={[10, 20, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#8b5cf6" />

          {/* Environment */}
          <Environment preset="city" />

          <ScrollControls pages={5} damping={0.1}>
            {/* 3D Objects that respond to scroll */}
            <Scroll>
              {/* Hero Section */}
              <group position={[0, 0, 0]}>
                <mesh position={[0, 0, 0]} scale={[2, 2, 2]}>
                  <dodecahedronGeometry />
                  <meshPhysicalMaterial
                    color="#8b5cf6"
                    metalness={0.9}
                    roughness={0.1}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    transmission={0.8}
                    ior={1.5}
                    thickness={0.5}
                  />
                </mesh>

                {/* Floating orbs */}
                {floatingOrbs.map((orb) => (
                  <mesh
                    key={orb.key}
                    position={orb.position}
                  >
                    <sphereGeometry args={[0.2, 32, 32]} />
                    <meshStandardMaterial
                      color={orb.color}
                      emissive={orb.emissive}
                      emissiveIntensity={0.5}
                    />
                  </mesh>
                ))}
              </group>

              {/* Second Section - Project Showcase */}
              <group position={[0, -10, 0]}>
                <mesh position={[-3, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
                  <boxGeometry args={[2, 3, 0.5]} />
                  <meshPhysicalMaterial color="#ec4899" metalness={0.8} roughness={0.2} />
                </mesh>
                <mesh position={[0, 0, 0]} rotation={[0, -Math.PI / 4, 0]}>
                  <boxGeometry args={[2, 3, 0.5]} />
                  <meshPhysicalMaterial color="#3b82f6" metalness={0.8} roughness={0.2} />
                </mesh>
                <mesh position={[3, 0, 0]} rotation={[0, Math.PI / 3, 0]}>
                  <boxGeometry args={[2, 3, 0.5]} />
                  <meshPhysicalMaterial color="#10b981" metalness={0.8} roughness={0.2} />
                </mesh>
              </group>

              {/* Third Section - Interactive Elements */}
              <group position={[0, -20, 0]}>
                {interactiveElements.map((element) => (
                  <mesh
                    key={element.key}
                    position={element.position}
                  >
                    <icosahedronGeometry args={[0.3, 0]} />
                    <meshPhysicalMaterial
                      color={element.color}
                      metalness={1}
                      roughness={0}
                    />
                  </mesh>
                ))}
              </group>
            </Scroll>

            {/* HTML overlay with scroll */}
            <Scroll html style={{ width: '100%' }}>
              <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <motion.h1
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    style={{
                      fontSize: '6rem',
                      fontWeight: 'bold',
                      background: 'linear-gradient(45deg, #8b5cf6, #ec4899, #3b82f6)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      marginBottom: '2rem'
                    }}
                  >
                    LIGHTBRUSH
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.8)' }}
                  >
                    Immersive 3D Projection Mapping
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                    style={{ marginTop: '3rem' }}
                  >
                    <div style={{ fontSize: '0.875rem', opacity: 0.6 }}>
                      ↓ Scroll to explore the 3D experience
                    </div>
                  </motion.div>
                </div>
              </div>

              <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: 'white', maxWidth: '800px', padding: '2rem' }}>
                  <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Premium Projects</h2>
                  <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
                    Transform spaces into living canvases with cutting-edge projection mapping technology
                  </p>
                </div>
              </div>

              <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: 'white', maxWidth: '800px', padding: '2rem' }}>
                  <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Interactive Installations</h2>
                  <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
                    Merge physical and digital worlds with responsive, real-time visual experiences
                  </p>
                </div>
              </div>

              <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: 'white', maxWidth: '800px', padding: '2rem' }}>
                  <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Contact</h2>
                  <p style={{ fontSize: '1.5rem', opacity: 0.9 }}>
                    Let's create something extraordinary together
                  </p>
                  <button
                    style={{
                      marginTop: '2rem',
                      padding: '1rem 3rem',
                      fontSize: '1.2rem',
                      background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
                      border: 'none',
                      borderRadius: '50px',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'transform 0.3s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    Start a Project
                  </button>
                </div>
              </div>
            </Scroll>
          </ScrollControls>

          <ContactShadows position={[0, -4, 0]} opacity={0.5} scale={20} blur={1.5} />
        </Suspense>
      </Canvas>

      <Loader />
    </div>
  )
}

export default HomePage