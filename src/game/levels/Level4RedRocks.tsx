import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Level, type LevelConfig } from './Level';
import { RedRocksScene } from './scenes/RedRocksScene';
import { LEDWall } from '../entities/LEDWall';
import { RedRocksCrowd } from '../entities/RedRocksCrowd';
import { ProfessionalRig } from '../entities/ProfessionalRig';
import { InputManager } from '../engine/InputManager';
import { AudioManager } from '../engine/AudioManager';
import { usePlayerStore } from '../../store/playerStore';
import { useGameStore } from '../../store/gameStore';

interface VJMixingState {
  activeLayer: number;
  visualIntensity: number;
  colorScheme: string;
  effectsActive: string[];
  beatSync: boolean;
  crowdEnergy: number;
  performanceScore: number;
  currentSong: string;
  timeRemaining: number;
  malfunctionChance: number;
}

interface FinaleSequence {
  step: number;
  totalSteps: number;
  fireworksActive: boolean;
  laserShowActive: boolean;
  crowdReaction: 'silent' | 'applause' | 'cheering' | 'standing_ovation';
  professionalRating: number;
  audienceSize: number;
}

const levelConfig: LevelConfig = {
  id: 'level4_red_rocks',
  name: 'Red Rocks LED Wall Spectacular',
  description: 'The ultimate test - perform at the iconic Red Rocks Amphitheatre with massive LED walls',
  backgroundMusic: 'red_rocks_ambient',
  ambientSounds: ['colorado_wind', 'crowd_murmur', 'equipment_hum'],
  requiredLevel: 15,
  requiredSkills: {
    technicalMapping: 7,
    artisticVision: 6,
    equipmentMastery: 8,
    collaboration: 5
  },
  unlockConditions: ['completed_level3', 'reputation_5000', 'equipment_mastery_expert']
};

class RedRocksLevel extends Level {
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private renderer?: THREE.WebGLRenderer;
  private redRocksScene?: RedRocksScene;
  private ledWall?: LEDWall;
  private crowd?: RedRocksCrowd;
  private professionalRig?: ProfessionalRig;

  // Performance state
  private mixingState: VJMixingState = {
    activeLayer: 0,
    visualIntensity: 0.5,
    colorScheme: 'cosmic_purple',
    effectsActive: [],
    beatSync: true,
    crowdEnergy: 0.3,
    performanceScore: 0,
    currentSong: 'opening_track',
    timeRemaining: 3600, // 60 minutes show
    malfunctionChance: 0.02
  };

  private finaleSequence: FinaleSequence = {
    step: 0,
    totalSteps: 12,
    fireworksActive: false,
    laserShowActive: false,
    crowdReaction: 'silent',
    professionalRating: 0,
    audienceSize: 9000
  };

  // Performance tracking
  private beatDetector?: any;
  private audioAnalyzer?: AnalyserNode;
  private frequencyData?: Uint8Array;
  private lastBeatTime: number = 0;
  private bpm: number = 128;
  private showStarted: boolean = false;
  private finaleTriggered: boolean = false;

  constructor() {
    super(levelConfig);
  }

  protected async initializeLevel(): Promise<void> {
    // Initialize Three.js
    this.setupThreeJS();

    // Create Red Rocks environment
    this.redRocksScene = new RedRocksScene();
    await this.redRocksScene.initialize();

    // Initialize entities
    this.ledWall = new LEDWall({
      width: 100,
      height: 60,
      resolution: { width: 1920, height: 1080 },
      position: { x: 0, y: 30, z: -50 },
      type: 'main_display'
    });

    this.crowd = new RedRocksCrowd({
      amphitheaterLayout: true,
      capacity: 9000,
      energyLevel: 0.3,
      reactions: ['applause', 'cheering', 'dancing', 'phone_lights'],
      weatherConditions: 'clear_night'
    });

    this.professionalRig = new ProfessionalRig({
      projectorCount: 8,
      ledPanelCount: 4,
      cameraCount: 6,
      mixingConsole: 'professional_grade',
      backupSystems: true,
      redundancy: 'full'
    });

    // Setup audio analysis
    this.setupAudioAnalysis();

    // Initialize mixing interface
    this.setupMixingInterface();

    // Setup malfunction system
    this.setupMalfunctionSystem();

    console.log('Red Rocks level initialized - The show must go on!');
  }

  private setupThreeJS(): void {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x1a1a2e, 100, 1000);

