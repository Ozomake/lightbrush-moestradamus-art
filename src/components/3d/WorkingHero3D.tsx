import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Sphere, Stars, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedSphere({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[1, 32, 32]} position={position}>
        <MeshDistortMaterial
          color="#8b5cf6"
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        color="#ec4899"
      />

      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      <Float speed={1} rotationIntensity={0.1} floatIntensity={1}>
        <Text
          fontSize={3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.1}
        >
          LIGHTBRUSH
          <meshStandardMaterial
            attach="material"
            color="#ffffff"
            emissive="#8b5cf6"
            emissiveIntensity={0.5}
            metalness={0.9}
            roughness={0.1}
          />
        </Text>
      </Float>

      <AnimatedSphere position={[-4, 0, 0]} />
      <AnimatedSphere position={[4, 0, 0]} />
      <AnimatedSphere position={[0, 3, -3]} />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export default function WorkingHero3D() {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/50" />
    </div>
  );
}