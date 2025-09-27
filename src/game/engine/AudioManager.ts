export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
}

export interface AudioSource {
  audio: HTMLAudioElement;
  volume: number;
  loop: boolean;
  category: 'music' | 'sfx';
  fadeIn?: boolean;
  fadeOut?: boolean;
  fadeDuration?: number;
  currentFade?: number;
}

export class AudioManager {
  private audioSources: Map<string, AudioSource> = new Map();
  private settings: AudioSettings;
  private audioContext: AudioContext | null = null;
  private gainNodes: Map<string, GainNode> = new Map();

  constructor() {
    this.settings = {
      masterVolume: 0.7,
      musicVolume: 0.5,
      sfxVolume: 0.8,
      muted: false
    };

    this.loadSettingsFromStorage();
    this.initializeAudioContext();
  }

  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Create gain nodes for different categories
      const masterGain = this.audioContext.createGain();
      const musicGain = this.audioContext.createGain();
      const sfxGain = this.audioContext.createGain();

      masterGain.connect(this.audioContext.destination);
      musicGain.connect(masterGain);
      sfxGain.connect(masterGain);

      this.gainNodes.set('master', masterGain);
      this.gainNodes.set('music', musicGain);
      this.gainNodes.set('sfx', sfxGain);

      this.updateGainNodes();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  private updateGainNodes(): void {
    if (!this.audioContext) return;

    const masterGain = this.gainNodes.get('master');
    const musicGain = this.gainNodes.get('music');
    const sfxGain = this.gainNodes.get('sfx');

    if (masterGain) {
      masterGain.gain.value = this.settings.muted ? 0 : this.settings.masterVolume;
    }
    if (musicGain) {
      musicGain.gain.value = this.settings.musicVolume;
    }
    if (sfxGain) {
      sfxGain.gain.value = this.settings.sfxVolume;
    }
  }

  // Load audio file
  public async loadAudio(key: string, src: string, category: 'music' | 'sfx' = 'sfx', loop: boolean = false): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();

      audio.addEventListener('canplaythrough', () => {
        const source: AudioSource = {
          audio,
          volume: 1.0,
          loop,
          category
        };

        this.audioSources.set(key, source);
        resolve();
      });

      audio.addEventListener('error', (error) => {
        console.error(`Failed to load audio: ${key}`, error);
        reject(error);
      });

