import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Plane, Sphere, Text, Html } from '@react-three/drei';
import { useRef, useState, useCallback } from 'react';
import { Mesh, Group, Vector3 } from 'three';
import * as THREE from 'three';

interface ProjectorProps {
  position: Vector3;
  target: Vector3;
  isActive: boolean;
  color: string;
  onSelect: () => void;
}

function Projector({ position, target, isActive, color, onSelect }: ProjectorProps) {
  const groupRef = useRef<Group>(null!);
  const projectorRef = useRef<Mesh>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.lookAt(target);
      if (isActive) {
        groupRef.current.rotation.y += Math.sin(state.clock.elapsedTime * 2) * 0.01;
      }
    }
  });

  return (
    <group ref={groupRef} position={position} onClick={onSelect}>
      {/* Projector body */}
      <Box ref={projectorRef} scale={[0.8, 0.5, 1.2]} position={[0, 0, 0]}>
        <meshPhysicalMaterial
          color={isActive ? color : '#333333'}
          metalness={0.8}
          roughness={0.2}
          emissive={isActive ? color : '#000000'}
          emissiveIntensity={isActive ? 0.3 : 0}
        />
      </Box>

      {/* Projector lens */}
      <Sphere scale={[0.3, 0.3, 0.3]} position={[0, 0, 0.7]}>
        <meshPhysicalMaterial
          color="#ffffff"
          metalness={0.1}
          roughness={0.1}
          transmission={0.9}
          transparent
        />
      </Sphere>

      {/* Projection beam */}
      {isActive && (
        <group>
          <Box
            scale={[0.1, 0.1, Vector3.prototype.distanceTo.call(position, target)]}
            position={[0, 0, Vector3.prototype.distanceTo.call(position, target) / 2]}
          >
            <meshBasicMaterial color={color} transparent opacity={0.3} />
          </Box>

          {/* Beam particles */}
          {[...Array(8)].map((_, i) => (
            <Sphere
              key={i}
              scale={[0.05, 0.05, 0.05]}
              position={[
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5,
                i * (Vector3.prototype.distanceTo.call(position, target) / 8)
              ]}
            >
              <meshBasicMaterial color={color} />
            </Sphere>
          ))}
        </group>
      )}

      {/* Status indicator */}
      <Html distanceFactor={10} position={[0, 1, 0]}>
        <div className={`px-2 py-1 rounded text-xs ${isActive ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
          {isActive ? 'ACTIVE' : 'STANDBY'}
        </div>
      </Html>
    </group>
  );
}

interface SurfaceProps {
  position: Vector3;
  rotation: [number, number, number];
  scale: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
  projectionTexture?: THREE.Texture;
}

function ProjectionSurface({ position, rotation, scale, isSelected, onSelect, projectionTexture }: SurfaceProps) {
  const surfaceRef = useRef<Mesh>(null!);

  return (
    <Plane
      ref={surfaceRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={onSelect}
    >
      <meshPhysicalMaterial
        color={isSelected ? '#4f46e5' : '#ffffff'}
        metalness={0.1}
        roughness={0.8}
        map={projectionTexture}
        emissive={isSelected ? '#1e1b4b' : '#000000'}
        emissiveIntensity={isSelected ? 0.2 : 0}
      />
    </Plane>
  );
}

function InteractiveSurface({ position }: { position: Vector3 }) {
  const meshRef = useRef<Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
      meshRef.current.position.y = position.y + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <Box
      ref={meshRef}
      position={position}
      scale={hovered ? [2.2, 2.2, 2.2] : [2, 2, 2]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshPhysicalMaterial
        color={hovered ? '#ec4899' : '#8b5cf6'}
        metalness={0.8}
        roughness={0.2}
        transmission={0.5}
        transparent
        opacity={0.8}
      />
    </Box>
  );
}

interface ProjectionMappingSimulatorProps {
  onProjectorSelect?: (index: number) => void;
  onSurfaceSelect?: (index: number) => void;
}

export default function ProjectionMappingSimulator({
  onProjectorSelect,
  onSurfaceSelect
}: ProjectionMappingSimulatorProps) {
  const [activeProjector, setActiveProjector] = useState<number>(0);
  const [selectedSurface, setSelectedSurface] = useState<number>(0);
  // const [showSettings, setShowSettings] = useState(false); // TODO: Implement settings panel

  const projectors = [
    {
      position: new Vector3(-8, 5, 8),
      target: new Vector3(0, 0, 0),
      color: '#3b82f6'
    },
    {
      position: new Vector3(8, 5, 8),
      target: new Vector3(0, 0, 0),
      color: '#8b5cf6'
    },
    {
      position: new Vector3(0, 8, 10),
      target: new Vector3(0, 0, 0),
      color: '#ec4899'
    }
  ];

  const surfaces = [
    {
      position: new Vector3(0, 0, -5),
      rotation: [0, 0, 0] as [number, number, number],
      scale: [8, 6, 1] as [number, number, number]
    },
    {
      position: new Vector3(-6, 0, 0),
      rotation: [0, Math.PI / 2, 0] as [number, number, number],
      scale: [8, 6, 1] as [number, number, number]
    },
    {
      position: new Vector3(6, 0, 0),
      rotation: [0, -Math.PI / 2, 0] as [number, number, number],
      scale: [8, 6, 1] as [number, number, number]
    }
  ];

  const interactiveSurfaces = [
    new Vector3(-3, 2, 2),
    new Vector3(3, 2, 2),
    new Vector3(0, 4, 0)
  ];

  const handleProjectorSelect = useCallback((index: number) => {
    setActiveProjector(index);
    onProjectorSelect?.(index);
  }, [onProjectorSelect]);

  const handleSurfaceSelect = useCallback((index: number) => {
    setSelectedSurface(index);
    onSurfaceSelect?.(index);
  }, [onSurfaceSelect]);

  return (
    <div className="w-full h-[80vh] relative">
      <Canvas
        camera={{ position: [15, 10, 15], fov: 60 }}
        style={{ background: 'linear-gradient(to bottom, #0f172a, #1e293b)' }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight
          position={[0, 15, 0]}
          angle={0.5}
          penumbra={1}
          intensity={0.5}
          castShadow
        />

        {/* Room/Stage setup */}
        <Plane
          args={[20, 20]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -3, 0]}
        >
          <meshPhysicalMaterial color="#1a1a2e" metalness={0.5} roughness={0.8} />
        </Plane>

        {/* Ceiling */}
        <Plane
          args={[20, 20]}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 10, 0]}
        >
          <meshBasicMaterial color="#0a0a0a" transparent opacity={0.8} />
        </Plane>

        {/* Projectors */}
        {projectors.map((projector, index) => (
          <Projector
            key={index}
            position={projector.position}
            target={projector.target}
            isActive={activeProjector === index}
            color={projector.color}
            onSelect={() => handleProjectorSelect(index)}
          />
        ))}

        {/* Projection surfaces */}
        {surfaces.map((surface, index) => (
          <ProjectionSurface
            key={index}
            position={surface.position}
            rotation={surface.rotation}
            scale={surface.scale}
            isSelected={selectedSurface === index}
            onSelect={() => handleSurfaceSelect(index)}
          />
        ))}

        {/* Interactive surfaces */}
        {interactiveSurfaces.map((position, index) => (
          <InteractiveSurface key={index} position={position} />
        ))}

        {/* Central control panel */}
        <group position={[0, 0, 5]}>
          <Box scale={[3, 1, 0.2]} position={[0, 0, 0]}>
            <meshPhysicalMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
          </Box>
          <Html distanceFactor={20} position={[0, 0, 0.2]}>
            <div className="bg-gray-900 p-4 rounded-lg text-white text-sm min-w-[200px]">
              <h3 className="font-bold mb-2">Control Panel</h3>
              <div className="space-y-1">
                <div>Active Projector: {activeProjector + 1}</div>
                <div>Selected Surface: {selectedSurface + 1}</div>
                <div className="text-green-400">● System Online</div>
              </div>
            </div>
          </Html>
        </group>

        {/* Floating title */}
        <Text
          position={[0, 12, 0]}
          fontSize={2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          PROJECTION MAPPING STUDIO
        </Text>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          maxDistance={30}
          minDistance={5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={0}
        />
      </Canvas>

      {/* Control UI */}
      <div className="absolute top-4 left-4 space-y-4">
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white">
          <h3 className="font-bold mb-3">Simulator Controls</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Active Projector</label>
              <select
                value={activeProjector}
                onChange={(e) => handleProjectorSelect(Number(e.target.value))}
                className="w-full px-2 py-1 bg-gray-800 rounded text-sm"
              >
                {projectors.map((_, index) => (
                  <option key={index} value={index}>
                    Projector {index + 1}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Target Surface</label>
              <select
                value={selectedSurface}
                onChange={(e) => handleSurfaceSelect(Number(e.target.value))}
                className="w-full px-2 py-1 bg-gray-800 rounded text-sm"
              >
                {surfaces.map((_, index) => (
                  <option key={index} value={index}>
                    Surface {index + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
          <div className="space-y-1">
            <div>🎮 Click projectors to activate</div>
            <div>🖱️ Drag to rotate view</div>
            <div>🔍 Scroll to zoom</div>
            <div>✨ Hover interactive surfaces</div>
          </div>
        </div>
      </div>

      {/* Status panel */}
      <div className="absolute bottom-4 right-4">
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white">
          <h4 className="font-bold mb-2">System Status</h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span>All projectors online</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span>Surfaces calibrated</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              <span>Real-time simulation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}