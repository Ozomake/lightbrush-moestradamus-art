import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Box, Plane, MeshReflectorMaterial, ContactShadows, Sparkles, Trail, PerspectiveCamera } from '@react-three/drei';
import { useRef, useState, Suspense } from 'react';
import { Mesh, Group } from 'three';
import * as THREE from 'three';

interface Project3DProps {
  title: string;
  description: string;
  position: [number, number, number];
  color: string;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

function Project3D({ title, description, position, color, index, isActive, onClick }: Project3DProps) {
  const groupRef = useRef<Group>(null!);
  const boxRef = useRef<Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      const targetY = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + index * 2) * 0.3;
      const targetRotationY = Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.15;

      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.1);

      if (hovered) {
        groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, 1.1, 0.1));
      } else {
        groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, 1, 0.1));
      }
    }

    if (boxRef.current) {
      boxRef.current.rotation.x += hovered ? 0.015 : 0.005;
      boxRef.current.rotation.z += hovered ? 0.018 : 0.008;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
        <Trail
          width={3}
          length={6}
          color={color}
          attenuation={(t) => t * t}
        >
          {/* Main project cube with premium materials */}
          <Box
            ref={boxRef}
            scale={isActive ? [2.8, 2.8, 2.8] : [2.2, 2.2, 2.2]}
            args={[1, 1, 1]}
          >
            <meshPhysicalMaterial
              color={color}
              metalness={0.9}
              roughness={0.1}
              clearcoat={1}
              clearcoatRoughness={0}
              transmission={0.5}
              transparent
              opacity={0.95}
              emissive={hovered ? color : '#000000'}
              emissiveIntensity={hovered ? 0.3 : 0}
              envMapIntensity={1}
              reflectivity={1}
            />
          </Box>
        </Trail>

        {/* Premium holographic info panel */}
        {isActive && (
          <group position={[0, 3.5, 0]}>
            <Plane args={[5, 2]} position={[0, 0, 0.1]}>
              <meshPhysicalMaterial
                color="#000000"
                transparent
                opacity={0.9}
                metalness={0.8}
                roughness={0.2}
                clearcoat={1}
              />
            </Plane>
            <Text
              position={[0, 0.4, 0.2]}
              fontSize={0.35}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
              letterSpacing={0.1}
            >
              {title}
              <meshStandardMaterial
                attach="material"
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={0.3}
              />
            </Text>
            <Text
              position={[0, -0.2, 0.2]}
              fontSize={0.18}
              color="#aaaaaa"
              anchorX="center"
              anchorY="middle"
              maxWidth={4}
              lineHeight={1.5}
            >
              {description}
              <meshStandardMaterial
                attach="material"
                color="#aaaaaa"
                emissive="#8b5cf6"
                emissiveIntensity={0.1}
              />
            </Text>
          </group>
        )}

        {/* Premium particle effects */}
        {(isActive || hovered) && (
          <Sparkles
            count={50}
            scale={4}
            size={hovered ? 4 : 2}
            speed={0.5}
            color={color}
          />
        )}

        {/* Orbital rings for active project */}
        {isActive && (
          <group>
            {[...Array(3)].map((_, i) => {
              const radius = 3 + i * 0.5;
              return (
                <mesh key={i} rotation={[Math.PI / 2 * i, 0, 0]}>
                  <torusGeometry args={[radius, 0.02, 8, 64]} />
                  <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.5}
                    transparent
                    opacity={0.3}
                  />
                </mesh>
              );
            })}
          </group>
        )}
      </Float>

      {/* Premium projection beam effect */}
      <mesh position={[0, -3, 0]}>
        <cylinderGeometry args={[0.1, 0.5, 6, 32]} />
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={hovered ? 0.5 : 0.2}
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          transmission={0.9}
          roughness={0}
          metalness={1}
        />
      </mesh>
    </group>
  );
}

interface ProjectShowcase3DProps {
  projects: Array<{
    title: string;
    description: string;
    color: string;
  }>;
}

