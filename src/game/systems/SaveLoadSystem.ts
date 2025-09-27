import { Player } from '../entities/Player';

export interface SaveGameData {
  version: string;
  timestamp: number;
  playerData: string;
  gameState: {
    currentLevel: string;
    totalPlaytime: number;
    sessionCount: number;
    lastPlayed: number;
  };
  metadata: {
    playerName: string;
    playerLevel: number;
    location: string;
    screenshotData?: string; // Base64 encoded screenshot
    description?: string;
  };
  settings: {
    graphics: any;
    audio: any;
    controls: any;
    accessibility: any;
  };
  achievements: string[];
  statistics: {
    [key: string]: number;
  };
}

export interface SaveSlotInfo {
  id: number;
  exists: boolean;
  metadata?: SaveGameData['metadata'];
  timestamp?: number;
  playtime?: number;
  isCorrupted?: boolean;
}

export interface ImportExportData {
  saveData: SaveGameData;
  exportedAt: number;
  exportVersion: string;
  checksum: string;
}

export class SaveLoadSystem {
  private static instance: SaveLoadSystem;
  private static readonly SAVE_VERSION = '1.0.0';
  private static readonly MAX_SAVE_SLOTS = 10;
  private static readonly AUTO_SAVE_SLOT = 0;
  private static readonly SAVE_KEY_PREFIX = 'vj-career-rpg-save-';
  private static readonly SETTINGS_KEY = 'vj-career-rpg-settings';
  private static readonly STATISTICS_KEY = 'vj-career-rpg-stats';

  private autoSaveEnabled: boolean = true;
  private autoSaveInterval: number = 30000; // 30 seconds
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private compressionEnabled: boolean = true;

  private constructor() {
    this.setupAutoSave();
  }

  public static getInstance(): SaveLoadSystem {
    if (!SaveLoadSystem.instance) {
      SaveLoadSystem.instance = new SaveLoadSystem();
    }
    return SaveLoadSystem.instance;
  }

  // Core save/load functionality
  public async saveGame(
    player: Player,
    slotId: number = SaveLoadSystem.AUTO_SAVE_SLOT,
    metadata?: Partial<SaveGameData['metadata']>,
    includeScreenshot: boolean = false
  ): Promise<boolean> {
    try {
      const saveData = await this.createSaveData(player, metadata, includeScreenshot);
      const saveKey = this.getSaveKey(slotId);

      if (this.compressionEnabled) {
        const compressedData = await this.compressData(JSON.stringify(saveData));
        localStorage.setItem(saveKey, compressedData);
      } else {
        localStorage.setItem(saveKey, JSON.stringify(saveData));
      }

      // Update statistics
      this.updateSaveStatistics(slotId);

      console.log(`Game saved to slot ${slotId} successfully`);
      return true;

    } catch (error) {
      console.error(`Failed to save game to slot ${slotId}:`, error);
      this.handleSaveError(error, slotId);
      return false;
    }
  }

  public async loadGame(player: Player, slotId: number): Promise<boolean> {
    try {
      const saveKey = this.getSaveKey(slotId);
      const rawData = localStorage.getItem(saveKey);

      if (!rawData) {
        throw new Error(`No save data found in slot ${slotId}`);
      }

      let saveData: SaveGameData;
      try {
        if (this.compressionEnabled && this.isCompressed(rawData)) {
          const decompressedData = await this.decompressData(rawData);
          saveData = JSON.parse(decompressedData);
        } else {
          saveData = JSON.parse(rawData);
        }
      } catch (parseError) {
        throw new Error(`Save data is corrupted in slot ${slotId}`);
      }

      // Validate save data
      if (!this.validateSaveData(saveData)) {
        throw new Error(`Invalid save data in slot ${slotId}`);
      }

      // Load player data
      player.deserialize(saveData.playerData);

      // Apply game state
      await this.applySaveData(saveData);

      console.log(`Game loaded from slot ${slotId} successfully`);
      return true;

    } catch (error) {
      console.error(`Failed to load game from slot ${slotId}:`, error);
      this.handleLoadError(error, slotId);
      return false;
    }
  }

  // Save slot management
  public getSaveSlots(): SaveSlotInfo[] {
    const slots: SaveSlotInfo[] = [];

    for (let i = 0; i < SaveLoadSystem.MAX_SAVE_SLOTS; i++) {
      const slot = this.getSaveSlotInfo(i);
      slots.push(slot);
    }

    return slots;
  }

