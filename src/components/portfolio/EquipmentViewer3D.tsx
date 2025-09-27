import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Cylinder } from '@react-three/drei';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Group } from 'three';

interface Equipment3DProps {
  type: 'projector' | 'led-array' | 'speaker' | 'controller';
  position: [number, number, number];
  rotation?: [number, number, number];
  onClick?: () => void;
  isActive?: boolean;
}

const Equipment3D = ({ type, position, rotation = [0, 0, 0], onClick, isActive }: Equipment3DProps) => {
  const meshRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = hovered ? Math.sin(state.clock.elapsedTime) * 0.1 : rotation[1];
      meshRef.current.scale.setScalar(hovered || isActive ? 1.1 : 1);
    }
  });

  const getEquipmentModel = () => {
    switch (type) {
      case 'projector':
        return (
          <group>
            {/* Projector body */}
            <Box args={[2, 1, 1.5]} position={[0, 0, 0]}>
              <meshStandardMaterial color={isActive ? '#3b82f6' : '#374151'} />
            </Box>
            {/* Lens */}
            <Cylinder args={[0.3, 0.3, 0.2]} position={[1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <meshStandardMaterial color="#1f2937" transparent opacity={0.8} />
            </Cylinder>
            {/* Light beam (when active) */}
            {isActive && (
              <Cylinder args={[0.1, 2, 4]} position={[3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <meshStandardMaterial color="#60a5fa" transparent opacity={0.3} />
              </Cylinder>
            )}
          </group>
        );

      case 'led-array':
        return (
          <group>
            {Array.from({ length: 16 }).map((_, i) => {
              const x = (i % 4) * 0.5 - 0.75;
              const y = Math.floor(i / 4) * 0.5 - 0.75;
              return (
                <Box key={i} args={[0.3, 0.3, 0.1]} position={[x, y, 0]}>
                  <meshStandardMaterial
                    color={isActive ? `hsl(${i * 22.5}, 70%, 60%)` : '#4b5563'}
                    emissive={isActive ? `hsl(${i * 22.5}, 70%, 30%)` : '#000000'}
                  />
                </Box>
              );
            })}
          </group>
        );

      case 'speaker':
        return (
          <group>
            <Cylinder args={[0.8, 0.8, 2]} position={[0, 0, 0]}>
              <meshStandardMaterial color={isActive ? '#8b5cf6' : '#374151'} />
            </Cylinder>
            {/* Speaker cone */}
            <Cylinder args={[0.5, 0.2, 0.3]} position={[0, 0, 1]}>
              <meshStandardMaterial color="#1f2937" />
            </Cylinder>
            {/* Sound waves (when active) */}
            {isActive && (
              <>
                {[1.5, 2, 2.5].map((radius, i) => (
                  <mesh key={i} position={[0, 0, 1]}>
                    <ringGeometry args={[radius, radius + 0.1, 32]} />
                    <meshStandardMaterial
                      color="#a855f7"
                      transparent
                      opacity={0.3 - i * 0.1}
                    />
                  </mesh>
                ))}
              </>
            )}
          </group>
        );

      case 'controller':
        return (
          <group>
            <Box args={[1.5, 0.3, 0.8]} position={[0, 0, 0]}>
              <meshStandardMaterial color={isActive ? '#10b981' : '#374151'} />
            </Box>
            {/* Control buttons */}
            {Array.from({ length: 8 }).map((_, i) => (
              <Sphere key={i} args={[0.05]} position={[(i % 4) * 0.2 - 0.3, 0.2, (Math.floor(i / 4) - 0.5) * 0.2]}>
                <meshStandardMaterial color={isActive ? '#34d399' : '#6b7280'} />
              </Sphere>
            ))}
          </group>
        );

      default:
        return <Box args={[1, 1, 1]}><meshStandardMaterial color="#374151" /></Box>;
    }
  };

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onClick}
    >
      {getEquipmentModel()}
    </group>
  );
};

interface EquipmentViewer3DProps {
  equipment: Array<{
    id: string;
    name: string;
    type: 'projector' | 'led-array' | 'speaker' | 'controller';
    specs: string[];
    position: [number, number, number];
  }>;
  onEquipmentSelect?: (equipment: {
    id: string;
    name: string;
    type: 'projector' | 'led-array' | 'speaker' | 'controller';
    specs: string[];
    position: [number, number, number];
  }) => void;
  className?: string;
}

const EquipmentViewer3D = ({ equipment, onEquipmentSelect, className = '' }: EquipmentViewer3DProps) => {
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleEquipmentClick = (equipmentId: string) => {
    setSelectedEquipment(selectedEquipment === equipmentId ? null : equipmentId);
    const selectedItem = equipment.find(eq => eq.id === equipmentId);
    if (selectedItem && onEquipmentSelect) {
      onEquipmentSelect(selectedItem);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gradient-to-br from-gray-900 to-black rounded-xl border border-white/10 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span>3D Equipment Setup</span>
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              isPlaying
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-green-500/20 text-green-400 border border-green-500/30'
            }`}
          >
            {isPlaying ? 'Stop Demo' : 'Start Demo'}
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="h-96 relative">
        <Canvas camera={{ position: [10, 5, 10], fov: 50 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />

          {/* Ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#111827" transparent opacity={0.3} />
          </mesh>

          {/* Equipment */}
          {equipment.map((item) => (
            <Equipment3D
              key={item.id}
              type={item.type}
              position={item.position}
              isActive={selectedEquipment === item.id || isPlaying}
              onClick={() => handleEquipmentClick(item.id)}
            />
          ))}

          {/* Venue outline */}
          <mesh position={[0, 0, -5]}>
            <boxGeometry args={[12, 6, 0.1]} />
            <meshStandardMaterial color="#1f2937" transparent opacity={0.5} />
          </mesh>

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
            minDistance={5}
            maxDistance={20}
          />
        </Canvas>

        {/* Equipment info overlay */}
        {selectedEquipment && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 border border-white/20 max-w-xs"
          >
            {equipment
              .filter(item => item.id === selectedEquipment)
              .map(item => (
                <div key={item.id}>
                  <h4 className="text-white font-semibold mb-2">{item.name}</h4>
                  <div className="space-y-1">
                    {item.specs.map((spec, index) => (
                      <p key={index} className="text-sm text-gray-300">
                        • {spec}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
          </motion.div>
        )}

        {/* Controls */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="flex items-center justify-between text-sm text-gray-300">
              <span>Click equipment to inspect • Drag to rotate • Scroll to zoom</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-xs">Active: {selectedEquipment || (isPlaying ? 'Demo Mode' : 'None')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment List */}
      <div className="p-4 border-t border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {equipment.map((item) => (
            <button
              key={item.id}
              onClick={() => handleEquipmentClick(item.id)}
              className={`p-2 rounded-lg text-xs text-left transition-all ${
                selectedEquipment === item.id
                  ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                  : 'bg-gray-800/50 border border-white/10 text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <div className="font-medium truncate">{item.name}</div>
              <div className="text-gray-500 capitalize">{item.type.replace('-', ' ')}</div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default EquipmentViewer3D;