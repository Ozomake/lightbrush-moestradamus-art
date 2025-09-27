import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import {
  usePlayerStore,
  // PlayerState type import removed as it's not used in this test file
} from '../../store/playerStore'

// Mock the game entities and systems
vi.mock('../../game/entities/Player', () => {
  return {
    Player: class MockPlayer {
      private stats = {
        level: 1,
        experience: 0,
        experienceToNext: 100,
        reputation: 0,
        energy: 100,
        maxEnergy: 100,
        money: 0
      }
      private skills = {
        technicalMapping: 1,
        artisticVision: 1,
        equipmentMastery: 1,
        socialMedia: 1,
        collaboration: 1
      }
      private equipment = {
        projector: null as string | null,
        computer: 'basic-laptop' as string,
        controller: null as string | null,
        software: ['basic-vj-software'] as string[],
        accessories: [] as string[]
      }
      private position = { x: 0, y: 0, scene: 'home' }
      private inventory = new Map()
      private achievements = new Set()
      private unlockedContent = new Set()

      getStats() { return { ...this.stats } }
      getSkills() { return { ...this.skills } }
      getEquipment() { return { ...this.equipment } }
      getPosition() { return { ...this.position } }
      getInventory() { return new Map(this.inventory) }
      getAchievements() { return new Set(this.achievements) }
      getUnlockedContent() { return new Set(this.unlockedContent) }

      addExperience(amount: number) {
        this.stats.experience += amount
        return true
      }

      addReputation(amount: number) {
        this.stats.reputation += amount
      }

      addMoney(amount: number) {
        this.stats.money += amount
      }

      spendMoney(amount: number) {
        if (this.stats.money >= amount) {
          this.stats.money -= amount
          return true
        }
        return false
      }

      consumeEnergy(amount: number) {
        if (this.stats.energy >= amount) {
          this.stats.energy -= amount
          return true
        }
        return false
      }

      restoreEnergy(amount: number) {
        this.stats.energy = Math.min(this.stats.maxEnergy, this.stats.energy + amount)
      }

      equipItem(slot: string, itemId: string) {
        if (slot === 'projector' || slot === 'computer' || slot === 'controller') {
          (this.equipment as any)[slot] = itemId
        }
        return true
      }

      unequipItem(slot: string) {
        if (slot === 'projector' || slot === 'computer' || slot === 'controller') {
          (this.equipment as any)[slot] = null
        }
        return true
      }

      addToInventory(itemId: string, quantity: number = 1) {
        const current = this.inventory.get(itemId) || 0
        this.inventory.set(itemId, current + quantity)
      }

      removeFromInventory(itemId: string, quantity: number = 1) {
        const current = this.inventory.get(itemId) || 0
        if (current >= quantity) {
          this.inventory.set(itemId, current - quantity)
          return true
        }
        return false
      }

      hasInInventory(itemId: string, quantity: number = 1) {
        return (this.inventory.get(itemId) || 0) >= quantity
      }

      getInventoryCount(itemId: string) {
        return this.inventory.get(itemId) || 0
      }

      setPosition(x: number, y: number, scene?: string) {
        this.position = { x, y, scene: scene || this.position.scene }
      }

      moveBy(dx: number, dy: number) {
        this.position.x += dx
        this.position.y += dy
      }

      unlockContent(contentId: string) {
        this.unlockedContent.add(contentId)
      }

      hasUnlockedContent(contentId: string) {
        return this.unlockedContent.has(contentId)
      }

      serialize() {
        return JSON.stringify({
          stats: this.stats,
          skills: this.skills,
          equipment: this.equipment,
          position: this.position,
          inventory: Array.from(this.inventory.entries()),
          achievements: Array.from(this.achievements),
          unlockedContent: Array.from(this.unlockedContent)
        })
      }

      deserialize(data: string) {
        const parsed = JSON.parse(data)
        this.stats = parsed.stats || this.stats
        this.skills = parsed.skills || this.skills
        this.equipment = parsed.equipment || this.equipment
        this.position = parsed.position || this.position
        this.inventory = new Map(parsed.inventory || [])
        this.achievements = new Set(parsed.achievements || [])
        this.unlockedContent = new Set(parsed.unlockedContent || [])
      }
    }
  }
})