    // Professional lighting setup for Red Rocks
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);

    const stageLight = new THREE.DirectionalLight(0xffffff, 1.0);
    stageLight.position.set(0, 50, -30);
    stageLight.castShadow = true;
    this.scene.add(stageLight);

    // Colorado sunset lighting
    const sunsetLight = new THREE.DirectionalLight(0xff6b35, 0.6);
    sunsetLight.position.set(-200, 100, 100);
    this.scene.add(sunsetLight);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    this.camera.position.set(0, 40, 80);
    this.camera.lookAt(0, 30, -50);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
  }

  private setupAudioAnalysis(): void {
    // Initialize Web Audio API for beat detection
    try {
      const audioContext = new AudioContext();
      this.audioAnalyzer = audioContext.createAnalyser();
      this.audioAnalyzer.fftSize = 512;
      this.frequencyData = new Uint8Array(this.audioAnalyzer.frequencyBinCount);

      // Simple beat detection algorithm
      this.beatDetector = {
        detect: (frequencyData: Uint8Array) => {
          const bass = frequencyData.slice(0, 60);
          const average = bass.reduce((sum, val) => sum + val) / bass.length;
          return average > 100; // Threshold for beat detection
        }
      };
    } catch (error) {
      console.warn('Web Audio API not available, using fallback beat sync');
      this.setupFallbackBeatSync();
    }
  }

  private setupFallbackBeatSync(): void {
    // Fallback beat sync based on timer
    setInterval(() => {
      if (this.showStarted) {
        this.lastBeatTime = performance.now();
        this.onBeatDetected();
      }
    }, 60000 / this.bpm); // Convert BPM to milliseconds
  }

  private setupMixingInterface(): void {
    // Initialize professional VJ mixing console state
    this.addTrigger({
      id: 'mixing_console',
      x: -20, y: 10, width: 40, height: 20,
      action: 'open_mixing_console',
      data: { consoleType: 'professional' }
    });

    // Layer control triggers
    for (let i = 0; i < 8; i++) {
      this.addTrigger({
        id: `layer_${i}`,
        x: -40 + (i * 10), y: 0, width: 8, height: 8,
        action: 'switch_layer',
        data: { layer: i }
      });
    }

    // Effect triggers
    const effects = ['strobe', 'color_cycle', 'particle_burst', 'laser_show', 'fog_machine', 'fireworks'];
    effects.forEach((effect, index) => {
      this.addTrigger({
        id: `effect_${effect}`,
        x: -30 + (index * 10), y: -10, width: 8, height: 8,
        action: 'trigger_effect',
        data: { effect }
      });
    });
  }

  private setupMalfunctionSystem(): void {
    // Random equipment malfunctions during show
    setInterval(() => {
      if (this.showStarted && Math.random() < this.mixingState.malfunctionChance) {
        this.triggerMalfunction();
      }
    }, 30000); // Check every 30 seconds
  }

  private triggerMalfunction(): void {
    const malfunctions = [
      'projector_overheating',
      'led_panel_flickering',
      'audio_desync',
      'backup_needed',
      'cooling_system_failure'
    ];

    const malfunction = malfunctions[Math.floor(Math.random() * malfunctions.length)];

    useGameStore.getState().addNotification({
      type: 'warning',
      title: 'Equipment Malfunction!',
      message: `${malfunction.replace('_', ' ').toUpperCase()} - Take immediate action!`,
      duration: 8000
    });

    // Reduce performance score if not handled
    setTimeout(() => {
      if (this.mixingState.malfunctionChance > 0.01) {
        this.mixingState.performanceScore -= 10;
        this.mixingState.crowdEnergy -= 0.1;
        useGameStore.getState().addNotification({
          type: 'error',
          title: 'Performance Impact',
          message: 'Malfunction affected the show quality!'
        });
      }
    }, 15000);
  }

  private onBeatDetected(): void {
    if (!this.showStarted) return;

    // Sync visual effects to beat
    if (this.mixingState.beatSync) {
      this.ledWall?.onBeatDetected();
      this.redRocksScene?.syncToBeat();

      // Update crowd energy based on performance
      if (this.mixingState.performanceScore > 80) {
        this.mixingState.crowdEnergy = Math.min(1.0, this.mixingState.crowdEnergy + 0.002);
      }
    }

    // Trigger finale sequence at the right moment
    if (this.mixingState.timeRemaining < 300 && !this.finaleTriggered) { // 5 minutes left
      this.initiateFinaleSequence();
    }
  }

  private initiateFinaleSequence(): void {
    this.finaleTriggered = true;

    useGameStore.getState().addNotification({
      type: 'info',
      title: 'FINALE TIME!',
      message: 'Create the ultimate visual spectacular for Red Rocks!',
      duration: 5000
    });

    // Start finale countdown
    this.startFinaleSequence();
  }

  private startFinaleSequence(): void {
    const finaleInterval = setInterval(() => {
      this.finaleSequence.step++;

      switch (this.finaleSequence.step) {
        case 1:
          this.triggerFinaleEffect('led_wall_spectacular');
          break;
        case 3:
          this.triggerFinaleEffect('laser_show_maximum');
          break;
        case 5:
          this.triggerFinaleEffect('fireworks_launch');
          break;
        case 8:
          this.triggerFinaleEffect('crowd_phone_lights');
          break;
        case 10:
          this.triggerFinaleEffect('confetti_cannons');
          break;
        case 12:
          this.completeFinaleSequence();
          clearInterval(finaleInterval);
          break;
      }

      // Update crowd reaction based on finale performance
      this.updateFinaleReaction();

    }, 5000); // Each finale step lasts 5 seconds
  }

  private triggerFinaleEffect(effect: string): void {
    console.log(`Triggering finale effect: ${effect}`);

    switch (effect) {
      case 'led_wall_spectacular':
        this.ledWall?.triggerSpectacularMode();
        this.mixingState.performanceScore += 15;
        break;
      case 'laser_show_maximum':
        this.finaleSequence.laserShowActive = true;
        this.mixingState.performanceScore += 20;
        break;
      case 'fireworks_launch':
        this.finaleSequence.fireworksActive = true;
        this.mixingState.performanceScore += 25;
        break;
      case 'crowd_phone_lights':
        this.crowd?.activatePhoneLights();
        this.mixingState.crowdEnergy = Math.min(1.0, this.mixingState.crowdEnergy + 0.3);
        break;
      case 'confetti_cannons':
        // Epic finale moment
        this.mixingState.performanceScore += 30;
        break;
    }
  }

  private updateFinaleReaction(): void {
    const score = this.mixingState.performanceScore;

    if (score > 90) {
      this.finaleSequence.crowdReaction = 'standing_ovation';
      this.finaleSequence.professionalRating = 10;
    } else if (score > 75) {
      this.finaleSequence.crowdReaction = 'cheering';
      this.finaleSequence.professionalRating = 8;
    } else if (score > 60) {
      this.finaleSequence.crowdReaction = 'applause';
      this.finaleSequence.professionalRating = 6;
    } else {
      this.finaleSequence.crowdReaction = 'silent';
      this.finaleSequence.professionalRating = 4;
    }
  }

  private completeFinaleSequence(): void {
    this.showStarted = false;

    // Calculate final results
    const finalScore = this.mixingState.performanceScore;
    const crowdRating = this.mixingState.crowdEnergy * 100;
    const professionalRating = this.finaleSequence.professionalRating;
    const overallRating = Math.round((finalScore + crowdRating + professionalRating * 10) / 3);

    // Award achievements based on performance
    this.awardRedRocksAchievements(overallRating);

    // Show results screen
    this.showPerformanceResults(overallRating);

    // Start credits sequence
    setTimeout(() => {
      this.startCreditsSequence();
    }, 5000);
  }

  private awardRedRocksAchievements(rating: number): void {
    const player = usePlayerStore.getState().player;
    const gameStore = useGameStore.getState();

    // Base completion achievement
    player.unlockAchievement('red_rocks_performer');
    gameStore.addNotification({
      type: 'success',
      title: 'Achievement Unlocked!',
      message: 'Red Rocks Performer - You performed at the legendary Red Rocks!'
    });

    // Performance-based achievements
    if (rating >= 90) {
      player.unlockAchievement('red_rocks_legend');
      player.unlockAchievement('visual_virtuoso');
      player.unlockAchievement('lightbrush_master');

      gameStore.addNotification({
        type: 'success',
        title: 'LEGENDARY PERFORMANCE!',
        message: 'Multiple achievements unlocked! You are now a Red Rocks Legend!'
      });
    } else if (rating >= 75) {
      player.unlockAchievement('red_rocks_star');
      player.unlockAchievement('crowd_favorite');
    }

    // Technical achievements
    if (this.mixingState.malfunctionChance < 0.005) {
      player.unlockAchievement('technical_master');
    }

    if (this.finaleSequence.fireworksActive && this.finaleSequence.laserShowActive) {
      player.unlockAchievement('pyrotechnic_vj');
    }

    // Award massive experience and reputation
    player.addExperience(1000 + (rating * 10));
    player.addReputation(500 + (rating * 5));
  }

  private showPerformanceResults(overallRating: number): void {
    const resultsDialog = {
      character: 'Festival Director',
      text: `Outstanding performance at Red Rocks! Your overall rating: ${overallRating}/100\n\n` +
            `Performance Score: ${this.mixingState.performanceScore}\n` +
            `Crowd Energy: ${Math.round(this.mixingState.crowdEnergy * 100)}%\n` +
            `Professional Rating: ${this.finaleSequence.professionalRating}/10\n` +
            `Crowd Reaction: ${this.finaleSequence.crowdReaction.replace('_', ' ')}\n\n` +
            `You've proven yourself as a master VJ. The visual arts industry will remember this night!`,
      options: [
        { text: 'Thank you! This was incredible!', action: 'celebrate' },
        { text: 'I want to do this again!', action: 'replay_offer' }
      ]
    };

    useGameStore.getState().showDialog(
      resultsDialog.character,
      resultsDialog.text,
      resultsDialog.options
    );
  }

  private startCreditsSequence(): void {
    // Epic credits sequence showing player's journey
    const credits = [
      'Congratulations on completing the VJ Career RPG!',
      '',
      'YOUR JOURNEY:',
      'From kitchen experiments to Red Rocks mastery',
      'You\'ve become a true Lightbrush Legend',
      '',
      'FINAL STATS:',
      `Level: ${usePlayerStore.getState().player.getStats().level}`,
      `Total Experience: ${usePlayerStore.getState().player.getStats().experience}`,
      `Reputation: ${usePlayerStore.getState().player.getStats().reputation}`,
      `Achievements: ${usePlayerStore.getState().player.getAchievements().size}`,
      '',
      'THANK YOU FOR PLAYING!',
      'The world of visual artistry awaits your creativity',
      '',
      'Continue exploring and creating...',
      'Your VJ career is just beginning!'
    ];

    this.displayCredits(credits);
  }

  private displayCredits(credits: string[]): void {
    let currentCredit = 0;

    const creditInterval = setInterval(() => {
      if (currentCredit < credits.length) {
        useGameStore.getState().addNotification({
          type: 'info',
          title: credits[currentCredit] ? 'VJ Career RPG' : '',
          message: credits[currentCredit] || ' ',
          duration: 3000
        });
        currentCredit++;
      } else {
        clearInterval(creditInterval);
        this.completeLevelProgression();
      }
    }, 2000);
  }

  private completeLevelProgression(): void {
    // Mark level as completed and unlock post-game content
    usePlayerStore.getState().player.unlockContent('post_game_mode');
    usePlayerStore.getState().player.unlockContent('sandbox_mode');
    usePlayerStore.getState().player.unlockContent('custom_venues');

    // Final notification
    useGameStore.getState().addNotification({
      type: 'success',
      title: 'GAME COMPLETED!',
      message: 'New game modes and features unlocked! Keep creating!',
      duration: 10000
    });
  }

  protected updateLevel(deltaTime: number): void {
    if (!this.showStarted) return;

    // Update show timer
    this.mixingState.timeRemaining = Math.max(0, this.mixingState.timeRemaining - deltaTime);

    // Update entities
    this.ledWall?.update(deltaTime);
    this.crowd?.update(deltaTime, this.mixingState.crowdEnergy);
    this.professionalRig?.update(deltaTime);
    this.redRocksScene?.update(deltaTime);

    // Update audio analysis
    if (this.audioAnalyzer && this.frequencyData) {
      this.audioAnalyzer.getByteFrequencyData(this.frequencyData);

      if (this.beatDetector?.detect(this.frequencyData)) {
        const currentTime = performance.now();
        if (currentTime - this.lastBeatTime > 300) { // Minimum 300ms between beats
          this.lastBeatTime = currentTime;
          this.onBeatDetected();
        }
      }
    }

    // Gradually increase malfunction chance as show progresses (equipment stress)
    this.mixingState.malfunctionChance = Math.min(0.1, 0.02 + (1 - this.mixingState.timeRemaining / 3600) * 0.03);

    // Update Three.js scene
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  protected renderLevel(ctx: CanvasRenderingContext2D): void {
    // Render Three.js to canvas
    if (this.renderer) {
      const imageData = this.renderer.domElement.toDataURL();
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
      };
      img.src = imageData;
    }

    // Render HUD overlays
    this.renderRedRocksHUD(ctx);
  }

  private renderRedRocksHUD(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.resetTransform();

    // Performance metrics
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, 10, 300, 200);

    ctx.fillStyle = '#00ff88';
    ctx.font = '16px monospace';
    ctx.fillText('RED ROCKS PERFORMANCE', 20, 30);

    ctx.fillStyle = 'white';
    ctx.font = '12px monospace';
    ctx.fillText(`Time Remaining: ${Math.floor(this.mixingState.timeRemaining / 60)}:${Math.floor(this.mixingState.timeRemaining % 60).toString().padStart(2, '0')}`, 20, 50);
    ctx.fillText(`Performance Score: ${Math.round(this.mixingState.performanceScore)}/100`, 20, 70);
    ctx.fillText(`Crowd Energy: ${Math.round(this.mixingState.crowdEnergy * 100)}%`, 20, 90);
    ctx.fillText(`Active Layer: ${this.mixingState.activeLayer}`, 20, 110);
    ctx.fillText(`Current Song: ${this.mixingState.currentSong}`, 20, 130);
    ctx.fillText(`Beat Sync: ${this.mixingState.beatSync ? 'ON' : 'OFF'}`, 20, 150);
    ctx.fillText(`Effects: ${this.mixingState.effectsActive.join(', ') || 'None'}`, 20, 170);

    // Crowd energy bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(20, 180, 200, 20);
    ctx.fillStyle = this.mixingState.crowdEnergy > 0.8 ? '#00ff00' :
                   this.mixingState.crowdEnergy > 0.5 ? '#ffff00' : '#ff6600';
    ctx.fillRect(20, 180, this.mixingState.crowdEnergy * 200, 20);

    // Show instructions if not started
    if (!this.showStarted) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('WELCOME TO RED ROCKS AMPHITHEATRE', ctx.canvas.width / 2, ctx.canvas.height / 2 - 100);
      ctx.font = '18px Arial';
      ctx.fillText('The ultimate VJ challenge awaits', ctx.canvas.width / 2, ctx.canvas.height / 2 - 60);
      ctx.font = '14px Arial';
      ctx.fillText('Press SPACE to start the show', ctx.canvas.width / 2, ctx.canvas.height / 2);
      ctx.fillText('Use mixing console and effects to create an epic performance', ctx.canvas.width / 2, ctx.canvas.height / 2 + 30);
      ctx.fillText('Manage equipment malfunctions and sync to the beat', ctx.canvas.width / 2, ctx.canvas.height / 2 + 50);
    }

    ctx.restore();
  }

  protected handleLevelInput(inputManager: InputManager): void {
    const keys = inputManager.getKeys();
    const actions = inputManager.getActionInputs();

    // Start show
    if (!this.showStarted && keys.space) {
      this.startShow();
    }

    if (!this.showStarted) return;

    // Layer switching (1-8)
    for (let i = 1; i <= 8; i++) {
      if (keys[i.toString()]) {
        this.switchLayer(i - 1);
      }
    }

    // Effect triggers
    if (keys.q) this.triggerEffect('strobe');
    if (keys.w) this.triggerEffect('color_cycle');
    if (keys.e) this.triggerEffect('particle_burst');
    if (keys.r) this.triggerEffect('laser_show');
    if (keys.t) this.triggerEffect('fog_machine');
    if (keys.y) this.triggerEffect('fireworks');

    // Intensity control
    if (keys.arrowUp) {
      this.mixingState.visualIntensity = Math.min(1.0, this.mixingState.visualIntensity + 0.05);
    }
    if (keys.arrowDown) {
      this.mixingState.visualIntensity = Math.max(0.0, this.mixingState.visualIntensity - 0.05);
    }

    // Beat sync toggle
    if (keys.b) {
      this.mixingState.beatSync = !this.mixingState.beatSync;
    }

    // Emergency actions (for malfunctions)
    if (keys.f1) this.handleMalfunction('reset_projector');
    if (keys.f2) this.handleMalfunction('backup_system');
    if (keys.f3) this.handleMalfunction('cooling_boost');
  }

  private startShow(): void {
    this.showStarted = true;
    this.mixingState.currentSong = 'opening_spectacular';

    useGameStore.getState().addNotification({
      type: 'success',
      title: 'SHOW STARTED!',
      message: 'Red Rocks is ready for your visual mastery!',
      duration: 3000
    });

    // Start background music
    // AudioManager would handle this in a real implementation
    console.log('Starting Red Rocks concert audio');
  }

  private switchLayer(layerIndex: number): void {
    this.mixingState.activeLayer = layerIndex;
    this.ledWall?.switchToLayer(layerIndex);
    this.mixingState.performanceScore += 2; // Smooth transitions boost score
  }

  private triggerEffect(effect: string): void {
    if (!this.mixingState.effectsActive.includes(effect)) {
      this.mixingState.effectsActive.push(effect);

      // Remove effect after duration
      setTimeout(() => {
        this.mixingState.effectsActive = this.mixingState.effectsActive.filter(e => e !== effect);
      }, 5000);

      // Apply effect to appropriate systems
      this.ledWall?.triggerEffect(effect);
      this.redRocksScene?.triggerEffect(effect);

      // Score bonus for good timing
      this.mixingState.performanceScore += 5;
      this.mixingState.crowdEnergy = Math.min(1.0, this.mixingState.crowdEnergy + 0.05);
    }
  }

  private handleMalfunction(action: string): void {
    console.log(`Handling malfunction with action: ${action}`);

    // Reduce malfunction chance (player is actively managing)
    this.mixingState.malfunctionChance = Math.max(0.005, this.mixingState.malfunctionChance - 0.01);

    // Score bonus for quick response
    this.mixingState.performanceScore += 8;

    useGameStore.getState().addNotification({
      type: 'success',
      title: 'Malfunction Resolved!',
      message: 'Great technical response - the show goes on!'
    });
  }

  protected onCustomTrigger(trigger: any): void {
    switch (trigger.action) {
      case 'open_mixing_console':
        useGameStore.getState().showCustomModal('mixing_console', {
          state: this.mixingState,
          onStateChange: (newState: Partial<VJMixingState>) => {
            Object.assign(this.mixingState, newState);
          }
        });
        break;

      case 'switch_layer':
        this.switchLayer(trigger.data.layer);
        break;

      case 'trigger_effect':
        this.triggerEffect(trigger.data.effect);
        break;
    }
  }

  public destroy(): void {
    super.destroy();

    // Clean up Three.js resources
    if (this.renderer) {
      this.renderer.dispose();
    }

    if (this.scene) {
      this.scene.clear();
    }

    // Clean up entities
    this.ledWall?.destroy();
    this.crowd?.destroy();
    this.professionalRig?.destroy();
    this.redRocksScene?.destroy();

    console.log('Red Rocks level destroyed');
  }
}

