export interface InputState {
  keys: Set<string>;
  mouse: {
    x: number;
    y: number;
    buttons: Set<number>;
    wheel: number;
  };
  touch: {
    touches: Touch[];
    isActive: boolean;
  };
}

export class InputManager {
  private canvas: HTMLCanvasElement;
  private state: InputState;
  private previousState: InputState;
  private callbacks: Map<string, Set<Function>> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.state = {
      keys: new Set(),
      mouse: {
        x: 0,
        y: 0,
        buttons: new Set(),
        wheel: 0
      },
      touch: {
        touches: [],
        isActive: false
      }
    };

    this.previousState = this.cloneState(this.state);
    this.setupEventListeners();
  }

  private cloneState(state: InputState): InputState {
    return {
      keys: new Set(state.keys),
      mouse: {
        x: state.mouse.x,
        y: state.mouse.y,
        buttons: new Set(state.mouse.buttons),
        wheel: state.mouse.wheel
      },
      touch: {
        touches: [...state.touch.touches],
        isActive: state.touch.isActive
      }
    };
  }

  private setupEventListeners(): void {
    // Keyboard events
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));

    // Mouse events
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('wheel', this.handleWheel.bind(this));

    // Touch events
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });

    // Context menu prevention
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Focus management
    this.canvas.tabIndex = 0; // Make canvas focusable
  }

  // Keyboard handlers
  private handleKeyDown(event: KeyboardEvent): void {
    this.state.keys.add(event.code);
    this.triggerCallback('keydown', event);

    // Prevent default for game keys to avoid browser shortcuts
    const gameKeys = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'];
    if (gameKeys.includes(event.code)) {
      event.preventDefault();
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.state.keys.delete(event.code);
    this.triggerCallback('keyup', event);
  }

  // Mouse handlers
  private handleMouseDown(event: MouseEvent): void {
    this.state.mouse.buttons.add(event.button);
    this.updateMousePosition(event);
    this.triggerCallback('mousedown', event);
    this.canvas.focus(); // Focus canvas when clicked
  }

  private handleMouseUp(event: MouseEvent): void {
    this.state.mouse.buttons.delete(event.button);
    this.updateMousePosition(event);
    this.triggerCallback('mouseup', event);
  }

  private handleMouseMove(event: MouseEvent): void {
    this.updateMousePosition(event);
    this.triggerCallback('mousemove', event);
  }

  private handleWheel(event: WheelEvent): void {
    this.state.mouse.wheel = event.deltaY;
    this.triggerCallback('wheel', event);
    event.preventDefault();
  }

  private updateMousePosition(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.state.mouse.x = event.clientX - rect.left;
    this.state.mouse.y = event.clientY - rect.top;
  }

  // Touch handlers
  private handleTouchStart(event: TouchEvent): void {
    this.state.touch.isActive = true;
    this.state.touch.touches = Array.from(event.touches);
    this.triggerCallback('touchstart', event);
    event.preventDefault();
  }

  private handleTouchEnd(event: TouchEvent): void {
    this.state.touch.touches = Array.from(event.touches);
    if (event.touches.length === 0) {
      this.state.touch.isActive = false;
    }
    this.triggerCallback('touchend', event);
    event.preventDefault();
  }

  private handleTouchMove(event: TouchEvent): void {
    this.state.touch.touches = Array.from(event.touches);
    this.triggerCallback('touchmove', event);
    event.preventDefault();
  }

  // Public API
  public isKeyPressed(key: string): boolean {
    return this.state.keys.has(key);
  }

  public isKeyJustPressed(key: string): boolean {
    return this.state.keys.has(key) && !this.previousState.keys.has(key);
  }

  public isKeyJustReleased(key: string): boolean {
    return !this.state.keys.has(key) && this.previousState.keys.has(key);
  }

  public isMouseButtonPressed(button: number): boolean {
    return this.state.mouse.buttons.has(button);
  }

  public isMouseButtonJustPressed(button: number): boolean {
    return this.state.mouse.buttons.has(button) && !this.previousState.mouse.buttons.has(button);
  }

  public isMouseButtonJustReleased(button: number): boolean {
    return !this.state.mouse.buttons.has(button) && this.previousState.mouse.buttons.has(button);
  }

  public getMousePosition(): { x: number; y: number } {
    return { x: this.state.mouse.x, y: this.state.mouse.y };
  }

  public getMouseWheel(): number {
    return this.state.mouse.wheel;
  }

  public getTouches(): Touch[] {
    return [...this.state.touch.touches];
  }

  public isTouchActive(): boolean {
    return this.state.touch.isActive;
  }

  // Event callbacks
  public on(event: string, callback: Function): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, new Set());
    }
    this.callbacks.get(event)!.add(callback);
  }

  public off(event: string, callback: Function): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  private triggerCallback(event: string, data: any): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Update method called each frame
  public update(): void {
    // Store previous state for "just pressed/released" checks
    this.previousState = this.cloneState(this.state);

    // Reset frame-specific values
    this.state.mouse.wheel = 0;
  }

  // Input schemes for different contexts
  public getMovementInput(): { x: number; y: number } {
    let x = 0;
    let y = 0;

    // WASD movement
    if (this.isKeyPressed('KeyW') || this.isKeyPressed('ArrowUp')) y -= 1;
    if (this.isKeyPressed('KeyS') || this.isKeyPressed('ArrowDown')) y += 1;
    if (this.isKeyPressed('KeyA') || this.isKeyPressed('ArrowLeft')) x -= 1;
    if (this.isKeyPressed('KeyD') || this.isKeyPressed('ArrowRight')) x += 1;

    // Normalize diagonal movement
    if (x !== 0 && y !== 0) {
      const length = Math.sqrt(x * x + y * y);
      x /= length;
      y /= length;
    }

    return { x, y };
  }

  public getActionInputs(): { [key: string]: boolean } {
    return {
      interact: this.isKeyJustPressed('KeyE') || this.isKeyJustPressed('Space'),
      menu: this.isKeyJustPressed('Escape'),
      inventory: this.isKeyJustPressed('KeyI'),
      skills: this.isKeyJustPressed('KeyK'),
      confirm: this.isKeyJustPressed('Enter'),
      cancel: this.isKeyJustPressed('Escape')
    };
  }

  // Cleanup
  public destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));

    this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.removeEventListener('wheel', this.handleWheel.bind(this));

    this.canvas.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.canvas.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    this.canvas.removeEventListener('touchmove', this.handleTouchMove.bind(this));

    this.callbacks.clear();
  }
}