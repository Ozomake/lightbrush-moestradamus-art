import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Sphere, Box, MeshDistortMaterial, Stars, Sparkles, Trail, PerspectiveCamera } from '@react-three/drei';
import { useRef, useMemo, Suspense } from 'react';
import { Mesh, Vector3 } from 'three';
import * as THREE from 'three';

// Premium floating orb with distortion and trails
function FloatingOrb({ position, color, scale = 1 }: { position: Vector3; color: string; scale?: number }) {
  const meshRef = useRef<Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5 + position.x) * 0.3;
      meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.3 + position.y) * 0.3;
      meshRef.current.position.y = position.y + Math.sin(state.clock.elapsedTime * 1.5 + position.x) * 0.8;
      meshRef.current.position.x = position.x + Math.cos(state.clock.elapsedTime * 0.7) * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Trail
        width={4}
        length={8}
        color={color}
        attenuation={(t) => t * t}
        target={meshRef}
      >
        <Sphere ref={meshRef} position={position} scale={scale} args={[1, 64, 64]}>
          <MeshDistortMaterial
            color={color}
            attach="material"
            distort={0.4}
            speed={2}
            roughness={0}
            metalness={0.9}
            emissive={color}
            emissiveIntensity={0.5}
          />
        </Sphere>
      </Trail>
    </Float>
  );
}

// Dynamic particle field
function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null!);

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(2000 * 3);
    const colors = new Float32Array(2000 * 3);

    for (let i = 0; i < 2000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.2 + 0.7, 1, 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return [positions, colors];
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        transparent
        opacity={0.6}
        vertexColors
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Projection effect component
function ProjectionEffect() {
  const meshRef = useRef<Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group position={[0, 2, -3]}>
      <Box ref={meshRef} scale={[4, 2, 0.1]}>
        <meshPhysicalMaterial
          color="#ec4899"
          metalness={0.8}
          roughness={0.2}
          transmission={0.6}
          transparent
          opacity={0.7}
        />
      </Box>

      {/* Projection beam */}
      <Box position={[0, -1, 2]} scale={[0.2, 0.2, 4]} rotation={[0, 0, 0]}>
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.4} />
      </Box>
    </group>
  );
}

// Premium 3D scene with advanced effects
function Scene3D() {
  const orbPositions = useMemo(() => [
    new Vector3(-5, 2, -2),
    new Vector3(5, 1, -3),
    new Vector3(-3, 3, 1),
    new Vector3(3, 2, 2),
    new Vector3(0, 4, -1),
    new Vector3(-2, 1, 3),
    new Vector3(2, 3, -4),
  ], []);

  const orbColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#f43f5e', '#06b6d4'];

  // Memoize scales to prevent infinite re-renders from Math.random()
  const orbScales = useMemo(() => [
    0.7, 0.9, 0.6, 0.8, 1.0, 0.5, 0.85
  ], []);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 5, 15]} fov={50} />
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#8b5cf6" />
      <spotLight
        position={[0, 15, 5]}
        angle={0.4}
        penumbra={1}
        intensity={2}
        color="#ec4899"
        castShadow
      />

      <Suspense fallback={null}>
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0.5}
          fade
          speed={1}
        />

        <Sparkles
          count={200}
          scale={15}
          size={3}
          speed={0.4}
          color="#8b5cf6"
        />

        <ParticleField />
        <ProjectionEffect />

      {orbPositions.map((position, index) => (
        <FloatingOrb
          key={index}
          position={position}
          color={orbColors[index]}
          scale={orbScales[index]}
        />
      ))}

      {/* Premium hero text with effects */}
      <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
        <group>
          <Text
            position={[0, 0.5, 0]}
            fontSize={2.5}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.15}
            fontWeight="bold"
            material-emissive="#8b5cf6"
            material-emissiveIntensity={0.3}
          >
            LIGHTBRUSH
            <meshStandardMaterial
              attach="material"
              color="#ffffff"
              emissive="#8b5cf6"
              emissiveIntensity={0.4}
              metalness={0.95}
              roughness={0.05}
            />
          </Text>
          <Text
            position={[0, -0.5, 0]}
            fontSize={0.5}
            color="#8b5cf6"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.4}
            fontWeight="300"
          >
            IMMERSIVE DIGITAL EXPERIENCES
            <meshStandardMaterial
              attach="material"
              color="#8b5cf6"
              emissive="#3b82f6"
              emissiveIntensity={0.3}
              transparent
              opacity={0.8}
            />
          </Text>
        </group>
      </Float>

      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 4}
        autoRotate
        autoRotateSpeed={0.5}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

// Main component export with premium features
export default function InteractiveHero3D() {
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <Canvas
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        shadows
      >
        <Scene3D />
      </Canvas>

      {/* Premium overlay gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-blue-900/10" />
      </div>

      {/* Premium content overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center text-white z-10 mt-32">
          <div className="text-xs uppercase tracking-[0.3em] text-blue-400 mb-4 animate-pulse">
            ✨ Premium Interactive Experience ✨
          </div>
          <div className="text-lg text-gray-300 max-w-lg mx-auto font-light">
            Drag to explore • Cutting-edge projection mapping • Real-time 3D rendering
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </div>
  );
}