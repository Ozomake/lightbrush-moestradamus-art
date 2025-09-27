import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Box, Sphere, Html } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import { Mesh, Group } from 'three';
import * as THREE from 'three';

function ProjectionBeam({ start, end, color }: { start: THREE.Vector3; end: THREE.Vector3; color: string }) {
  const beamRef = useRef<Mesh>(null!);

  useFrame(() => {
    if (beamRef.current) {
      beamRef.current.lookAt(end);
    }
  });

  const distance = start.distanceTo(end);

  return (
    <group position={start}>
      <Box
        ref={beamRef}
        scale={[0.1, 0.1, distance]}
        position={[0, 0, -distance / 2]}
      >
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </Box>
    </group>
  );
}

function InteractiveProjector({ position, isActive, onToggle }: {
  position: THREE.Vector3;
  isActive: boolean;
  onToggle: () => void;
}) {
  const projectorRef = useRef<Mesh>(null!);

  useFrame((state) => {
    if (projectorRef.current && isActive) {
      projectorRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={position} onClick={onToggle}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
        <Box ref={projectorRef} scale={[1, 0.6, 1.5]}>
          <meshPhysicalMaterial
            color={isActive ? '#00ff88' : '#333333'}
            metalness={0.8}
            roughness={0.2}
            emissive={isActive ? '#00ff44' : '#000000'}
            emissiveIntensity={isActive ? 0.4 : 0}
          />
        </Box>

        {/* Lens */}
        <Sphere scale={[0.3, 0.3, 0.3]} position={[0, 0, 0.8]}>
          <meshPhysicalMaterial
            color="#ffffff"
            metalness={0.1}
            roughness={0.0}
            transmission={0.95}
            transparent
          />
        </Sphere>
      </Float>

      {/* Status display */}
      <Html distanceFactor={10} position={[0, 1.5, 0]}>
        <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
          isActive ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
        }`}>
          {isActive ? 'PROJECTING' : 'STANDBY'}
        </div>
      </Html>
    </group>
  );
}

function ProjectionSurface({ position, scale, content }: {
  position: THREE.Vector3;
  scale: [number, number, number];
  content: string;
}) {
  const surfaceRef = useRef<Mesh>(null!);

  return (
    <group position={position}>
      <Box ref={surfaceRef} scale={scale}>
        <meshPhysicalMaterial
          color="#ffffff"
          metalness={0.1}
          roughness={0.7}
        />
      </Box>

      <Html distanceFactor={15} position={[0, 0, scale[2] / 2 + 0.1]}>
        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white text-center max-w-xs">
          <div className="text-lg font-bold mb-2">Interactive Surface</div>
          <div className="text-sm text-gray-300">{content}</div>
        </div>
      </Html>
    </group>
  );
}

function FloatingParticles() {
  const particlesRef = useRef<Group>(null!);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={particlesRef}>
      {[...Array(20)].map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 8 + Math.random() * 4;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = (Math.random() - 0.5) * 8;

        return (
          <Float key={i} speed={1 + Math.random()} rotationIntensity={1} floatIntensity={2}>
            <Sphere
              position={[x, y, z]}
              scale={[0.1, 0.1, 0.1]}
            >
              <meshBasicMaterial
                color={['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][i % 5]}
              />
            </Sphere>
          </Float>
        );
      })}
    </group>
  );
}

interface GameEnvironment3DProps {
  level?: number;
  score?: number;
  onInteraction?: (type: string, data?: any) => void;
}

export default function GameEnvironment3D({
  level = 1,
  score = 0,
  onInteraction
}: GameEnvironment3DProps) {
  const [activeProjectors, setActiveProjectors] = useState<boolean[]>([false, false, false]);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'complete'>('intro');

  const projectorPositions = [
    new THREE.Vector3(-6, 4, 6),
    new THREE.Vector3(6, 4, 6),
    new THREE.Vector3(0, 6, 8)
  ];

  const surfaces = [
    {
      position: new THREE.Vector3(0, 0, -6),
      scale: [8, 5, 0.2] as [number, number, number],
      content: "Main projection surface - Building facade simulation"
    },
    {
      position: new THREE.Vector3(-6, 2, 0),
      scale: [0.2, 4, 6] as [number, number, number],
      content: "Side wall - Interactive art display"
    },
    {
      position: new THREE.Vector3(6, 2, 0),
      scale: [0.2, 4, 6] as [number, number, number],
      content: "Side wall - Reactive motion graphics"
    }
  ];

  const toggleProjector = (index: number) => {
    const newActiveProjectors = [...activeProjectors];
    newActiveProjectors[index] = !newActiveProjectors[index];
    setActiveProjectors(newActiveProjectors);
    onInteraction?.('projector_toggle', { index, active: newActiveProjectors[index] });
  };

  useEffect(() => {
    if (activeProjectors.every(p => p)) {
      setGameState('complete');
      onInteraction?.('level_complete', { level, score: score + 1000 });
    }
  }, [activeProjectors, level, score, onInteraction]);

  return (
    <div className="w-full h-screen relative">
      <Canvas
        camera={{ position: [10, 8, 12], fov: 60 }}
        style={{
          background: 'linear-gradient(to bottom, #0a0a0a, #1a1a2e, #16213e)'
        }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, 5, 5]} intensity={0.5} color="#8b5cf6" />
        <spotLight
          position={[0, 15, 0]}
          angle={0.4}
          penumbra={1}
          intensity={0.8}
          color="#ffffff"
          castShadow
        />

        {/* Ground */}
        <Box
          args={[20, 0.2, 20]}
          position={[0, -3, 0]}
        >
          <meshPhysicalMaterial color="#1a1a2e" metalness={0.8} roughness={0.3} />
        </Box>

        {/* Projectors */}
        {projectorPositions.map((position, index) => (
          <InteractiveProjector
            key={index}
            position={position}
            isActive={activeProjectors[index]}
            onToggle={() => toggleProjector(index)}
          />
        ))}

        {/* Projection beams */}
        {projectorPositions.map((projPos, index) => (
          activeProjectors[index] && surfaces.map((surface, surfIndex) => (
            <ProjectionBeam
              key={`${index}-${surfIndex}`}
              start={projPos}
              end={surface.position}
              color={['#3b82f6', '#8b5cf6', '#ec4899'][index]}
            />
          ))
        ))}

        {/* Projection surfaces */}
        {surfaces.map((surface, index) => (
          <ProjectionSurface
            key={index}
            position={surface.position}
            scale={surface.scale}
            content={surface.content}
          />
        ))}

        {/* Floating particles */}
        <FloatingParticles />

        {/* Game title */}
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.8}>
          <Text
            position={[0, 8, 0]}
            fontSize={1.5}
            color={gameState === 'complete' ? '#00ff88' : '#ffffff'}
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {gameState === 'intro' && `LEVEL ${level}`}
            {gameState === 'playing' && 'ACTIVATE PROJECTORS'}
            {gameState === 'complete' && 'LEVEL COMPLETE!'}
          </Text>
        </Float>

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          maxDistance={25}
          minDistance={8}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 6}
          autoRotate={gameState === 'intro'}
          autoRotateSpeed={1}
        />
      </Canvas>

      {/* Game UI */}
      <div className="absolute top-4 left-4 space-y-4">
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white">
          <h3 className="font-bold mb-2">Mission Control</h3>
          <div className="space-y-2 text-sm">
            <div>Level: {level}</div>
            <div>Score: {score.toLocaleString()}</div>
            <div>Active Projectors: {activeProjectors.filter(p => p).length}/3</div>
            <div className={`font-bold ${
              gameState === 'complete' ? 'text-green-400' : 'text-blue-400'
            }`}>
              Status: {gameState.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
          <div className="space-y-1">
            <div>🎯 Click projectors to activate</div>
            <div>🎮 Activate all 3 to complete level</div>
            <div>🖱️ Drag to explore the environment</div>
          </div>
        </div>
      </div>

      {/* Completion celebration */}
      {gameState === 'complete' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-white animate-pulse">
            <div className="text-6xl font-bold mb-4 text-green-400">SUCCESS!</div>
            <div className="text-xl">All projectors synchronized</div>
          </div>
        </div>
      )}
    </div>
  );
}