import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Simple particle system without requiring additional packages
export const PremiumParticleField: React.FC<{ count?: number }> = ({ count = 5000 }) => {
  const particlesRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  // Memoize particle data to prevent infinite re-renders
  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Position - use deterministic values based on index
      positions[i * 3] = ((i * 7) % 100 - 50); // Fixed X position
      positions[i * 3 + 1] = ((i * 5) % 100 - 50); // Fixed Y position
      positions[i * 3 + 2] = ((i * 3) % 100 - 50); // Fixed Z position

      // Color with gradient - fixed hue based on index
      const color = new THREE.Color();
      const hue = 0.6 + ((i % 100) / 100) * 0.2; // Fixed hue range
      const lightness = 0.5 + ((i % 50) / 50) * 0.5; // Fixed lightness
      color.setHSL(hue, 1.0, lightness);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Size variation - fixed based on index
      sizes[i] = 0.1 + ((i % 10) / 10) * 0.5;
    }

    return { positions, colors, sizes };
  }, [count]);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
    }

    if (materialRef.current) {
      materialRef.current.opacity = 0.6 + Math.sin(state.clock.elapsedTime) * 0.2;
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
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.15}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
};

// Volumetric lighting effect for premium atmosphere
export const VolumetricLight: React.FC<{ position?: [number, number, number] }> = ({
  position = [0, 10, 0]
}) => {
  const lightRef = useRef<THREE.SpotLight>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    }

    if (lightRef.current) {
      lightRef.current.intensity = 2 + Math.sin(state.clock.elapsedTime * 2) * 0.5;
    }
  });

  return (
    <>
      <spotLight
        ref={lightRef}
        position={position}
        angle={0.3}
        penumbra={1}
        intensity={2}
        color="#8b5cf6"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Volumetric cone mesh */}
      <mesh ref={meshRef} position={position}>
        <coneGeometry args={[5, 15, 32, 1, true]} />
        <meshBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </>
  );
};

export default PremiumParticleField;