  public getSaveSlotInfo(slotId: number): SaveSlotInfo {
    const saveKey = this.getSaveKey(slotId);
    const rawData = localStorage.getItem(saveKey);

    if (!rawData) {
      return { id: slotId, exists: false };
    }

    try {
      let saveData: SaveGameData;

      if (this.compressionEnabled && this.isCompressed(rawData)) {
        const decompressedData = this.decompressData(rawData);
        saveData = JSON.parse(decompressedData);
      } else {
        saveData = JSON.parse(rawData);
      }

      if (!this.validateSaveData(saveData)) {
        return { id: slotId, exists: true, isCorrupted: true };
      }

      return {
        id: slotId,
        exists: true,
        metadata: saveData.metadata,
        timestamp: saveData.timestamp,
        playtime: saveData.gameState.totalPlaytime,
        isCorrupted: false
      };

    } catch (error) {
      return { id: slotId, exists: true, isCorrupted: true };
    }
  }

  public deleteSave(slotId: number): boolean {
    try {
      if (slotId === SaveLoadSystem.AUTO_SAVE_SLOT) {
        console.warn('Cannot delete auto-save slot');
        return false;
      }

      const saveKey = this.getSaveKey(slotId);
      localStorage.removeItem(saveKey);

      console.log(`Save slot ${slotId} deleted successfully`);
      return true;

    } catch (error) {
      console.error(`Failed to delete save slot ${slotId}:`, error);
      return false;
    }
  }

  public copySave(fromSlotId: number, toSlotId: number): boolean {
    try {
      const fromKey = this.getSaveKey(fromSlotId);
      const toKey = this.getSaveKey(toSlotId);
      const saveData = localStorage.getItem(fromKey);

      if (!saveData) {
        throw new Error(`No save data found in slot ${fromSlotId}`);
      }

      localStorage.setItem(toKey, saveData);

      console.log(`Save copied from slot ${fromSlotId} to slot ${toSlotId}`);
      return true;

    } catch (error) {
      console.error(`Failed to copy save from slot ${fromSlotId} to ${toSlotId}:`, error);
      return false;
    }
  }

  // Auto-save system
  public setAutoSaveEnabled(enabled: boolean): void {
    this.autoSaveEnabled = enabled;

    if (enabled) {
      this.setupAutoSave();
    } else {
      this.stopAutoSave();
    }
  }

  public setAutoSaveInterval(intervalMs: number): void {
    this.autoSaveInterval = Math.max(10000, intervalMs); // Minimum 10 seconds

    if (this.autoSaveEnabled) {
      this.setupAutoSave();
    }
  }

  private setupAutoSave(): void {
    this.stopAutoSave();

    if (this.autoSaveEnabled) {
      this.autoSaveTimer = setInterval(() => {
        this.performAutoSave();
      }, this.autoSaveInterval);
    }
  }

