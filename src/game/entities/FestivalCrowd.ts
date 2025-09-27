import * as THREE from 'three'

export type CrowdMood = 'excited' | 'happy' | 'neutral' | 'bored' | 'leaving'
export type CrowdDensity = 'sparse' | 'moderate' | 'packed' | 'overcrowded'

export interface CrowdMember {
  id: string
  position: THREE.Vector3
  velocity: THREE.Vector3
  mood: CrowdMood
  energy: number // 0-100
  satisfaction: number // 0-100
  patience: number // 0-100
  favoriteGenre: string
  timeAtFestival: number // minutes
  spentMoney: number
  group: string | null // Group ID if part of a group
}

export interface CrowdArea {
  id: string
  center: THREE.Vector3
  radius: number
  capacity: number
  currentCount: number
  density: CrowdDensity
  averageEnergy: number
  averageSatisfaction: number
  dominantMood: CrowdMood
  stageDistance: number
  soundQuality: number // 0-1
  visualQuality: number // 0-1
}

export interface CrowdMetrics {
  totalAttendance: number
  peakAttendance: number
  averageEnergy: number
  averageSatisfaction: number
  totalRevenue: number
  moodDistribution: { [mood in CrowdMood]: number }
  retentionRate: number // percentage staying vs leaving
  wordOfMouth: number // social media buzz factor
}

export interface CrowdBehaviorConfig {
  baseMovementSpeed: number
  socialDistancePreference: number
  stageAttractionStrength: number
  moodContagionRate: number
  patienceDecayRate: number
  energyDecayRate: number
  satisfactionThreshold: number
  leavingThreshold: number
}

export class FestivalCrowd {
  private members: Map<string, CrowdMember> = new Map()
  private crowdAreas: Map<string, CrowdArea> = new Map()
  private crowdGroup: THREE.Group = new THREE.Group()
  private instancedMeshes: Map<CrowdMood, THREE.InstancedMesh> = new Map()

  // Crowd simulation parameters
  private behaviorConfig: CrowdBehaviorConfig = {
    baseMovementSpeed: 0.5,
    socialDistancePreference: 1.0,
    stageAttractionStrength: 2.0,
    moodContagionRate: 0.1,
    patienceDecayRate: 0.05,
    energyDecayRate: 0.02,
    satisfactionThreshold: 60,
    leavingThreshold: 30
  }

  // Crowd metrics
  private metrics: CrowdMetrics = {
    totalAttendance: 0,
    peakAttendance: 0,
    averageEnergy: 50,
    averageSatisfaction: 50,
    totalRevenue: 0,
    moodDistribution: {
      excited: 0,
      happy: 0,
      neutral: 0,
      bored: 0,
      leaving: 0
    },
    retentionRate: 100,
    wordOfMouth: 50
  }

  // Visual representation
  private crowdGeometry!: THREE.BufferGeometry
  private crowdMaterials: Map<CrowdMood, THREE.MeshLambertMaterial> = new Map()
  private maxCrowdSize: number = 1000

  // Audio analysis for crowd reaction
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private frequencyData: Uint8Array = new Uint8Array()

  // Performance tracking
  private currentPerformance: {
    stageId: string
    genre: string
    energy: number
    startTime: number
  } | null = null

  // Crowd spawning areas
  private spawnAreas: THREE.Vector3[] = [
    new THREE.Vector3(-40, 0, 20),  // Festival entrance
    new THREE.Vector3(40, 0, 20),   // Side entrance
    new THREE.Vector3(0, 0, 40)     // Back entrance
  ]

  // Weather effects
  private weatherImpact: number = 1.0

  constructor(maxCrowdSize: number = 1000) {
    this.maxCrowdSize = maxCrowdSize
    this.crowdGroup.name = 'festival_crowd'

    this.initializeCrowdAreas()
    this.createCrowdMaterials()
    this.createInstancedMeshes()
    this.initializeAudioAnalysis()

    // Start with some initial crowd
    this.spawnInitialCrowd()
  }

