import { useState, useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Box, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useVJCareerGame } from '../../store/gameStore';
import { MetatronsCube } from '../3d/SacredGeometry';

// Venue Component
interface Venue3DProps {
  position: [number, number, number];
  name: string;
  difficulty: string;
  onSelect: () => void;
  isActive: boolean;
}

function Venue3D({ position, name, difficulty, onSelect, isActive }: Venue3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const colors: Record<string, string> = {
    'Basement Club': '#10b981',
    'Warehouse Party': '#3b82f6',
    'Music Festival': '#ec4899',
    'Red Rocks': '#f59e0b',
    'Madison Square Garden': '#8b5cf6'
  };

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <group position={position}>
        <Box
          ref={meshRef}
          args={[2, 3, 0.5]}
          onClick={onSelect}
        >
          <meshPhysicalMaterial
            color={colors[name] || '#ffffff'}
            metalness={0.9}
            roughness={0.1}
            emissive={colors[name] || '#ffffff'}
            emissiveIntensity={isActive ? 0.5 : 0.2}
          />
        </Box>
        <Text
          position={[0, 2, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
        >
          {name}
        </Text>
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.2}
          color="#ffff00"
          anchorX="center"
        >
          Difficulty: {difficulty}
        </Text>
      </group>
    </Float>
  );
}

// Equipment Display
interface Equipment3DProps {
  equipment: any[];
  position: [number, number, number];
}

function Equipment3D({ equipment, position }: Equipment3DProps) {
  // Memoize equipment positions to prevent infinite re-renders
  const equipmentPositions = useMemo(() => {
    return equipment.map((_: any, i: number) => ({
      box: [(i - 1) * 1.5, 0, 0] as [number, number, number],
      text: [(i - 1) * 1.5, -0.6, 0] as [number, number, number]
    }));
  }, [equipment.length]);

  return (
    <group position={position}>
      {equipment.map((item: any, i: number) => (
        <Float key={i} speed={1 + i * 0.2}>
          <Box
            position={equipmentPositions[i].box}
            args={[0.8, 0.8, 0.8]}
          >
            <meshPhysicalMaterial
              color={item.rarity === 'legendary' ? '#ffd700' : item.rarity === 'epic' ? '#8b5cf6' : '#3b82f6'}
              metalness={1}
              roughness={0}
              emissive={item.rarity === 'legendary' ? '#ffd700' : '#8b5cf6'}
              emissiveIntensity={0.3}
            />
          </Box>
          <Text
            position={equipmentPositions[i].text}
            fontSize={0.15}
            color="white"
            anchorX="center"
          >
            {item.name}
          </Text>
        </Float>
      ))}
    </group>
  );
}