  private stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  private async performAutoSave(): Promise<void> {
    try {
      // Get player from store
      const playerStore = (window as any).playerStore?.getState();
      if (!playerStore?.player) return;

      await this.saveGame(
        playerStore.player,
        SaveLoadSystem.AUTO_SAVE_SLOT,
        {
          description: 'Auto-save',
          playerName: 'Player' // Could be customizable
        },
        false // No screenshot for auto-save
      );

    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  // Import/Export functionality
  public async exportSave(slotId: number): Promise<string> {
    const saveKey = this.getSaveKey(slotId);
    const rawData = localStorage.getItem(saveKey);

    if (!rawData) {
      throw new Error(`No save data found in slot ${slotId}`);
    }

    let saveData: SaveGameData;
    if (this.compressionEnabled && this.isCompressed(rawData)) {
      const decompressedData = await this.decompressData(rawData);
      saveData = JSON.parse(decompressedData);
    } else {
      saveData = JSON.parse(rawData);
    }

    const exportData: ImportExportData = {
      saveData,
      exportedAt: Date.now(),
      exportVersion: SaveLoadSystem.SAVE_VERSION,
      checksum: await this.generateChecksum(JSON.stringify(saveData))
    };

    return JSON.stringify(exportData);
  }

  public async importSave(importData: string, targetSlotId: number): Promise<boolean> {
    try {
      const exportData: ImportExportData = JSON.parse(importData);

      // Validate import data
      if (!this.validateImportData(exportData)) {
        throw new Error('Invalid import data format');
      }

      // Verify checksum
      const calculatedChecksum = await this.generateChecksum(JSON.stringify(exportData.saveData));
      if (calculatedChecksum !== exportData.checksum) {
        throw new Error('Import data integrity check failed');
      }

      // Save to target slot
      const saveKey = this.getSaveKey(targetSlotId);
      localStorage.setItem(saveKey, JSON.stringify(exportData.saveData));

      console.log(`Save imported to slot ${targetSlotId} successfully`);
      return true;

    } catch (error) {
      console.error('Failed to import save:', error);
      return false;
    }
  }

  public async exportAllSaves(): Promise<string> {
    const allSaves: { [slotId: string]: SaveGameData } = {};

    for (let i = 0; i < SaveLoadSystem.MAX_SAVE_SLOTS; i++) {
      const slot = this.getSaveSlotInfo(i);
      if (slot.exists && !slot.isCorrupted) {
        try {
          const saveKey = this.getSaveKey(i);
          const rawData = localStorage.getItem(saveKey);
          if (rawData) {
            let saveData: SaveGameData;
            if (this.compressionEnabled && this.isCompressed(rawData)) {
              const decompressedData = await this.decompressData(rawData);
              saveData = JSON.parse(decompressedData);
            } else {
              saveData = JSON.parse(rawData);
            }
            allSaves[i.toString()] = saveData;
          }
        } catch (error) {
          console.warn(`Failed to export slot ${i}:`, error);
        }
      }
    }

    const exportData = {
      saves: allSaves,
      exportedAt: Date.now(),
      version: SaveLoadSystem.SAVE_VERSION
    };

    return JSON.stringify(exportData);
  }

  // Data compression (simple base64 for now, could be improved with actual compression)
  private async compressData(data: string): Promise<string> {
    try {
      return btoa(data);
    } catch (error) {
      console.warn('Compression failed, saving uncompressed:', error);
      return data;
    }
  }

  private async decompressData(compressedData: string): Promise<string> {
    try {
      return atob(compressedData);
    } catch (error) {
      console.warn('Decompression failed, treating as uncompressed');
      return compressedData;
    }
  }

  private isCompressed(data: string): boolean {
    // Simple check - real implementation would be more robust
    try {
      atob(data);
      return true;
    } catch {
      return false;
    }
  }

  // Save data creation and validation
  private async createSaveData(
    player: Player,
    metadata?: Partial<SaveGameData['metadata']>,
    includeScreenshot: boolean = false
  ): Promise<SaveGameData> {
    const stats = player.getStats();
    const position = player.getPosition();

    // Get current game state
    const gameStore = (window as any).gameStore?.getState();
    const playerStore = (window as any).playerStore?.getState();

    let screenshotData: string | undefined;
    if (includeScreenshot) {
      screenshotData = await this.captureScreenshot();
    }

    const saveData: SaveGameData = {
      version: SaveLoadSystem.SAVE_VERSION,
      timestamp: Date.now(),
      playerData: player.serialize(),
      gameState: {
        currentLevel: position.scene,
        totalPlaytime: playerStore?.totalPlaytime || 0,
        sessionCount: this.getSessionCount(),
        lastPlayed: Date.now()
      },
      metadata: {
        playerName: metadata?.playerName || 'VJ Artist',
        playerLevel: stats.level,
        location: this.getLocationDisplayName(position.scene),
        screenshotData,
        description: metadata?.description || `Level ${stats.level} VJ`,
        ...metadata
      },
      settings: {
        graphics: gameStore?.settings.graphics || {},
        audio: gameStore?.settings.audio || {},
        controls: gameStore?.settings.controls || {},
        accessibility: gameStore?.settings.accessibility || {}
      },
      achievements: Array.from(player.getAchievements()),
      statistics: this.getGameStatistics()
    };

    return saveData;
  }

  private validateSaveData(saveData: any): saveData is SaveGameData {
    return (
      saveData &&
      typeof saveData.version === 'string' &&
      typeof saveData.timestamp === 'number' &&
      typeof saveData.playerData === 'string' &&
      saveData.gameState &&
      saveData.metadata &&
      saveData.settings &&
      Array.isArray(saveData.achievements) &&
      saveData.statistics
    );
  }

  private validateImportData(importData: any): importData is ImportExportData {
    return (
      importData &&
      importData.saveData &&
      this.validateSaveData(importData.saveData) &&
      typeof importData.exportedAt === 'number' &&
      typeof importData.exportVersion === 'string' &&
      typeof importData.checksum === 'string'
    );
  }

  private async applySaveData(saveData: SaveGameData): Promise<void> {
    // Apply game settings
    const gameStore = (window as any).gameStore?.getState();
    if (gameStore) {
      gameStore.updateGraphicsSettings(saveData.settings.graphics);
      gameStore.updateAudioSettings(saveData.settings.audio);
      gameStore.updateControlSettings(saveData.settings.controls);
      gameStore.updateAccessibilitySettings(saveData.settings.accessibility);
    }

    // Update player store state
    const playerStore = (window as any).playerStore?.getState();
    if (playerStore) {
      playerStore.totalPlaytime = saveData.gameState.totalPlaytime;
      playerStore.refreshPlayerData();
    }

    // Set current level
    if (gameStore) {
      gameStore.setCurrentScene(saveData.gameState.currentLevel);
    }
  }

  // Utility methods
  private getSaveKey(slotId: number): string {
    return `${SaveLoadSystem.SAVE_KEY_PREFIX}${slotId}`;
  }

  private getLocationDisplayName(sceneId: string): string {
    const locationNames: { [key: string]: string } = {
      'home': 'VJ Studio',
      'club': 'Night Club',
      'festival': 'Music Festival',
      'gallery': 'Art Gallery'
    };

    return locationNames[sceneId] || sceneId;
  }

  private getSessionCount(): number {
    const count = localStorage.getItem('vj-session-count');
    return count ? parseInt(count, 10) : 1;
  }

  private getGameStatistics(): { [key: string]: number } {
    const stats = localStorage.getItem(SaveLoadSystem.STATISTICS_KEY);
    return stats ? JSON.parse(stats) : {};
  }

  private updateSaveStatistics(slotId: number): void {
    const stats = this.getGameStatistics();
    stats[`saves_to_slot_${slotId}`] = (stats[`saves_to_slot_${slotId}`] || 0) + 1;
    stats['total_saves'] = (stats['total_saves'] || 0) + 1;
    stats['last_save_timestamp'] = Date.now();

    localStorage.setItem(SaveLoadSystem.STATISTICS_KEY, JSON.stringify(stats));
  }

  private async captureScreenshot(): Promise<string> {
    // This would capture the game canvas as a screenshot
    // For now, return a placeholder
    return 'data:image/png;base64,placeholder';
  }

  private async generateChecksum(data: string): Promise<string> {
    // Simple checksum implementation
    // In production, use a proper hashing algorithm
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  private handleSaveError(error: any, slotId: number): void {
    // Could notify the user or attempt recovery
    console.error(`Save error in slot ${slotId}:`, error);

    if (error.name === 'QuotaExceededError') {
      console.error('Storage quota exceeded. Consider cleaning up old saves.');
    }
  }

  private handleLoadError(error: any, slotId: number): void {
    // Could attempt to recover corrupted saves
    console.error(`Load error from slot ${slotId}:`, error);
  }

  // Cleanup and maintenance
  public getStorageUsage(): { used: number; available: number; percentage: number } {
    try {
      let totalSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          totalSize += localStorage.getItem(key)?.length || 0;
        }
      }

      // Rough estimate of available space (localStorage limit is usually 5-10MB)
      const estimatedLimit = 5 * 1024 * 1024; // 5MB
      const percentage = (totalSize / estimatedLimit) * 100;

      return {
        used: totalSize,
        available: estimatedLimit - totalSize,
        percentage: Math.min(percentage, 100)
      };
    } catch (error) {
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  public cleanupOldSaves(keepCount: number = 5): number {
    const slots = this.getSaveSlots().filter(slot =>
      slot.exists && !slot.isCorrupted && slot.id !== SaveLoadSystem.AUTO_SAVE_SLOT
    );

    // Sort by timestamp, newest first
    slots.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    let deletedCount = 0;
    for (let i = keepCount; i < slots.length; i++) {
      if (this.deleteSave(slots[i].id)) {
        deletedCount++;
      }
    }

    return deletedCount;
  }

  public destroy(): void {
    this.stopAutoSave();
    SaveLoadSystem.instance = null as any;
  }
}