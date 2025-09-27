import { BaseService } from './BaseService';
import type { ServiceConfig, ServiceResponse } from './BaseService';
import { GameEngine } from '../game/engine/GameEngine';
import { Player, type PlayerStats } from '../game/entities/Player';
import { SkillSystem } from '../game/systems/SkillSystem';
import { EquipmentSystem } from '../game/systems/EquipmentSystem';
import { AchievementSystem } from '../game/systems/AchievementSystem';
import { SaveLoadSystem } from '../game/systems/SaveLoadSystem';

export interface GameServiceConfig extends ServiceConfig {
  autoSaveInterval?: number;
  maxSaveSlots?: number;
}

export interface GameState {
  engine: GameEngine;
  player: Player;
  systems: {
    skills: SkillSystem;
    equipment: EquipmentSystem;
    achievements: AchievementSystem;
    saveLoad: SaveLoadSystem;
  };
}

/**
 * Service for managing game operations
 */
export class GameService extends BaseService {
  private static instance: GameService;
  private gameState?: GameState;
  private autoSaveTimer?: NodeJS.Timeout;

  private constructor(config: GameServiceConfig) {
    super(config);
  }

  static getInstance(config?: GameServiceConfig): GameService {
    if (!GameService.instance) {
      GameService.instance = new GameService(
        config || {
          name: 'GameService',
          version: '1.0.0',
          debug: true,
          autoSaveInterval: 60000, // 1 minute
          maxSaveSlots: 3,
        }
      );
    }
    return GameService.instance;
  }

  protected async onInitialize(): Promise<void> {
    this.log('Initializing game systems...');

    // Initialize game engine
    const canvas = document.createElement('canvas');
    const engine = GameEngine.getInstance(canvas);
    engine.start();

    // Initialize player
    const player = new Player();

    // Initialize game systems
    const systems = {
      skills: SkillSystem.getInstance(),
      equipment: EquipmentSystem.getInstance(),
      achievements: AchievementSystem.getInstance(),
      saveLoad: SaveLoadSystem.getInstance(),
    };

    this.gameState = {
      engine,
      player,
      systems,
    };

    // Setup auto-save
    this.setupAutoSave();
  }

  protected async onCleanup(): Promise<void> {
    this.log('Cleaning up game systems...');

    // Clear auto-save timer
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = undefined;
    }

    // Cleanup game state
    if (this.gameState) {
      this.gameState.engine.stop();
      this.gameState = undefined;
    }
  }

  /**
   * Game operations
   */
  async startGame(): Promise<ServiceResponse<void>> {
    return this.executeAsync(async () => {
      if (!this.gameState) {
        throw new Error('Game service not initialized');
      }

      await this.gameState.engine.start();
      this.log('Game started');
    });
  }

  async pauseGame(): Promise<ServiceResponse<void>> {
    return this.executeAsync(async () => {
      if (!this.gameState) {
        throw new Error('Game service not initialized');
      }

      this.gameState.engine.pause();
      this.log('Game paused');
    });
  }

  async resumeGame(): Promise<ServiceResponse<void>> {
    return this.executeAsync(async () => {
      if (!this.gameState) {
        throw new Error('Game service not initialized');
      }

      this.gameState.engine.resume();
      this.log('Game resumed');
    });
  }

  /**
   * Save/Load operations
   */
  async saveGame(slotId: number): Promise<ServiceResponse<void>> {
    return this.executeAsync(async () => {
      if (!this.gameState) {
        throw new Error('Game service not initialized');
      }

      await this.gameState.systems.saveLoad.saveGame(this.gameState.player, slotId);
      this.log(`Game saved to slot ${slotId}`);
    });
  }

  async loadGame(slotId: number): Promise<ServiceResponse<void>> {
    return this.executeAsync(async () => {
      if (!this.gameState) {
        throw new Error('Game service not initialized');
      }

      await this.gameState.systems.saveLoad.loadGame(this.gameState.player, slotId);
      this.log(`Game loaded from slot ${slotId}`);
    });
  }

  /**
   * Player operations
   */
  async updatePlayerStats(stats: Partial<PlayerStats>): Promise<ServiceResponse<void>> {
    return this.executeAsync(async () => {
      if (!this.gameState) {
        throw new Error('Game service not initialized');
      }

      // Update player stats
      Object.assign(this.gameState.player, stats);
      this.log('Player stats updated', stats);
    });
  }

  /**
   * Achievement operations
   */
  async unlockAchievement(id: string): Promise<ServiceResponse<void>> {
    return this.executeAsync(async () => {
      if (!this.gameState) {
        throw new Error('Game service not initialized');
      }

      this.gameState.player.unlockAchievement(id);
      this.log(`Achievement unlocked: ${id}`);
    });
  }

  /**
   * Get current game state
   */
  getGameState(): GameState | undefined {
    return this.gameState;
  }

  /**
   * Setup auto-save functionality
   */
  private setupAutoSave(): void {
    const config = this.config as GameServiceConfig;

    if (config.autoSaveInterval && config.autoSaveInterval > 0) {
      this.autoSaveTimer = setInterval(() => {
        this.saveGame(0).catch(error => {
          this.error('Auto-save failed', error);
        });
      }, config.autoSaveInterval);

      this.log('Auto-save enabled', { interval: config.autoSaveInterval });
    }
  }
}

// Export singleton instance
export const gameService = GameService.getInstance();