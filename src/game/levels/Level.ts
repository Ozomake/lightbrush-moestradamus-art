import { InputManager } from '../engine/InputManager';
import { AudioManager } from '../engine/AudioManager';
import { usePlayerStore } from '../../store/playerStore';
import { useGameStore } from '../../store/gameStore';

export interface LevelConfig {
  id: string;
  name: string;
  description: string;
  backgroundMusic?: string;
  ambientSounds?: string[];
  requiredLevel?: number;
  requiredSkills?: { [skill: string]: number };
  unlockConditions?: string[];
}

export interface GameObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'npc' | 'interactive' | 'decoration' | 'trigger';
  sprite?: string;
  animation?: string;
  data?: any;
}

export interface Trigger {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  action: string;
  condition?: () => boolean;
  data?: any;
}

export interface LevelTransition {
  targetLevel: string;
  x: number;
  y: number;
  width: number;
  height: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  requirements?: {
    level?: number;
    skills?: { [skill: string]: number };
    items?: string[];
    achievements?: string[];
  };
}

export abstract class Level {
  protected config: LevelConfig;
  protected gameObjects: Map<string, GameObject> = new Map();
  protected triggers: Map<string, Trigger> = new Map();
  protected transitions: Map<string, LevelTransition> = new Map();
  protected isInitialized: boolean = false;
  protected isPaused: boolean = false;
  protected camera: { x: number; y: number; scale: number } = { x: 0, y: 0, scale: 1 };

  // Level state
  protected visited: boolean = false;
  protected completionStatus: { [objective: string]: boolean } = {};
  protected levelData: { [key: string]: any } = {};

  // Performance tracking
  protected lastUpdateTime: number = 0;
  protected frameCount: number = 0;
  protected averageFps: number = 60;

  constructor(config: LevelConfig) {
    this.config = config;
  }

  // Abstract methods that must be implemented by subclasses
  protected abstract initializeLevel(): void;
  protected abstract updateLevel(deltaTime: number): void;
  protected abstract renderLevel(ctx: CanvasRenderingContext2D): void;
  protected abstract handleLevelInput(inputManager: InputManager): void;

