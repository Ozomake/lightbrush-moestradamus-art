import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { GameEngine } from '../game/engine/GameEngine';

export interface GameState {
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

  // Actions
  initializeGame: (canvas: HTMLCanvasElement) => Promise<void>;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  stopGame: () => void;

  // Scene management
  setCurrentScene: (sceneName: string) => void;

  // UI actions
  toggleHUD: () => void;
  showMenuModal: () => void;
  hideMenuModal: () => void;
  showInventoryModal: () => void;
  hideInventoryModal: () => void;
  showSkillTreeModal: () => void;
  hideSkillTreeModal: () => void;
  showAchievementsModal: () => void;
  hideAchievementsModal: () => void;
  showSettingsModal: () => void;
  hideSettingsModal: () => void;

  // Dialog system actions
  showDialog: (character: string, text: string, options?: { text: string; action: string }[]) => void;
  hideDialog: () => void;

  // Notification system actions
  addNotification: (notification: Omit<GameState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Loading actions
  setLoading: (isLoading: boolean, text?: string, progress?: number) => void;

  // VJ Career Game actions
  startNewGame: () => void;
  addExperience: (amount: number) => void;
  addMoney: (amount: number) => void;
  setVenue: (venue: string) => void;
  setPerforming: (performing: boolean) => void;

  // Settings actions
  updateGraphicsSettings: (settings: Partial<GameState['settings']['graphics']>) => void;
  updateAudioSettings: (settings: Partial<GameState['settings']['audio']>) => void;
  updateControlSettings: (settings: Partial<GameState['settings']['controls']>) => void;
  updateAccessibilitySettings: (settings: Partial<GameState['settings']['accessibility']>) => void;

  // Save/load settings
  saveSettings: () => void;
  loadSettings: () => void;
}

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    isInitialized: false,
    isRunning: false,
    isPaused: false,
    currentScene: null,

    showHUD: true,
    showMenu: false,
    showInventory: false,
    showSkillTree: false,
    showAchievements: false,
    showSettings: false,

    currentDialog: null,

    notifications: [],

    loading: {
      isLoading: false,
      loadingText: '',
      progress: 0
    },

    vjCareerGame: {
      isActive: false,
      player: null,
      scene: null
    },

    settings: {
      graphics: {
        quality: 'medium',
        showParticles: true,
        showAnimations: true
      },
      audio: {
        masterVolume: 0.7,
        musicVolume: 0.5,
        sfxVolume: 0.8,
        muted: false
      },
      controls: {
        keyboardControls: {
          moveUp: 'KeyW',
          moveDown: 'KeyS',
          moveLeft: 'KeyA',
          moveRight: 'KeyD',
          interact: 'KeyE',
          menu: 'Escape',
          inventory: 'KeyI',
          skills: 'KeyK'
        },
        mouseControls: true,
        touchControls: true
      },
      accessibility: {
        colorBlindMode: false,
        highContrast: false,
        reducedMotion: false,
        textSize: 'medium'
      }
    },

    // Game engine actions
    initializeGame: async (canvas: HTMLCanvasElement) => {
      set({ loading: { isLoading: true, loadingText: 'Initializing game engine...', progress: 0 } });

      try {
        // Initialize game engine
        const gameEngine = GameEngine.getInstance(canvas);

        set({ loading: { isLoading: true, loadingText: 'Loading assets...', progress: 25 } });

        // Initialize audio manager and preload sounds
        const audioManager = gameEngine.getAudioManager();
        await audioManager.preloadGameAudio();

        set({ loading: { isLoading: true, loadingText: 'Setting up game systems...', progress: 50 } });

        // Load settings
        get().loadSettings();

        set({ loading: { isLoading: true, loadingText: 'Finalizing...', progress: 75 } });

        // Mark as initialized
        set({
          isInitialized: true,
          loading: { isLoading: true, loadingText: 'Ready!', progress: 100 }
        });

        // Hide loading after a short delay
        setTimeout(() => {
          set({ loading: { isLoading: false, loadingText: '', progress: 0 } });
        }, 500);

      } catch (error) {
        console.error('Failed to initialize game:', error);
        set({
          loading: { isLoading: false, loadingText: '', progress: 0 },
          notifications: [...get().notifications, {
            id: Date.now().toString(),
            type: 'error',
            title: 'Initialization Error',
            message: 'Failed to initialize game engine',
            timestamp: Date.now()
          }]
        });
      }
    },

