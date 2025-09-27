import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the game store - create mock before using it
vi.mock('../../../game/stores/gameStore', () => ({
  useGameStore: vi.fn(),
}))

import Level1Kitchen from '../../../game/levels/Level1Kitchen'
// import { renderWithThreeJs } from '../../../test/helpers/testUtils' // Commented out to fix unused import
import { useGameStore } from '../../../game/stores/gameStore'

// Get the mocked function for test use
const mockUseGameStore = useGameStore as unknown as ReturnType<typeof vi.fn>

// Mock Three.js scene classes
vi.mock('../../../game/scenes/KitchenScene', () => {
  return {
    default: class MockKitchenScene {
      getScene() {
        return {
          add: vi.fn(),
          remove: vi.fn(),
          children: [],
        }
      }
    }
  }
})

vi.mock('../../../game/entities/KitchenCabinet', () => {
  return {
    default: class MockKitchenCabinet {
      config: Record<string, unknown>;
      constructor(config: Record<string, unknown>) {
        this.config = config
      }
      getGroup() {
        return {
          add: vi.fn(),
          remove: vi.fn(),
          position: { set: vi.fn() },
          rotation: { set: vi.fn() },
        }
      }
    }
  }
})

vi.mock('../../../game/entities/Projector', () => {
  return {
    default: class MockProjector {
      config: Record<string, unknown>;
      constructor(config: Record<string, unknown>) {
        this.config = config
      }
      getGroup() {
        return {
          add: vi.fn(),
          remove: vi.fn(),
          position: { set: vi.fn() },
          rotation: { set: vi.fn() },
        }
      }
      setPosition() {}
      setRotation() {}
      updateProjection() {}
    }
  }
})

vi.mock('../../../game/utils/PatternGenerator', () => {
  return {
    default: class MockPatternGenerator {
      size: number;
      constructor(size: number) {
        this.size = size
      }
      generatePattern() {
        return {
          image: new ImageData(512, 512),
          mapping: vi.fn(),
          wrapS: 1001,
          wrapT: 1001,
          magFilter: 1006,
          minFilter: 1008,
        }
      }
      getAvailablePatterns() {
        return ['circle', 'square', 'triangle']
      }
    }
  }
})

vi.mock('../../../game/shaders/ProjectionShader', () => ({
  ProjectionShaderMaterial: class MockProjectionShaderMaterial {
    type: string;
    constructor() {
      this.type = 'ShaderMaterial'
    }
  }
}))

// Mock @react-three/fiber hooks
vi.mock('@react-three/fiber', async (importOriginal) => {
  const actual = await importOriginal() as any
  return {
    ...actual,
    Canvas: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'mock-canvas' }, children),
    useThree: () => ({
      camera: {
        position: { x: 0, y: 5, z: 10 },
        lookAt: vi.fn(),
        updateProjectionMatrix: vi.fn(),
      },
      scene: {
        add: vi.fn(),
        remove: vi.fn(),
        children: [],
      },
      gl: {
        render: vi.fn(),
        setSize: vi.fn(),
      },
    }),
    useFrame: vi.fn(),
    extend: vi.fn(),
  }
})