  private initializeCrowdAreas(): void {
    // Define crowd areas around different stages
    const areas: Omit<CrowdArea, 'currentCount' | 'density' | 'averageEnergy' | 'averageSatisfaction' | 'dominantMood'>[] = [
      {
        id: 'main_stage_pit',
        center: new THREE.Vector3(0, 0, -15),
        radius: 12,
        capacity: 500,
        stageDistance: 5,
        soundQuality: 0.9,
        visualQuality: 0.95
      },
      {
        id: 'main_stage_general',
        center: new THREE.Vector3(0, 0, -5),
        radius: 20,
        capacity: 800,
        stageDistance: 15,
        soundQuality: 0.8,
        visualQuality: 0.7
      },
      {
        id: 'edm_tent_floor',
        center: new THREE.Vector3(-25, 0, -10),
        radius: 8,
        capacity: 300,
        stageDistance: 3,
        soundQuality: 0.95,
        visualQuality: 0.85
      },
      {
        id: 'art_pavilion_circle',
        center: new THREE.Vector3(25, 0, -10),
        radius: 10,
        capacity: 200,
        stageDistance: 4,
        soundQuality: 0.7,
        visualQuality: 0.9
      },
      {
        id: 'chill_zone_lawn',
        center: new THREE.Vector3(0, 0, 15),
        radius: 15,
        capacity: 400,
        stageDistance: 8,
        soundQuality: 0.6,
        visualQuality: 0.6
      },
      {
        id: 'festival_midway',
        center: new THREE.Vector3(0, 0, 0),
        radius: 25,
        capacity: 600,
        stageDistance: 20,
        soundQuality: 0.4,
        visualQuality: 0.3
      }
    ]

    areas.forEach(areaConfig => {
      const area: CrowdArea = {
        ...areaConfig,
        currentCount: 0,
        density: 'sparse',
        averageEnergy: 50,
        averageSatisfaction: 60,
        dominantMood: 'neutral'
      }
      this.crowdAreas.set(area.id, area)
    })
  }

  private createCrowdMaterials(): void {
    const moodColors = {
      excited: 0xff6b6b,    // Red - high energy
      happy: 0x4ecdc4,      // Cyan - positive
      neutral: 0x95a5a6,    // Gray - neutral
      bored: 0x7f8c8d,      // Dark gray - low energy
      leaving: 0x2c3e50     // Dark blue - leaving
    }

    Object.entries(moodColors).forEach(([mood, color]) => {
      const material = new THREE.MeshLambertMaterial({
        color,
        transparent: true,
        opacity: 0.8
      })
      this.crowdMaterials.set(mood as CrowdMood, material)
    })
  }

  private createInstancedMeshes(): void {
    // Simple crowd member geometry (capsule-like)
    this.crowdGeometry = new THREE.CapsuleGeometry(0.3, 1.2, 4, 8)

    // Create instanced meshes for each mood
    this.crowdMaterials.forEach((material, mood) => {
      const instancedMesh = new THREE.InstancedMesh(
        this.crowdGeometry,
        material,
        Math.floor(this.maxCrowdSize / 5) // Distribute instances across moods
      )

      instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
      instancedMesh.name = `crowd_${mood}`
      instancedMesh.castShadow = true
      instancedMesh.receiveShadow = true

      this.instancedMeshes.set(mood, instancedMesh)
      this.crowdGroup.add(instancedMesh)
    })
  }