    startGame: () => {
      const gameEngine = GameEngine.getInstance();
      if (gameEngine) {
        gameEngine.start();
        set({ isRunning: true, isPaused: false });
      }
    },

    pauseGame: () => {
      const gameEngine = GameEngine.getInstance();
      if (gameEngine) {
        gameEngine.pause();
        set({ isPaused: true });
      }
    },

    resumeGame: () => {
      const gameEngine = GameEngine.getInstance();
      if (gameEngine) {
        gameEngine.resume();
        set({ isPaused: false });
      }
    },

    stopGame: () => {
      const gameEngine = GameEngine.getInstance();
      if (gameEngine) {
        gameEngine.stop();
        set({ isRunning: false, isPaused: false });
      }
    },

    // Scene management
    setCurrentScene: (sceneName: string) => {
      set({ currentScene: sceneName });
    },

    // UI actions
    toggleHUD: () => set(state => ({ showHUD: !state.showHUD })),

    showMenuModal: () => {
      get().pauseGame();
      set({ showMenu: true });
    },

    hideMenuModal: () => {
      set({ showMenu: false });
      get().resumeGame();
    },

    showInventoryModal: () => set({ showInventory: true }),
    hideInventoryModal: () => set({ showInventory: false }),

    showSkillTreeModal: () => set({ showSkillTree: true }),
    hideSkillTreeModal: () => set({ showSkillTree: false }),

    showAchievementsModal: () => set({ showAchievements: true }),
    hideAchievementsModal: () => set({ showAchievements: false }),

    showSettingsModal: () => set({ showSettings: true }),
    hideSettingsModal: () => set({ showSettings: false }),

    // Dialog system
    showDialog: (character: string, text: string, options?: { text: string; action: string }[]) => {
      get().pauseGame();
      set({ currentDialog: { character, text, options } });
    },

    hideDialog: () => {
      set({ currentDialog: null });
      get().resumeGame();
    },

    // Notifications
    addNotification: (notification) => {
      const id = Date.now().toString();
      const timestamp = Date.now();

      set(state => ({
        notifications: [...state.notifications, { ...notification, id, timestamp }]
      }));

      // Auto-remove notification after duration
      if (notification.duration !== 0) {
        const duration = notification.duration || 5000;
        setTimeout(() => {
          get().removeNotification(id);
        }, duration);
      }
    },

