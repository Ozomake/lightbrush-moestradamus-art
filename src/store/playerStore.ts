import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Player } from '../game/entities/Player';
import type { PlayerStats, PlayerSkills, PlayerEquipment, PlayerPosition } from '../game/entities/Player';
import { SkillSystem } from '../game/systems/SkillSystem';
import { EquipmentSystem, type EquipmentItem } from '../game/systems/EquipmentSystem';
import { AchievementSystem } from '../game/systems/AchievementSystem';

// Extend window interface for global game store access
declare global {
  interface Window {
    gameStore?: {
      getState: () => {
        addNotification: (notification: { type: string; title: string; message: string }) => void;
      };
    };
  }
}

export interface PlayerState {
  // Player instance and data
  player: Player;

  // Cached player data for performance
  stats: PlayerStats;
  skills: PlayerSkills;
  equipment: PlayerEquipment;
  position: PlayerPosition;
  inventory: Map<string, number>;
  achievements: Set<string>;
  unlockedContent: Set<string>;

  // System instances
  skillSystem: SkillSystem;
  equipmentSystem: EquipmentSystem;
  achievementSystem: AchievementSystem;

  // Save/Load system
  autoSaveEnabled: boolean;
  lastSaveTime: number;
  saveSlots: Array<{
    id: number;
    name: string;
    timestamp: number;
    playerLevel: number;
    location: string;
    playtime: number;
  } | null>;

  // Game session tracking
  sessionStartTime: number;
  totalPlaytime: number; // in seconds

  // Actions
  initializePlayer: () => void;
  refreshPlayerData: () => void;

  // Stat actions
  addExperience: (amount: number) => boolean;
  addReputation: (amount: number) => void;
  addMoney: (amount: number) => void;
  spendMoney: (amount: number) => boolean;
  consumeEnergy: (amount: number) => boolean;
  restoreEnergy: (amount: number) => void;

  // Skill actions
  upgradeSkill: (skill: keyof PlayerSkills) => boolean;
  canUpgradeSkill: (skill: keyof PlayerSkills) => { canUpgrade: boolean; reason?: string };
  getSkillProgress: () => { [key in keyof PlayerSkills]: { current: number; max: number; percentage: number } };

  // Equipment actions
  equipItem: (slot: keyof Omit<PlayerEquipment, 'software' | 'accessories'>, itemId: string) => boolean;
  unequipItem: (slot: keyof Omit<PlayerEquipment, 'software' | 'accessories'>) => boolean;
  purchaseEquipment: (equipmentId: string) => boolean;
  getAvailableEquipment: () => EquipmentItem[];

  // Inventory actions
  addToInventory: (itemId: string, quantity?: number) => void;
  removeFromInventory: (itemId: string, quantity?: number) => boolean;
  hasInInventory: (itemId: string, quantity?: number) => boolean;
  getInventoryCount: (itemId: string) => number;

  // Position actions
  setPosition: (x: number, y: number, scene?: string) => void;
  moveBy: (dx: number, dy: number) => void;

  // Achievement actions
  checkAchievements: () => string[];
  getAchievementStats: () => {
    total: number;
    unlocked: number;
    totalPoints: number;
    earnedPoints: number;
    completionPercentage: number;
  };

  // Content unlocking
  unlockContent: (contentId: string) => void;
  hasUnlockedContent: (contentId: string) => boolean;

  // Save/Load actions
  saveGame: (slotId?: number, name?: string) => Promise<boolean>;
  loadGame: (slotId: number) => Promise<boolean>;
  deleteSave: (slotId: number) => boolean;
  getSaveSlots: () => Array<PlayerState['saveSlots'][0]>;
  setAutoSave: (enabled: boolean) => void;

  // Session management
  startSession: () => void;
  updatePlaytime: () => void;
  getSessionDuration: () => number;

  // Utility actions
  resetPlayer: () => void;
  exportPlayerData: () => string;
  importPlayerData: (data: string) => boolean;
}

