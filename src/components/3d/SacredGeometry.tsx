import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Metatron's Cube Component
export function MetatronsCube({ scale = 1, color = '#8b5cf6', emissiveIntensity = 0.5 }) {
  const groupRef = useRef<THREE.Group>(null!);
  const linesRef = useRef<THREE.Group>(null!);

  // Create the 13 spheres of Metatron's Cube
  const spherePositions = useMemo(() => {
    const positions: [number, number, number][] = [];

    // Center sphere
    positions.push([0, 0, 0]);

    // Inner hexagon (6 spheres)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      positions.push([
        Math.cos(angle) * scale,
        Math.sin(angle) * scale,
        0
      ]);
    }

    // Outer hexagon (6 spheres)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
      positions.push([
        Math.cos(angle) * scale * 1.7,
        Math.sin(angle) * scale * 1.7,
        0
      ]);
    }

    return positions;
  }, [scale]);

  // Create the lines connecting all spheres
  const lines = useMemo(() => {
    const lineGeometry = new THREE.BufferGeometry();
    const points: number[] = [];

    // Connect all spheres to each other
    for (let i = 0; i < spherePositions.length; i++) {
      for (let j = i + 1; j < spherePositions.length; j++) {
        points.push(
          spherePositions[i][0], spherePositions[i][1], spherePositions[i][2],
          spherePositions[j][0], spherePositions[j][1], spherePositions[j][2]
        );
      }
    }

    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return lineGeometry;
  }, [spherePositions]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.05;
    }
    if (linesRef.current) {
      linesRef.current.rotation.z = -state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Spheres at vertices */}
      {spherePositions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.1 * scale, 32, 32]} />
          <meshPhysicalMaterial
            color={color}
            metalness={1}
            roughness={0}
            emissive={color}
            emissiveIntensity={emissiveIntensity}
          />
        </mesh>
      ))}

      {/* Connecting lines */}
      <group ref={linesRef}>
        <lineSegments geometry={lines}>
          <lineBasicMaterial
            color={color}
            transparent
            opacity={0.3}
            linewidth={1}
          />
        </lineSegments>
      </group>
    </group>
  );
}

// Flower of Life Component
export function FlowerOfLife({ scale = 1, color = '#ec4899' }) {
  const groupRef = useRef<THREE.Group>(null!);

  const circles = useMemo(() => {
    const circlePositions: [number, number, number][] = [];

    // Center circle
    circlePositions.push([0, 0, 0]);

    // 6 surrounding circles
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      circlePositions.push([
        Math.cos(angle) * scale,
        Math.sin(angle) * scale,
        0
      ]);
    }

    // 6 outer circles
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
      circlePositions.push([
        Math.cos(angle) * scale * 1.73,
        Math.sin(angle) * scale * 1.73,
        0
      ]);
    }

    return circlePositions;
  }, [scale]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.1;
      groupRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime) * 0.1;
      groupRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {circles.map((pos, i) => (
        <mesh key={i} position={pos}>
          <torusGeometry args={[scale * 0.5, 0.02, 8, 64]} />
          <meshPhysicalMaterial
            color={color}
            metalness={1}
            roughness={0}
            emissive={color}
            emissiveIntensity={0.3}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

// Merkaba (Star Tetrahedron) Component
export function Merkaba({ scale = 1, color = '#10b981' }) {
  const groupRef = useRef<THREE.Group>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -state.clock.elapsedTime * 0.5;
      innerRef.current.rotation.x = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* Upward pointing tetrahedron */}
      <mesh>
        <tetrahedronGeometry args={[2, 0]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.7}
          emissive={color}
          emissiveIntensity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Downward pointing tetrahedron */}
      <mesh ref={innerRef} rotation={[Math.PI, 0, 0]}>
        <tetrahedronGeometry args={[2, 0]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.7}
          emissive={color}
          emissiveIntensity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// Platonic Solids Collection
export function PlatonicSolids({ position = [0, 0, 0] as [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const solids = [
    { geometry: 'tetrahedron', position: [-3, 0, 0] as [number, number, number], color: '#ff0000' },
    { geometry: 'octahedron', position: [-1.5, 0, 0] as [number, number, number], color: '#00ff00' },
    { geometry: 'icosahedron', position: [0, 0, 0] as [number, number, number], color: '#0000ff' },
    { geometry: 'dodecahedron', position: [1.5, 0, 0] as [number, number, number], color: '#ffff00' },
    { geometry: 'box', position: [3, 0, 0] as [number, number, number], color: '#ff00ff' }
  ];

  return (
    <group ref={groupRef} position={position}>
      {solids.map((solid, i) => {
        const GeometryComponent = {
          tetrahedron: () => <tetrahedronGeometry args={[0.5, 0]} />,
          octahedron: () => <octahedronGeometry args={[0.5, 0]} />,
          icosahedron: () => <icosahedronGeometry args={[0.5, 0]} />,
          dodecahedron: () => <dodecahedronGeometry args={[0.5, 0]} />,
          box: () => <boxGeometry args={[0.7, 0.7, 0.7]} />
        }[solid.geometry];

        return (
          <mesh key={i} position={solid.position}>
            {GeometryComponent && <GeometryComponent />}
            <meshPhysicalMaterial
              color={solid.color}
              metalness={1}
              roughness={0}
              emissive={solid.color}
              emissiveIntensity={0.5}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Sacred Geometry Composite
export function SacredGeometryComposite({ scale = 1 }) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      <MetatronsCube scale={2} color="#8b5cf6" emissiveIntensity={0.5} />
      <FlowerOfLife scale={3} color="#ec4899" />
      <Merkaba scale={0.8} color="#10b981" />
    </group>
  );
}