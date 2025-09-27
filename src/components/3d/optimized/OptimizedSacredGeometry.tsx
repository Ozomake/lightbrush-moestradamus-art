import React, { useRef, useMemo, useCallback, useEffect } from 'react';
import { Group, BufferGeometry, Float32BufferAttribute, MeshPhysicalMaterial, LineBasicMaterial, DoubleSide } from 'three';
import { useAnimationRegistration, AnimationPriority } from '../../../hooks/useAnimationManager';
import { useResourcePool } from '../../../utils/ResourcePool';

// Optimized Metatron's Cube Component with resource pooling and memoization
interface MetatronsCubeProps {
  scale?: number;
  color?: string;
  emissiveIntensity?: number;
}

export const MetatronsCube = React.memo<MetatronsCubeProps>(({
  scale = 1,
  color = '#8b5cf6',
  emissiveIntensity = 0.5
}) => {
  const groupRef = useRef<Group>(null!);
  const linesRef = useRef<Group>(null!);
  const { getGeometry, releaseGeometry, getMaterial, releaseMaterial } = useResourcePool();

  // Memoized sphere positions calculation
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

  // Memoized line geometry with resource pooling
  const lineGeometry = useMemo(() => {
    return getGeometry('metatron-lines', () => {
      const geometry = new BufferGeometry();
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

      geometry.setAttribute('position', new Float32BufferAttribute(points, 3));
      return geometry;
    }, spherePositions);
  }, [spherePositions, getGeometry]);

  // Memoized materials with resource pooling
  const sphereMaterial = useMemo(() => {
    return getMaterial('metatron-sphere', () => new MeshPhysicalMaterial(), {
      color,
      metalness: 1,
      roughness: 0,
      emissive: color,
      emissiveIntensity,
    });
  }, [color, emissiveIntensity, getMaterial]);

  const lineMaterial = useMemo(() => {
    return getMaterial('metatron-line', () => new LineBasicMaterial(), {
      color,
      transparent: true,
      opacity: 0.3,
      linewidth: 1,
    });
  }, [color, getMaterial]);

  // Optimized animation callback with reduced frequency
  const animationCallback = useCallback((state: any) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.05;
    }
    if (linesRef.current) {
      linesRef.current.rotation.z = -state.clock.elapsedTime * 0.1;
    }
  }, []);

  // Register animation with medium priority and 30 FPS target for performance
  useAnimationRegistration(
    `metatron-cube-${scale}-${color}`,
    animationCallback,
    AnimationPriority.MEDIUM,
    30,
    [scale, color]
  );

  // Cleanup resources on unmount
  useEffect(() => {
    return () => {
      if (lineGeometry) releaseGeometry(lineGeometry as any);
      if (sphereMaterial) releaseMaterial(sphereMaterial as any);
      if (lineMaterial) releaseMaterial(lineMaterial as any);
    };
  }, [lineGeometry, sphereMaterial, lineMaterial, releaseGeometry, releaseMaterial]);

  return (
    <group ref={groupRef}>
      {/* Spheres at vertices */}
      {spherePositions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.1 * scale, 16, 16]} />
          <primitive object={sphereMaterial} />
        </mesh>
      ))}

      {/* Connecting lines */}
      <group ref={linesRef}>
        <lineSegments geometry={lineGeometry}>
          <primitive object={lineMaterial} />
        </lineSegments>
      </group>
    </group>
  );
});

// Optimized Flower of Life Component
interface FlowerOfLifeProps {
  scale?: number;
  color?: string;
}

const FlowerOfLife = React.memo<FlowerOfLifeProps>(({ scale = 1, color = '#ec4899' }) => {
  const groupRef = useRef<Group>(null!);
  const { getMaterial, releaseMaterial } = useResourcePool();

  // Memoized circle positions
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

  // Memoized material
  const material = useMemo(() => {
    return getMaterial('flower-of-life', () => new MeshPhysicalMaterial(), {
      color,
      metalness: 1,
      roughness: 0,
      emissive: color,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.8,
    });
  }, [color, getMaterial]);

  // Optimized animation callback
  const animationCallback = useCallback((state: any) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.1;
      const scaleValue = 1 + Math.sin(state.clock.elapsedTime) * 0.1;
      groupRef.current.scale.x = scaleValue;
      groupRef.current.scale.y = scaleValue;
    }
  }, []);

  useAnimationRegistration(
    `flower-of-life-${scale}-${color}`,
    animationCallback,
    AnimationPriority.MEDIUM,
    30,
    [scale, color]
  );

  useEffect(() => {
    return () => {
      if (material) releaseMaterial(material as any);
    };
  }, [material, releaseMaterial]);

  return (
    <group ref={groupRef}>
      {circles.map((pos, i) => (
        <mesh key={i} position={pos}>
          <torusGeometry args={[scale * 0.5, 0.02, 8, 32]} />
          <primitive object={material} />
        </mesh>
      ))}
    </group>
  );
});

