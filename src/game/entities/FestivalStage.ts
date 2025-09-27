import * as THREE from 'three'

export type StageType = 'main' | 'edm_tent' | 'art_installation' | 'chill_out'
export type StageStatus = 'idle' | 'setup' | 'soundcheck' | 'performance' | 'breakdown'

export interface StageConfig {
  id: string
  name: string
  type: StageType
  position: THREE.Vector3
  size: THREE.Vector3
  capacity: number
  hasRoof: boolean
  primaryColor: number
  secondaryColor: number
  powerRequirement: number
  setupTime: number // minutes
  breakdownTime: number // minutes
}

export interface PerformanceSlot {
  id: string
  artistName: string
  genre: string
  startTime: number // minutes from festival start
  duration: number // minutes
  expectedCrowd: number
  difficulty: number // 1-10
  energyType: 'high' | 'medium' | 'low' | 'chill'
  requirements: {
    projectors: number
    lights: number
    sound: number
    crew: number
  }
}

export interface StageEquipment {
  projectors: {
    installed: number
    working: number
    maxCapacity: number
  }
  lighting: {
    installed: number
    working: number
    maxCapacity: number
  }
  sound: {
    installed: number
    working: number
    maxCapacity: number
  }
  power: {
    available: number
    used: number
    efficiency: number // 0-1
  }
}

export interface StageMetrics {
  crowdSatisfaction: number // 0-100
  technicalQuality: number // 0-100
  artistSatisfaction: number // 0-100
  overallRating: number // 0-100
  totalRevenue: number
  powerConsumption: number
}

export class FestivalStage {
  private config: StageConfig
  private group: THREE.Group
  private equipment: StageEquipment
  private currentStatus: StageStatus = 'idle'
  private performanceSchedule: PerformanceSlot[] = []
  private currentPerformance: PerformanceSlot | null = null
  private metrics: StageMetrics

  // Visual elements
  private platform: THREE.Mesh
  private backdrop: THREE.Mesh
  private roof: THREE.Mesh | null = null
  private equipmentMeshes: Map<string, THREE.Mesh[]> = new Map()
  private lightingSystems: THREE.SpotLight[] = []
  private projectionSurfaces: THREE.Mesh[] = []

  // Animation and effects
  private lightAnimationMixer: THREE.AnimationMixer | null = null
  private projectionMaterials: THREE.Material[] = []
  private audioAnalyzer: AnalyserNode | null = null

  // Stage management
  private setupProgress: number = 0
  private maintenanceLevel: number = 100 // 0-100, affects equipment reliability
  private weatherResistance: number = 1.0 // multiplier for weather effects

  constructor(config: StageConfig) {
    this.config = config
    this.group = new THREE.Group()
    this.group.name = `festival_stage_${config.id}`
    this.group.position.copy(config.position)

    this.initializeEquipment()
    this.initializeMetrics()
    this.createStageStructure()
    this.createEquipmentVisuals()
    this.setupLightingSystem()
  }

  private initializeEquipment(): void {
    // Equipment capacity based on stage type
    const equipmentCapacity = this.getEquipmentCapacityByType()

    this.equipment = {
      projectors: {
        installed: 0,
        working: 0,
        maxCapacity: equipmentCapacity.projectors
      },
      lighting: {
        installed: Math.floor(equipmentCapacity.lights * 0.5), // Start with some basic lighting
        working: Math.floor(equipmentCapacity.lights * 0.5),
        maxCapacity: equipmentCapacity.lights
      },
      sound: {
        installed: Math.floor(equipmentCapacity.sound * 0.3), // Basic sound system
        working: Math.floor(equipmentCapacity.sound * 0.3),
        maxCapacity: equipmentCapacity.sound
      },
      power: {
        available: equipmentCapacity.power,
        used: 0,
        efficiency: 0.8
      }
    }
  }

  private getEquipmentCapacityByType(): { projectors: number, lights: number, sound: number, power: number } {
    switch (this.config.type) {
      case 'main':
        return { projectors: 8, lights: 20, sound: 12, power: 1000 }
      case 'edm_tent':
        return { projectors: 6, lights: 15, sound: 10, power: 800 }
      case 'art_installation':
        return { projectors: 10, lights: 8, sound: 4, power: 600 }
      case 'chill_out':
        return { projectors: 4, lights: 12, sound: 6, power: 400 }
      default:
        return { projectors: 4, lights: 10, sound: 6, power: 500 }
    }
  }