  private initializeAudioAnalysis(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 256
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount)
    } catch (error) {
      console.warn('Audio analysis not available:', error)
    }
  }

  private spawnInitialCrowd(): void {
    // Start with 20% of max capacity
    const initialCount = Math.floor(this.maxCrowdSize * 0.2)

    for (let i = 0; i < initialCount; i++) {
      this.spawnCrowdMember()
    }

    this.updateInstancedMeshes()
  }

  public spawnCrowdMember(targetArea?: string): string {
    if (this.members.size >= this.maxCrowdSize) {
      return '' // At capacity
    }

    const memberId = `member_${Date.now()}_${Math.random()}`

    // Choose spawn location
    const spawnArea = this.spawnAreas[Math.floor(Math.random() * this.spawnAreas.length)]
    const spawnOffset = new THREE.Vector3(
      (Math.random() - 0.5) * 10,
      0,
      (Math.random() - 0.5) * 10
    )

    const member: CrowdMember = {
      id: memberId,
      position: spawnArea.clone().add(spawnOffset),
      velocity: new THREE.Vector3(),
      mood: this.getRandomMood(),
      energy: 40 + Math.random() * 40, // 40-80 initial energy
      satisfaction: 50 + Math.random() * 30, // 50-80 initial satisfaction
      patience: 80 + Math.random() * 20, // 80-100 initial patience
      favoriteGenre: this.getRandomGenre(),
      timeAtFestival: 0,
      spentMoney: 0,
      group: Math.random() < 0.3 ? this.createOrFindGroup() : null
    }

    this.members.set(memberId, member)
    this.metrics.totalAttendance++

    // Assign to appropriate area
    if (targetArea) {
      this.moveCrowdMemberToArea(memberId, targetArea)
    } else {
      this.assignCrowdMemberToArea(memberId)
    }

    return memberId
  }

  private getRandomMood(): CrowdMood {
    const moods: CrowdMood[] = ['excited', 'happy', 'neutral', 'bored']
    const weights = [0.2, 0.4, 0.3, 0.1] // Weighted towards positive moods initially

    const random = Math.random()
    let cumulative = 0

    for (let i = 0; i < moods.length; i++) {
      cumulative += weights[i]
      if (random < cumulative) {
        return moods[i]
      }
    }

    return 'neutral'
  }

  private getRandomGenre(): string {
    const genres = ['electronic', 'rock', 'indie', 'pop', 'techno', 'ambient', 'folk', 'hip-hop']
    return genres[Math.floor(Math.random() * genres.length)]
  }

  private createOrFindGroup(): string {
    // Simple group system - for now just return a random group ID
    const groupSize = Math.random() < 0.7 ? 2 : Math.random() < 0.9 ? 3 : 4
    return `group_${Date.now()}_${groupSize}`
  }

  private assignCrowdMemberToArea(memberId: string): void {
    const member = this.members.get(memberId)
    if (!member) return

    // Find the best area based on member preferences and area capacity
    let bestArea: CrowdArea | null = null
    let bestScore = -1

    this.crowdAreas.forEach(area => {
      if (area.currentCount >= area.capacity) return

      let score = 0

      // Prefer areas with better sound/visual quality
      score += area.soundQuality * 30
      score += area.visualQuality * 30

      // Prefer areas with similar energy levels
      score += Math.max(0, 20 - Math.abs(member.energy - area.averageEnergy))

      // Avoid overcrowded areas
      const crowdedness = area.currentCount / area.capacity
      score += Math.max(0, 20 - crowdedness * 40)

      // Random factor for variety
      score += Math.random() * 10

      if (score > bestScore) {
        bestScore = score
        bestArea = area
      }
    })

    if (bestArea) {
      (bestArea as CrowdArea).currentCount++
      this.updateAreaDensity(bestArea)
    }
  }

  private moveCrowdMemberToArea(memberId: string, areaId: string): void {
    const member = this.members.get(memberId)
    const area = this.crowdAreas.get(areaId)

    if (!member || !area || area.currentCount >= area.capacity) return

    // Remove from current area (simplified - in full implementation would track current area)

    // Add to new area
    area.currentCount++
    this.updateAreaDensity(area)

    // Set movement target
    const targetPosition = this.getRandomPositionInArea(area)
    this.setMemberTarget(member, targetPosition)
  }

  private getRandomPositionInArea(area: CrowdArea): THREE.Vector3 {
    const angle = Math.random() * Math.PI * 2
    const distance = Math.random() * area.radius * 0.8 // Stay within 80% of radius

    return new THREE.Vector3(
      area.center.x + Math.cos(angle) * distance,
      0,
      area.center.z + Math.sin(angle) * distance
    )
  }

  private setMemberTarget(member: CrowdMember, target: THREE.Vector3): void {
    const direction = target.clone().sub(member.position).normalize()
    member.velocity.copy(direction.multiplyScalar(this.behaviorConfig.baseMovementSpeed))
  }

  private updateAreaDensity(area: CrowdArea): void {
    const crowdedness = area.currentCount / area.capacity

    if (crowdedness < 0.3) {
      area.density = 'sparse'
    } else if (crowdedness < 0.7) {
      area.density = 'moderate'
    } else if (crowdedness < 1.0) {
      area.density = 'packed'
    } else {
      area.density = 'overcrowded'
    }
  }

  public startPerformance(stageId: string, genre: string, energyLevel: number): void {
    this.currentPerformance = {
      stageId,
      genre,
      energy: energyLevel,
      startTime: Date.now()
    }

    // Attract crowd to the performance area
    this.attractCrowdToPerformance()

    // Boost mood based on performance match
    this.boostMoodForPerformance()
  }

  private attractCrowdToPerformance(): void {
    if (!this.currentPerformance) return

    const performanceArea = this.findAreaNearStage(this.currentPerformance.stageId)
    if (!performanceArea) return

    // Attract members who like this genre
    this.members.forEach(member => {
      if (member.favoriteGenre === this.currentPerformance!.genre || Math.random() < 0.3) {
        // Move towards performance area
        this.moveCrowdMemberToArea(member.id, performanceArea.id)

        // Boost energy and satisfaction
        member.energy = Math.min(100, member.energy + 20)
        member.satisfaction = Math.min(100, member.satisfaction + 15)

        // Update mood based on energy
        this.updateMemberMood(member)
      }
    })
  }

  private findAreaNearStage(stageId: string): CrowdArea | null {
    // Simple mapping - in full implementation would use proper stage positions
    const stageAreaMap: { [stageId: string]: string } = {
      'main_stage': 'main_stage_pit',
      'edm_tent': 'edm_tent_floor',
      'art_pavilion': 'art_pavilion_circle',
      'chill_zone': 'chill_zone_lawn'
    }

    const areaId = stageAreaMap[stageId]
    return areaId ? this.crowdAreas.get(areaId) || null : null
  }

  private boostMoodForPerformance(): void {
    if (!this.currentPerformance) return

    this.members.forEach(member => {
      // Genre match bonus
      const genreMatch = member.favoriteGenre === this.currentPerformance!.genre

      if (genreMatch) {
        member.energy = Math.min(100, member.energy + 25)
        member.satisfaction = Math.min(100, member.satisfaction + 20)
      } else if (Math.random() < 0.5) {
        // Some members enjoy performances outside their preference
        member.energy = Math.min(100, member.energy + 10)
        member.satisfaction = Math.min(100, member.satisfaction + 5)
      }

      this.updateMemberMood(member)
    })
  }

  public endPerformance(): void {
    if (!this.currentPerformance) return

    // Calculate performance impact
    const performanceDuration = (Date.now() - this.currentPerformance.startTime) / 1000 / 60 // minutes

    // Gradual energy decay after performance
    this.members.forEach(member => {
      member.energy = Math.max(20, member.energy - performanceDuration * 0.5)
      this.updateMemberMood(member)
    })

    this.currentPerformance = null
  }

  private updateMemberMood(member: CrowdMember): void {
    // const prevMood = member.mood // Commented out to fix unused variable

    // Determine mood based on energy, satisfaction, and patience
    if (member.satisfaction < this.behaviorConfig.leavingThreshold || member.patience < 20) {
      member.mood = 'leaving'
    } else if (member.energy > 80 && member.satisfaction > 70) {
      member.mood = 'excited'
    } else if (member.energy > 60 && member.satisfaction > 50) {
      member.mood = 'happy'
    } else if (member.energy < 30 || member.satisfaction < 40) {
      member.mood = 'bored'
    } else {
      member.mood = 'neutral'
    }

    // Mood contagion - influenced by nearby members
    if (Math.random() < this.behaviorConfig.moodContagionRate) {
      this.applyMoodContagion(member)
    }
  }

  private applyMoodContagion(member: CrowdMember): void {
    const nearbyMembers = this.findNearbyMembers(member, 3.0)

    if (nearbyMembers.length === 0) return

    // Calculate average mood influence
    const moodScores = {
      excited: 0,
      happy: 0,
      neutral: 0,
      bored: 0,
      leaving: 0
    }

    nearbyMembers.forEach(nearby => {
      moodScores[nearby.mood]++
    })

    // Find dominant mood
    let dominantMood: CrowdMood = 'neutral'
    let maxScore = 0

    Object.entries(moodScores).forEach(([mood, score]) => {
      if (score > maxScore) {
        maxScore = score
        dominantMood = mood as CrowdMood
      }
    })

    // Slight influence towards dominant mood
    if (dominantMood !== member.mood && Math.random() < 0.3) {
      // Adjust satisfaction/energy slightly towards dominant mood
      const mood = dominantMood as CrowdMood
      if (mood === 'excited' || mood === 'happy') {
        member.satisfaction = Math.min(100, member.satisfaction + 5)
        member.energy = Math.min(100, member.energy + 3)
      } else if (mood === 'bored' || mood === 'leaving') {
        member.satisfaction = Math.max(0, member.satisfaction - 3)
        member.energy = Math.max(0, member.energy - 2)
      }
      // neutral mood requires no adjustment
    }
  }

  private findNearbyMembers(member: CrowdMember, radius: number): CrowdMember[] {
    const nearby: CrowdMember[] = []

    this.members.forEach(other => {
      if (other.id !== member.id) {
        const distance = member.position.distanceTo(other.position)
        if (distance <= radius) {
          nearby.push(other)
        }
      }
    })

    return nearby
  }

  public applyWeatherEffects(weatherType: string, intensity: number): void {
    this.weatherImpact = 1.0

    switch (weatherType) {
      case 'rain':
        this.weatherImpact = 0.7 - (intensity * 0.3)
        // People seek shelter or leave
        this.members.forEach(member => {
          member.satisfaction -= intensity * 20
          member.patience -= intensity * 15
          if (member.satisfaction < 30) {
            member.mood = 'leaving'
          }
        })
        break

      case 'storm':
        this.weatherImpact = 0.4
        // Most people leave in storms
        this.members.forEach(member => {
          member.satisfaction -= 40
          member.patience -= 30
          member.mood = 'leaving'
        })
        break

      case 'clear':
        this.weatherImpact = 1.2
        // Good weather boosts mood
        this.members.forEach(member => {
          member.satisfaction = Math.min(100, member.satisfaction + 10)
        })
        break
    }

    this.updateAllMemberMoods()
  }

  private updateAllMemberMoods(): void {
    this.members.forEach(member => {
      this.updateMemberMood(member)
    })
  }

  public addAudioSource(audioElement: HTMLAudioElement): void {
    if (!this.audioContext || !this.analyser) return

    try {
      const source = this.audioContext.createMediaElementSource(audioElement)
      source.connect(this.analyser)
      this.analyser.connect(this.audioContext.destination)
    } catch (error) {
      console.warn('Failed to connect audio source:', error)
    }
  }

  private analyzeAudio(): { bass: number, mid: number, treble: number, volume: number } {
    if (!this.analyser) {
      return { bass: 0, mid: 0, treble: 0, volume: 0 }
    }

    this.analyser.getByteFrequencyData(this.frequencyData)

    // Analyze frequency ranges
    const bass = this.getAverageFrequency(0, 10) / 255
    const mid = this.getAverageFrequency(10, 80) / 255
    const treble = this.getAverageFrequency(80, 128) / 255
    const volume = this.getAverageFrequency(0, 128) / 255

    return { bass, mid, treble, volume }
  }

  private getAverageFrequency(startIndex: number, endIndex: number): number {
    let sum = 0
    for (let i = startIndex; i < endIndex && i < this.frequencyData.length; i++) {
      sum += this.frequencyData[i]
    }
    return sum / (endIndex - startIndex)
  }

  public update(deltaTime: number): void {
    // Analyze audio for crowd reactions
    const audioAnalysis = this.analyzeAudio()

    // Update each crowd member
    this.members.forEach(member => {
      this.updateCrowdMember(member, deltaTime, audioAnalysis)
    })

    // Remove members who are leaving
    this.removeReadyToLeaveCrowdMembers()

    // Spawn new members periodically
    if (Math.random() < 0.01 * this.weatherImpact) { // 1% chance per frame, modified by weather
      this.spawnCrowdMember()
    }

    // Update area metrics
    this.updateAreaMetrics()

    // Update crowd metrics
    this.updateCrowdMetrics()

    // Update visual representation
    this.updateInstancedMeshes()
  }

  private updateCrowdMember(member: CrowdMember, deltaTime: number, audio: { bass: number, mid: number, treble: number, volume: number }): void {
    // Update time at festival
    member.timeAtFestival += deltaTime / 60 // Convert to minutes

    // Natural energy decay
    member.energy = Math.max(0, member.energy - this.behaviorConfig.energyDecayRate * deltaTime)

    // Patience decay over time
    member.patience = Math.max(0, member.patience - this.behaviorConfig.patienceDecayRate * deltaTime)

    // React to audio if performance is happening
    if (this.currentPerformance && audio.volume > 0.1) {
      const reactionStrength = this.calculateAudioReaction(member, audio)

      member.energy = Math.min(100, member.energy + reactionStrength * deltaTime * 10)
      member.satisfaction = Math.min(100, member.satisfaction + reactionStrength * deltaTime * 5)
    }

    // Update position (simplified movement)
    this.updateMemberMovement(member, deltaTime)

    // Update mood based on current state
    this.updateMemberMood(member)

    // Spending simulation
    if (Math.random() < 0.001) { // Small chance to buy something
      const spent = 5 + Math.random() * 15 // $5-20
      member.spentMoney += spent
      this.metrics.totalRevenue += spent
      member.satisfaction = Math.min(100, member.satisfaction + 2)
    }
  }

  private calculateAudioReaction(member: CrowdMember, audio: { bass: number, mid: number, treble: number, volume: number }): number {
    let reaction = 0

    // Base reaction to volume
    reaction += audio.volume * 0.5

    // Genre-specific reactions
    if (this.currentPerformance) {
      switch (this.currentPerformance.genre) {
        case 'electronic':
        case 'techno':
          reaction += audio.bass * 0.8 + audio.treble * 0.6
          break
        case 'rock':
          reaction += audio.mid * 0.8 + audio.bass * 0.5
          break
        case 'ambient':
          reaction += (audio.mid + audio.treble) * 0.4
          break
        default:
          reaction += (audio.bass + audio.mid + audio.treble) * 0.3
      }
    }

    // Member preference modifier
    if (this.currentPerformance && member.favoriteGenre === this.currentPerformance.genre) {
      reaction *= 1.5
    }

    return Math.min(1, reaction)
  }

  private updateMemberMovement(member: CrowdMember, deltaTime: number): void {
    // Simple movement towards velocity target
    member.position.add(member.velocity.clone().multiplyScalar(deltaTime))

    // Add some randomness to movement
    if (Math.random() < 0.1) {
      const randomDirection = new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        0,
        (Math.random() - 0.5) * 0.2
      )
      member.velocity.add(randomDirection)
      member.velocity.clampLength(0, this.behaviorConfig.baseMovementSpeed)
    }

    // Keep members within festival bounds
    member.position.x = Math.max(-45, Math.min(45, member.position.x))
    member.position.z = Math.max(-35, Math.min(35, member.position.z))
    member.position.y = 0
  }

  private removeReadyToLeaveCrowdMembers(): void {
    const leavingMembers: string[] = []

    this.members.forEach(member => {
      if (member.mood === 'leaving' && Math.random() < 0.02) { // 2% chance per frame to actually leave
        leavingMembers.push(member.id)
      }
    })

    leavingMembers.forEach(memberId => {
      this.removeCrowdMember(memberId)
    })
  }

  private removeCrowdMember(memberId: string): void {
    const member = this.members.get(memberId)
    if (!member) return

    // Remove from areas
    this.crowdAreas.forEach(area => {
      const distance = area.center.distanceTo(member.position)
      if (distance <= area.radius) {
        area.currentCount = Math.max(0, area.currentCount - 1)
        this.updateAreaDensity(area)
      }
    })

    this.members.delete(memberId)
  }

  private updateAreaMetrics(): void {
    // Reset area counts
    this.crowdAreas.forEach(area => {
      area.currentCount = 0
      area.averageEnergy = 0
      area.averageSatisfaction = 0
    })

    // Count members in each area
    this.members.forEach(member => {
      this.crowdAreas.forEach(area => {
        const distance = area.center.distanceTo(member.position)
        if (distance <= area.radius) {
          area.currentCount++
          area.averageEnergy += member.energy
          area.averageSatisfaction += member.satisfaction
        }
      })
    })

    // Calculate averages
    this.crowdAreas.forEach(area => {
      if (area.currentCount > 0) {
        area.averageEnergy /= area.currentCount
        area.averageSatisfaction /= area.currentCount
        this.updateAreaDensity(area)
      }
    })
  }

  private updateCrowdMetrics(): void {
    if (this.members.size === 0) return

    // Update peak attendance
    this.metrics.peakAttendance = Math.max(this.metrics.peakAttendance, this.members.size)

    // Calculate averages
    let totalEnergy = 0
    let totalSatisfaction = 0
    const moodCounts = {
      excited: 0,
      happy: 0,
      neutral: 0,
      bored: 0,
      leaving: 0
    }

    this.members.forEach(member => {
      totalEnergy += member.energy
      totalSatisfaction += member.satisfaction
      moodCounts[member.mood]++
    })

    this.metrics.averageEnergy = totalEnergy / this.members.size
    this.metrics.averageSatisfaction = totalSatisfaction / this.members.size

    // Update mood distribution
    Object.keys(moodCounts).forEach(mood => {
      this.metrics.moodDistribution[mood as CrowdMood] = (moodCounts[mood as CrowdMood] / this.members.size) * 100
    })

    // Calculate retention rate
    this.metrics.retentionRate = Math.max(0, 100 - (moodCounts.leaving / this.members.size) * 100)

    // Calculate word of mouth based on satisfaction
    this.metrics.wordOfMouth = Math.min(100, this.metrics.averageSatisfaction * 1.2)
  }

  private updateInstancedMeshes(): void {
    // Reset all instances to invisible
    this.instancedMeshes.forEach((mesh, mood) => {
      mesh.count = 0
    })

    // Group members by mood and update instances
    const membersByMood = new Map<CrowdMood, CrowdMember[]>()

    this.members.forEach(member => {
      if (!membersByMood.has(member.mood)) {
        membersByMood.set(member.mood, [])
      }
      membersByMood.get(member.mood)!.push(member)
    })

    // Update instanced meshes
    membersByMood.forEach((members, mood) => {
      const mesh = this.instancedMeshes.get(mood)
      if (!mesh) return

      const maxInstances = Math.min(members.length, mesh.count)
      mesh.count = maxInstances

      const matrix = new THREE.Matrix4()
      const tempObject = new THREE.Object3D()

      members.slice(0, maxInstances).forEach((member, index) => {
        tempObject.position.copy(member.position)
        tempObject.rotation.y = Math.atan2(member.velocity.x, member.velocity.z)

        // Scale based on energy level
        const scale = 0.8 + (member.energy / 100) * 0.4
        tempObject.scale.set(scale, scale, scale)

        tempObject.updateMatrix()
        mesh.setMatrixAt(index, tempObject.matrix)
      })

      mesh.instanceMatrix.needsUpdate = true
    })
  }

  // Public API methods
  public getCrowdMetrics(): CrowdMetrics {
    return { ...this.metrics }
  }

  public getCrowdAreas(): CrowdArea[] {
    return Array.from(this.crowdAreas.values())
  }

  public getCurrentCrowdSize(): number {
    return this.members.size
  }

  public getCrowdGroup(): THREE.Group {
    return this.crowdGroup
  }

  public getAverageEnergyInArea(areaId: string): number {
    const area = this.crowdAreas.get(areaId)
    return area ? area.averageEnergy : 0
  }

  public getMoodDistribution(): { [mood in CrowdMood]: number } {
    return { ...this.metrics.moodDistribution }
  }

  public setCrowdBehaviorConfig(config: Partial<CrowdBehaviorConfig>): void {
    Object.assign(this.behaviorConfig, config)
  }

  public forceMoodChange(areaId: string, targetMood: CrowdMood, percentage: number): void {
    const area = this.crowdAreas.get(areaId)
    if (!area) return

    const membersInArea: CrowdMember[] = []
    this.members.forEach(member => {
      const distance = area.center.distanceTo(member.position)
      if (distance <= area.radius) {
        membersInArea.push(member)
      }
    })

    const targetCount = Math.floor(membersInArea.length * percentage / 100)

    for (let i = 0; i < targetCount && i < membersInArea.length; i++) {
      const member = membersInArea[i]
      member.mood = targetMood

      // Adjust energy/satisfaction to match mood
      switch (targetMood) {
        case 'excited':
          member.energy = Math.max(member.energy, 80)
          member.satisfaction = Math.max(member.satisfaction, 70)
          break
        case 'happy':
          member.energy = Math.max(member.energy, 60)
          member.satisfaction = Math.max(member.satisfaction, 60)
          break
        case 'bored':
          member.energy = Math.min(member.energy, 40)
          member.satisfaction = Math.min(member.satisfaction, 40)
          break
        case 'leaving':
          member.satisfaction = Math.min(member.satisfaction, 30)
          member.patience = Math.min(member.patience, 20)
          break
      }
    }
  }

  public dispose(): void {
    // Dispose geometries and materials
    this.crowdGeometry.dispose()
    this.crowdMaterials.forEach(material => material.dispose())

    // Clear instanced meshes
    this.instancedMeshes.forEach(mesh => {
      mesh.dispose()
    })

    // Clear data structures
    this.members.clear()
    this.crowdAreas.clear()
    this.crowdMaterials.clear()
    this.instancedMeshes.clear()

    // Clear group
    this.crowdGroup.clear()

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close()
    }
  }
}