    removeNotification: (id: string) => {
      set(state => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }));
    },

    clearNotifications: () => set({ notifications: [] }),

    // Loading
    setLoading: (isLoading: boolean, text: string = '', progress: number = 0) => {
      set({
        loading: {
          isLoading,
          loadingText: text,
          progress: Math.max(0, Math.min(100, progress))
        }
      });
    },

    // VJ Career Game actions
    startNewGame: () => {
      set({
        vjCareerGame: {
          isActive: true,
          player: {
            level: 1,
            experience: 0,
            money: 0,
            reputation: 0
          },
          scene: {
            venue: null,
            isPerforming: false
          }
        }
      });
    },

    addExperience: (amount: number) => {
      set(state => {
        if (!state.vjCareerGame.player) return state;

        const newExperience = state.vjCareerGame.player.experience + amount;
        const newLevel = Math.floor(newExperience / 100) + 1;

        return {
          vjCareerGame: {
            ...state.vjCareerGame,
            player: {
              ...state.vjCareerGame.player,
              experience: newExperience,
              level: newLevel
            }
          }
        };
      });
    },

    addMoney: (amount: number) => {
      set(state => {
        if (!state.vjCareerGame.player) return state;

        return {
          vjCareerGame: {
            ...state.vjCareerGame,
            player: {
              ...state.vjCareerGame.player,
              money: state.vjCareerGame.player.money + amount
            }
          }
        };
      });
    },

    setVenue: (venue: string) => {
      set(state => ({
        vjCareerGame: {
          ...state.vjCareerGame,
          scene: state.vjCareerGame.scene ? {
            ...state.vjCareerGame.scene,
            venue
          } : {
            venue,
            isPerforming: false
          }
        }
      }));
    },

    setPerforming: (performing: boolean) => {
      set(state => ({
        vjCareerGame: {
          ...state.vjCareerGame,
          scene: state.vjCareerGame.scene ? {
            ...state.vjCareerGame.scene,
            isPerforming: performing
          } : {
            venue: null,
            isPerforming: performing
          }
        }
      }));
    },

    // Settings
    updateGraphicsSettings: (newSettings) => {
      set(state => ({
        settings: {
          ...state.settings,
          graphics: { ...state.settings.graphics, ...newSettings }
        }
      }));
      get().saveSettings();
    },

    updateAudioSettings: (newSettings) => {
      set(state => ({
        settings: {
          ...state.settings,
          audio: { ...state.settings.audio, ...newSettings }
        }
      }));

      // Apply audio settings to audio manager
      const gameEngine = GameEngine.getInstance();
      if (gameEngine) {
        const audioManager = gameEngine.getAudioManager();
        if (newSettings.masterVolume !== undefined) {
          audioManager.setVolume('masterVolume', newSettings.masterVolume);
        }
        if (newSettings.musicVolume !== undefined) {
          audioManager.setVolume('musicVolume', newSettings.musicVolume);
        }
        if (newSettings.sfxVolume !== undefined) {
          audioManager.setVolume('sfxVolume', newSettings.sfxVolume);
        }
        if (newSettings.muted !== undefined) {
          if (newSettings.muted) {
            audioManager.toggleMute();
          }
        }
      }

      get().saveSettings();
    },

    updateControlSettings: (newSettings) => {
      set(state => ({
        settings: {
          ...state.settings,
          controls: { ...state.settings.controls, ...newSettings }
        }
      }));
      get().saveSettings();
    },

    updateAccessibilitySettings: (newSettings) => {
      set(state => ({
        settings: {
          ...state.settings,
          accessibility: { ...state.settings.accessibility, ...newSettings }
        }
      }));
      get().saveSettings();
    },

    // Persistence
    saveSettings: () => {
      try {
        localStorage.setItem('vj-game-settings', JSON.stringify(get().settings));
      } catch (error) {
        console.warn('Failed to save settings:', error);
      }
    },

    loadSettings: () => {
      try {
        const stored = localStorage.getItem('vj-game-settings');
        if (stored) {
          const settings = JSON.parse(stored);
          set(state => ({ settings: { ...state.settings, ...settings } }));
        }
      } catch (error) {
        console.warn('Failed to load settings:', error);
      }
    }
  }))
);

// Selectors for commonly used state slices
export const useGameEngine = () => useGameStore(state => ({
  isInitialized: state.isInitialized,
  isRunning: state.isRunning,
  isPaused: state.isPaused,
  startGame: state.startGame,
  pauseGame: state.pauseGame,
  resumeGame: state.resumeGame,
  stopGame: state.stopGame
}));

export const useGameUI = () => useGameStore(state => ({
  showHUD: state.showHUD,
  showMenu: state.showMenu,
  showInventory: state.showInventory,
  showSkillTree: state.showSkillTree,
  showAchievements: state.showAchievements,
  showSettings: state.showSettings,
  toggleHUD: state.toggleHUD,
  showMenuModal: state.showMenuModal,
  hideMenuModal: state.hideMenuModal,
  showInventoryModal: state.showInventoryModal,
  hideInventoryModal: state.hideInventoryModal,
  showSkillTreeModal: state.showSkillTreeModal,
  hideSkillTreeModal: state.hideSkillTreeModal,
  showAchievementsModal: state.showAchievementsModal,
  hideAchievementsModal: state.hideAchievementsModal,
  showSettingsModal: state.showSettingsModal,
  hideSettingsModal: state.hideSettingsModal
}));

export const useGameDialog = () => useGameStore(state => ({
  currentDialog: state.currentDialog,
  showDialog: state.showDialog,
  hideDialog: state.hideDialog
}));

export const useGameNotifications = () => useGameStore(state => ({
  notifications: state.notifications,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications
}));

export const useGameSettings = () => useGameStore(state => ({
  settings: state.settings,
  updateGraphicsSettings: state.updateGraphicsSettings,
  updateAudioSettings: state.updateAudioSettings,
  updateControlSettings: state.updateControlSettings,
  updateAccessibilitySettings: state.updateAccessibilitySettings
}));

export const useVJCareerGame = () => useGameStore(state => ({
  vjCareerGame: state.vjCareerGame,
  startNewGame: state.startNewGame,
  addExperience: state.addExperience,
  addMoney: state.addMoney,
  setVenue: state.setVenue,
  setPerforming: state.setPerforming
}));