  // Core level lifecycle methods
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.loadAssets();
      this.initializeLevel();
      this.setupDefaultObjects();
      this.isInitialized = true;
      console.log(`Level ${this.config.id} initialized successfully`);
    } catch (error) {
      console.error(`Failed to initialize level ${this.config.id}:`, error);
      throw error;
    }
  }

  public onEnter(): void {
    if (!this.visited) {
      this.visited = true;
      this.onFirstVisit();
    }

    this.startBackgroundMusic();
    this.onLevelEnter();

    // Update player position in store
    const playerStore = usePlayerStore.getState();
    playerStore.setPosition(
      playerStore.player.getPosition().x,
      playerStore.player.getPosition().y,
      this.config.id
    );

    console.log(`Entered level: ${this.config.name}`);
  }

  public onExit(): void {
    this.stopBackgroundMusic();
    this.onLevelExit();
    console.log(`Exited level: ${this.config.name}`);
  }

  public onPause(): void {
    this.isPaused = true;
    this.onLevelPause();
  }

  public onResume(): void {
    this.isPaused = false;
    this.onLevelResume();
  }

  public update(deltaTime: number): void {
    if (!this.isInitialized || this.isPaused) return;

    // Performance tracking
    this.frameCount++;
    const currentTime = performance.now();
    if (currentTime - this.lastUpdateTime >= 1000) {
      this.averageFps = this.frameCount;
      this.frameCount = 0;
      this.lastUpdateTime = currentTime;
    }

    // Update game objects
    this.updateGameObjects(deltaTime);

    // Check triggers
    this.checkTriggers();

    // Check transitions
    this.checkTransitions();

    // Update camera
    this.updateCamera(deltaTime);

    // Call subclass update
    this.updateLevel(deltaTime);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.isInitialized) return;

    // Save context state
    ctx.save();

    // Apply camera transformation
    ctx.translate(-this.camera.x, -this.camera.y);
    ctx.scale(this.camera.scale, this.camera.scale);

    try {
      // Render background
      this.renderBackground(ctx);

      // Render level content
      this.renderLevel(ctx);

      // Render game objects
      this.renderGameObjects(ctx);

      // Render UI overlays
      this.renderUI(ctx);

      // Debug rendering
      if (this.shouldShowDebugInfo()) {
        this.renderDebugInfo(ctx);
      }
    } finally {
      // Restore context state
      ctx.restore();
    }
  }

  public handleInput(inputManager: InputManager): void {
    if (!this.isInitialized || this.isPaused) return;

    // Handle common input
    const actions = inputManager.getActionInputs();

    if (actions.menu) {
      useGameStore.getState().showMenuModal();
    }

    if (actions.inventory) {
      useGameStore.getState().showInventoryModal();
    }

    if (actions.skills) {
      useGameStore.getState().showSkillTreeModal();
    }

    // Handle level-specific input
    this.handleLevelInput(inputManager);
  }

  // Game object management
  protected addGameObject(gameObject: GameObject): void {
    this.gameObjects.set(gameObject.id, gameObject);
  }

  protected removeGameObject(id: string): void {
    this.gameObjects.delete(id);
  }

  protected getGameObject(id: string): GameObject | undefined {
    return this.gameObjects.get(id);
  }

  protected getGameObjectsInArea(x: number, y: number, width: number, height: number): GameObject[] {
    const results: GameObject[] = [];

    this.gameObjects.forEach(obj => {
      if (this.isRectangleOverlap(
        obj.x, obj.y, obj.width, obj.height,
        x, y, width, height
      )) {
        results.push(obj);
      }
    });

    return results;
  }

  // Trigger system
  protected addTrigger(trigger: Trigger): void {
    this.triggers.set(trigger.id, trigger);
  }

  protected removeTrigger(id: string): void {
    this.triggers.delete(id);
  }

  protected checkTriggers(): void {
    const player = usePlayerStore.getState().player;
    const playerPos = player.getPosition();

    this.triggers.forEach(trigger => {
      if (this.isPointInRectangle(
        playerPos.x, playerPos.y,
        trigger.x, trigger.y, trigger.width, trigger.height
      )) {
        if (!trigger.condition || trigger.condition()) {
          this.executeTrigger(trigger);
        }
      }
    });
  }

  protected executeTrigger(trigger: Trigger): void {
    console.log(`Executing trigger: ${trigger.action}`);

    switch (trigger.action) {
      case 'dialog':
        if (trigger.data?.character && trigger.data?.text) {
          useGameStore.getState().showDialog(
            trigger.data.character,
            trigger.data.text,
            trigger.data.options
          );
        }
        break;

      case 'give_experience':
        if (trigger.data?.amount) {
          usePlayerStore.getState().addExperience(trigger.data.amount);
          useGameStore.getState().addNotification({
            type: 'success',
            title: 'Experience Gained!',
            message: `+${trigger.data.amount} XP`
          });
        }
        break;

      case 'unlock_content':
        if (trigger.data?.contentId) {
          usePlayerStore.getState().unlockContent(trigger.data.contentId);
          useGameStore.getState().addNotification({
            type: 'info',
            title: 'Content Unlocked!',
            message: trigger.data.message || 'New content is now available'
          });
        }
        break;

      case 'start_tutorial':
        // Start tutorial sequence
        this.startTutorial(trigger.data?.tutorialId);
        break;

      default:
        // Allow custom trigger handling
        this.onCustomTrigger(trigger);
    }
  }

  // Transition system
  protected addTransition(id: string, transition: LevelTransition): void {
    this.transitions.set(id, transition);
  }

  protected checkTransitions(): void {
    const player = usePlayerStore.getState().player;
    const playerPos = player.getPosition();

    this.transitions.forEach((transition, id) => {
      if (this.isPointInRectangle(
        playerPos.x, playerPos.y,
        transition.x, transition.y, transition.width, transition.height
      )) {
        if (this.canUseTransition(transition)) {
          this.executeTransition(transition);
        }
      }
    });
  }

  protected canUseTransition(transition: LevelTransition): boolean {
    if (!transition.requirements) return true;

    const player = usePlayerStore.getState().player;
    const stats = player.getStats();
    const skills = player.getSkills();

    // Check level requirement
    if (transition.requirements.level && stats.level < transition.requirements.level) {
      return false;
    }

    // Check skill requirements
    if (transition.requirements.skills) {
      for (const [skillName, requiredLevel] of Object.entries(transition.requirements.skills)) {
        if (skills[skillName as keyof typeof skills] < requiredLevel) {
          return false;
        }
      }
    }

    // Check item requirements
    if (transition.requirements.items) {
      for (const itemId of transition.requirements.items) {
        if (!player.hasInInventory(itemId)) {
          return false;
        }
      }
    }

    // Check achievement requirements
    if (transition.requirements.achievements) {
      for (const achievementId of transition.requirements.achievements) {
        if (!player.hasAchievement(achievementId)) {
          return false;
        }
      }
    }

    return true;
  }

  protected executeTransition(transition: LevelTransition): void {
    console.log(`Transitioning to level: ${transition.targetLevel}`);
    // This would be handled by the SceneManager
    // For now, just log the transition
  }

  // Camera system
  protected updateCamera(deltaTime: number): void {
    const player = usePlayerStore.getState().player;
    const playerPos = player.getPosition();

    // Simple camera follow with smoothing
    const targetX = playerPos.x - (window.innerWidth / 2);
    const targetY = playerPos.y - (window.innerHeight / 2);

    const smoothing = 5.0;
    this.camera.x += (targetX - this.camera.x) * smoothing * deltaTime;
    this.camera.y += (targetY - this.camera.y) * smoothing * deltaTime;
  }

  // Rendering methods
  protected renderBackground(ctx: CanvasRenderingContext2D): void {
    // Default background - can be overridden
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  protected renderGameObjects(ctx: CanvasRenderingContext2D): void {
    // Sort objects by y position for proper layering
    const sortedObjects = Array.from(this.gameObjects.values())
      .sort((a, b) => a.y - b.y);

    sortedObjects.forEach(obj => {
      this.renderGameObject(ctx, obj);
    });
  }

  protected renderGameObject(ctx: CanvasRenderingContext2D, obj: GameObject): void {
    // Simple placeholder rendering - can be overridden
    ctx.fillStyle = this.getGameObjectColor(obj.type);
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);

    // Render object ID for debugging
    if (this.shouldShowDebugInfo()) {
      ctx.fillStyle = 'white';
      ctx.font = '12px monospace';
      ctx.fillText(obj.id, obj.x, obj.y - 5);
    }
  }

  protected getGameObjectColor(type: GameObject['type']): string {
    switch (type) {
      case 'npc': return '#4ade80';
      case 'interactive': return '#60a5fa';
      case 'decoration': return '#a78bfa';
      case 'trigger': return '#f87171';
      default: return '#6b7280';
    }
  }

  protected renderUI(ctx: CanvasRenderingContext2D): void {
    // Override in subclasses for level-specific UI
  }

  protected renderDebugInfo(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.resetTransform();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 200, 120);

    ctx.fillStyle = 'white';
    ctx.font = '12px monospace';
    ctx.fillText(`Level: ${this.config.name}`, 20, 30);
    ctx.fillText(`Objects: ${this.gameObjects.size}`, 20, 50);
    ctx.fillText(`Triggers: ${this.triggers.size}`, 20, 70);
    ctx.fillText(`FPS: ${this.averageFps}`, 20, 90);
    ctx.fillText(`Camera: ${Math.round(this.camera.x)}, ${Math.round(this.camera.y)}`, 20, 110);

    ctx.restore();
  }

  // Audio methods
  protected startBackgroundMusic(): void {
    if (this.config.backgroundMusic) {
      // This would use the AudioManager
      console.log(`Starting background music: ${this.config.backgroundMusic}`);
    }
  }

  protected stopBackgroundMusic(): void {
    if (this.config.backgroundMusic) {
      console.log(`Stopping background music: ${this.config.backgroundMusic}`);
    }
  }

  // Asset loading
  protected async loadAssets(): Promise<void> {
    // Override in subclasses to load level-specific assets
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate loading
  }

  // Utility methods
  protected isPointInRectangle(px: number, py: number, rx: number, ry: number, rw: number, rh: number): boolean {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
  }

  protected isRectangleOverlap(
    x1: number, y1: number, w1: number, h1: number,
    x2: number, y2: number, w2: number, h2: number
  ): boolean {
    return !(x1 + w1 < x2 || x2 + w2 < x1 || y1 + h1 < y2 || y2 + h2 < y1);
  }

  protected shouldShowDebugInfo(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  // Setup methods
  protected setupDefaultObjects(): void {
    // Override in subclasses to add default objects
  }

  // Event handlers (override in subclasses)
  protected onFirstVisit(): void {}
  protected onLevelEnter(): void {}
  protected onLevelExit(): void {}
  protected onLevelPause(): void {}
  protected onLevelResume(): void {}
  protected onCustomTrigger(trigger: Trigger): void {}

  protected startTutorial(tutorialId?: string): void {
    console.log(`Starting tutorial: ${tutorialId}`);
  }

  // Update game objects
  protected updateGameObjects(deltaTime: number): void {
    // Basic object updates - override for more complex behavior
    this.gameObjects.forEach(obj => {
      if (obj.animation) {
        // Update animation state
      }
    });
  }

  // Getters
  public getId(): string {
    return this.config.id;
  }

  public getName(): string {
    return this.config.name;
  }

  public getDescription(): string {
    return this.config.description;
  }

  public isLevelInitialized(): boolean {
    return this.isInitialized;
  }

  public getCamera(): { x: number; y: number; scale: number } {
    return { ...this.camera };
  }

  // Cleanup
  public destroy(): void {
    this.gameObjects.clear();
    this.triggers.clear();
    this.transitions.clear();
    this.isInitialized = false;
    console.log(`Level ${this.config.id} destroyed`);
  }
}