// Optimized Merkaba Component
interface MerkabaProps {
  scale?: number;
  color?: string;
}

const Merkaba = React.memo<MerkabaProps>(({ scale = 1, color = '#10b981' }) => {
  const groupRef = useRef<Group>(null!);
  const innerRef = useRef<any>(null!);
  const { getMaterial, releaseMaterial } = useResourcePool();

  // Memoized material
  const material = useMemo(() => {
    return getMaterial('merkaba', () => new MeshPhysicalMaterial(), {
      color,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.7,
      emissive: color,
      emissiveIntensity: 0.3,
      side: DoubleSide,
    });
  }, [color, getMaterial]);

  // Optimized animation callback
  const animationCallback = useCallback((state: any) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -state.clock.elapsedTime * 0.5;
      innerRef.current.rotation.x = state.clock.elapsedTime * 0.2;
    }
  }, []);

  useAnimationRegistration(
    `merkaba-${scale}-${color}`,
    animationCallback,
    AnimationPriority.MEDIUM,
    30,
    [scale, color]
  );

  useEffect(() => {
    return () => {
      if (material) releaseMaterial(material as any);
    };
  }, [material, releaseMaterial]);

  return (
    <group ref={groupRef} scale={scale}>
      {/* Upward pointing tetrahedron */}
      <mesh>
        <tetrahedronGeometry args={[2, 0]} />
        <primitive object={material} />
      </mesh>

      {/* Downward pointing tetrahedron */}
      <mesh ref={innerRef} rotation={[Math.PI, 0, 0]}>
        <tetrahedronGeometry args={[2, 0]} />
        <primitive object={material} />
      </mesh>
    </group>
  );
});

// Optimized Platonic Solids Collection
interface PlatonicSolidsProps {
  position?: [number, number, number];
}

const PlatonicSolids = React.memo<PlatonicSolidsProps>(({
  position = [0, 0, 0]
}) => {
  const groupRef = useRef<Group>(null!);
  const { getMaterial, releaseMaterial } = useResourcePool();

  // Memoized solids configuration
  const solids = useMemo(() => [
    { geometry: 'tetrahedron', position: [-3, 0, 0] as [number, number, number], color: '#ff0000' },
    { geometry: 'octahedron', position: [-1.5, 0, 0] as [number, number, number], color: '#00ff00' },
    { geometry: 'icosahedron', position: [0, 0, 0] as [number, number, number], color: '#0000ff' },
    { geometry: 'dodecahedron', position: [1.5, 0, 0] as [number, number, number], color: '#ffff00' },
    { geometry: 'box', position: [3, 0, 0] as [number, number, number], color: '#ff00ff' }
  ], []);

  // Memoized materials for each solid
  const materials = useMemo(() => {
    return solids.map(solid =>
      getMaterial(`platonic-${solid.geometry}`, () => new MeshPhysicalMaterial(), {
        color: solid.color,
        metalness: 1,
        roughness: 0,
        emissive: solid.color,
        emissiveIntensity: 0.5,
      })
    );
  }, [solids, getMaterial]);

  // Optimized animation callback
  const animationCallback = useCallback((state: any) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  }, []);

  useAnimationRegistration(
    `platonic-solids-${position.join('-')}`,
    animationCallback,
    AnimationPriority.LOW,
    20,
    [position]
  );

  useEffect(() => {
    return () => {
      materials.forEach(material => releaseMaterial(material as any));
    };
  }, [materials, releaseMaterial]);

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
            <primitive object={materials[i]} />
          </mesh>
        );
      })}
    </group>
  );
});

// Optimized Sacred Geometry Composite
interface SacredGeometryCompositeProps {
  scale?: number;
}

export const SacredGeometryComposite = React.memo<SacredGeometryCompositeProps>(({
  scale = 1
}) => {
  const groupRef = useRef<Group>(null!);

  // Optimized animation callback with reduced frequency
  const animationCallback = useCallback((state: any) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  }, []);

  useAnimationRegistration(
    `sacred-geometry-composite-${scale}`,
    animationCallback,
    AnimationPriority.LOW,
    15,
    [scale]
  );

  return (
    <group ref={groupRef} scale={scale}>
      <MetatronsCube scale={2} color="#8b5cf6" emissiveIntensity={0.5} />
      <FlowerOfLife scale={3} color="#ec4899" />
      <Merkaba scale={0.8} color="#10b981" />
    </group>
  );
});

// Default export
export default MetatronsCube;

// Named exports are already defined above with const declarations
export { FlowerOfLife, Merkaba, PlatonicSolids };