      audio.src = src;
      audio.preload = 'auto';
    });
  }

  // Play audio
  public play(key: string, volume: number = 1.0, fadeIn: boolean = false, fadeDuration: number = 1.0): void {
    const source = this.audioSources.get(key);
    if (!source) {
      console.warn(`Audio not found: ${key}`);
      return;
    }

    // Stop current playback if playing
    source.audio.pause();
    source.audio.currentTime = 0;

    // Set volume
    source.volume = volume;
    source.audio.loop = source.loop;

    // Apply fade in
    if (fadeIn) {
      source.fadeIn = true;
      source.fadeDuration = fadeDuration;
      source.currentFade = 0;
      source.audio.volume = 0;
    } else {
      source.audio.volume = this.calculateEffectiveVolume(source);
    }

    // Play audio
    const playPromise = source.audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn('Audio play failed:', error);
      });
    }
  }

  // Stop audio
  public stop(key: string, fadeOut: boolean = false, fadeDuration: number = 1.0): void {
    const source = this.audioSources.get(key);
    if (!source) return;

    if (fadeOut) {
      source.fadeOut = true;
      source.fadeDuration = fadeDuration;
      source.currentFade = 0;
    } else {
      source.audio.pause();
      source.audio.currentTime = 0;
    }
  }

  // Pause audio
  public pause(key: string): void {
    const source = this.audioSources.get(key);
    if (source) {
      source.audio.pause();
    }
  }

  // Resume audio
  public resume(key: string): void {
    const source = this.audioSources.get(key);
    if (source && source.audio.paused) {
      const playPromise = source.audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Audio resume failed:', error);
        });
      }
    }
  }

  // Check if audio is playing
  public isPlaying(key: string): boolean {
    const source = this.audioSources.get(key);
    return source ? !source.audio.paused && source.audio.currentTime > 0 : false;
  }

  // Volume controls
  public setVolume(category: Exclude<keyof AudioSettings, 'muted'>, volume: number): void {
    this.settings[category] = Math.max(0, Math.min(1, volume));
    this.updateGainNodes();
    this.updateAllAudioVolumes();
    this.saveSettingsToStorage();
  }

  public getVolume(category: Exclude<keyof AudioSettings, 'muted'>): number {
    return this.settings[category] as number;
  }

  public toggleMute(): void {
    this.settings.muted = !this.settings.muted;
    this.updateGainNodes();
    this.updateAllAudioVolumes();
    this.saveSettingsToStorage();
  }

  public isMuted(): boolean {
    return this.settings.muted;
  }

  private calculateEffectiveVolume(source: AudioSource): number {
    if (this.settings.muted) return 0;

    let categoryVolume = 1;
    switch (source.category) {
      case 'music':
        categoryVolume = this.settings.musicVolume;
        break;
      case 'sfx':
        categoryVolume = this.settings.sfxVolume;
        break;
    }

    return source.volume * categoryVolume * this.settings.masterVolume;
  }

  private updateAllAudioVolumes(): void {
    this.audioSources.forEach((source) => {
      if (!source.fadeIn && !source.fadeOut) {
        source.audio.volume = this.calculateEffectiveVolume(source);
      }
    });
  }

  // Update method called each frame
  public update(): void {
    const deltaTime = 1 / 60; // Approximate frame time

    this.audioSources.forEach((source) => {
      // Handle fade in
      if (source.fadeIn && source.currentFade !== undefined && source.fadeDuration) {
        source.currentFade += deltaTime;
        const progress = Math.min(source.currentFade / source.fadeDuration, 1);
        source.audio.volume = this.calculateEffectiveVolume(source) * progress;

        if (progress >= 1) {
          source.fadeIn = false;
          source.currentFade = undefined;
        }
      }

      // Handle fade out
      if (source.fadeOut && source.currentFade !== undefined && source.fadeDuration) {
        source.currentFade += deltaTime;
        const progress = Math.min(source.currentFade / source.fadeDuration, 1);
        source.audio.volume = this.calculateEffectiveVolume(source) * (1 - progress);

        if (progress >= 1) {
          source.audio.pause();
          source.audio.currentTime = 0;
          source.fadeOut = false;
          source.currentFade = undefined;
        }
      }
    });
  }

  // Preload common game sounds
  public async preloadGameAudio(): Promise<void> {
    const audioFiles = [
      { key: 'click', src: '/assets/audio/ui/click.mp3', category: 'sfx' as const },
      { key: 'success', src: '/assets/audio/ui/success.mp3', category: 'sfx' as const },
      { key: 'error', src: '/assets/audio/ui/error.mp3', category: 'sfx' as const },
      { key: 'levelUp', src: '/assets/audio/game/level-up.mp3', category: 'sfx' as const },
      { key: 'achievement', src: '/assets/audio/game/achievement.mp3', category: 'sfx' as const },
      { key: 'backgroundMusic', src: '/assets/audio/music/background.mp3', category: 'music' as const, loop: true },
      { key: 'menuMusic', src: '/assets/audio/music/menu.mp3', category: 'music' as const, loop: true }
    ];

    const loadPromises = audioFiles.map(({ key, src, category, loop }) =>
      this.loadAudio(key, src, category, loop).catch(error => {
        console.warn(`Failed to preload audio: ${key}`, error);
      })
    );

    await Promise.all(loadPromises);
  }

  // Quick play methods for common sounds
  public playClick(): void {
    this.play('click', 0.5);
  }

  public playSuccess(): void {
    this.play('success', 0.7);
  }

  public playError(): void {
    this.play('error', 0.6);
  }

  public playLevelUp(): void {
    this.play('levelUp', 0.8);
  }

  public playAchievement(): void {
    this.play('achievement', 0.9);
  }

  public playBackgroundMusic(): void {
    this.play('backgroundMusic', 0.3, true, 2.0);
  }

  public playMenuMusic(): void {
    this.play('menuMusic', 0.4, true, 1.5);
  }

  // Settings persistence
  private loadSettingsFromStorage(): void {
    const stored = localStorage.getItem('audioSettings');
    if (stored) {
      try {
        const settings = JSON.parse(stored);
        this.settings = { ...this.settings, ...settings };
      } catch (error) {
        console.warn('Failed to load audio settings from storage:', error);
      }
    }
  }

  private saveSettingsToStorage(): void {
    try {
      localStorage.setItem('audioSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.warn('Failed to save audio settings to storage:', error);
    }
  }

  // Cleanup
  public destroy(): void {
    this.audioSources.forEach((source) => {
      source.audio.pause();
      source.audio.src = '';
    });

    this.audioSources.clear();

    if (this.audioContext) {
      this.audioContext.close();
    }

    this.gainNodes.clear();
  }
}