  private initializeMetrics(): void {
    this.metrics = {
      crowdSatisfaction: 50,
      technicalQuality: 75,
      artistSatisfaction: 50,
      overallRating: 50,
      totalRevenue: 0,
      powerConsumption: 0
    }
  }

  private createStageStructure(): void {
    // Create platform
    const platformGeometry = new THREE.BoxGeometry(this.config.size.x, 1, this.config.size.z)
    const platformMaterial = new THREE.MeshLambertMaterial({
      color: this.config.primaryColor,
      transparent: true,
      opacity: 0.8
    })

    this.platform = new THREE.Mesh(platformGeometry, platformMaterial)
    this.platform.position.y = 0.5
    this.platform.castShadow = true
    this.platform.receiveShadow = true
    this.platform.name = `${this.config.id}_platform`
    this.group.add(this.platform)

    // Create backdrop
    const backdropGeometry = new THREE.PlaneGeometry(this.config.size.x, this.config.size.y)
    const backdropMaterial = new THREE.MeshLambertMaterial({
      color: this.config.secondaryColor,
      transparent: true,
      opacity: 0.9
    })

    this.backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial)
    this.backdrop.position.set(0, this.config.size.y / 2, -this.config.size.z / 2)
    this.backdrop.name = `${this.config.id}_backdrop`
    this.group.add(this.backdrop)

    // Create roof if needed
    if (this.config.hasRoof) {
      this.createRoof()
    }

