import { render, screen } from '@testing-library/react';
import { expect, test, describe, vi } from 'vitest';
import { GameProvider, useGame } from '../components/providers/GameProvider';
import type { GameEngine } from '../game/engine/GameEngine';
import type { Player } from '../game/entities/Player';

// Mock the useGameEngine hook
vi.mock('../hooks/useGameEngine', () => ({
  useGameEngine: vi.fn(() => ({
    engine: null,
    isReady: false
  }))
}));

// Test component that uses the game context
const TestComponent = () => {
  const { engine, isReady } = useGame();
  return (
    <div>
      <div data-testid="engine-status">{engine ? 'engine-loaded' : 'engine-null'}</div>
      <div data-testid="ready-status">{isReady ? 'ready' : 'not-ready'}</div>
    </div>
  );
};

// Component that uses useGame outside of provider for error testing
const ComponentOutsideProvider = () => {
  useGame();
  return <div>Should not render</div>;
};

describe('GameProvider', () => {
  test('provides game context to children', () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    expect(screen.getByTestId('engine-status')).toHaveTextContent('engine-null');
    expect(screen.getByTestId('ready-status')).toHaveTextContent('not-ready');
  });

  test('throws error when useGame is used outside GameProvider', () => {
    // Expect error to be thrown
    expect(() => {
      render(<ComponentOutsideProvider />);
    }).toThrow('useGame must be used within a GameProvider');
  });

  test('renders children correctly', () => {
    render(
      <GameProvider>
        <div data-testid="child-content">Child content</div>
      </GameProvider>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toHaveTextContent('Child content');
  });

  test('passes through all context values', async () => {
    // Get the mocked useGameEngine function
    const { useGameEngine } = await import('../hooks/useGameEngine');

    // Mock different engine state
    vi.mocked(useGameEngine).mockReturnValue({
      engine: { id: 'mock-engine' } as unknown as GameEngine,
      isReady: true,
      player: { level: 1, experience: 0 } as unknown as Player
    });

    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    expect(screen.getByTestId('engine-status')).toHaveTextContent('engine-loaded');
    expect(screen.getByTestId('ready-status')).toHaveTextContent('ready');
  });
});