export default function VJCareerGame3D({ position }: { position: [number, number, number] }) {
  const { vjCareerGame, startNewGame, addExperience, addMoney, setVenue, setPerforming } = useVJCareerGame();
  const { player, scene } = vjCareerGame;
  const gameActive = vjCareerGame.isActive;
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [currentPerformance, setCurrentPerformance] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const venues = [
    { name: 'Basement Club', difficulty: 1, reward: 100, xp: 50 },
    { name: 'Warehouse Party', difficulty: 2, reward: 250, xp: 100 },
    { name: 'Music Festival', difficulty: 3, reward: 500, xp: 200 },
    { name: 'Red Rocks', difficulty: 4, reward: 1000, xp: 400 },
    { name: 'Madison Square Garden', difficulty: 5, reward: 2500, xp: 800 }
  ];

  const equipment = [
    { name: 'Basic Projector', cost: 100, power: 10, rarity: 'common' },
    { name: 'Pro Projector', cost: 500, power: 25, rarity: 'epic' },
    { name: 'Laser System', cost: 1500, power: 50, rarity: 'legendary' }
  ];

  const handleVenueSelect = useCallback((venue: any) => {
    try {
      setSelectedVenue(venue.name);
      setVenue(venue.name);
      setCurrentPerformance(true);
      setPerforming(true);

      // Simulate completing the venue
      setTimeout(() => {
        try {
          addMoney(venue.reward);
          addExperience(venue.xp);
          setSelectedVenue(null);
          setCurrentPerformance(false);
          setPerforming(false);
        } catch (error) {
          console.error('Error completing venue performance:', error);
          // Reset state on error
          setSelectedVenue(null);
          setCurrentPerformance(false);
          setPerforming(false);
        }
      }, 3000);
    } catch (error) {
      console.error('Error selecting venue:', error);
    }
  }, [setVenue, setPerforming, addMoney, addExperience]);

  // Memoize venue positions to prevent infinite re-renders
  const venuePositions = useMemo(() => {
    return venues.map((_venue, i) => {
      const angle = (i / venues.length) * Math.PI * 2;
      const radius = 5;
      return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius] as [number, number, number];
    });
  }, [venues.length]);

  // Memoize venue handlers to prevent infinite re-renders
  const venueHandlers = useMemo(() => {
    return venues.map(venue => () => handleVenueSelect(venue));
  }, [venues, handleVenueSelect]);

  const handleStartGame = () => {
    try {
      setIsLoading(true);
      startNewGame();
      // Small delay to show loading state
      setTimeout(() => setIsLoading(false), 500);
    } catch (error) {
      console.error('Error starting new game:', error);
      setIsLoading(false);
    }
  };

  return (
    <group position={position}>
      {/* Main Game Crystal - Metatron's Cube */}
      <Float speed={0.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <group onClick={handleStartGame} scale={1.5}>
          <MetatronsCube
            scale={2}
            color={gameActive ? "#ffd700" : "#8b5cf6"}
            emissiveIntensity={gameActive ? 0.8 : 0.3}
          />
        </group>
      </Float>

      {!gameActive && !isLoading && (
        <Text position={[0, 3, 0]} fontSize={0.5} color="#8b5cf6" anchorX="center">
          CLICK TO START VJ CAREER
        </Text>
      )}

      {isLoading && (
        <Text position={[0, 3, 0]} fontSize={0.5} color="#ffd700" anchorX="center">
          INITIALIZING CAREER...
        </Text>
      )}

      {gameActive && (
        <>
          {/* Game Title */}
          <Text position={[0, 7, 0]} fontSize={0.8} color="#8b5cf6" anchorX="center">
            VJ CAREER RPG
          </Text>

          {/* Player Stats */}
          <group position={[0, 6, 0]}>
            <Text fontSize={0.3} color="white" anchorX="center">
              Level {player?.level || 1} VJ • {player?.experience || 0} XP • ${player?.money || 0}
            </Text>
            <Text position={[0, -0.5, 0]} fontSize={0.25} color="#10b981" anchorX="center">
              Reputation: {player?.reputation || 0} • Current Venue: {scene?.venue || 'None'}
            </Text>
          </group>

          {/* Venues */}
          <group position={[0, 2, 0]}>
            <Text position={[0, 2, 0]} fontSize={0.4} color="white" anchorX="center">
              SELECT VENUE
            </Text>
            {venues.map((venue, i) => (
              <Venue3D
                key={venue.name}
                position={venuePositions[i]}
                name={venue.name}
                difficulty={venue.difficulty.toString()}
                onSelect={venueHandlers[i]}
                isActive={selectedVenue === venue.name}
              />
            ))}
          </group>

          {/* Equipment Shop */}
          <group position={[0, -3, 0]}>
            <Text position={[0, 1, 0]} fontSize={0.3} color="yellow" anchorX="center">
              EQUIPMENT SHOP
            </Text>
            <Equipment3D equipment={equipment} position={[0, 0, 0]} />
          </group>

          {/* Performance Status */}
          {currentPerformance && (
            <group position={[0, -5, 0]}>
              <Box args={[4, 1, 0.2]}>
                <meshPhysicalMaterial
                  color="#ffd700"
                  emissive="#ffd700"
                  emissiveIntensity={0.5}
                  metalness={1}
                  roughness={0}
                />
              </Box>
              <Text position={[0, 0, 0.2]} fontSize={0.3} color="black" anchorX="center">
                PERFORMING...
              </Text>
            </group>
          )}

          {/* Active Venue Animation */}
          {selectedVenue && (
            <>
              <Text position={[0, -7, 0]} fontSize={0.5} color="#10b981" anchorX="center">
                PERFORMING AT {selectedVenue.toUpperCase()}
              </Text>
              <Sparkles
                count={100}
                scale={15}
                size={3}
                speed={2}
                color="#10b981"
              />
            </>
          )}
        </>
      )}
    </group>
  );
}