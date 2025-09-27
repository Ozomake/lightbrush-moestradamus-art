// React import not needed with JSX transform
// import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Text } from '@react-three/drei';

function SimpleScene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* Main Text */}
      <Text
        position={[0, 2, 0]}
        fontSize={2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        LIGHTBRUSH
      </Text>

      <Text
        position={[0, 0.5, 0]}
        fontSize={0.5}
        color="#8b5cf6"
        anchorX="center"
        anchorY="middle"
      >
        PREMIUM 3D EXPERIENCES
      </Text>

      {/* Animated Boxes */}
      <Box position={[-3, 0, 0]} args={[1, 1, 1]}>
        <meshStandardMaterial color="#8b5cf6" />
      </Box>

      <Sphere position={[3, 0, 0]} args={[0.7, 32, 32]}>
        <meshStandardMaterial color="#ec4899" />
      </Sphere>

      <Box position={[0, -2, 0]} args={[1.5, 1.5, 1.5]}>
        <meshStandardMaterial color="#3b82f6" />
      </Box>

      {/* Controls */}
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
    </>
  );
}

export default function SimpleHero3D() {
  return (
    <div style={{ width: '100%', height: '100vh', position: 'absolute', top: 0, left: 0 }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <SimpleScene />
      </Canvas>
      <div
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          textAlign: 'center',
          fontSize: '0.875rem',
          opacity: 0.7
        }}
      >
        Drag to rotate • This is actual 3D, not just text
      </div>
    </div>
  );
}