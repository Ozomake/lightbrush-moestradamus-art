import * as THREE from 'three';

export interface LEDWallConfig {
  width: number;
  height: number;
  resolution: { width: number; height: number };
  position: { x: number; y: number; z: number };
  type: 'main_display' | 'side_panel' | 'floor_led' | 'ceiling_panel';
  pixelPitch?: number; // Distance between LED pixels in mm
  brightness?: number; // 0-1 scale
  refreshRate?: number; // Hz
  colorDepth?: number; // bits per channel
}

export interface LEDPixel {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
  intensity: number;
}

export interface VisualLayer {
  id: string;
  name: string;
  content: THREE.Texture | THREE.VideoTexture | THREE.CanvasTexture;
  opacity: number;
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'additive';
  effects: VisualEffect[];
  position: { x: number; y: number };
  scale: { x: number; y: number };
  rotation: number;
}

export interface VisualEffect {
  type: 'strobe' | 'color_shift' | 'pixel_sort' | 'feedback' | 'distortion' | 'particle_overlay';
  intensity: number;
  parameters: { [key: string]: any };
  active: boolean;
}

export class LEDWall {
  private config: LEDWallConfig;
  private mesh: THREE.Mesh;
  private material: THREE.MeshBasicMaterial;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private renderTexture: THREE.CanvasTexture;

  // Visual layers system
  private layers: Map<string, VisualLayer> = new Map();
  private activeLayer: string = 'layer_0';
  private layerCompositor: CanvasRenderingContext2D;
  private compositorCanvas: HTMLCanvasElement;

  // Performance monitoring
  private frameRate: number = 60;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private pixelData: LEDPixel[][];

  // Beat synchronization
  private beatSyncEnabled: boolean = true;
  private lastBeatTime: number = 0;
  private beatEffects: VisualEffect[] = [];

  // Spectacular mode for finale
  private spectacularMode: boolean = false;
  private spectacularEffects: VisualEffect[] = [];

  // Hardware simulation
  private temperatureSimulation: number = 25; // Celsius
  private powerConsumption: number = 0; // Watts
  private malfunctionChance: number = 0.001;

  constructor(config: LEDWallConfig) {
    this.config = {
      pixelPitch: 2.5, // Professional 2.5mm pitch
      brightness: 0.8,
      refreshRate: 60,
      colorDepth: 16, // 16-bit per channel
      ...config
    };

    this.initializeHardware();
    this.createMesh();
    this.initializeCanvas();
    this.setupLayers();
    this.initializePixelGrid();
    this.setupBeatEffects();
  }

  private initializeHardware(): void {
    // Calculate power consumption based on LED count
    const pixelCount = this.config.resolution.width * this.config.resolution.height;
    this.powerConsumption = pixelCount * 0.2; // ~0.2W per pixel at full brightness

    console.log(`LED Wall initialized: ${this.config.resolution.width}x${this.config.resolution.height} (${pixelCount} pixels)`);
    console.log(`Estimated power consumption: ${this.powerConsumption}W`);
  }