export default function ProjectShowcase3D({ projects }: ProjectShowcase3DProps) {
  const [activeProject, setActiveProject] = useState<number | null>(null);

  const projectPositions: Array<[number, number, number]> = [
    [-6, 0, -3],
    [0, 2, -5],
    [6, 0, -3],
    [-3, -2, 0],
    [3, -2, 0],
    [0, 1, 3],
  ];

  return (
    <div className="w-full h-[70vh] relative overflow-hidden rounded-xl">
      <Canvas
        shadows
        gl={{ alpha: false, antialias: true, powerPreference: 'high-performance' }}
      >
        <PerspectiveCamera makeDefault position={[0, 5, 18]} fov={45} />
        <Suspense fallback={null}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#8b5cf6" />
        <spotLight
          position={[0, 15, 5]}
          angle={0.4}
          penumbra={1}
          intensity={2}
          color="#ec4899"
          castShadow
        />

        {/* Premium reflective floor */}
        <Plane
          args={[30, 30]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -5, 0]}
        >
          <MeshReflectorMaterial
            blur={[400, 100]}
            resolution={1024}
            mixBlur={1}
            mixStrength={40}
            roughness={0.8}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#0a0a0f"
            metalness={0.8}
          />
        </Plane>

        {/* Contact shadows for depth */}
        <ContactShadows
          opacity={0.6}
          scale={30}
          blur={2.5}
          far={10}
          resolution={512}
          position={[0, -4.99, 0]}
        />

        {/* Ambient particles */}
        <Sparkles
          count={200}
          scale={20}
          size={1.5}
          speed={0.3}
          color="#8b5cf6"
        />

        {projects.slice(0, 6).map((project, index) => (
          <Project3D
            key={index}
            title={project.title}
            description={project.description}
            position={projectPositions[index]}
            color={project.color}
            index={index}
            isActive={activeProject === index}
            onClick={() => setActiveProject(activeProject === index ? null : index)}
          />
        ))}

        {/* Premium central title */}
        <Float speed={1} rotationIntensity={0.2} floatIntensity={1}>
          <group position={[0, 7, 0]}>
            <Text
              fontSize={2}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
              letterSpacing={0.2}
            >
              PROJECT PORTFOLIO
              <meshPhysicalMaterial
                attach="material"
                color="#ffffff"
                emissive="#8b5cf6"
                emissiveIntensity={0.4}
                metalness={0.9}
                roughness={0.1}
                clearcoat={1}
              />
            </Text>
            <Text
              position={[0, -0.8, 0]}
              fontSize={0.4}
              color="#8b5cf6"
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.3}
            >
              INTERACTIVE 3D SHOWCASE
              <meshStandardMaterial
                attach="material"
                color="#8b5cf6"
                emissive="#3b82f6"
                emissiveIntensity={0.3}
              />
            </Text>
          </group>
        </Float>

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          maxDistance={25}
          minDistance={10}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 6}
          autoRotate={activeProject === null}
          autoRotateSpeed={0.5}
          enableDamping
          dampingFactor={0.05}
        />
        </Suspense>
      </Canvas>

      {/* Premium gradient overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
      </div>

      {/* Premium UI Instructions */}
      <div className="absolute bottom-4 left-4 text-white text-sm">
        <div className="bg-gradient-to-r from-purple-900/80 to-blue-900/80 backdrop-blur-md rounded-xl p-4 border border-white/10">
          <p className="mb-1 font-light">🖱️ Drag to rotate • 🔍 Scroll to zoom</p>
          <p className="font-light">✨ Click projects to explore • 🎯 Hover for effects</p>
        </div>
      </div>

      {/* Premium Project counter */}
      <div className="absolute top-4 right-4 text-white">
        <div className="bg-gradient-to-r from-blue-900/80 to-purple-900/80 backdrop-blur-md rounded-xl p-4 border border-white/10">
          <p className="text-sm font-semibold">
            {activeProject !== null ? `Viewing: Project ${activeProject + 1}` : '✨ Portfolio Overview'}
          </p>
          <p className="text-xs text-gray-200 font-light">{projects.length} Premium Projects</p>
        </div>
      </div>
    </div>
  );
}