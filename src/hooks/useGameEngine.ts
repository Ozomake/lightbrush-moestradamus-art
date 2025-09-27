import { useEffect, useRef } from 'react';
import { GameEngine } from '../game/engine/GameEngine';
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';

/**
 * Custom hook for managing GameEngine lifecycle
 * Provides centralized engine access and state synchronization
 */
export function useGameEngine() {
  const engineRef = useRef<GameEngine | null>(null);
  const { isInitialized, setIsInitialized } = useGameStore();
  const { player } = usePlayerStore();

  useEffect(() => {
    if (!isInitialized && !engineRef.current) {
      engineRef.current = GameEngine.getInstance();
      setIsInitialized(true);
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.cleanup();
        engineRef.current = null;
        setIsInitialized(false);
      }
    };
  }, [isInitialized, setIsInitialized]);

  return {
    engine: engineRef.current,
    isReady: isInitialized && engineRef.current !== null,
    player,
  };
}

/**
 * Hook for accessing game systems
 */
export function useGameSystems() {
  const { skillSystem, equipmentSystem, achievementSystem } = usePlayerStore();

  return {
    skills: skillSystem,
    equipment: equipmentSystem,
    achievements: achievementSystem,
  };
}