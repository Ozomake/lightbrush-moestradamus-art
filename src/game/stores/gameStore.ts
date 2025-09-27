import { create } from 'zustand'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: Date
}

export interface ProjectionPattern {
  id: string
  name: string
  type: 'geometric' | 'organic' | 'text' | 'image'
  complexity: number
  unlocked: boolean
}

export interface GameState {
  // Player progress
  level: number
  experience: number
  experienceToNext: number

  // Current level state
  currentLevel: string
  levelProgress: number

  // Achievements
  achievements: Achievement[]

  // Unlocked content
  unlockedPatterns: ProjectionPattern[]

  // Tutorial state
  tutorialStep: number
  tutorialCompleted: boolean

  // Projection mapping state
  projectorPosition: [number, number, number]
  projectorRotation: [number, number, number]
  selectedPattern: string | null
  projectionParameters: {
    size: number
    intensity: number
    keystone: { x: number; y: number; z: number; w: number }
  }

  // Actions
  addExperience: (amount: number) => void
  unlockAchievement: (achievementId: string) => void
  setTutorialStep: (step: number) => void
  completeTutorial: () => void
  updateProjectorPosition: (position: [number, number, number]) => void
  updateProjectorRotation: (rotation: [number, number, number]) => void
  selectPattern: (patternId: string) => void
  updateProjectionParameters: (params: Partial<GameState['projectionParameters']>) => void
  unlockPattern: (patternId: string) => void
  setLevelProgress: (progress: number) => void
  resetLevel: () => void
}

const initialAchievements: Achievement[] = [
  {
    id: 'first-light',
    title: 'First Light',
    description: 'Successfully create your first projection',
    icon: '💡',
    unlocked: false
  },
  {
    id: 'cabinet-master',
    title: 'Cabinet Master',
    description: 'Master projection mapping on kitchen cabinets',
    icon: '🏆',
    unlocked: false
  },
  {
    id: 'pixel-perfect',
    title: 'Pixel Perfect',
    description: 'Achieve perfect alignment in projection mapping',
    icon: '🎯',
    unlocked: false
  },
  {
    id: 'color-harmony',
    title: 'Color Harmony',
    description: 'Successfully match colors to wood textures',
    icon: '🎨',
    unlocked: false
  }
]

const initialPatterns: ProjectionPattern[] = [
  {
    id: 'simple-square',
    name: 'Simple Square',
    type: 'geometric',
    complexity: 1,
    unlocked: true
  },
  {
    id: 'circle',
    name: 'Circle',
    type: 'geometric',
    complexity: 1,
    unlocked: true
  },
  {
    id: 'triangle',
    name: 'Triangle',
    type: 'geometric',
    complexity: 1,
    unlocked: true
  },
  {
    id: 'diamond',
    name: 'Diamond',
    type: 'geometric',
    complexity: 2,
    unlocked: false
  },
  {
    id: 'hexagon',
    name: 'Hexagon',
    type: 'geometric',
    complexity: 2,
    unlocked: false
  },
  {
    id: 'spiral',
    name: 'Spiral',
    type: 'organic',
    complexity: 3,
    unlocked: false
  }
]

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  level: 1,
  experience: 0,
  experienceToNext: 100,
  currentLevel: 'level1-kitchen',
  levelProgress: 0,
  achievements: initialAchievements,
  unlockedPatterns: initialPatterns,
  tutorialStep: 0,
  tutorialCompleted: false,
  projectorPosition: [0, 2, 5],
  projectorRotation: [0, 0, 0],
  selectedPattern: 'simple-square',
  projectionParameters: {
    size: 1.0,
    intensity: 0.8,
    keystone: { x: 0, y: 0, z: 0, w: 0 }
  },

  // Actions
  addExperience: (amount: number) => {
    set((state) => {
      const newExperience = state.experience + amount
      const newLevel = Math.floor(newExperience / 100) + 1
      const experienceToNext = (newLevel * 100) - newExperience

      return {
        experience: newExperience,
        level: newLevel,
        experienceToNext: Math.max(0, experienceToNext)
      }
    })
  },

  unlockAchievement: (achievementId: string) => {
    set((state) => ({
      achievements: state.achievements.map(achievement =>
        achievement.id === achievementId
          ? { ...achievement, unlocked: true, unlockedAt: new Date() }
          : achievement
      )
    }))

    // Add experience for unlocking achievements
    get().addExperience(25)
  },

  setTutorialStep: (step: number) => {
    set({ tutorialStep: step })
  },

  completeTutorial: () => {
    set({ tutorialCompleted: true, tutorialStep: -1 })
    get().addExperience(50)
    get().unlockAchievement('first-light')
  },

  updateProjectorPosition: (position: [number, number, number]) => {
    set({ projectorPosition: position })
  },

  updateProjectorRotation: (rotation: [number, number, number]) => {
    set({ projectorRotation: rotation })
  },

  selectPattern: (patternId: string) => {
    const pattern = get().unlockedPatterns.find(p => p.id === patternId && p.unlocked)
    if (pattern) {
      set({ selectedPattern: patternId })
    }
  },

  updateProjectionParameters: (params) => {
    set((state) => ({
      projectionParameters: { ...state.projectionParameters, ...params }
    }))
  },

  unlockPattern: (patternId: string) => {
    set((state) => ({
      unlockedPatterns: state.unlockedPatterns.map(pattern =>
        pattern.id === patternId ? { ...pattern, unlocked: true } : pattern
      )
    }))
  },

  setLevelProgress: (progress: number) => {
    set({ levelProgress: Math.max(0, Math.min(100, progress)) })

    // Check if level is completed
    if (progress >= 100) {
      get().addExperience(100)
      get().unlockAchievement('cabinet-master')
    }
  },

  resetLevel: () => {
    set({
      levelProgress: 0,
      tutorialStep: 0,
      tutorialCompleted: false,
      projectorPosition: [0, 2, 5],
      projectorRotation: [0, 0, 0],
      selectedPattern: 'simple-square',
      projectionParameters: {
        size: 1.0,
        intensity: 0.8,
        keystone: { x: 0, y: 0, z: 0, w: 0 }
      }
    })
  }
}))