vi.mock('../../game/systems/SkillSystem', () => ({
  SkillSystem: {
    getInstance: vi.fn(() => ({
      upgradeSkill: vi.fn().mockReturnValue(true),
      canUpgradeSkill: vi.fn().mockReturnValue({ canUpgrade: true }),
      getSkillProgress: vi.fn().mockReturnValue({
        technicalMapping: { current: 1, max: 5, percentage: 20 },
        artisticVision: { current: 1, max: 5, percentage: 20 },
        equipmentMastery: { current: 1, max: 5, percentage: 20 },
        socialMedia: { current: 1, max: 5, percentage: 20 },
        collaboration: { current: 1, max: 5, percentage: 20 },
      }),
    }))
  }
}))

vi.mock('../../game/systems/EquipmentSystem', () => ({
  EquipmentSystem: {
    getInstance: vi.fn(() => ({
      purchaseEquipment: vi.fn().mockReturnValue(true),
      getAvailableEquipment: vi.fn().mockReturnValue([
        { id: 'projector-1', name: 'Basic Projector', price: 1000 }
      ]),
    }))
  }
}))

vi.mock('../../game/systems/AchievementSystem', () => ({
  AchievementSystem: {
    getInstance: vi.fn(() => ({
      checkAchievements: vi.fn().mockReturnValue(['first-steps']),
      getAchievementStats: vi.fn().mockReturnValue({
        total: 50,
        unlocked: 5,
        totalPoints: 1000,
        earnedPoints: 100,
        completionPercentage: 10
      }),
      getAchievement: vi.fn().mockReturnValue({
        id: 'first-steps',
        name: 'First Steps',
        description: 'Complete your first tutorial'
      }),
    }))
  }
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

// Mock setInterval
const mockSetInterval = vi.fn()
global.setInterval = mockSetInterval

describe('PlayerStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)

    // Mock window.gameStore for notifications
    Object.defineProperty(window, 'gameStore', {
      value: {
        getState: () => ({
          addNotification: vi.fn()
        })
      },
      writable: true
    })
  })

  afterEach(() => {
    // Reset the store state after each test
    act(() => {
      usePlayerStore.getState().resetPlayer()
    })
  })

  describe('Store Initialization', () => {
    it('should initialize with default values', () => {
      const store = usePlayerStore.getState()

      expect(store.stats.level).toBe(1)
      expect(store.stats.experience).toBe(0)
      expect(store.stats.money).toBe(0)
      expect(store.skills.technicalMapping).toBe(1)
      expect(store.equipment.computer).toBe('basic-laptop')
      expect(store.position.scene).toBe('home')
      expect(store.inventory.size).toBe(0)
      expect(store.achievements.size).toBe(0)
    })

    it('should initialize player instance', () => {
      const store = usePlayerStore.getState()

      expect(store.player).toBeDefined()
      expect(store.skillSystem).toBeDefined()
      expect(store.equipmentSystem).toBeDefined()
      expect(store.achievementSystem).toBeDefined()
    })

    it('should initialize save system', () => {
      const store = usePlayerStore.getState()

      expect(store.autoSaveEnabled).toBe(true)
      expect(store.saveSlots).toHaveLength(5)
      expect(store.saveSlots.every(slot => slot === null)).toBe(true)
    })

    it('should initialize session tracking', () => {
      const store = usePlayerStore.getState()

      expect(store.sessionStartTime).toBeGreaterThan(0)
      expect(store.totalPlaytime).toBe(0)
    })
  })

  describe('Player Stats Actions', () => {
    it('should add experience', () => {
      act(() => {
        const result = usePlayerStore.getState().addExperience(50)
        expect(result).toBe(true)
      })

      // Get fresh state after the action
      const store = usePlayerStore.getState()
      expect(store.stats.experience).toBe(50)
    })

    it('should add reputation', () => {
      act(() => {
        usePlayerStore.getState().addReputation(10)
      })

      // Get fresh state after the action
      const store = usePlayerStore.getState()
      expect(store.stats.reputation).toBe(10)
    })

    it('should add money', () => {
      act(() => {
        usePlayerStore.getState().addMoney(100)
      })

      // Get fresh state after the action
      const store = usePlayerStore.getState()
      expect(store.stats.money).toBe(100)
    })

    it('should spend money successfully', () => {
      act(() => {
        usePlayerStore.getState().addMoney(100)
        const result = usePlayerStore.getState().spendMoney(50)
        expect(result).toBe(true)
      })

      // Get fresh state after the actions
      const store = usePlayerStore.getState()
      expect(store.stats.money).toBe(50)
    })

    it('should fail to spend insufficient money', () => {
      act(() => {
        const result = usePlayerStore.getState().spendMoney(100)
        expect(result).toBe(false)
      })

      // Get fresh state after the action
      const store = usePlayerStore.getState()
      expect(store.stats.money).toBe(0)
    })

    it('should consume energy successfully', () => {
      act(() => {
        const result = usePlayerStore.getState().consumeEnergy(30)
        expect(result).toBe(true)
      })

      // Get fresh state after the action
      const store = usePlayerStore.getState()
      expect(store.stats.energy).toBe(70)
    })

    it('should fail to consume insufficient energy', () => {
      act(() => {
        usePlayerStore.getState().consumeEnergy(90) // Reduce to 10
        const result = usePlayerStore.getState().consumeEnergy(20) // Try to consume 20
        expect(result).toBe(false)
      })
    })

    it('should restore energy', () => {
      act(() => {
        usePlayerStore.getState().consumeEnergy(50) // Reduce to 50
        usePlayerStore.getState().restoreEnergy(30) // Restore 30
      })

      // Get fresh state after the actions
      const store = usePlayerStore.getState()
      expect(store.stats.energy).toBe(80)
    })
  })

  describe('Skill System', () => {
    it('should upgrade skill', () => {
      const store = usePlayerStore.getState()

      act(() => {
        const result = store.upgradeSkill('technicalMapping')
        expect(result).toBe(true)
      })

      expect(store.skillSystem.upgradeSkill).toHaveBeenCalledWith(
        store.player,
        'technicalMapping'
      )
    })

    it('should check if skill can be upgraded', () => {
      const store = usePlayerStore.getState()

      const result = store.canUpgradeSkill('artisticVision')

      expect(result.canUpgrade).toBe(true)
      expect(store.skillSystem.canUpgradeSkill).toHaveBeenCalledWith(
        store.player,
        'artisticVision'
      )
    })

    it('should get skill progress', () => {
      const store = usePlayerStore.getState()

      const progress = store.getSkillProgress()

      expect(progress).toHaveProperty('technicalMapping')
      expect(progress.technicalMapping.percentage).toBe(20)
    })
  })

  describe('Equipment System', () => {
    it('should equip item', () => {
      act(() => {
        const result = usePlayerStore.getState().equipItem('projector', 'projector-1')
        expect(result).toBe(true)
      })

      // Get fresh state after the action
      const store = usePlayerStore.getState()
      expect(store.equipment.projector).toBe('projector-1')
    })

    it('should unequip item', () => {
      act(() => {
        usePlayerStore.getState().equipItem('projector', 'projector-1')
        const result = usePlayerStore.getState().unequipItem('projector')
        expect(result).toBe(true)
      })

      // Get fresh state after the actions
      const store = usePlayerStore.getState()
      expect(store.equipment.projector).toBe(null)
    })

    it('should purchase equipment', () => {
      const store = usePlayerStore.getState()

      act(() => {
        const result = store.purchaseEquipment('projector-1')
        expect(result).toBe(true)
      })

      expect(store.equipmentSystem.purchaseEquipment).toHaveBeenCalledWith(
        store.player,
        'projector-1'
      )
    })

    it('should get available equipment', () => {
      const store = usePlayerStore.getState()

      const equipment = store.getAvailableEquipment()

      expect(equipment).toHaveLength(1)
      expect(equipment[0].id).toBe('projector-1')
    })
  })

  describe('Inventory System', () => {
    it('should add items to inventory', () => {
      const store = usePlayerStore.getState()

      act(() => {
        store.addToInventory('content-pack-1', 3)
      })

      expect(store.getInventoryCount('content-pack-1')).toBe(3)
    })

    it('should remove items from inventory', () => {
      const store = usePlayerStore.getState()

      act(() => {
        store.addToInventory('content-pack-1', 5)
        const result = store.removeFromInventory('content-pack-1', 2)
        expect(result).toBe(true)
      })

      expect(store.getInventoryCount('content-pack-1')).toBe(3)
    })

    it('should fail to remove more items than available', () => {
      const store = usePlayerStore.getState()

      act(() => {
        store.addToInventory('content-pack-1', 2)
        const result = store.removeFromInventory('content-pack-1', 5)
        expect(result).toBe(false)
      })

      expect(store.getInventoryCount('content-pack-1')).toBe(2)
    })

    it('should check if item is in inventory', () => {
      const store = usePlayerStore.getState()

      act(() => {
        store.addToInventory('content-pack-1', 3)
      })

      expect(store.hasInInventory('content-pack-1', 2)).toBe(true)
      expect(store.hasInInventory('content-pack-1', 5)).toBe(false)
      expect(store.hasInInventory('non-existent')).toBe(false)
    })

    it('should get inventory count', () => {
      const store = usePlayerStore.getState()

      act(() => {
        store.addToInventory('content-pack-1', 7)
      })

      expect(store.getInventoryCount('content-pack-1')).toBe(7)
      expect(store.getInventoryCount('non-existent')).toBe(0)
    })
  })

  describe('Position System', () => {
    it('should set position', () => {
      act(() => {
        usePlayerStore.getState().setPosition(10, 20, 'level-1')
      })

      // Get fresh state after the action
      const store = usePlayerStore.getState()
      expect(store.position.x).toBe(10)
      expect(store.position.y).toBe(20)
      expect(store.position.scene).toBe('level-1')
    })

    it('should set position without changing scene', () => {
      act(() => {
        usePlayerStore.getState().setPosition(5, 15)
      })

      // Get fresh state after the action
      const store = usePlayerStore.getState()
      expect(store.position.x).toBe(5)
      expect(store.position.y).toBe(15)
      expect(store.position.scene).toBe('home') // Should remain unchanged
    })

    it('should move by delta', () => {
      act(() => {
        usePlayerStore.getState().setPosition(10, 10)
        usePlayerStore.getState().moveBy(5, -3)
      })

      // Get fresh state after the actions
      const store = usePlayerStore.getState()
      expect(store.position.x).toBe(15)
      expect(store.position.y).toBe(7)
    })
  })

  describe('Achievement System', () => {
    it('should check achievements', () => {
      const store = usePlayerStore.getState()

      act(() => {
        const newAchievements = store.checkAchievements()
        expect(newAchievements).toEqual(['first-steps'])
      })
    })

    it('should get achievement stats', () => {
      const store = usePlayerStore.getState()

      const stats = store.getAchievementStats()

      expect(stats.total).toBe(50)
      expect(stats.unlocked).toBe(5)
      expect(stats.completionPercentage).toBe(10)
    })
  })

  describe('Content Unlocking', () => {
    it('should unlock content', () => {
      const store = usePlayerStore.getState()

      act(() => {
        store.unlockContent('level-2')
      })

      expect(store.hasUnlockedContent('level-2')).toBe(true)
    })

    it('should check unlocked content', () => {
      const store = usePlayerStore.getState()

      act(() => {
        store.unlockContent('level-2')
      })

      expect(store.hasUnlockedContent('level-2')).toBe(true)
      expect(store.hasUnlockedContent('level-3')).toBe(false)
    })
  })

  describe('Save/Load System', () => {
    it('should save game', async () => {
      const store = usePlayerStore.getState()

      await act(async () => {
        const result = await store.saveGame(1, 'Test Save')
        expect(result).toBe(true)
      })

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'vj-game-save-1',
        expect.stringContaining('"name":"Test Save"')
      )
    })

    it('should auto-save to slot 0', async () => {
      const store = usePlayerStore.getState()

      await act(async () => {
        const result = await store.saveGame() // Default slot 0
        expect(result).toBe(true)
      })

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'vj-game-autosave',
        expect.any(String)
      )
    })

    it('should load game', async () => {
      const mockSaveData = {
        playerData: JSON.stringify({ stats: { level: 5, money: 500 } }),
        playtime: 3600,
        timestamp: Date.now()
      }

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockSaveData))

      const store = usePlayerStore.getState()

      await act(async () => {
        const result = await store.loadGame(1)
        expect(result).toBe(true)
      })

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('vj-game-save-1')
    })

    it('should fail to load non-existent save', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const store = usePlayerStore.getState()

      await act(async () => {
        const result = await store.loadGame(1)
        expect(result).toBe(false)
      })
    })

    it('should delete save', () => {
      const store = usePlayerStore.getState()

      act(() => {
        const result = store.deleteSave(1)
        expect(result).toBe(true)
      })

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('vj-game-save-1')
    })

    it('should not delete auto-save slot', () => {
      const store = usePlayerStore.getState()

      act(() => {
        const result = store.deleteSave(0)
        expect(result).toBe(false)
      })

      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled()
    })

    it('should set auto-save preference', () => {
      act(() => {
        usePlayerStore.getState().setAutoSave(false)
      })

      // Get fresh state after the action
      const store = usePlayerStore.getState()
      expect(store.autoSaveEnabled).toBe(false)
    })
  })

  describe('Session Management', () => {
    it('should start session', () => {
      const store = usePlayerStore.getState()
      const beforeTime = Date.now()

      act(() => {
        store.startSession()
      })

      expect(store.sessionStartTime).toBeGreaterThanOrEqual(beforeTime)
    })

    it('should update playtime', () => {
      act(() => {
        usePlayerStore.getState().startSession()
        // Mock passage of time
        vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 10000) // 10 seconds later
        usePlayerStore.getState().updatePlaytime()
      })

      // Get fresh state after the actions
      const store = usePlayerStore.getState()
      expect(store.totalPlaytime).toBeGreaterThan(0)
    })

    it('should get session duration', () => {
      const store = usePlayerStore.getState()

      act(() => {
        store.startSession()
        vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 5000) // 5 seconds later
      })

      const duration = store.getSessionDuration()
      expect(duration).toBeGreaterThanOrEqual(4) // Allow for small timing differences
    })
  })

  describe('Utility Actions', () => {
    it('should reset player', () => {
      const store = usePlayerStore.getState()

      act(() => {
        store.addMoney(500)
        store.addExperience(200)
        store.resetPlayer()
      })

      expect(store.stats.money).toBe(0)
      expect(store.stats.experience).toBe(0)
      expect(store.stats.level).toBe(1)
    })

    it('should export player data', () => {
      const store = usePlayerStore.getState()

      act(() => {
        store.addMoney(100)
      })

      const exportData = store.exportPlayerData()

      expect(exportData).toContain('"version":"1.0"')
      expect(exportData).toContain('"playerData"')
      expect(JSON.parse(exportData)).toHaveProperty('exportedAt')
    })

    it('should import player data', () => {
      const importData = JSON.stringify({
        playerData: JSON.stringify({ stats: { money: 999 } }),
        totalPlaytime: 7200,
        version: '1.0'
      })

      act(() => {
        const result = usePlayerStore.getState().importPlayerData(importData)
        expect(result).toBe(true)
      })

      // Get fresh state after the action
      const store = usePlayerStore.getState()
      expect(store.totalPlaytime).toBe(7200)
    })

    it('should handle invalid import data', () => {
      const store = usePlayerStore.getState()

      act(() => {
        const result = store.importPlayerData('invalid json')
        expect(result).toBe(false)
      })
    })
  })

  describe('Selector Hooks', () => {
    it('should provide player stats selector', () => {
      // Test that the selector functions exist in the main store
      const store = usePlayerStore.getState()

      expect(store.stats).toBeDefined()
      expect(typeof store.addExperience).toBe('function')
      expect(typeof store.addMoney).toBe('function')
    })

    it('should provide player skills selector', () => {
      // Test that the selector functions exist in the main store
      const store = usePlayerStore.getState()

      expect(store.skills).toBeDefined()
      expect(typeof store.upgradeSkill).toBe('function')
      expect(typeof store.canUpgradeSkill).toBe('function')
    })

    it('should provide player equipment selector', () => {
      // Test that the selector functions exist in the main store
      const store = usePlayerStore.getState()

      expect(store.equipment).toBeDefined()
      expect(typeof store.equipItem).toBe('function')
      expect(typeof store.purchaseEquipment).toBe('function')
    })

    it('should provide player inventory selector', () => {
      // Test that the selector functions exist in the main store
      const store = usePlayerStore.getState()

      expect(store.inventory).toBeDefined()
      expect(typeof store.addToInventory).toBe('function')
      expect(typeof store.hasInInventory).toBe('function')
    })

    it('should provide player achievements selector', () => {
      // Test that the selector functions exist in the main store
      const store = usePlayerStore.getState()

      expect(store.achievements).toBeDefined()
      expect(typeof store.checkAchievements).toBe('function')
      expect(typeof store.getAchievementStats).toBe('function')
    })

    it('should provide player save/load selector', () => {
      // Test that the selector functions exist in the main store
      const store = usePlayerStore.getState()

      expect(typeof store.saveGame).toBe('function')
      expect(typeof store.loadGame).toBe('function')
      expect(typeof store.autoSaveEnabled).toBe('boolean')
    })
  })

  describe('Data Consistency', () => {
    it('should refresh player data after actions', () => {
      act(() => {
        usePlayerStore.getState().addMoney(100)
      })

      // Get fresh state after the action
      const store = usePlayerStore.getState()
      // Check that cached stats match player stats
      expect(store.stats.money).toBe(store.player.getStats().money)
    })

    it('should maintain inventory consistency', () => {
      act(() => {
        usePlayerStore.getState().addToInventory('test-item', 5)
      })

      // Get fresh state after the action
      const store = usePlayerStore.getState()
      expect(store.inventory.get('test-item')).toBe(5)
      expect(store.player.getInventoryCount('test-item')).toBe(5)
    })

    it('should maintain position consistency', () => {
      act(() => {
        usePlayerStore.getState().setPosition(25, 30, 'test-scene')
      })

      // Get fresh state after the action
      const store = usePlayerStore.getState()
      expect(store.position.x).toBe(25)
      expect(store.position.y).toBe(30)
      expect(store.position.scene).toBe('test-scene')

      const playerPosition = store.player.getPosition()
      expect(playerPosition.x).toBe(25)
      expect(playerPosition.y).toBe(30)
      expect(playerPosition.scene).toBe('test-scene')
    })
  })
})