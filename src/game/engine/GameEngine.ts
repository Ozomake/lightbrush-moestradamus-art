import { SceneManager } from './SceneManager';
import { InputManager } from './InputManager';
import { AudioManager } from './AudioManager';
import { useGameStore } from '../../store/gameStore';

export class GameEngine {
  private static instance: GameEngine;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private sceneManager: SceneManager;
  private inputManager: InputManager;
  private audioManager: AudioManager;
  private lastFrameTime: number = 0;
  private isRunning: boolean = false;
  private frameId: number = 0;

  private constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    // Initialize managers
    this.sceneManager = new SceneManager(this);
    this.inputManager = new InputManager(canvas);
    this.audioManager = new AudioManager();

    this.setupCanvas();
  }

  public static getInstance(canvas?: HTMLCanvasElement): GameEngine {
    if (!GameEngine.instance && canvas) {
      GameEngine.instance = new GameEngine(canvas);
    }
    return GameEngine.instance;
  }

  private setupCanvas(): void {
    // Set canvas size and handle high DPI displays
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';

    this.ctx.scale(dpr, dpr);

    // Handle canvas resize
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  private handleResize(): void {
    this.setupCanvas();
  }

  public start(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastFrameTime = performance.now();
      this.gameLoop();
    }
  }

  public stop(): void {
    this.isRunning = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
  }

  private gameLoop(): void {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
    this.lastFrameTime = currentTime;

    // Update
    this.update(deltaTime);

    // Render
    this.render();

    // Schedule next frame
    this.frameId = requestAnimationFrame(() => this.gameLoop());
  }

  private update(deltaTime: number): void {
    // Update input
    this.inputManager.update();

    // Update current scene
    this.sceneManager.update(deltaTime);

    // Update audio
    this.audioManager.update();
  }

  private render(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Render current scene
    this.sceneManager.render(this.ctx);
  }

  // Getters for managers
  public getSceneManager(): SceneManager {
    return this.sceneManager;
  }

  public getInputManager(): InputManager {
    return this.inputManager;
  }

  public getAudioManager(): AudioManager {
    return this.audioManager;
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  // Game state management
  public pause(): void {
    useGameStore.setState({ isPaused: true });
  }

  public resume(): void {
    useGameStore.setState({ isPaused: false });
  }

  public isPaused(): boolean {
    return useGameStore.getState().isPaused;
  }

  // Cleanup
  public destroy(): void {
    this.stop();
    window.removeEventListener('resize', this.handleResize.bind(this));
    this.inputManager.destroy();
    this.audioManager.destroy();
    GameEngine.instance = null as any;
  }
}