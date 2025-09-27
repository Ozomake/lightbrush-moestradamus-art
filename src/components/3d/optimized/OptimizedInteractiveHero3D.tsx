import React, { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Float, Sphere, Box, Stars, Sparkles, Trail, PerspectiveCamera } from '@react-three/drei';
import { Mesh, Vector3 } from 'three';
import * as THREE from 'three';
import { useAnimationRegistration, AnimationPriority } from '../../../hooks/useAnimationManager';
import { useResourcePool } from '../../../utils/ResourcePool';

// Optimized floating orb with resource pooling and reduced calculations
interface FloatingOrbProps {
  position: Vector3;
  color: string;
  scale?: number;
  orbIndex: number; // For unique animation registration
}

const FloatingOrb = React.memo<FloatingOrbProps>(({ position, color, scale = 1, orbIndex }) => {
  const meshRef = useRef<Mesh>(null!);
  const { getMaterial, releaseMaterial } = useResourcePool();

  // Memoized base values for consistent animation
  const animationOffsets = useMemo(() => ({
    xOffset: position.x,
    yOffset: position.y,
    speedX: 0.5 + (orbIndex * 0.1),
    speedY: 1.5 + (orbIndex * 0.2),
    speedRotX: 0.3 + (orbIndex * 0.05),
    speedRotY: 0.7 + (orbIndex * 0.1),
  }), [position, orbIndex]);

  // Memoized material with resource pooling
  const material = useMemo(() => {
    return getMaterial('floating-orb', () => new THREE.MeshPhysicalMaterial(), {
      color,
      metalness: 0.9,
      roughness: 0,
      emissive: color,
      emissiveIntensity: 0.5,
    });
  }, [color, getMaterial]);

  // Optimized animation callback
  const animationCallback = useCallback((state: { clock: { elapsedTime: number } }) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.rotation.x = Math.sin(time * animationOffsets.speedX + animationOffsets.xOffset) * 0.3;
      meshRef.current.rotation.y = Math.cos(time * animationOffsets.speedRotY + animationOffsets.yOffset) * 0.3;
      meshRef.current.position.y = position.y + Math.sin(time * animationOffsets.speedY + animationOffsets.xOffset) * 0.8;
      meshRef.current.position.x = position.x + Math.cos(time * animationOffsets.speedRotX) * 0.3;
    }
  }, [position, animationOffsets]);

  useAnimationRegistration(
    `floating-orb-${orbIndex}`,
    animationCallback,
    AnimationPriority.HIGH,
    45, // 45 FPS for smooth orb animation
    [orbIndex, position]
  );

  useEffect(() => {
    return () => {
      if (material) releaseMaterial(material as any);
    };
  }, [material, releaseMaterial]);

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Trail
        width={4}
        length={8}
        color={color}
        attenuation={(t) => t * t}
        target={meshRef}
      >
        <Sphere ref={meshRef} position={position} scale={scale} args={[1, 32, 32]}>
          <primitive object={material} />
        </Sphere>
      </Trail>
    </Float>
  );
});

// Optimized particle field with reduced particle count and LOD
const ParticleField = React.memo(() => {
  const particlesRef = useRef<THREE.Points>(null!);
  const [particleCount, setParticleCount] = useState(1000); // Reduced from 2000

  // Adaptive particle count based on performance
  useEffect(() => {
    const performanceTest = () => {
      const start = performance.now();
      for (let i = 0; i < 100000; i++) {
        // Performance test calculation
        const result = Math.random() * Math.sin(i);
        if (result > 1000) break; // Early exit condition to prevent optimization removal
      }
      const duration = performance.now() - start;

      if (duration > 10) {
        setParticleCount(500); // Low performance
      } else if (duration > 5) {
        setParticleCount(750); // Medium performance
      } else {
        setParticleCount(1000); // High performance
      }
    };

    performanceTest();
  }, []);

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
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
  }, [particleCount]);

  const animationCallback = useCallback((state: { clock: { elapsedTime: number } }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.1;
    }
  }, []);

  useAnimationRegistration(
    'particle-field',
    animationCallback,
    AnimationPriority.LOW,
    20, // 20 FPS for background particles
    []
  );

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
});