  private createMesh(): void {
    const geometry = new THREE.PlaneGeometry(this.config.width, this.config.height);

    this.material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.set(
      this.config.position.x,
      this.config.position.y,
      this.config.position.z
    );

    // Add subtle glow effect
    const glowGeometry = new THREE.PlaneGeometry(
      this.config.width * 1.1,
      this.config.height * 1.1
    );
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x404040,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending
    });

    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.position.z = -0.1;
    this.mesh.add(glowMesh);
  }

  private initializeCanvas(): void {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.config.resolution.width;
    this.canvas.height = this.config.resolution.height;
    this.context = this.canvas.getContext('2d')!;

    // Compositor canvas for layer blending
    this.compositorCanvas = document.createElement('canvas');
    this.compositorCanvas.width = this.config.resolution.width;
    this.compositorCanvas.height = this.config.resolution.height;
    this.layerCompositor = this.compositorCanvas.getContext('2d')!;

    // Create render texture
    this.renderTexture = new THREE.CanvasTexture(this.canvas);
    this.renderTexture.minFilter = THREE.NearestFilter;
    this.renderTexture.magFilter = THREE.NearestFilter;
    this.renderTexture.flipY = false;

    this.material.map = this.renderTexture;

    console.log(`LED Wall canvas initialized: ${this.canvas.width}x${this.canvas.height}`);
  }

  private setupLayers(): void {
    // Initialize default layers
    for (let i = 0; i < 8; i++) {
      const layerCanvas = document.createElement('canvas');
      layerCanvas.width = this.config.resolution.width;
      layerCanvas.height = this.config.resolution.height;

      const layerTexture = new THREE.CanvasTexture(layerCanvas);

      const layer: VisualLayer = {
        id: `layer_${i}`,
        name: `Layer ${i + 1}`,
        content: layerTexture,
        opacity: i === 0 ? 1.0 : 0.0, // Only first layer active by default
        blendMode: 'normal',
        effects: [],
        position: { x: 0, y: 0 },
        scale: { x: 1, y: 1 },
        rotation: 0
      };

      this.layers.set(layer.id, layer);

      // Add some default content to layer 0
      if (i === 0) {
        this.generateDefaultContent(layerCanvas);
      }
    }

    console.log(`Initialized ${this.layers.size} visual layers`);
  }

  private generateDefaultContent(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d')!;

    // Create a vibrant gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#FF006E');
    gradient.addColorStop(0.25, '#FB5607');
    gradient.addColorStop(0.5, '#FFBE0B');
    gradient.addColorStop(0.75, '#8338EC');
    gradient.addColorStop(1, '#3A86FF');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some geometric patterns
    ctx.globalCompositeOperation = 'multiply';
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = `hsl(${i * 18}, 70%, 50%)`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        20 + Math.random() * 40,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  private initializePixelGrid(): void {
    this.pixelData = [];
    for (let x = 0; x < this.config.resolution.width; x++) {
      this.pixelData[x] = [];
      for (let y = 0; y < this.config.resolution.height; y++) {
        this.pixelData[x][y] = {
          x,
          y,
          r: 0,
          g: 0,
          b: 0,
          intensity: 1.0
        };
      }
    }
  }

  private setupBeatEffects(): void {
    this.beatEffects = [
      {
        type: 'strobe',
        intensity: 0.8,
        parameters: { duration: 100, color: '#FFFFFF' },
        active: false
      },
      {
        type: 'color_shift',
        intensity: 0.6,
        parameters: { hueShift: 30, speed: 2 },
        active: false
      },
      {
        type: 'feedback',
        intensity: 0.4,
        parameters: { strength: 0.3, decay: 0.95 },
        active: false
      }
    ];
  }

  public update(deltaTime: number): void {
    const currentTime = performance.now();
    this.frameCount++;

    // Update frame rate tracking
    if (currentTime - this.lastFrameTime >= 1000) {
      this.frameRate = this.frameCount;
      this.frameCount = 0;
      this.lastFrameTime = currentTime;
    }

    // Update temperature simulation
    this.updateTemperatureSimulation(deltaTime);

    // Check for hardware malfunctions
    this.checkMalfunctions();

    // Update active effects
    this.updateEffects(deltaTime);

    // Render all layers
    this.renderLayers();

    // Update texture
    this.renderTexture.needsUpdate = true;

    // Update power consumption based on brightness
    this.updatePowerConsumption();
  }

  private updateTemperatureSimulation(deltaTime: number): void {
    // Temperature increases with brightness and usage
    const targetTemp = 25 + (this.config.brightness! * 30) + (this.frameRate / 60 * 10);
    this.temperatureSimulation += (targetTemp - this.temperatureSimulation) * deltaTime * 0.1;

    // Overheating protection
    if (this.temperatureSimulation > 70) {
      this.config.brightness = Math.max(0.3, this.config.brightness! - 0.01);
      console.warn('LED Wall overheating - reducing brightness');
    }
  }

  private checkMalfunctions(): void {
    if (Math.random() < this.malfunctionChance) {
      const malfunctionTypes = ['pixel_failure', 'color_shift', 'brightness_flicker', 'section_dropout'];
      const malfunction = malfunctionTypes[Math.floor(Math.random() * malfunctionTypes.length)];
      this.simulateMalfunction(malfunction);
    }
  }

  private simulateMalfunction(type: string): void {
    console.warn(`LED Wall malfunction: ${type}`);

    switch (type) {
      case 'pixel_failure':
        // Random pixels go black
        for (let i = 0; i < 50; i++) {
          const x = Math.floor(Math.random() * this.config.resolution.width);
          const y = Math.floor(Math.random() * this.config.resolution.height);
          this.pixelData[x][y].intensity = 0;
        }
        break;

      case 'color_shift':
        // Shift all colors randomly
        this.addEffect({
          type: 'color_shift',
          intensity: 1.0,
          parameters: { hueShift: Math.random() * 360, permanent: true },
          active: true
        });
        break;

      case 'brightness_flicker':
        // Flicker brightness
        let flickerCount = 0;
        const flickerInterval = setInterval(() => {
          this.config.brightness = this.config.brightness! > 0.5 ? 0.2 : 0.9;
          flickerCount++;
          if (flickerCount > 10) {
            clearInterval(flickerInterval);
            this.config.brightness = 0.8;
          }
        }, 100);
        break;

      case 'section_dropout':
        // Section of the display goes black
        const sectionX = Math.floor(Math.random() * (this.config.resolution.width - 100));
        const sectionY = Math.floor(Math.random() * (this.config.resolution.height - 100));
        this.context.fillStyle = 'black';
        this.context.fillRect(sectionX, sectionY, 100, 100);
        break;
    }

    // Auto-recover after 5-15 seconds
    setTimeout(() => {
      this.recoverFromMalfunction();
    }, 5000 + Math.random() * 10000);
  }

  private recoverFromMalfunction(): void {
    console.log('LED Wall recovering from malfunction');

    // Reset pixel intensities
    for (let x = 0; x < this.config.resolution.width; x++) {
      for (let y = 0; y < this.config.resolution.height; y++) {
        this.pixelData[x][y].intensity = 1.0;
      }
    }

    // Remove permanent effects
    this.layers.forEach(layer => {
      layer.effects = layer.effects.filter(effect => !effect.parameters.permanent);
    });

    // Reset brightness
    this.config.brightness = 0.8;
  }

  private updateEffects(deltaTime: number): void {
    this.layers.forEach(layer => {
      layer.effects.forEach(effect => {
        if (!effect.active) return;

        switch (effect.type) {
          case 'strobe':
            this.updateStrobeEffect(effect, deltaTime);
            break;
          case 'color_shift':
            this.updateColorShiftEffect(effect, deltaTime);
            break;
          case 'pixel_sort':
            this.updatePixelSortEffect(effect, deltaTime);
            break;
          case 'feedback':
            this.updateFeedbackEffect(effect, deltaTime);
            break;
          case 'distortion':
            this.updateDistortionEffect(effect, deltaTime);
            break;
          case 'particle_overlay':
            this.updateParticleOverlayEffect(effect, deltaTime);
            break;
        }
      });
    });
  }

  private updateStrobeEffect(effect: VisualEffect, deltaTime: number): void {
    const currentTime = performance.now();
    const strobeInterval = effect.parameters.interval || 100;

    if (currentTime - (effect.parameters.lastStrobe || 0) >= strobeInterval) {
      const brightness = effect.active ? (effect.intensity * this.config.brightness!) : 0;
      this.material.opacity = brightness;

      effect.parameters.lastStrobe = currentTime;

      // Auto-disable after duration
      if (effect.parameters.duration) {
        setTimeout(() => {
          effect.active = false;
          this.material.opacity = this.config.brightness!;
        }, effect.parameters.duration);
      }
    }
  }

  private updateColorShiftEffect(effect: VisualEffect, deltaTime: number): void {
    const canvas = this.canvas;
    const imageData = this.context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const hueShift = effect.parameters.hueShift || 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Convert to HSL, shift hue, convert back to RGB
      const hsl = this.rgbToHsl(r, g, b);
      hsl[0] = (hsl[0] + hueShift / 360) % 1;
      const rgb = this.hslToRgb(hsl[0], hsl[1], hsl[2]);

      data[i] = rgb[0];
      data[i + 1] = rgb[1];
      data[i + 2] = rgb[2];
    }

    this.context.putImageData(imageData, 0, 0);
  }

  private updatePixelSortEffect(effect: VisualEffect, deltaTime: number): void {
    // Implement datamoshing/pixel sorting effect
    const canvas = this.canvas;
    const imageData = this.context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const sortThreshold = effect.parameters.threshold || 50;
    const sortLength = effect.parameters.length || 20;

    // Sort pixels by brightness in horizontal strips
    for (let y = 0; y < canvas.height; y += 4) {
      const row: { r: number; g: number; b: number; brightness: number; index: number }[] = [];

      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const brightness = (r + g + b) / 3;

        row.push({ r, g, b, brightness, index });
      }

      // Sort by brightness
      row.sort((a, b) => a.brightness - b.brightness);

      // Apply sorted pixels back
      for (let i = 0; i < row.length; i++) {
        const pixel = row[i];
        const targetIndex = (y * canvas.width + i) * 4;

        data[targetIndex] = pixel.r;
        data[targetIndex + 1] = pixel.g;
        data[targetIndex + 2] = pixel.b;
      }
    }

    this.context.putImageData(imageData, 0, 0);
  }

  private updateFeedbackEffect(effect: VisualEffect, deltaTime: number): void {
    // Video feedback effect - copy and blend previous frame
    const strength = effect.parameters.strength || 0.3;
    const decay = effect.parameters.decay || 0.95;

    this.context.save();
    this.context.globalAlpha = strength;
    this.context.globalCompositeOperation = 'lighter';

    // Scale and rotate slightly for feedback effect
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    this.context.translate(centerX, centerY);
    this.context.scale(1.01, 1.01);
    this.context.rotate(0.001);
    this.context.translate(-centerX, -centerY);

    this.context.drawImage(this.canvas, 0, 0);
    this.context.restore();

    // Apply decay
    this.context.globalAlpha = decay;
    this.context.globalCompositeOperation = 'multiply';
    this.context.fillStyle = 'rgb(240, 240, 240)';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.globalCompositeOperation = 'source-over';
    this.context.globalAlpha = 1.0;
  }

  private updateDistortionEffect(effect: VisualEffect, deltaTime: number): void {
    // Warp/distort the image
    const time = performance.now() / 1000;
    const amplitude = effect.parameters.amplitude || 10;
    const frequency = effect.parameters.frequency || 0.1;

    const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const newImageData = this.context.createImageData(this.canvas.width, this.canvas.height);

    for (let x = 0; x < this.canvas.width; x++) {
      for (let y = 0; y < this.canvas.height; y++) {
        const offsetX = Math.sin(y * frequency + time) * amplitude;
        const offsetY = Math.cos(x * frequency + time) * amplitude;

        const sourceX = Math.max(0, Math.min(this.canvas.width - 1, Math.floor(x + offsetX)));
        const sourceY = Math.max(0, Math.min(this.canvas.height - 1, Math.floor(y + offsetY)));

        const sourceIndex = (sourceY * this.canvas.width + sourceX) * 4;
        const targetIndex = (y * this.canvas.width + x) * 4;

        newImageData.data[targetIndex] = imageData.data[sourceIndex];
        newImageData.data[targetIndex + 1] = imageData.data[sourceIndex + 1];
        newImageData.data[targetIndex + 2] = imageData.data[sourceIndex + 2];
        newImageData.data[targetIndex + 3] = imageData.data[sourceIndex + 3];
      }
    }

    this.context.putImageData(newImageData, 0, 0);
  }

  private updateParticleOverlayEffect(effect: VisualEffect, deltaTime: number): void {
    // Overlay animated particles
    const particleCount = effect.parameters.count || 100;
    const time = performance.now() / 1000;

    this.context.save();
    this.context.globalCompositeOperation = 'screen';

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.sin(time * 0.5 + i) * 0.5 + 0.5) * this.canvas.width;
      const y = (Math.cos(time * 0.3 + i * 0.7) * 0.5 + 0.5) * this.canvas.height;
      const size = 2 + Math.sin(time * 2 + i) * 2;

      this.context.fillStyle = `hsl(${(time * 100 + i * 36) % 360}, 70%, 50%)`;
      this.context.beginPath();
      this.context.arc(x, y, size, 0, Math.PI * 2);
      this.context.fill();
    }

    this.context.restore();
  }

  private updatePowerConsumption(): void {
    // Calculate actual power consumption based on displayed content
    const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;

    let totalBrightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      totalBrightness += brightness / 255;
    }

    const averageBrightness = totalBrightness / (this.canvas.width * this.canvas.height);
    const pixelCount = this.canvas.width * this.canvas.height;
    this.powerConsumption = pixelCount * 0.2 * averageBrightness * this.config.brightness!;
  }

  private renderLayers(): void {
    // Clear compositor
    this.layerCompositor.clearRect(0, 0, this.compositorCanvas.width, this.compositorCanvas.height);

    // Render each layer
    this.layers.forEach(layer => {
      if (layer.opacity <= 0) return;

      this.layerCompositor.save();
      this.layerCompositor.globalAlpha = layer.opacity;
      this.layerCompositor.globalCompositeOperation = this.getBlendMode(layer.blendMode);

      // Apply transformations
      const centerX = this.compositorCanvas.width / 2;
      const centerY = this.compositorCanvas.height / 2;

      this.layerCompositor.translate(centerX + layer.position.x, centerY + layer.position.y);
      this.layerCompositor.scale(layer.scale.x, layer.scale.y);
      this.layerCompositor.rotate(layer.rotation);
      this.layerCompositor.translate(-centerX, -centerY);

      // Draw layer content
      if (layer.content instanceof THREE.CanvasTexture) {
        this.layerCompositor.drawImage(layer.content.source.data, 0, 0);
      }

      this.layerCompositor.restore();
    });

    // Copy to main canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.drawImage(this.compositorCanvas, 0, 0);

    // Apply brightness
    this.context.globalAlpha = this.config.brightness!;
    this.context.globalCompositeOperation = 'multiply';
    const brightness = Math.floor(255 * this.config.brightness!);
    this.context.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.globalCompositeOperation = 'source-over';
    this.context.globalAlpha = 1.0;
  }

  private getBlendMode(mode: string): string {
    switch (mode) {
      case 'multiply': return 'multiply';
      case 'screen': return 'screen';
      case 'overlay': return 'overlay';
      case 'additive': return 'lighter';
      default: return 'source-over';
    }
  }

  // Public interface methods
  public switchToLayer(layerIndex: number): void {
    const layerId = `layer_${layerIndex}`;
    if (this.layers.has(layerId)) {
      // Fade out current layer
      const currentLayer = this.layers.get(this.activeLayer);
      if (currentLayer) {
        currentLayer.opacity = 0;
      }

      // Fade in new layer
      const newLayer = this.layers.get(layerId);
      if (newLayer) {
        newLayer.opacity = 1.0;
        this.activeLayer = layerId;
      }

      console.log(`Switched to layer ${layerIndex}`);
    }
  }

  public setLayerContent(layerId: string, content: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement): void {
    const layer = this.layers.get(layerId);
    if (layer) {
      if (content instanceof HTMLCanvasElement) {
        layer.content = new THREE.CanvasTexture(content);
      } else if (content instanceof HTMLVideoElement) {
        layer.content = new THREE.VideoTexture(content);
      } else if (content instanceof HTMLImageElement) {
        const canvas = document.createElement('canvas');
        canvas.width = content.width;
        canvas.height = content.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(content, 0, 0);
        layer.content = new THREE.CanvasTexture(canvas);
      }

      console.log(`Updated content for ${layerId}`);
    }
  }

  public addEffect(effect: VisualEffect, layerId?: string): void {
    if (layerId && this.layers.has(layerId)) {
      this.layers.get(layerId)!.effects.push(effect);
    } else {
      // Add to active layer
      const activeLayer = this.layers.get(this.activeLayer);
      if (activeLayer) {
        activeLayer.effects.push(effect);
      }
    }

    console.log(`Added effect: ${effect.type} (intensity: ${effect.intensity})`);
  }

  public triggerEffect(effectType: string): void {
    const layer = this.layers.get(this.activeLayer);
    if (!layer) return;

    let effect: VisualEffect;

    switch (effectType) {
      case 'strobe':
        effect = {
          type: 'strobe',
          intensity: 0.9,
          parameters: { interval: 50, duration: 2000 },
          active: true
        };
        break;

      case 'color_cycle':
        effect = {
          type: 'color_shift',
          intensity: 0.8,
          parameters: { hueShift: Math.random() * 360, speed: 2 },
          active: true
        };
        break;

      case 'particle_burst':
        effect = {
          type: 'particle_overlay',
          intensity: 1.0,
          parameters: { count: 200, duration: 3000 },
          active: true
        };
        break;

      case 'feedback':
        effect = {
          type: 'feedback',
          intensity: 0.6,
          parameters: { strength: 0.4, decay: 0.98 },
          active: true
        };
        break;

      default:
        return;
    }

    this.addEffect(effect);

    // Auto-disable timed effects
    if (effect.parameters.duration) {
      setTimeout(() => {
        effect.active = false;
      }, effect.parameters.duration);
    }
  }

  public onBeatDetected(): void {
    if (!this.beatSyncEnabled) return;

    this.lastBeatTime = performance.now();

    // Flash effect on beat
    this.material.opacity = 1.2;
    setTimeout(() => {
      this.material.opacity = this.config.brightness!;
    }, 100);

    // Trigger beat-synchronized effects
    this.beatEffects.forEach(effect => {
      if (Math.random() < 0.3) { // 30% chance per beat
        const beatEffect = { ...effect };
        beatEffect.active = true;
        this.addEffect(beatEffect);

        setTimeout(() => {
          beatEffect.active = false;
        }, 500);
      }
    });
  }

  public triggerSpectacularMode(): void {
    console.log('LED Wall entering SPECTACULAR MODE!');

    this.spectacularMode = true;
    this.config.brightness = 1.0;

    // Add multiple spectacular effects
    const spectacularEffects: VisualEffect[] = [
      {
        type: 'strobe',
        intensity: 1.0,
        parameters: { interval: 25, color: '#FFFFFF' },
        active: true
      },
      {
        type: 'color_shift',
        intensity: 0.9,
        parameters: { hueShift: 180, speed: 5 },
        active: true
      },
      {
        type: 'particle_overlay',
        intensity: 1.0,
        parameters: { count: 500 },
        active: true
      },
      {
        type: 'feedback',
        intensity: 0.8,
        parameters: { strength: 0.6, decay: 0.99 },
        active: true
      }
    ];

    spectacularEffects.forEach(effect => {
      this.addEffect(effect);
    });

    // End spectacular mode after finale
    setTimeout(() => {
      this.spectacularMode = false;
      spectacularEffects.forEach(effect => {
        effect.active = false;
      });
      console.log('LED Wall spectacular mode ended');
    }, 30000); // 30 seconds of spectacular mode
  }

  public setBrightness(brightness: number): void {
    this.config.brightness = Math.max(0, Math.min(1, brightness));
  }

  public setRefreshRate(rate: number): void {
    this.config.refreshRate = Math.max(30, Math.min(120, rate));
  }

  // Utility methods
  private rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h: number, s: number;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }

      h /= 6;
    }

    return [h, s, l];
  }

  private hslToRgb(h: number, s: number, l: number): [number, number, number] {
    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  // Getters for monitoring
  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  public getFrameRate(): number {
    return this.frameRate;
  }

  public getTemperature(): number {
    return this.temperatureSimulation;
  }

  public getPowerConsumption(): number {
    return this.powerConsumption;
  }

  public getActiveLayer(): string {
    return this.activeLayer;
  }

  public getLayers(): Map<string, VisualLayer> {
    return new Map(this.layers);
  }

  public destroy(): void {
    // Dispose Three.js resources
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.renderTexture.dispose();

    // Clear layers
    this.layers.forEach(layer => {
      if (layer.content instanceof THREE.Texture) {
        layer.content.dispose();
      }
    });

    this.layers.clear();

    console.log('LED Wall destroyed');
  }
}