export const usePlayerStore = create<PlayerState>()(
  subscribeWithSelector((set, get) => ({
    // Initialize with new player
    player: new Player(),

    // Cached data
    stats: {
      level: 1,
      experience: 0,
      experienceToNext: 100,
      reputation: 0,
      energy: 100,
      maxEnergy: 100,
      money: 0
    },
    skills: {
      technicalMapping: 1,
      artisticVision: 1,
      equipmentMastery: 1,
      socialMedia: 1,
      collaboration: 1
    },
    equipment: {
      projector: null,
      computer: 'basic-laptop',
      controller: null,
      software: ['basic-vj-software'],
      accessories: []
    },
    position: { x: 0, y: 0, scene: 'home' },
    inventory: new Map(),
    achievements: new Set(),
    unlockedContent: new Set(),

    // Systems
    skillSystem: SkillSystem.getInstance(),
    equipmentSystem: EquipmentSystem.getInstance(),
    achievementSystem: AchievementSystem.getInstance(),

    // Save system
    autoSaveEnabled: true,
    lastSaveTime: 0,
    saveSlots: Array(5).fill(null),

    // Session tracking
    sessionStartTime: Date.now(),
    totalPlaytime: 0,

    // Actions
    initializePlayer: () => {
      const state = get();

      // Try to load from auto-save if available
      const autoSave = localStorage.getItem('vj-game-autosave');
      if (autoSave) {
        try {
          state.player.deserialize(autoSave);
        } catch (error) {
          console.warn('Failed to load auto-save, starting fresh:', error);
        }
      }

      // Refresh cached data
      get().refreshPlayerData();

      // Start session tracking
      get().startSession();

      // Set up auto-save interval
      if (state.autoSaveEnabled) {
        setInterval(() => {
          get().saveGame(); // Auto-save to slot 0 (auto-save slot)
        }, 30000); // Auto-save every 30 seconds
      }
    },

    refreshPlayerData: () => {
      const { player } = get();

      set({
        stats: player.getStats(),
        skills: player.getSkills(),
        equipment: player.getEquipment(),
        position: player.getPosition(),
        inventory: player.getInventory(),
        achievements: player.getAchievements(),
        unlockedContent: player.getUnlockedContent()
      });
    },

    // Stat actions
    addExperience: (amount: number) => {
      const { player } = get();
      const result = player.addExperience(amount);
      get().refreshPlayerData();

      // Check for achievements after gaining experience
      get().checkAchievements();

      return result;
    },

    addReputation: (amount: number) => {
      const { player } = get();
      player.addReputation(amount);
      get().refreshPlayerData();

      // Check for achievements after gaining reputation
      get().checkAchievements();
    },

    addMoney: (amount: number) => {
      const { player } = get();
      player.addMoney(amount);
      get().refreshPlayerData();

      // Check for achievements after gaining money
      get().checkAchievements();
    },

    spendMoney: (amount: number) => {
      const { player } = get();
      const result = player.spendMoney(amount);
      if (result) {
        get().refreshPlayerData();
      }
      return result;
    },

    consumeEnergy: (amount: number) => {
      const { player } = get();
      const result = player.consumeEnergy(amount);
      get().refreshPlayerData();
      return result;
    },

    restoreEnergy: (amount: number) => {
      const { player } = get();
      player.restoreEnergy(amount);
      get().refreshPlayerData();
    },

    // Skill actions
    upgradeSkill: (skill: keyof PlayerSkills) => {
      const { skillSystem, player } = get();
      const result = skillSystem.upgradeSkill(player, skill);

      if (result) {
        get().refreshPlayerData();
        get().checkAchievements();
      }

      return result;
    },

    canUpgradeSkill: (skill: keyof PlayerSkills) => {
      const { skillSystem, player } = get();
      return skillSystem.canUpgradeSkill(player, skill);
    },

    getSkillProgress: () => {
      const { skillSystem, player } = get();
      return skillSystem.getSkillProgress(player);
    },

    // Equipment actions
    equipItem: (slot, itemId) => {
      const { player } = get();
      const result = player.equipItem(slot, itemId);

      if (result) {
        get().refreshPlayerData();
      }

      return result;
    },

    unequipItem: (slot) => {
      const { player } = get();
      const result = player.unequipItem(slot);

      if (result) {
        get().refreshPlayerData();
      }

      return result;
    },

    purchaseEquipment: (equipmentId: string) => {
      const { equipmentSystem, player } = get();
      const result = equipmentSystem.purchaseEquipment(player, equipmentId);

      if (result) {
        get().refreshPlayerData();
        get().checkAchievements();
      }

      return result;
    },

    getAvailableEquipment: () => {
      const { equipmentSystem, player } = get();
      return equipmentSystem.getAvailableEquipment(player);
    },

    // Inventory actions
    addToInventory: (itemId: string, quantity: number = 1) => {
      const { player } = get();
      player.addToInventory(itemId, quantity);
      get().refreshPlayerData();
      get().checkAchievements();
    },

    removeFromInventory: (itemId: string, quantity: number = 1) => {
      const { player } = get();
      const result = player.removeFromInventory(itemId, quantity);

      if (result) {
        get().refreshPlayerData();
      }

      return result;
    },

    hasInInventory: (itemId: string, quantity: number = 1) => {
      const { player } = get();
      return player.hasInInventory(itemId, quantity);
    },

    getInventoryCount: (itemId: string) => {
      const { player } = get();
      return player.getInventoryCount(itemId);
    },

    // Position actions
    setPosition: (x: number, y: number, scene?: string) => {
      const { player } = get();
      player.setPosition(x, y, scene);
      get().refreshPlayerData();
    },

    moveBy: (dx: number, dy: number) => {
      const { player } = get();
      player.moveBy(dx, dy);
      get().refreshPlayerData();
    },

    // Achievement actions
    checkAchievements: () => {
      const { achievementSystem, player } = get();
      const newAchievements = achievementSystem.checkAchievements(player);

      if (newAchievements.length > 0) {
        get().refreshPlayerData();

        // Trigger notifications for new achievements
        const gameStore = window.gameStore; // Access game store for notifications
        if (gameStore) {
          newAchievements.forEach(achievementId => {
            const achievement = achievementSystem.getAchievement(achievementId);
            if (achievement) {
              gameStore.getState().addNotification({
                type: 'achievement',
                title: 'Achievement Unlocked!',
                message: `${achievement.name}: ${achievement.description}`
              });
            }
          });
        }
      }

      return newAchievements;
    },

    getAchievementStats: () => {
      const { achievementSystem, player } = get();
      return achievementSystem.getAchievementStats(player);
    },

    // Content unlocking
    unlockContent: (contentId: string) => {
      const { player } = get();
      player.unlockContent(contentId);
      get().refreshPlayerData();
    },

    hasUnlockedContent: (contentId: string) => {
      const { player } = get();
      return player.hasUnlockedContent(contentId);
    },

    // Save/Load system
    saveGame: async (slotId: number = 0, name?: string) => {
      try {
        const { player, totalPlaytime } = get();
        get().updatePlaytime();

        const saveData = {
          playerData: player.serialize(),
          timestamp: Date.now(),
          playerLevel: player.getStats().level,
          location: player.getPosition().scene,
          playtime: totalPlaytime,
          name: name || `Save ${slotId}`
        };

        // Save to localStorage
        const saveKey = slotId === 0 ? 'vj-game-autosave' : `vj-game-save-${slotId}`;
        localStorage.setItem(saveKey, JSON.stringify(saveData));

        // Update save slots cache
        const saveSlots = [...get().saveSlots];
        saveSlots[slotId] = {
          id: slotId,
          name: saveData.name,
          timestamp: saveData.timestamp,
          playerLevel: saveData.playerLevel,
          location: saveData.location,
          playtime: saveData.playtime
        };

        set({ saveSlots, lastSaveTime: Date.now() });

        return true;
      } catch (error) {
        console.error('Failed to save game:', error);
        return false;
      }
    },

    loadGame: async (slotId: number) => {
      try {
        const saveKey = slotId === 0 ? 'vj-game-autosave' : `vj-game-save-${slotId}`;
        const saveData = localStorage.getItem(saveKey);

        if (!saveData) {
          throw new Error('Save data not found');
        }

        const parsed = JSON.parse(saveData);
        const { player } = get();

        // Load player data
        player.deserialize(parsed.playerData);

        // Update session data
        set({
          totalPlaytime: parsed.playtime || 0,
          sessionStartTime: Date.now()
        });

        // Refresh cached data
        get().refreshPlayerData();

        return true;
      } catch (error) {
        console.error('Failed to load game:', error);
        return false;
      }
    },

    deleteSave: (slotId: number) => {
      try {
        if (slotId === 0) return false; // Cannot delete auto-save

        const saveKey = `vj-game-save-${slotId}`;
        localStorage.removeItem(saveKey);

        const saveSlots = [...get().saveSlots];
        saveSlots[slotId] = null;
        set({ saveSlots });

        return true;
      } catch (error) {
        console.error('Failed to delete save:', error);
        return false;
      }
    },

    getSaveSlots: () => {
      const slots = [...get().saveSlots];

      // Update slots from localStorage
      for (let i = 1; i < slots.length; i++) {
        try {
          const saveKey = `vj-game-save-${i}`;
          const saveData = localStorage.getItem(saveKey);

          if (saveData) {
            const parsed = JSON.parse(saveData);
            slots[i] = {
              id: i,
              name: parsed.name || `Save ${i}`,
              timestamp: parsed.timestamp,
              playerLevel: parsed.playerLevel,
              location: parsed.location,
              playtime: parsed.playtime || 0
            };
          }
        } catch (error) {
          console.warn(`Failed to load save slot ${i}:`, error);
        }
      }

      return slots;
    },

    setAutoSave: (enabled: boolean) => {
      set({ autoSaveEnabled: enabled });
    },

    // Session management
    startSession: () => {
      set({ sessionStartTime: Date.now() });
    },

    updatePlaytime: () => {
      const { sessionStartTime, totalPlaytime } = get();
      const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
      set({ totalPlaytime: totalPlaytime + sessionDuration, sessionStartTime: Date.now() });
    },

    getSessionDuration: () => {
      const { sessionStartTime } = get();
      return Math.floor((Date.now() - sessionStartTime) / 1000);
    },

    // Utility actions
    resetPlayer: () => {
      const newPlayer = new Player();
      set({
        player: newPlayer,
        sessionStartTime: Date.now(),
        totalPlaytime: 0
      });
      get().refreshPlayerData();
    },

    exportPlayerData: () => {
      const { player } = get();
      get().updatePlaytime();

      const exportData = {
        playerData: player.serialize(),
        totalPlaytime: get().totalPlaytime,
        exportedAt: Date.now(),
        version: '1.0'
      };

      return JSON.stringify(exportData);
    },

    importPlayerData: (data: string) => {
      try {
        const parsed = JSON.parse(data);
        const { player } = get();

        player.deserialize(parsed.playerData);

        set({
          totalPlaytime: parsed.totalPlaytime || 0,
          sessionStartTime: Date.now()
        });

        get().refreshPlayerData();
        get().checkAchievements();

        return true;
      } catch (error) {
        console.error('Failed to import player data:', error);
        return false;
      }
    }
  }))
);