// Optimized projection effect component
const ProjectionEffect = React.memo(() => {
  const meshRef = useRef<Mesh>(null!);
  const { getMaterial, releaseMaterial } = useResourcePool();

  const screenMaterial = useMemo(() => {
    return getMaterial('projection-screen', () => new THREE.MeshPhysicalMaterial(), {
      color: '#ec4899',
      metalness: 0.8,
      roughness: 0.2,
      transmission: 0.6,
      transparent: true,
      opacity: 0.7,
    });
  }, [getMaterial]);

  const beamMaterial = useMemo(() => {
    return getMaterial('projection-beam', () => new THREE.MeshBasicMaterial(), {
      color: '#fbbf24',
      transparent: true,
      opacity: 0.4,
    });
  }, [getMaterial]);

  const animationCallback = useCallback((state: { clock: { elapsedTime: number } }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.5) * 0.1;
    }
  }, []);

  useAnimationRegistration(
    'projection-effect',
    animationCallback,
    AnimationPriority.MEDIUM,
    30,
    []
  );

  useEffect(() => {
    return () => {
      if (screenMaterial) releaseMaterial(screenMaterial as any);
      if (beamMaterial) releaseMaterial(beamMaterial as any);
    };
  }, [screenMaterial, beamMaterial, releaseMaterial]);

  return (
    <group position={[0, 2, -3]}>
      <Box ref={meshRef} scale={[4, 2, 0.1]}>
        <primitive object={screenMaterial} />
      </Box>

      {/* Projection beam */}
      <Box position={[0, -1, 2]} scale={[0.2, 0.2, 4]} rotation={[0, 0, 0]}>
        <primitive object={beamMaterial} />
      </Box>
    </group>
  );
});

// Optimized 3D scene with adaptive quality
const Scene3D = React.memo(() => {
  const orbPositions = useMemo(() => [
    new Vector3(-5, 2, -2),
    new Vector3(5, 1, -3),
    new Vector3(-3, 3, 1),
    new Vector3(3, 2, 2),
    new Vector3(0, 4, -1),
    new Vector3(-2, 1, 3),
    new Vector3(2, 3, -4),
  ], []);

  const orbColors = useMemo(() =>
    ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#f43f5e', '#06b6d4'],
    []
  );

  const orbScales = useMemo(() => [
    0.7, 0.9, 0.6, 0.8, 1.0, 0.5, 0.85
  ], []);

  // Memoized text materials
  const titleMaterial = useMemo(() => (
    <meshStandardMaterial
      color="#ffffff"
      emissive="#8b5cf6"
      emissiveIntensity={0.4}
      metalness={0.95}
      roughness={0.05}
    />
  ), []);

  const subtitleMaterial = useMemo(() => (
    <meshStandardMaterial
      color="#8b5cf6"
      emissive="#3b82f6"
      emissiveIntensity={0.3}
      transparent
      opacity={0.8}
    />
  ), []);

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

      <React.Suspense fallback={null}>
        <Stars
          radius={100}
          depth={50}
          count={3000} // Reduced from 5000
          factor={4}
          saturation={0.5}
          fade
          speed={1}
        />

        <Sparkles
          count={100} // Reduced from 200
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
            orbIndex={index}
          />
        ))}

        {/* Optimized hero text with memoized materials */}
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
            >
              LIGHTBRUSH
              {titleMaterial}
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
              {subtitleMaterial}
            </Text>
          </group>
        </Float>
      </React.Suspense>

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
});

// Main optimized component with performance monitoring
interface OptimizedInteractiveHero3DProps {
  className?: string;
  enablePerformanceMode?: boolean;
}

const OptimizedInteractiveHero3D = React.memo<OptimizedInteractiveHero3DProps>(({
  className = "w-full h-screen relative overflow-hidden",
  enablePerformanceMode = true
}) => {
  const [canvasSettings, setCanvasSettings] = useState({
    antialias: true,
    powerPreference: 'high-performance' as const,
    precision: 'highp' as const,
  });

  // Adaptive canvas settings based on performance
  useEffect(() => {
    if (enablePerformanceMode) {
      const performanceTest = () => {
        const start = performance.now();
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

        if (gl) {
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';

          // Adjust settings based on GPU
          if (renderer.includes('Intel') || navigator.hardwareConcurrency < 4) {
            setCanvasSettings({
              antialias: false,
              powerPreference: 'high-performance',
              precision: 'highp' as const,
            });
          }
        }

        const duration = performance.now() - start;
        console.log(`Performance test completed in ${duration}ms`);
      };

      performanceTest();
    }
  }, [enablePerformanceMode]);

  return (
    <div className={className}>
      <Canvas
        style={{ background: 'transparent' }}
        gl={{
          alpha: true,
          ...canvasSettings,
        }}
        shadows={canvasSettings.precision === 'highp'}
        performance={{ min: 0.5 }}
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
            Premium Interactive Experience
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
});

export default OptimizedInteractiveHero3D;