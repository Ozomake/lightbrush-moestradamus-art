import { GameEngine } from './engine/GameEngine';
import { SaveLoadSystem } from './systems/SaveLoadSystem';
import { SkillSystem } from './systems/SkillSystem';
import { EquipmentSystem } from './systems/EquipmentSystem';
import { AchievementSystem } from './systems/AchievementSystem';
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { HomeLevel } from './levels/HomeLevel';

export class GameInitializer {
  private static instance: GameInitializer;
  private gameEngine: GameEngine | null = null;
  private saveLoadSystem: SaveLoadSystem | null = null;
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): GameInitializer {
    if (!GameInitializer.instance) {
      GameInitializer.instance = new GameInitializer();
    }
    return GameInitializer.instance;
  }

  public async initialize(canvas: HTMLCanvasElement): Promise<boolean> {
    if (this.isInitialized) {
      console.warn('Game already initialized');
      return true;
    }

    try {
      console.log('Initializing VJ Career RPG...');

      const gameStore = useGameStore.getState();
      // const playerStore = usePlayerStore.getState();

      // Set up loading state
      gameStore.setLoading(true, 'Initializing game systems...', 0);

      // Initialize core systems
      await this.initializeSystems();
      gameStore.setLoading(true, 'Loading player data...', 25);

      // Initialize player and data
      await this.initializePlayer();
      gameStore.setLoading(true, 'Setting up game engine...', 50);

      // Initialize game engine
      await this.initializeGameEngine(canvas);
      gameStore.setLoading(true, 'Loading first level...', 75);

      // Load initial level
      await this.loadInitialLevel();
      gameStore.setLoading(true, 'Finalizing...', 90);

      // Set up event listeners
      this.setupEventListeners();
      gameStore.setLoading(true, 'Ready!', 100);

      this.isInitialized = true;

      // Hide loading screen after a brief delay
      setTimeout(() => {
        gameStore.setLoading(false);
        this.showWelcomeMessage();
      }, 500);

      console.log('VJ Career RPG initialized successfully!');
      return true;

    } catch (error) {
      console.error('Failed to initialize game:', error);
      useGameStore.getState().addNotification({
        type: 'error',
        title: 'Initialization Failed',
        message: 'Failed to start the game. Please refresh and try again.',
        duration: 0
      });
      return false;
    }
  }

  private async initializeSystems(): Promise<void> {
    // Initialize singleton systems
    this.saveLoadSystem = SaveLoadSystem.getInstance();

    // Initialize game systems (these are already singletons)
    SkillSystem.getInstance();
    EquipmentSystem.getInstance();
    AchievementSystem.getInstance();

    console.log('Core systems initialized');
  }

  private async initializePlayer(): Promise<void> {
    const playerStore = usePlayerStore.getState();

    // Initialize player store
    playerStore.initializePlayer();

    // Try to load auto-save if available
    if (this.saveLoadSystem) {
      const autoSaveSlot = this.saveLoadSystem.getSaveSlotInfo(0);
      if (autoSaveSlot.exists && !autoSaveSlot.isCorrupted) {
        console.log('Loading auto-save data...');
        await this.saveLoadSystem.loadGame(playerStore.player, 0);
      }
    }

    console.log('Player data initialized');
  }

  private async initializeGameEngine(canvas: HTMLCanvasElement): Promise<void> {
    // Initialize game engine
    this.gameEngine = GameEngine.getInstance(canvas);

    // Wait for game engine to be ready
    await new Promise<void>((resolve) => {
      const checkReady = () => {
        if (this.gameEngine) {
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    });

    console.log('Game engine initialized');
  }

  private async loadInitialLevel(): Promise<void> {
    if (!this.gameEngine) {
      throw new Error('Game engine not initialized');
    }

    const sceneManager = this.gameEngine.getSceneManager();
    const playerStore = usePlayerStore.getState();
    const playerPosition = playerStore.player.getPosition();

    // Determine initial level based on player data
    let initialLevel: string = playerPosition.scene;

    // If no scene is set, start at home
    if (!initialLevel || initialLevel === 'undefined') {
      initialLevel = 'home';
      playerStore.player.setPosition(350, 250, 'home');
    }

    // Load the appropriate level
    switch (initialLevel) {
      case 'home':
      default:
        const homeLevel = new HomeLevel();
        await homeLevel.initialize();
        sceneManager.loadScene(homeLevel);
        break;

      // Add other levels here as they're implemented
      // case 'club':
      //   const clubLevel = new ClubLevel();
      //   await clubLevel.initialize();
      //   sceneManager.loadScene(clubLevel);
      //   break;
    }

    useGameStore.getState().setCurrentScene(initialLevel);

    console.log(`Initial level loaded: ${initialLevel}`);
  }

  private setupEventListeners(): void {
    // Keyboard event handlers for global game controls
    document.addEventListener('keydown', this.handleGlobalKeyDown.bind(this));

    // Window focus/blur for pause/resume
    window.addEventListener('blur', this.handleWindowBlur.bind(this));
    window.addEventListener('focus', this.handleWindowFocus.bind(this));

    // Beforeunload for auto-save
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));

    // Visibility change for performance optimization
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    console.log('Event listeners set up');
  }

  private handleGlobalKeyDown(event: KeyboardEvent): void {
    const gameStore = useGameStore.getState();

    // Handle global shortcuts that work across all game states
    switch (event.code) {
      case 'F11':
        // Toggle fullscreen
        this.toggleFullscreen();
        event.preventDefault();
        break;

      case 'F12':
        // Toggle debug mode (in development)
        if (process.env.NODE_ENV === 'development') {
          console.log('Debug mode toggle');
          event.preventDefault();
        }
        break;

      case 'F5':
        // Prevent accidental refresh during gameplay
        if (gameStore.isRunning) {
          event.preventDefault();
          gameStore.addNotification({
            type: 'warning',
            title: 'Game Running',
            message: 'Use the in-game menu to save before refreshing!'
          });
        }
        break;
    }
  }

  private handleWindowBlur(): void {
    const gameStore = useGameStore.getState();
    if (gameStore.isRunning && !gameStore.isPaused) {
      gameStore.pauseGame();
      console.log('Game paused due to window blur');
    }
  }

  private handleWindowFocus(): void {
    const gameStore = useGameStore.getState();
    if (gameStore.isRunning && gameStore.isPaused) {
      // Don't auto-resume - let player decide
      gameStore.addNotification({
        type: 'info',
        title: 'Game Paused',
        message: 'Click to resume or press ESC for menu',
        duration: 3000
      });
    }
  }

  private handleBeforeUnload(event: BeforeUnloadEvent): void {
    const gameStore = useGameStore.getState();
    const playerStore = usePlayerStore.getState();

    if (gameStore.isRunning && this.saveLoadSystem) {
      // Attempt quick auto-save
      try {
        this.saveLoadSystem.saveGame(playerStore.player, 0);
      } catch (error) {
        console.warn('Failed to auto-save on page unload:', error);
      }
    }

    // Show confirmation dialog if game is running
    if (gameStore.isRunning) {
      event.preventDefault();
      event.returnValue = 'Are you sure you want to leave? Your progress will be auto-saved.';
      return event.returnValue;
    }
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      // Page is hidden - reduce performance if needed
      console.log('Page hidden - optimizing performance');
    } else {
      // Page is visible - restore full performance
      console.log('Page visible - restoring performance');
    }
  }

  private toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(error => {
        console.warn('Failed to enter fullscreen:', error);
        useGameStore.getState().addNotification({
          type: 'warning',
          title: 'Fullscreen Unavailable',
          message: 'Your browser does not support fullscreen mode'
        });
      });
    } else {
      document.exitFullscreen().catch(error => {
        console.warn('Failed to exit fullscreen:', error);
      });
    }
  }

  private showWelcomeMessage(): void {
    const playerStore = usePlayerStore.getState();
    const gameStore = useGameStore.getState();
    const stats = playerStore.player.getStats();

    if (stats.level === 1 && stats.experience === 0) {
      // New player
      setTimeout(() => {
        gameStore.showDialog(
          'VJ Career RPG',
          'Welcome to VJ Career RPG! You\'re starting your journey as a visual artist. Explore your studio, practice your skills, and build your reputation in the VJ community.',
          [
            { text: 'Let\'s begin my VJ journey!', action: 'start_tutorial' },
            { text: 'I\'ll explore on my own', action: 'close' }
          ]
        );
      }, 1000);
    } else {
      // Returning player
      gameStore.addNotification({
        type: 'info',
        title: 'Welcome Back!',
        message: `Level ${stats.level} VJ Artist - Continue your creative journey!`
      });
    }
  }

  // Public methods for game control
  public startGame(): boolean {
    if (!this.isInitialized || !this.gameEngine) {
      console.error('Cannot start game - not initialized');
      return false;
    }

    this.gameEngine.start();
    useGameStore.getState().startGame();

    console.log('Game started');
    return true;
  }

  public pauseGame(): boolean {
    if (!this.isInitialized || !this.gameEngine) {
      return false;
    }

    this.gameEngine.pause();
    useGameStore.getState().pauseGame();

    console.log('Game paused');
    return true;
  }

  public resumeGame(): boolean {
    if (!this.isInitialized || !this.gameEngine) {
      return false;
    }

    this.gameEngine.resume();
    useGameStore.getState().resumeGame();

    console.log('Game resumed');
    return true;
  }

  public stopGame(): boolean {
    if (!this.isInitialized || !this.gameEngine) {
      return false;
    }

    this.gameEngine.stop();
    useGameStore.getState().stopGame();

    console.log('Game stopped');
    return true;
  }

  // Save/Load integration
  public async quickSave(): Promise<boolean> {
    if (!this.saveLoadSystem) return false;

    const playerStore = usePlayerStore.getState();
    const success = await this.saveLoadSystem.saveGame(
      playerStore.player,
      1, // Quick save slot
      { description: 'Quick save' }
    );

    if (success) {
      useGameStore.getState().addNotification({
        type: 'success',
        title: 'Quick Save',
        message: 'Game saved successfully!'
      });
    }

    return success;
  }

  public async quickLoad(): Promise<boolean> {
    if (!this.saveLoadSystem) return false;

    const playerStore = usePlayerStore.getState();
    const slotInfo = this.saveLoadSystem.getSaveSlotInfo(1);

    if (!slotInfo.exists) {
      useGameStore.getState().addNotification({
        type: 'warning',
        title: 'No Save Found',
        message: 'No quick save found to load'
      });
      return false;
    }

    const success = await this.saveLoadSystem.loadGame(playerStore.player, 1);

    if (success) {
      useGameStore.getState().addNotification({
        type: 'success',
        title: 'Quick Load',
        message: 'Game loaded successfully!'
      });

      // Refresh player data in store
      playerStore.refreshPlayerData();
    }

    return success;
  }

  // Cleanup
  public destroy(): void {
    // Remove event listeners
    document.removeEventListener('keydown', this.handleGlobalKeyDown);
    window.removeEventListener('blur', this.handleWindowBlur);
    window.removeEventListener('focus', this.handleWindowFocus);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);

    // Destroy game engine
    if (this.gameEngine) {
      this.gameEngine.destroy();
      this.gameEngine = null;
    }

    // Destroy save system
    if (this.saveLoadSystem) {
      this.saveLoadSystem.destroy();
      this.saveLoadSystem = null;
    }

    this.isInitialized = false;
    GameInitializer.instance = null as any;

    console.log('Game systems destroyed');
  }

  // Getters
  public getGameEngine(): GameEngine | null {
    return this.gameEngine;
  }

  public getSaveLoadSystem(): SaveLoadSystem | null {
    return this.saveLoadSystem;
  }

  public isGameInitialized(): boolean {
    return this.isInitialized;
  }
}