    // Create projection surfaces based on stage type
    this.createProjectionSurfaces()
  }

  private createRoof(): void {
    const roofGeometry = new THREE.PlaneGeometry(
      this.config.size.x + 4,
      this.config.size.z + 4
    )
    const roofMaterial = new THREE.MeshLambertMaterial({
      color: 0x2c3e50,
      transparent: true,
      opacity: 0.7
    })

    this.roof = new THREE.Mesh(roofGeometry, roofMaterial)
    this.roof.rotation.x = -Math.PI / 2
    this.roof.position.y = this.config.size.y + 2
    this.roof.castShadow = true
    this.roof.name = `${this.config.id}_roof`

    this.updateWeatherResistance()
    this.group.add(this.roof)
  }

  private createProjectionSurfaces(): void {
    switch (this.config.type) {
      case 'main':
        this.createMainStageProjectionSurfaces()
        break
      case 'edm_tent':
        this.createEDMProjectionSurfaces()
        break
      case 'art_installation':
        this.createArtInstallationSurfaces()
        break
      case 'chill_out':
        this.createChillOutSurfaces()
        break
    }
  }

  private createMainStageProjectionSurfaces(): void {
    // Large backdrop screens
    const screenConfigs = [
      { pos: [-4, 3, -this.config.size.z / 2 + 0.1], size: [6, 4] },
      { pos: [4, 3, -this.config.size.z / 2 + 0.1], size: [6, 4] },
      { pos: [0, 6, -this.config.size.z / 2 + 0.1], size: [8, 3] }
    ]

    screenConfigs.forEach((screen, index) => {
      const screenGeometry = new THREE.PlaneGeometry(screen.size[0], screen.size[1])
      const screenMaterial = new THREE.MeshBasicMaterial({
        color: 0x111111,
        // emissive: 0x222222,
        transparent: true,
        opacity: 0.9
      })

      const screenMesh = new THREE.Mesh(screenGeometry, screenMaterial)
      screenMesh.position.set(screen.pos[0], screen.pos[1], screen.pos[2])
      screenMesh.name = `${this.config.id}_screen_${index}`

      this.projectionSurfaces.push(screenMesh)
      this.projectionMaterials.push(screenMaterial)
      this.group.add(screenMesh)
    })
  }

  private createEDMProjectionSurfaces(): void {
    // DJ booth projection surface and ceiling
    const surfaces = [
      { pos: [0, 2, 0], size: [8, 4], rot: [0, Math.PI, 0] }, // Back wall
      { pos: [0, this.config.size.y - 0.5, 0], size: [10, 8], rot: [-Math.PI / 2, 0, 0] } // Ceiling
    ]

    surfaces.forEach((surface, index) => {
      const surfaceGeometry = new THREE.PlaneGeometry(surface.size[0], surface.size[1])
      const surfaceMaterial = new THREE.MeshBasicMaterial({
        color: 0x1a1a1a,
        transparent: true,
        opacity: 0.8
      })

      const surfaceMesh = new THREE.Mesh(surfaceGeometry, surfaceMaterial)
      surfaceMesh.position.set(surface.pos[0], surface.pos[1], surface.pos[2])
      surfaceMesh.rotation.set(surface.rot[0], surface.rot[1], surface.rot[2])
      surfaceMesh.name = `${this.config.id}_edm_surface_${index}`

      this.projectionSurfaces.push(surfaceMesh)
      this.projectionMaterials.push(surfaceMaterial)
      this.group.add(surfaceMesh)
    })
  }

  private createArtInstallationSurfaces(): void {
    // Multiple angled projection surfaces for art
    const surfaces = [
      { pos: [-3, 2, 0], rot: [0, Math.PI / 4, 0], size: [3, 4] },
      { pos: [3, 2, 0], rot: [0, -Math.PI / 4, 0], size: [3, 4] },
      { pos: [0, 3, 2], rot: [0, Math.PI, 0], size: [4, 3] },
      { pos: [0, 1, -2], rot: [Math.PI / 6, 0, 0], size: [6, 2] }
    ]

    surfaces.forEach((surface, index) => {
      const surfaceGeometry = new THREE.PlaneGeometry(surface.size[0], surface.size[1])
      const surfaceMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9
      })

      const surfaceMesh = new THREE.Mesh(surfaceGeometry, surfaceMaterial)
      surfaceMesh.position.set(surface.pos[0], surface.pos[1], surface.pos[2])
      surfaceMesh.rotation.set(surface.rot[0], surface.rot[1], surface.rot[2])
      surfaceMesh.name = `${this.config.id}_art_surface_${index}`

      this.projectionSurfaces.push(surfaceMesh)
      this.projectionMaterials.push(surfaceMaterial)
      this.group.add(surfaceMesh)
    })
  }

  private createChillOutSurfaces(): void {
    // Ambient projection surfaces on trees/poles
    const surfaces = [
      { pos: [-4, 2, -4], size: [2, 3] },
      { pos: [4, 2, -4], size: [2, 3] },
      { pos: [-4, 2, 4], size: [2, 3] },
      { pos: [4, 2, 4], size: [2, 3] }
    ]

    surfaces.forEach((surface, index) => {
      const surfaceGeometry = new THREE.PlaneGeometry(surface.size[0], surface.size[1])
      const surfaceMaterial = new THREE.MeshBasicMaterial({
        color: 0xf0f0f0,
        transparent: true,
        opacity: 0.7
      })

      const surfaceMesh = new THREE.Mesh(surfaceGeometry, surfaceMaterial)
      surfaceMesh.position.set(surface.pos[0], surface.pos[1], surface.pos[2])
      surfaceMesh.name = `${this.config.id}_chill_surface_${index}`

      this.projectionSurfaces.push(surfaceMesh)
      this.projectionMaterials.push(surfaceMaterial)
      this.group.add(surfaceMesh)
    })
  }

  private createEquipmentVisuals(): void {
    this.createProjectorRigs()
    this.createSoundSystem()
    this.createLightingRigs()
    this.createPowerSystems()
  }

  private createProjectorRigs(): void {
    const projectorMeshes: THREE.Mesh[] = []
    const projectorPositions = this.getProjectorPositions()

    projectorPositions.forEach((pos, index) => {
      // Projector housing
      const housingGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.6)
      const housingMaterial = new THREE.MeshLambertMaterial({ color: 0x2c3e50 })

      const housing = new THREE.Mesh(housingGeometry, housingMaterial)
      housing.position.copy(pos)
      housing.castShadow = true
      housing.name = `${this.config.id}_projector_${index}`

      // Lens
      const lensGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 16)
      const lensMaterial = new THREE.MeshPhongMaterial({
        color: 0x111111,
        shininess: 200,
        transparent: true,
        opacity: 0.8
      })

      const lens = new THREE.Mesh(lensGeometry, lensMaterial)
      lens.position.copy(pos)
      lens.position.z += 0.3
      lens.rotation.x = Math.PI / 2
      lens.name = `${this.config.id}_projector_lens_${index}`

      projectorMeshes.push(housing, lens)
      this.group.add(housing, lens)
    })

    this.equipmentMeshes.set('projectors', projectorMeshes)
  }

  private getProjectorPositions(): THREE.Vector3[] {
    switch (this.config.type) {
      case 'main':
        return [
          new THREE.Vector3(-6, 8, 5),
          new THREE.Vector3(6, 8, 5),
          new THREE.Vector3(0, 12, 8),
          new THREE.Vector3(-10, 6, 0),
          new THREE.Vector3(10, 6, 0)
        ]
      case 'edm_tent':
        return [
          new THREE.Vector3(-4, 6, 3),
          new THREE.Vector3(4, 6, 3),
          new THREE.Vector3(0, 8, -2),
          new THREE.Vector3(0, 4, 6)
        ]
      case 'art_installation':
        return [
          new THREE.Vector3(-5, 4, -5),
          new THREE.Vector3(5, 4, -5),
          new THREE.Vector3(-5, 4, 5),
          new THREE.Vector3(5, 4, 5),
          new THREE.Vector3(0, 6, 0)
        ]
      case 'chill_out':
        return [
          new THREE.Vector3(-3, 4, -3),
          new THREE.Vector3(3, 4, -3),
          new THREE.Vector3(0, 5, 0)
        ]
      default:
        return []
    }
  }

  private createSoundSystem(): void {
    const soundMeshes: THREE.Mesh[] = []

    // Create speakers based on stage type
    const speakerConfigs = this.getSpeakerConfigurations()

    speakerConfigs.forEach((config, index) => {
      const speakerGeometry = new THREE.BoxGeometry(config.size[0], config.size[1], config.size[2])
      const speakerMaterial = new THREE.MeshLambertMaterial({ color: 0x34495e })

      const speaker = new THREE.Mesh(speakerGeometry, speakerMaterial)
      speaker.position.set(config.position[0], config.position[1], config.position[2])
      speaker.castShadow = true
      speaker.name = `${this.config.id}_speaker_${index}`

      soundMeshes.push(speaker)
      this.group.add(speaker)
    })

    this.equipmentMeshes.set('sound', soundMeshes)
  }

  private getSpeakerConfigurations(): Array<{ position: number[], size: number[] }> {
    const baseConfigs = [
      { position: [-this.config.size.x / 2 - 1, 2, this.config.size.z / 2], size: [0.8, 4, 0.8] },
      { position: [this.config.size.x / 2 + 1, 2, this.config.size.z / 2], size: [0.8, 4, 0.8] }
    ]

    if (this.config.type === 'main' || this.config.type === 'edm_tent') {
      // Add subwoofers
      baseConfigs.push(
        { position: [-4, 0.5, this.config.size.z / 2], size: [1.5, 1, 1.5] },
        { position: [4, 0.5, this.config.size.z / 2], size: [1.5, 1, 1.5] }
      )
    }

    return baseConfigs
  }

  private createLightingRigs(): void {
    const lightMeshes: THREE.Mesh[] = []

    // Create lighting truss
    const trussGeometry = new THREE.CylinderGeometry(0.05, 0.05, this.config.size.x)
    const trussMaterial = new THREE.MeshLambertMaterial({ color: 0x95a5a6 })

    const truss = new THREE.Mesh(trussGeometry, trussMaterial)
    truss.rotation.z = Math.PI / 2
    truss.position.set(0, this.config.size.y + 1, 0)
    truss.castShadow = true
    truss.name = `${this.config.id}_truss`

    lightMeshes.push(truss)
    this.group.add(truss)

    // Create individual light fixtures
    const lightPositions = this.getLightPositions()

    lightPositions.forEach((pos, index) => {
      const lightGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.3)
      const lightMaterial = new THREE.MeshLambertMaterial({ color: 0x2c3e50 })

      const lightFixture = new THREE.Mesh(lightGeometry, lightMaterial)
      lightFixture.position.copy(pos)
      lightFixture.castShadow = true
      lightFixture.name = `${this.config.id}_light_${index}`

      lightMeshes.push(lightFixture)
      this.group.add(lightFixture)
    })

    this.equipmentMeshes.set('lighting', lightMeshes)
  }

  private getLightPositions(): THREE.Vector3[] {
    const positions: THREE.Vector3[] = []
    const lightCount = Math.min(this.equipment.lighting.maxCapacity, 12)

    for (let i = 0; i < lightCount; i++) {
      const x = (i / (lightCount - 1)) * this.config.size.x - this.config.size.x / 2
      positions.push(new THREE.Vector3(x, this.config.size.y + 0.8, 0))
    }

    return positions
  }

  private createPowerSystems(): void {
    const powerMeshes: THREE.Mesh[] = []

    // Power distribution boxes
    const powerBoxPositions = [
      new THREE.Vector3(-this.config.size.x / 2 - 2, 0.5, this.config.size.z / 2 + 1),
      new THREE.Vector3(this.config.size.x / 2 + 2, 0.5, this.config.size.z / 2 + 1)
    ]

    powerBoxPositions.forEach((pos, index) => {
      const boxGeometry = new THREE.BoxGeometry(1, 1, 0.5)
      const boxMaterial = new THREE.MeshLambertMaterial({ color: 0x7f8c8d })

      const powerBox = new THREE.Mesh(boxGeometry, boxMaterial)
      powerBox.position.copy(pos)
      powerBox.castShadow = true
      powerBox.name = `${this.config.id}_powerbox_${index}`

      powerMeshes.push(powerBox)
      this.group.add(powerBox)
    })

    this.equipmentMeshes.set('power', powerMeshes)
  }

  private setupLightingSystem(): void {
    // Create dynamic lighting for performances
    const lightColors = [0xff0080, 0x00ff80, 0x8000ff, 0xff8000, 0x0080ff, 0x80ff00]

    this.getLightPositions().forEach((pos, index) => {
      if (index < this.equipment.lighting.working) {
        const spotlight = new THREE.SpotLight(
          lightColors[index % lightColors.length],
          0.5,
          20,
          Math.PI / 8,
          0.5,
          0.8
        )

        spotlight.position.copy(pos)
        spotlight.target.position.set(
          pos.x,
          0,
          pos.z - 5
        )

        spotlight.castShadow = true
        spotlight.name = `${this.config.id}_stage_light_${index}`

        this.lightingSystems.push(spotlight)
        this.group.add(spotlight)
        this.group.add(spotlight.target)
      }
    })
  }

  private updateWeatherResistance(): void {
    this.weatherResistance = this.config.hasRoof ? 0.9 : 0.3
  }

  // Equipment management methods
  public installEquipment(type: keyof StageEquipment, quantity: number): boolean {
    const equipment = this.equipment[type]

    if ('installed' in equipment && 'maxCapacity' in equipment && equipment.installed + quantity <= equipment.maxCapacity) {
      (equipment as any).installed += quantity
      (equipment as any).working += quantity // Assume new equipment works
      this.updateEquipmentVisuals(type)
      return true
    }

    return false
  }

  public removeEquipment(type: keyof StageEquipment, quantity: number): boolean {
    const equipment = this.equipment[type]

    if (equipment.installed >= quantity) {
      equipment.installed -= quantity
      equipment.working = Math.min(equipment.working, equipment.installed)
      this.updateEquipmentVisuals(type)
      return true
    }

    return false
  }

  private updateEquipmentVisuals(type: keyof StageEquipment): void {
    const meshes = this.equipmentMeshes.get(type as string)
    if (!meshes) return

    // Update visibility based on installed equipment
    const equipment = this.equipment[type]
    meshes.forEach((mesh, index) => {
      mesh.visible = index < equipment.installed

      // Visual indication of working vs broken equipment
      if (mesh.material instanceof THREE.MeshLambertMaterial) {
        mesh.material.color.setHex(
          index < equipment.working ? 0x2c3e50 : 0x8b0000
        )
      }
    })
  }

  // Performance management
  public schedulePerformance(performance: PerformanceSlot): boolean {
    // Check if slot is available
    const conflict = this.performanceSchedule.some(scheduled =>
      performance.startTime < scheduled.startTime + scheduled.duration &&
      performance.startTime + performance.duration > scheduled.startTime
    )

    if (!conflict) {
      this.performanceSchedule.push(performance)
      this.performanceSchedule.sort((a, b) => a.startTime - b.startTime)
      return true
    }

    return false
  }

  public startPerformance(performanceId: string): boolean {
    const performance = this.performanceSchedule.find(p => p.id === performanceId)
    if (!performance) return false

    // Check equipment requirements
    if (!this.hasRequiredEquipment(performance.requirements)) {
      return false
    }

    this.currentPerformance = performance
    this.currentStatus = 'performance'
    this.startPerformanceEffects()

    return true
  }

  private hasRequiredEquipment(requirements: PerformanceSlot['requirements']): boolean {
    return (
      this.equipment.projectors.working >= requirements.projectors &&
      this.equipment.lighting.working >= requirements.lights &&
      this.equipment.sound.working >= requirements.sound &&
      this.equipment.power.available >= this.calculatePowerRequirement(requirements)
    )
  }

  private calculatePowerRequirement(requirements: PerformanceSlot['requirements']): number {
    return (requirements.projectors * 100 +
            requirements.lights * 50 +
            requirements.sound * 150) / this.equipment.power.efficiency
  }

  private startPerformanceEffects(): void {
    if (!this.currentPerformance) return

    // Activate lighting effects
    this.lightingSystems.forEach((light, index) => {
      if (index < this.equipment.lighting.working) {
        light.intensity = 0.8
        light.visible = true
      }
    })

    // Update projection surfaces for performance
    this.updateProjectionSurfaces()

    // Start light show animations
    this.startLightShow()
  }

  private updateProjectionSurfaces(): void {
    if (!this.currentPerformance) return

    // Update projection materials based on performance type
    this.projectionMaterials.forEach((material, index) => {
      if (material instanceof THREE.MeshBasicMaterial) {
        // Vary emissive intensity based on performance energy
        const energyMultiplier = this.getEnergyMultiplier(this.currentPerformance!.energyType)
        material.emissive.setHSL(
          Math.random(),
          0.8,
          0.3 * energyMultiplier
        )
      }
    })
  }

  private getEnergyMultiplier(energyType: PerformanceSlot['energyType']): number {
    switch (energyType) {
      case 'high': return 1.0
      case 'medium': return 0.7
      case 'low': return 0.4
      case 'chill': return 0.2
      default: return 0.5
    }
  }

  private startLightShow(): void {
    if (!this.currentPerformance) return

    const energyMultiplier = this.getEnergyMultiplier(this.currentPerformance.energyType)

    // Create pulsing light effects
    this.lightingSystems.forEach((light, index) => {
      const baseIntensity = 0.8 * energyMultiplier
      const pulseSpeed = 0.5 + energyMultiplier * 1.5

      // Animate light intensity
      const animate = () => {
        if (this.currentStatus === 'performance') {
          light.intensity = baseIntensity + Math.sin(Date.now() * 0.001 * pulseSpeed + index) * 0.3
          requestAnimationFrame(animate)
        }
      }
      animate()
    })
  }

  public endPerformance(): void {
    if (!this.currentPerformance) return

    // Calculate performance metrics
    this.calculatePerformanceMetrics()

    // Reset stage
    this.currentPerformance = null
    this.currentStatus = 'breakdown'
    this.stopPerformanceEffects()

    // Schedule automatic return to idle
    setTimeout(() => {
      if (this.currentStatus === 'breakdown') {
        this.currentStatus = 'idle'
      }
    }, this.config.breakdownTime * 60 * 1000)
  }

  private calculatePerformanceMetrics(): void {
    if (!this.currentPerformance) return

    const performance = this.currentPerformance

    // Base score from technical quality
    const technicalScore = this.calculateTechnicalScore(performance)

    // Equipment adequacy bonus/penalty
    const equipmentScore = this.calculateEquipmentScore(performance)

    // Weather impact
    const weatherScore = this.calculateWeatherImpact()

    // Overall performance rating
    const performanceRating = Math.max(0, Math.min(100,
      (technicalScore + equipmentScore + weatherScore) / 3
    ))

    // Update metrics
    this.metrics.technicalQuality = (this.metrics.technicalQuality + technicalScore) / 2
    this.metrics.overallRating = (this.metrics.overallRating + performanceRating) / 2
    this.metrics.totalRevenue += this.calculateRevenue(performance, performanceRating)

    console.log(`Performance ${performance.artistName} completed with rating: ${performanceRating.toFixed(1)}`)
  }

  private calculateTechnicalScore(performance: PerformanceSlot): number {
    let score = 70 // Base score

    // Equipment working condition bonus
    const projectorRatio = this.equipment.projectors.working / Math.max(1, performance.requirements.projectors)
    const lightRatio = this.equipment.lighting.working / Math.max(1, performance.requirements.lights)
    const soundRatio = this.equipment.sound.working / Math.max(1, performance.requirements.sound)

    score += Math.min(20, (projectorRatio - 1) * 10)
    score += Math.min(20, (lightRatio - 1) * 10)
    score += Math.min(20, (soundRatio - 1) * 10)

    // Maintenance level impact
    score *= (this.maintenanceLevel / 100)

    return Math.max(0, Math.min(100, score))
  }

  private calculateEquipmentScore(performance: PerformanceSlot): number {
    const projectorAdequacy = this.equipment.projectors.working / performance.requirements.projectors
    const lightAdequacy = this.equipment.lighting.working / performance.requirements.lights
    const soundAdequacy = this.equipment.sound.working / performance.requirements.sound

    const averageAdequacy = (projectorAdequacy + lightAdequacy + soundAdequacy) / 3
    return Math.min(100, averageAdequacy * 80)
  }

  private calculateWeatherImpact(): number {
    // Weather resistance affects outdoor stages more
    const baseScore = 80
    return baseScore * this.weatherResistance
  }

  private calculateRevenue(performance: PerformanceSlot, rating: number): number {
    const baseFee = performance.expectedCrowd * 10 // Base revenue per person
    const qualityMultiplier = rating / 100
    const capacityBonus = Math.min(1.5, this.config.capacity / performance.expectedCrowd)

    return baseFee * qualityMultiplier * capacityBonus
  }

  private stopPerformanceEffects(): void {
    // Dim lights
    this.lightingSystems.forEach(light => {
      light.intensity = 0.1
    })

    // Reset projection surfaces
    this.projectionMaterials.forEach(material => {
      if (material instanceof THREE.MeshBasicMaterial) {
        material.emissive.setHex(0x222222)
      }
    })
  }

  // Weather impact
  public applyWeatherEffects(weather: { type: string, intensity: number }): void {
    if (!this.config.hasRoof && weather.type === 'rain') {
      // Rain affects equipment reliability
      const damageChance = weather.intensity * 0.1 * (1 - this.weatherResistance)

      if (Math.random() < damageChance) {
        this.damageRandomEquipment()
      }

      // Reduce power efficiency
      this.equipment.power.efficiency = Math.max(0.3,
        this.equipment.power.efficiency - weather.intensity * 0.1
      )
    }
  }

  private damageRandomEquipment(): void {
    const equipmentTypes = Object.keys(this.equipment) as (keyof StageEquipment)[]
    const randomType = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)]

    if (randomType !== 'power') {
      const equipment = this.equipment[randomType]
      if (equipment.working > 0) {
        equipment.working--
        this.updateEquipmentVisuals(randomType)
        console.log(`Weather damaged ${randomType} on stage ${this.config.name}`)
      }
    }
  }

  // Maintenance
  public performMaintenance(): number {
    const maintenanceCost = this.calculateMaintenanceCost()

    // Restore equipment
    Object.keys(this.equipment).forEach(key => {
      const equipmentType = key as keyof StageEquipment
      if (equipmentType !== 'power') {
        const equipment = this.equipment[equipmentType]
        equipment.working = equipment.installed
        this.updateEquipmentVisuals(equipmentType)
      }
    })

    // Restore power efficiency
    this.equipment.power.efficiency = 0.9

    // Restore maintenance level
    this.maintenanceLevel = 100

    return maintenanceCost
  }

  private calculateMaintenanceCost(): number {
    const equipmentCount = Object.values(this.equipment).reduce((total, equipment) => {
      return total + (equipment.installed || 0)
    }, 0)

    const maintenanceRate = (100 - this.maintenanceLevel) / 100
    return equipmentCount * 50 * (1 + maintenanceRate)
  }

  public update(deltaTime: number, currentTime: number): void {
    // Update maintenance level (gradual degradation)
    this.maintenanceLevel = Math.max(0, this.maintenanceLevel - deltaTime * 0.01)

    // Check for scheduled performances
    const upcomingPerformance = this.performanceSchedule.find(
      p => p.startTime <= currentTime && currentTime < p.startTime + p.duration
    )

    if (upcomingPerformance && this.currentPerformance?.id !== upcomingPerformance.id) {
      this.startPerformance(upcomingPerformance.id)
    } else if (!upcomingPerformance && this.currentPerformance) {
      this.endPerformance()
    }

    // Update power consumption
    this.equipment.power.used = this.calculateCurrentPowerUsage()
    this.metrics.powerConsumption = this.equipment.power.used

    // Update visual effects
    this.updateVisualEffects(deltaTime)
  }

  private calculateCurrentPowerUsage(): number {
    if (this.currentStatus !== 'performance') return 0

    const projectorPower = this.equipment.projectors.working * 100
    const lightPower = this.equipment.lighting.working * 50
    const soundPower = this.equipment.sound.working * 150

    return (projectorPower + lightPower + soundPower) / this.equipment.power.efficiency
  }

  private updateVisualEffects(deltaTime: number): void {
    // Animate projection surfaces during performance
    if (this.currentStatus === 'performance' && this.currentPerformance) {
      this.projectionMaterials.forEach((material, index) => {
        if (material instanceof THREE.MeshBasicMaterial) {
          const time = Date.now() * 0.001
          const hue = (time * 0.1 + index * 0.2) % 1
          const energyMultiplier = this.getEnergyMultiplier(this.currentPerformance!.energyType)

          material.emissive.setHSL(hue, 0.8, 0.3 * energyMultiplier)
        }
      })
    }

    // Subtle platform color pulsing
    if (this.platform.material instanceof THREE.MeshLambertMaterial) {
      const time = Date.now() * 0.001
      const brightness = 0.8 + Math.sin(time * 0.5) * 0.2

      const color = new THREE.Color(this.config.primaryColor)
      color.multiplyScalar(brightness)
      this.platform.material.color.copy(color)
    }
  }

  // Getters
  public getGroup(): THREE.Group {
    return this.group
  }

  public getConfig(): StageConfig {
    return { ...this.config }
  }

  public getStatus(): StageStatus {
    return this.currentStatus
  }

  public getEquipment(): StageEquipment {
    return JSON.parse(JSON.stringify(this.equipment))
  }

  public getMetrics(): StageMetrics {
    return { ...this.metrics }
  }

  public getCurrentPerformance(): PerformanceSlot | null {
    return this.currentPerformance ? { ...this.currentPerformance } : null
  }

  public getPerformanceSchedule(): PerformanceSlot[] {
    return [...this.performanceSchedule]
  }

  public getProjectionSurfaces(): THREE.Mesh[] {
    return [...this.projectionSurfaces]
  }

  public getMaintenanceLevel(): number {
    return this.maintenanceLevel
  }

  public getWeatherResistance(): number {
    return this.weatherResistance
  }

  public dispose(): void {
    // Dispose materials and geometries
    this.group.traverse(child => {
      if (child instanceof THREE.Mesh) {
        if (child.material instanceof THREE.Material) {
          child.material.dispose()
        }
        if (child.geometry) {
          child.geometry.dispose()
        }
      }
    })

    // Clear arrays
    this.lightingSystems.length = 0
    this.projectionSurfaces.length = 0
    this.projectionMaterials.length = 0
    this.performanceSchedule.length = 0

    // Clear maps
    this.equipmentMeshes.clear()

    // Clear group
    this.group.clear()
  }
}