// React component wrapper
export const Level4RedRocks: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const levelRef = useRef<RedRocksLevel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeLevel = async () => {
      if (!canvasRef.current) return;

      try {
        levelRef.current = new RedRocksLevel();
        await levelRef.current.initialize();

        // Start game loop
        const gameLoop = (timestamp: number) => {
          if (levelRef.current) {
            const deltaTime = timestamp / 1000;
            levelRef.current.update(deltaTime);

            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) {
              levelRef.current.render(ctx);
            }
          }
          requestAnimationFrame(gameLoop);
        };

        requestAnimationFrame(gameLoop);
        setIsLoading(false);

      } catch (error) {
        console.error('Failed to initialize Red Rocks level:', error);
      }
    };

    initializeLevel();

    return () => {
      levelRef.current?.destroy();
    };
  }, []);

  return (
    <div className="red-rocks-level">
      {isLoading && (
        <div className="loading-screen">
          <h2>Preparing Red Rocks Amphitheatre...</h2>
          <p>Loading the ultimate VJ challenge</p>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ display: isLoading ? 'none' : 'block' }}
      />

      {!isLoading && (
        <div className="level-instructions">
          <div className="controls-hint">
            <h3>Red Rocks Controls</h3>
            <p>1-8: Switch visual layers</p>
            <p>Q/W/E/R/T/Y: Trigger effects</p>
            <p>↑/↓: Adjust intensity</p>
            <p>B: Toggle beat sync</p>
            <p>F1/F2/F3: Handle malfunctions</p>
            <p>Space: Start show</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Level4RedRocks;