// Selectors for commonly used state slices
export const usePlayerStats = () => usePlayerStore(state => ({
  stats: state.stats,
  addExperience: state.addExperience,
  addReputation: state.addReputation,
  addMoney: state.addMoney,
  spendMoney: state.spendMoney,
  consumeEnergy: state.consumeEnergy,
  restoreEnergy: state.restoreEnergy
}));

export const usePlayerSkills = () => usePlayerStore(state => ({
  skills: state.skills,
  upgradeSkill: state.upgradeSkill,
  canUpgradeSkill: state.canUpgradeSkill,
  getSkillProgress: state.getSkillProgress
}));

export const usePlayerEquipment = () => usePlayerStore(state => ({
  equipment: state.equipment,
  equipItem: state.equipItem,
  unequipItem: state.unequipItem,
  purchaseEquipment: state.purchaseEquipment,
  getAvailableEquipment: state.getAvailableEquipment
}));

export const usePlayerInventory = () => usePlayerStore(state => ({
  inventory: state.inventory,
  addToInventory: state.addToInventory,
  removeFromInventory: state.removeFromInventory,
  hasInInventory: state.hasInInventory,
  getInventoryCount: state.getInventoryCount
}));

export const usePlayerAchievements = () => usePlayerStore(state => ({
  achievements: state.achievements,
  checkAchievements: state.checkAchievements,
  getAchievementStats: state.getAchievementStats
}));

export const usePlayerSaveLoad = () => usePlayerStore(state => ({
  saveGame: state.saveGame,
  loadGame: state.loadGame,
  deleteSave: state.deleteSave,
  getSaveSlots: state.getSaveSlots,
  setAutoSave: state.setAutoSave,
  autoSaveEnabled: state.autoSaveEnabled,
  lastSaveTime: state.lastSaveTime,
  exportPlayerData: state.exportPlayerData,
  importPlayerData: state.importPlayerData
}));