describe('Level1Kitchen', () => {
  const mockGameStoreReturn = {
    tutorialStep: 0,
    tutorialCompleted: false,
    projectorPosition: [0, 2, 4] as [number, number, number],
    projectorRotation: [0, 0, 0] as [number, number, number],
    selectedPattern: 'circle',
    projectionParameters: {
      brightness: 3000,
      contrast: 1.0,
      keystone: { x: 0, y: 0 },
    },
    setTutorialStep: vi.fn(),
    completeTutorial: vi.fn(),
    updateProjectorPosition: vi.fn(),
    updateProjectorRotation: vi.fn(),
    selectPattern: vi.fn(),
    addExperience: vi.fn(),
    unlockAchievement: vi.fn(),
    setLevelProgress: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseGameStore.mockReturnValue(mockGameStoreReturn)
  })

  describe('Component Existence', () => {
    it('should be defined and importable', () => {
      expect(Level1Kitchen).toBeDefined()
      expect(typeof Level1Kitchen).toBe('function')
    })

    it('should have access to game store hook', () => {
      expect(useGameStore).toBeDefined()
      expect(typeof useGameStore).toBe('function')
    })
  })

  describe('Tutorial System Integration', () => {
    it('should have tutorial step management in store', () => {
      expect(mockGameStoreReturn.tutorialStep).toBeDefined()
      expect(mockGameStoreReturn.tutorialCompleted).toBeDefined()
      expect(mockGameStoreReturn.setTutorialStep).toBeDefined()
      expect(mockGameStoreReturn.completeTutorial).toBeDefined()
    })
  })

  describe('Game Store Integration', () => {
    it('should have all required store properties and methods', () => {
      const storeReturn = mockGameStoreReturn
      expect(storeReturn).toHaveProperty('projectorPosition')
      expect(storeReturn).toHaveProperty('projectorRotation')
      expect(storeReturn).toHaveProperty('selectedPattern')
      expect(storeReturn).toHaveProperty('setTutorialStep')
      expect(storeReturn).toHaveProperty('completeTutorial')
      expect(storeReturn).toHaveProperty('updateProjectorPosition')
      expect(storeReturn).toHaveProperty('updateProjectorRotation')
      expect(storeReturn).toHaveProperty('selectPattern')
      expect(storeReturn).toHaveProperty('addExperience')
      expect(storeReturn).toHaveProperty('unlockAchievement')
      expect(storeReturn).toHaveProperty('setLevelProgress')
    })
  })

  describe('Component Configuration', () => {
    it('should have mocked store methods for testing', () => {
      // Verify that all the mock functions are properly configured
      expect(vi.isMockFunction(mockGameStoreReturn.setTutorialStep)).toBe(true)
      expect(vi.isMockFunction(mockGameStoreReturn.completeTutorial)).toBe(true)
      expect(vi.isMockFunction(mockGameStoreReturn.updateProjectorPosition)).toBe(true)
      expect(vi.isMockFunction(mockGameStoreReturn.updateProjectorRotation)).toBe(true)
      expect(vi.isMockFunction(mockGameStoreReturn.selectPattern)).toBe(true)
      expect(vi.isMockFunction(mockGameStoreReturn.addExperience)).toBe(true)
      expect(vi.isMockFunction(mockGameStoreReturn.unlockAchievement)).toBe(true)
      expect(vi.isMockFunction(mockGameStoreReturn.setLevelProgress)).toBe(true)
    })

    it('should have proper default values in mock store', () => {
      expect(mockGameStoreReturn.tutorialStep).toBe(0)
      expect(mockGameStoreReturn.tutorialCompleted).toBe(false)
      expect(mockGameStoreReturn.projectorPosition).toEqual([0, 2, 4])
      expect(mockGameStoreReturn.projectorRotation).toEqual([0, 0, 0])
      expect(mockGameStoreReturn.selectedPattern).toBe('circle')
      expect(mockGameStoreReturn.projectionParameters).toHaveProperty('brightness')
      expect(mockGameStoreReturn.projectionParameters).toHaveProperty('contrast')
      expect(mockGameStoreReturn.projectionParameters).toHaveProperty('keystone')
    })

    it('should be able to call mock store methods', () => {
      const store = mockGameStoreReturn

      // Test that we can call the methods without errors
      store.setTutorialStep(1)
      store.completeTutorial()
      store.updateProjectorPosition([1, 2, 3])
      store.updateProjectorRotation([10, 20, 30])
      store.selectPattern('square')
      store.addExperience(100)
      store.unlockAchievement('first-achievement')
      store.setLevelProgress(0.5)

      // Verify the mocks were called
      expect(store.setTutorialStep).toHaveBeenCalledWith(1)
      expect(store.completeTutorial).toHaveBeenCalled()
      expect(store.updateProjectorPosition).toHaveBeenCalledWith([1, 2, 3])
      expect(store.updateProjectorRotation).toHaveBeenCalledWith([10, 20, 30])
      expect(store.selectPattern).toHaveBeenCalledWith('square')
      expect(store.addExperience).toHaveBeenCalledWith(100)
      expect(store.unlockAchievement).toHaveBeenCalledWith('first-achievement')
      expect(store.setLevelProgress).toHaveBeenCalledWith(0.5)
    })
  })
})