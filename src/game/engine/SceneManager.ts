import { Level } from '../levels/Level';

export class SceneManager {
  // private gameEngine: any; // Reference to GameEngine - Used in scene methods (reserved for future)
  private currentScene: Level | null = null;
  private nextScene: Level | null = null;
  private isTransitioning: boolean = false;
  private transitionDuration: number = 1.0; // seconds
  private transitionTime: number = 0;

  constructor(_gameEngine: any) {
    // GameEngine reference stored for future scene management features
    // this.gameEngine = gameEngine;
  }

  public loadScene(scene: Level): void {
    if (this.isTransitioning) {
      console.warn('Scene transition already in progress');
      return;
    }

    this.nextScene = scene;
    this.startTransition();
  }

  public getCurrentScene(): Level | null {
    return this.currentScene;
  }

  private startTransition(): void {
    this.isTransitioning = true;
    this.transitionTime = 0;

    // Start fade out of current scene
    if (this.currentScene) {
      this.currentScene.onExit();
    }
  }

  private completeTransition(): void {
    // Clean up old scene
    if (this.currentScene) {
      this.currentScene.destroy();
    }

    // Set new scene as current
    this.currentScene = this.nextScene;
    this.nextScene = null;

    // Initialize new scene
    if (this.currentScene) {
      this.currentScene.onEnter();
    }

    this.isTransitioning = false;
    this.transitionTime = 0;
  }

  public update(deltaTime: number): void {
    if (this.isTransitioning) {
      this.transitionTime += deltaTime;

      // Check if transition is complete
      if (this.transitionTime >= this.transitionDuration) {
        this.completeTransition();
      }
    }

    // Update current scene
    if (this.currentScene && !this.isTransitioning) {
      this.currentScene.update(deltaTime);
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.isTransitioning) {
      this.renderTransition(ctx);
    } else if (this.currentScene) {
      this.currentScene.render(ctx);
    }
  }

  private renderTransition(ctx: CanvasRenderingContext2D): void {
    const progress = Math.min(this.transitionTime / this.transitionDuration, 1);
    const alpha = Math.sin(progress * Math.PI); // Smooth fade

    // Render current scene (fading out)
    if (this.currentScene) {
      ctx.globalAlpha = 1 - (progress * 0.5);
      this.currentScene.render(ctx);
    }

    // Render next scene (fading in)
    if (this.nextScene && progress > 0.5) {
      ctx.globalAlpha = (progress - 0.5) * 2;
      this.nextScene.render(ctx);
    }

    // Reset alpha
    ctx.globalAlpha = 1;

    // Render transition overlay
    this.renderTransitionOverlay(ctx, alpha);
  }

  private renderTransitionOverlay(ctx: CanvasRenderingContext2D, alpha: number): void {
    const canvas = ctx.canvas;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Create radial gradient for smooth transition
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, Math.max(canvas.width, canvas.height)
    );

    gradient.addColorStop(0, `rgba(0, 0, 0, ${alpha * 0.3})`);
    gradient.addColorStop(1, `rgba(0, 0, 0, ${alpha * 0.1})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Scene stack management for menus/overlays
  private sceneStack: Level[] = [];

  public pushScene(scene: Level): void {
    if (this.currentScene) {
      this.sceneStack.push(this.currentScene);
      this.currentScene.onPause();
    }
    this.currentScene = scene;
    scene.onEnter();
  }

  public popScene(): void {
    if (this.currentScene) {
      this.currentScene.onExit();
      this.currentScene.destroy();
    }

    if (this.sceneStack.length > 0) {
      this.currentScene = this.sceneStack.pop()!;
      this.currentScene.onResume();
    } else {
      this.currentScene = null;
    }
  }

  public isTransitionInProgress(): boolean {
    return this.isTransitioning;
  }

  public getTransitionProgress(): number {
    if (!this.isTransitioning) return 0;
    return Math.min(this.transitionTime / this.transitionDuration, 1);
  }

  // Cleanup
  public destroy(): void {
    if (this.currentScene) {
      this.currentScene.destroy();
    }
    if (this.nextScene) {
      this.nextScene.destroy();
    }

    // Clean up scene stack
    this.sceneStack.forEach(scene => scene.destroy());
    this.sceneStack = [];
  }
}