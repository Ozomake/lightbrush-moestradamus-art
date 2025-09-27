import { createContext, useContext, type ReactNode } from 'react';
import { GameEngine } from '../../game/engine/GameEngine';
import { useGameEngine } from '../../hooks/useGameEngine';

interface GameContextValue {
  engine: GameEngine | null;
  isReady: boolean;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

/**
 * Context provider for game engine access
 * Centralizes game engine lifecycle management
 */
export function GameProvider({ children }: GameProviderProps) {
  const { engine, isReady } = useGameEngine();

  return (
    <GameContext.Provider value={{ engine, isReady }}>
      {children}
    </GameContext.Provider>
  );
}

/**
 * Hook for consuming game context
 */
export function useGame() {
  const context = useContext(GameContext);

  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }

  return context;
}