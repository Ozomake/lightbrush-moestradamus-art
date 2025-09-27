import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Box, Sphere, OrbitControls } from '@react-three/drei'

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Box position={[-1.2, 0, 0]} args={[1, 1, 1]}>
        <meshStandardMaterial color={'orange'} />
      </Box>
      <Sphere position={[1.2, 0, 0]} args={[1, 32, 32]}>
        <meshStandardMaterial color={'hotpink'} />
      </Sphere>
      <OrbitControls />
    </>
  )
}

function MinimalApp() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <h1 style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        color: 'white',
        zIndex: 1000,
        fontFamily: 'Arial, sans-serif'
      }}>
        Lightbrush 3D Sacred Geometry Dashboard - Minimal Version
      </h1>
      <Canvas>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default MinimalApp