# Store API Documentation

This document provides comprehensive documentation for Zustand state management stores used in the LightBrush Website project.

## Table of Contents

- [GameStore](#gamestore)
- [PlayerStore](#playerstore)
- [Store Selectors](#store-selectors)
- [Best Practices](#best-practices)

---

## GameStore

The main game state management store that handles game engine state, UI state, dialog system, notifications, VJ career game, and settings.

### Overview

The GameStore is built using Zustand with the `subscribeWithSelector` middleware for fine-grained subscription capabilities. It serves as the central state management hub for the entire application.

### Usage

```typescript
import {
  useGameStore,
  useGameEngine,
  useGameUI,
  useGameDialog,
  useGameNotifications,
  useGameSettings,
  useVJCareerGame
} from '../store/gameStore';

// Direct store access
function MyComponent() {
  const isRunning = useGameStore(state => state.isRunning);
  const startGame = useGameStore(state => state.startGame);

  return (
    <button onClick={startGame} disabled={isRunning}>
      {isRunning ? 'Game Running' : 'Start Game'}
    </button>
  );
}

// Using specialized selectors
function GameControls() {
  const { isRunning, startGame, pauseGame, stopGame } = useGameEngine();
  // ...
}
```

### State Interface

```typescript
interface GameState {
  // Game engine state
  isInitialized: boolean;
  isRunning: boolean;
  isPaused: boolean;
  currentScene: string | null;

  // UI state
  showHUD: boolean;
  showMenu: boolean;
  showInventory: boolean;
  showSkillTree: boolean;
  showAchievements: boolean;
  showSettings: boolean;

  // Dialog system
  currentDialog: {
    character: string;
    text: string;
    options?: { text: string; action: string }[];
  } | null;

  // Notification system
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'achievement';
    title: string;
    message: string;
    duration?: number;
    timestamp: number;
  }>;

  // Loading state
  loading: {
    isLoading: boolean;
    loadingText: string;
    progress: number;
  };

  // VJ Career Game state
  vjCareerGame: {
    isActive: boolean;
    player: {
      level: number;
      experience: number;
      money: number;
      reputation: number;
    } | null;
    scene: {
      venue: string | null;
      isPerforming: boolean;
    } | null;
  };

  // Game settings
  settings: {
    graphics: {
      quality: 'low' | 'medium' | 'high';
      showParticles: boolean;
      showAnimations: boolean;
    };
    audio: {
      masterVolume: number;
      musicVolume: number;
      sfxVolume: number;
      muted: boolean;
    };
    controls: {
      keyboardControls: { [action: string]: string };
      mouseControls: boolean;
      touchControls: boolean;
    };
    accessibility: {
      colorBlindMode: boolean;
      highContrast: boolean;
      reducedMotion: boolean;
      textSize: 'small' | 'medium' | 'large';
    };
  };
}
```

### Game Engine Actions

#### initializeGame(canvas)

Initializes the game engine with the provided canvas element.

**Parameters:**
- `canvas` (HTMLCanvasElement): The canvas element for rendering

**Returns:** `Promise<void>`

**Example:**
```typescript
function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initializeGame = useGameStore(state => state.initializeGame);

  useEffect(() => {
    if (canvasRef.current) {
      initializeGame(canvasRef.current);
    }
  }, []);

  return <canvas ref={canvasRef} />;
}
```

#### startGame()

Starts the game engine and sets running state to true.

#### pauseGame()

Pauses the game engine while maintaining running state.

#### resumeGame()

Resumes the game engine from paused state.

#### stopGame()

Stops the game engine and sets running state to false.

### Scene Management

#### setCurrentScene(sceneName)

Sets the current active scene.

**Parameters:**
- `sceneName` (string): Name of the scene to activate

### UI State Actions

#### toggleHUD()

Toggles the visibility of the game HUD.

#### Modal Management

- `showMenuModal()` / `hideMenuModal()`: Game menu modal
- `showInventoryModal()` / `hideInventoryModal()`: Inventory modal
- `showSkillTreeModal()` / `hideSkillTreeModal()`: Skill tree modal
- `showAchievementsModal()` / `hideAchievementsModal()`: Achievements modal
- `showSettingsModal()` / `hideSettingsModal()`: Settings modal

**Example:**
```typescript
function GameUI() {
  const { showMenu, showMenuModal, hideMenuModal } = useGameUI();

  return (
    <>
      <button onClick={showMenuModal}>Menu</button>
      {showMenu && (
        <Modal onClose={hideMenuModal}>
          <GameMenu />
        </Modal>
      )}
    </>
  );
}
```

### Dialog System

#### showDialog(character, text, options?)

Displays a dialog with the specified character and text.

**Parameters:**
- `character` (string): Name of the character speaking
- `text` (string): Dialog text to display
- `options` (array, optional): Array of dialog options with text and action

**Example:**
```typescript
function NPCInteraction() {
  const { showDialog } = useGameDialog();

  const handleNPCClick = () => {
    showDialog('Mentor', 'Welcome to the VJ academy!', [
      { text: 'Tell me more', action: 'learn_more' },
      { text: 'Start training', action: 'start_tutorial' },
      { text: 'Not now', action: 'close' }
    ]);
  };

  return <button onClick={handleNPCClick}>Talk to Mentor</button>;
}
```

#### hideDialog()

Closes the current dialog and resumes the game.

### Notification System

#### addNotification(notification)

Adds a new notification to the notification queue.

**Parameters:**
- `notification` (object): Notification object without id and timestamp

**Example:**
```typescript
function AchievementSystem() {
  const { addNotification } = useGameNotifications();

  const unlockAchievement = (title: string, description: string) => {
    addNotification({
      type: 'achievement',
      title,
      message: description,
      duration: 5000
    });
  };

  return (
    <button onClick={() => unlockAchievement('First Steps', 'You completed your first projection!')}>
      Complete Tutorial
    </button>
  );
}
```

#### removeNotification(id)

Removes a specific notification by ID.

#### clearNotifications()

Removes all notifications from the queue.

### Loading State

#### setLoading(isLoading, text?, progress?)

Updates the loading state with optional text and progress.

**Parameters:**
- `isLoading` (boolean): Whether loading is active
- `text` (string, optional): Loading text to display
- `progress` (number, optional): Loading progress (0-100)

**Example:**
```typescript
function AssetLoader() {
  const setLoading = useGameStore(state => state.setLoading);

  const loadAssets = async () => {
    setLoading(true, 'Loading textures...', 0);

    const textures = await loadTextures((progress) => {
      setLoading(true, 'Loading textures...', progress * 50);
    });

    setLoading(true, 'Loading models...', 50);

    const models = await loadModels((progress) => {
      setLoading(true, 'Loading models...', 50 + progress * 50);
    });

    setLoading(false);
  };

  return <button onClick={loadAssets}>Load Game Assets</button>;
}
```

### VJ Career Game Actions

#### startNewGame()

Initializes a new VJ career game with default player stats.

#### addExperience(amount)

Adds experience points to the player and handles level progression.

**Parameters:**
- `amount` (number): Experience points to add

#### addMoney(amount)

Adds money to the player's account.

**Parameters:**
- `amount` (number): Money amount to add

#### setVenue(venue)

Sets the current venue for the VJ performance.

**Parameters:**
- `venue` (string): Name of the venue

#### setPerforming(performing)

Sets whether the player is currently performing.

**Parameters:**
- `performing` (boolean): Performance state

**Example:**
```typescript
function VJCareerUI() {
  const {
    vjCareerGame,
    startNewGame,
    addExperience,
    addMoney,
    setVenue
  } = useVJCareerGame();

  const completePerformance = () => {
    addExperience(25);
    addMoney(100);
    addNotification({
      type: 'success',
      title: 'Performance Complete!',
      message: 'You earned 25 XP and $100'
    });
  };

  if (!vjCareerGame.isActive) {
    return <button onClick={startNewGame}>Start Career</button>;
  }

  return (
    <div>
      <div>Level: {vjCareerGame.player?.level}</div>
      <div>XP: {vjCareerGame.player?.experience}</div>
      <div>Money: ${vjCareerGame.player?.money}</div>
      <button onClick={completePerformance}>Complete Performance</button>
    </div>
  );
}
```

### Settings Management

#### updateGraphicsSettings(settings)

Updates graphics settings and saves to localStorage.

**Parameters:**
- `settings` (object): Partial graphics settings object

#### updateAudioSettings(settings)

Updates audio settings, applies to audio manager, and saves to localStorage.

**Parameters:**
- `settings` (object): Partial audio settings object

#### updateControlSettings(settings)

Updates control settings and saves to localStorage.

**Parameters:**
- `settings` (object): Partial control settings object

#### updateAccessibilitySettings(settings)

Updates accessibility settings and saves to localStorage.

**Parameters:**
- `settings` (object): Partial accessibility settings object

**Example:**
```typescript
function SettingsPanel() {
  const {
    settings,
    updateGraphicsSettings,
    updateAudioSettings
  } = useGameSettings();

  return (
    <div>
      <h3>Graphics</h3>
      <select
        value={settings.graphics.quality}
        onChange={(e) => updateGraphicsSettings({ quality: e.target.value })}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <h3>Audio</h3>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={settings.audio.masterVolume}
        onChange={(e) => updateAudioSettings({ masterVolume: parseFloat(e.target.value) })}
      />
    </div>
  );
}
```

#### saveSettings() / loadSettings()

Manual save/load of settings to/from localStorage. Settings are automatically saved when updated.

---

## PlayerStore

Store for player-specific data and progression tracking.

### Usage

```typescript
import { usePlayerStore } from '../store/playerStore';

function PlayerProfile() {
  const {
    profile,
    achievements,
    updateProfile,
    unlockAchievement,
    saveProgress
  } = usePlayerStore();

  return (
    <div>
      <h2>{profile.name}</h2>
      <div>Level: {profile.level}</div>
      <div>Achievements: {achievements.length}</div>
    </div>
  );
}
```

### State Interface

```typescript
interface PlayerState {
  profile: {
    id: string;
    name: string;
    level: number;
    experience: number;
    totalPlayTime: number;
    lastPlayed: number;
  };

  achievements: Array<{
    id: string;
    title: string;
    description: string;
    unlockedAt: number;
    type: 'projection' | 'performance' | 'skill' | 'special';
  }>;

  statistics: {
    projectionsCreated: number;
    performancesCompleted: number;
    totalScore: number;
    bestPerformance: number;
  };

  preferences: {
    tutorialCompleted: boolean;
    preferredDifficulty: 'easy' | 'medium' | 'hard';
    autoSave: boolean;
  };
}
```

---

## Store Selectors

Pre-built selectors for common state combinations to optimize re-renders.

### useGameEngine

Provides game engine-specific state and actions.

```typescript
const {
  isInitialized,
  isRunning,
  isPaused,
  startGame,
  pauseGame,
  resumeGame,
  stopGame
} = useGameEngine();
```

### useGameUI

Provides UI state and modal management actions.

```typescript
const {
  showHUD,
  showMenu,
  showInventory,
  showSkillTree,
  showAchievements,
  showSettings,
  toggleHUD,
  showMenuModal,
  hideMenuModal,
  // ... other modal actions
} = useGameUI();
```

### useGameDialog

Provides dialog system state and actions.

```typescript
const {
  currentDialog,
  showDialog,
  hideDialog
} = useGameDialog();
```

### useGameNotifications

Provides notification system state and actions.

```typescript
const {
  notifications,
  addNotification,
  removeNotification,
  clearNotifications
} = useGameNotifications();
```

### useGameSettings

Provides settings state and update actions.

```typescript
const {
  settings,
  updateGraphicsSettings,
  updateAudioSettings,
  updateControlSettings,
  updateAccessibilitySettings
} = useGameSettings();
```

### useVJCareerGame

Provides VJ career game state and actions.

```typescript
const {
  vjCareerGame,
  startNewGame,
  addExperience,
  addMoney,
  setVenue,
  setPerforming
} = useVJCareerGame();
```

---

## Best Practices

### 1. Use Specific Selectors

Instead of subscribing to the entire store, use specific selectors to optimize performance:

```typescript
// Good: Only re-renders when isRunning changes
const isRunning = useGameStore(state => state.isRunning);

// Better: Use pre-built selector
const { isRunning } = useGameEngine();

// Bad: Re-renders on any state change
const gameState = useGameStore();
```

### 2. Batch Related Updates

When making multiple related state changes, batch them together:

```typescript
// Good: Single state update
const completeLevelUp = () => {
  useGameStore.setState(state => ({
    vjCareerGame: {
      ...state.vjCareerGame,
      player: state.vjCareerGame.player ? {
        ...state.vjCareerGame.player,
        level: state.vjCareerGame.player.level + 1,
        experience: 0
      } : null
    },
    notifications: [...state.notifications, {
      id: Date.now().toString(),
      type: 'achievement',
      title: 'Level Up!',
      message: `You reached level ${state.vjCareerGame.player?.level + 1}!`,
      timestamp: Date.now()
    }]
  }));
};

// Bad: Multiple separate updates
const levelUp = () => {
  addExperience(-getCurrentExperience());
  setLevel(getCurrentLevel() + 1);
  addNotification({ ... });
};
```

### 3. Handle Async Operations Properly

Use loading states for async operations:

```typescript
const loadGameData = async () => {
  setLoading(true, 'Loading save data...');

  try {
    const saveData = await loadFromServer();
    useGameStore.setState({ ...saveData });
    addNotification({
      type: 'success',
      title: 'Game Loaded',
      message: 'Your progress has been restored'
    });
  } catch (error) {
    addNotification({
      type: 'error',
      title: 'Load Failed',
      message: 'Could not load your save data'
    });
  } finally {
    setLoading(false);
  }
};
```

### 4. Implement Proper Error Boundaries

Wrap store usage in error boundaries to handle state-related errors:

```typescript
function GameStateErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={<div>Something went wrong with the game state</div>}
      onError={(error) => {
        console.error('Store error:', error);
        // Reset to safe state if needed
        useGameStore.getState().stopGame();
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

### 5. Subscribe to Specific Changes

Use Zustand's subscribe functionality for side effects:

```typescript
// Monitor performance and adjust quality
useGameStore.subscribe(
  (state) => state.settings.graphics.quality,
  (quality) => {
    // Adjust Three.js renderer settings based on quality
    adjustRendererQuality(quality);
  }
);

// Save progress automatically
useGameStore.subscribe(
  (state) => state.vjCareerGame.player,
  (player) => {
    if (player) {
      savePlayerProgress(player);
    }
  }
);
```

### 6. Initialize State Properly

Initialize store state on app startup:

```typescript
function AppInitializer() {
  useEffect(() => {
    // Load saved settings
    useGameStore.getState().loadSettings();

    // Initialize with default values if needed
    const { vjCareerGame } = useGameStore.getState();
    if (!vjCareerGame.isActive) {
      // Set up default state
    }
  }, []);

  return null;
}
```

This comprehensive store documentation provides all the necessary information for working with the state management system in the LightBrush Website project.