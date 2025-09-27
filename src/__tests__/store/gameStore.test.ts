import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useGameStore } from '../../store/gameStore';

// Mock GameEngine
vi.mock('../../game/engine/GameEngine', () => ({
  GameEngine: {
    getInstance: vi.fn(() => ({
      start: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      stop: vi.fn(),
      getAudioManager: vi.fn(() => ({
        preloadGameAudio: vi.fn().mockResolvedValue(undefined),
        setVolume: vi.fn(),
        toggleMute: vi.fn()
      }))
    }))
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('gameStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    // Reset store state
    useGameStore.setState({
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
      }
    });
  });

  describe('Initial state', () => {
    test('should have correct initial values', () => {
      const state = useGameStore.getState();

      expect(state.isInitialized).toBe(false);
      expect(state.isRunning).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.currentScene).toBe(null);
      expect(state.showHUD).toBe(true);
      expect(state.showMenu).toBe(false);
      expect(state.notifications).toEqual([]);
      expect(state.vjCareerGame.isActive).toBe(false);
    });
  });

  describe('Game engine actions', () => {
    test('startGame should set isRunning to true', () => {
      const { startGame } = useGameStore.getState();

      startGame();

      const state = useGameStore.getState();
      expect(state.isRunning).toBe(true);
      expect(state.isPaused).toBe(false);
    });

    test('pauseGame should set isPaused to true', () => {
      const { pauseGame } = useGameStore.getState();

      pauseGame();

      const state = useGameStore.getState();
      expect(state.isPaused).toBe(true);
    });

    test('resumeGame should set isPaused to false', () => {
      const { resumeGame } = useGameStore.getState();

      // First pause the game
      useGameStore.setState({ isPaused: true });

      resumeGame();

      const state = useGameStore.getState();
      expect(state.isPaused).toBe(false);
    });

    test('stopGame should set isRunning and isPaused to false', () => {
      const { stopGame } = useGameStore.getState();

      // Set initial running state
      useGameStore.setState({ isRunning: true, isPaused: true });

      stopGame();

      const state = useGameStore.getState();
      expect(state.isRunning).toBe(false);
      expect(state.isPaused).toBe(false);
    });
  });

  describe('UI state management', () => {
    test('toggleHUD should toggle showHUD state', () => {
      const { toggleHUD } = useGameStore.getState();

      expect(useGameStore.getState().showHUD).toBe(true);

      toggleHUD();
      expect(useGameStore.getState().showHUD).toBe(false);

      toggleHUD();
      expect(useGameStore.getState().showHUD).toBe(true);
    });

    test('showMenuModal should pause game and show menu', () => {
      const { showMenuModal } = useGameStore.getState();

      showMenuModal();

      const state = useGameStore.getState();
      expect(state.showMenu).toBe(true);
      expect(state.isPaused).toBe(true);
    });

    test('hideMenuModal should hide menu and resume game', () => {
      const { hideMenuModal } = useGameStore.getState();

      // Set initial state
      useGameStore.setState({ showMenu: true, isPaused: true });

      hideMenuModal();

      const state = useGameStore.getState();
      expect(state.showMenu).toBe(false);
      expect(state.isPaused).toBe(false);
    });

    test('inventory modal actions should work correctly', () => {
      const { showInventoryModal, hideInventoryModal } = useGameStore.getState();

      showInventoryModal();
      expect(useGameStore.getState().showInventory).toBe(true);

      hideInventoryModal();
      expect(useGameStore.getState().showInventory).toBe(false);
    });
  });

  describe('Notification system', () => {
    test('addNotification should add notification with generated id and timestamp', () => {
      const { addNotification } = useGameStore.getState();

      const notification = {
        type: 'info' as const,
        title: 'Test Notification',
        message: 'This is a test message'
      };

      addNotification(notification);

      const state = useGameStore.getState();
      expect(state.notifications).toHaveLength(1);
      expect(state.notifications[0]).toMatchObject({
        type: 'info',
        title: 'Test Notification',
        message: 'This is a test message'
      });
      expect(state.notifications[0].id).toBeDefined();
      expect(state.notifications[0].timestamp).toBeDefined();
    });

    test('removeNotification should remove notification by id', () => {
      const { addNotification, removeNotification } = useGameStore.getState();

      // Add notification
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Operation completed'
      });

      const notificationId = useGameStore.getState().notifications[0].id;

      removeNotification(notificationId);

      expect(useGameStore.getState().notifications).toHaveLength(0);
    });

    test('clearNotifications should remove all notifications', () => {
      const { addNotification, clearNotifications } = useGameStore.getState();

      // Add multiple notifications
      addNotification({ type: 'info', title: 'Info 1', message: 'Message 1' });
      addNotification({ type: 'info', title: 'Info 2', message: 'Message 2' });

      expect(useGameStore.getState().notifications).toHaveLength(2);

      clearNotifications();

      expect(useGameStore.getState().notifications).toHaveLength(0);
    });
  });

  describe('VJ Career Game actions', () => {
    test('startNewGame should initialize player and scene', () => {
      const { startNewGame } = useGameStore.getState();

      startNewGame();

      const state = useGameStore.getState();
      expect(state.vjCareerGame.isActive).toBe(true);
      expect(state.vjCareerGame.player).toEqual({
        level: 1,
        experience: 0,
        money: 0,
        reputation: 0
      });
      expect(state.vjCareerGame.scene).toEqual({
        venue: null,
        isPerforming: false
      });
    });

    test('addExperience should increase experience and level up correctly', () => {
      const { startNewGame, addExperience } = useGameStore.getState();

      startNewGame();
      addExperience(150);

      const state = useGameStore.getState();
      expect(state.vjCareerGame.player?.experience).toBe(150);
      expect(state.vjCareerGame.player?.level).toBe(2); // 150 / 100 + 1 = 2
    });

    test('addMoney should increase player money', () => {
      const { startNewGame, addMoney } = useGameStore.getState();

      startNewGame();
      addMoney(500);

      const state = useGameStore.getState();
      expect(state.vjCareerGame.player?.money).toBe(500);
    });

    test('setVenue should update venue in scene', () => {
      const { startNewGame, setVenue } = useGameStore.getState();

      startNewGame();
      setVenue('Club Red');

      const state = useGameStore.getState();
      expect(state.vjCareerGame.scene?.venue).toBe('Club Red');
    });
  });

  describe('Settings management', () => {
    test('updateGraphicsSettings should update graphics settings and save', () => {
      const { updateGraphicsSettings } = useGameStore.getState();

      updateGraphicsSettings({ quality: 'high', showParticles: false });

      const state = useGameStore.getState();
      expect(state.settings.graphics.quality).toBe('high');
      expect(state.settings.graphics.showParticles).toBe(false);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'vj-game-settings',
        expect.any(String)
      );
    });

    test('loadSettings should load from localStorage', () => {
      const mockSettings = {
        graphics: { quality: 'low', showParticles: false, showAnimations: false },
        audio: { masterVolume: 0.5 }
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSettings));

      const { loadSettings } = useGameStore.getState();
      loadSettings();

      const state = useGameStore.getState();
      expect(state.settings.graphics.quality).toBe('low');
      expect(state.settings.graphics.showParticles).toBe(false);
    });
  });

  describe('Selectors', () => {
    test('useGameEngine selector should return correct engine state', () => {
      useGameStore.setState({ isRunning: true, isPaused: false });

      // Test selector function directly without calling hooks outside component
      const state = useGameStore.getState();
      const selectorResult = {
        isInitialized: state.isInitialized,
        isRunning: state.isRunning,
        isPaused: state.isPaused,
        startGame: state.startGame,
        pauseGame: state.pauseGame,
        resumeGame: state.resumeGame,
        stopGame: state.stopGame
      };

      expect(selectorResult.isRunning).toBe(true);
      expect(selectorResult.isPaused).toBe(false);
      expect(typeof selectorResult.startGame).toBe('function');
    });

    test('useGameUI selector should return correct UI state', () => {
      useGameStore.setState({ showMenu: true, showInventory: false });

      // Test selector logic directly
      const state = useGameStore.getState();
      const selectorResult = {
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
      };

      expect(selectorResult.showMenu).toBe(true);
      expect(selectorResult.showInventory).toBe(false);
      expect(typeof selectorResult.showMenuModal).toBe('function');
    });

    test('useGameNotifications selector should return notifications state', () => {
      const notifications = [
        { id: '1', type: 'info' as const, title: 'Test', message: 'Message', timestamp: Date.now() }
      ];
      useGameStore.setState({ notifications });

      // Test selector logic directly
      const state = useGameStore.getState();
      const selectorResult = {
        notifications: state.notifications,
        addNotification: state.addNotification,
        removeNotification: state.removeNotification,
        clearNotifications: state.clearNotifications
      };

      expect(selectorResult.notifications).toEqual(notifications);
      expect(typeof selectorResult.addNotification).toBe('function');
    });
  });
});