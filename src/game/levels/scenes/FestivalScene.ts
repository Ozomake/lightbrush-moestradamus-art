import * as THREE from 'three'

export interface FestivalStageConfig {
  id: string
  name: string
  type: 'main' | 'edm_tent' | 'art_installation' | 'chill_out'
  position: THREE.Vector3
  size: THREE.Vector3
  capacity: number
  hasRoof: boolean
  primaryColor: number
  secondaryColor: number
}

export interface WeatherState {
  type: 'clear' | 'cloudy' | 'rain' | 'storm'
  intensity: number
  windSpeed: number
  windDirection: THREE.Vector3
  visibility: number
  temperature: number
}

export interface TimeOfDay {
  hour: number
  minute: number
  sunPosition: THREE.Vector3
  skyColor: number
  ambientIntensity: number
  spotlightIntensity: number
}

export class FestivalScene {
  private scene: THREE.Scene
  private ground: THREE.Mesh
  private skybox: THREE.Mesh
  private weatherParticles: THREE.Points | null = null
  private stages: Map<string, THREE.Group> = new Map()
  private decorations: THREE.Group = new THREE.Group()
  private lighting: THREE.Group = new THREE.Group()
  private atmosphere: THREE.Group = new THREE.Group()

  // Festival environment state
  private timeOfDay: TimeOfDay = {
    hour: 20,
    minute: 0,
    sunPosition: new THREE.Vector3(-10, 5, 10),
    skyColor: 0x1a1a2e,
    ambientIntensity: 0.3,
    spotlightIntensity: 0.8
  }

  private weather: WeatherState = {
    type: 'clear',
    intensity: 0,
    windSpeed: 0,
    windDirection: new THREE.Vector3(1, 0, 0),
    visibility: 1.0,
    temperature: 22
  }

  // Festival stage configurations
  private stageConfigs: FestivalStageConfig[] = [
    {
      id: 'main_stage',
      name: 'Main Stage',
      type: 'main',
      position: new THREE.Vector3(0, 0, -20),
      size: new THREE.Vector3(16, 8, 6),
      capacity: 2000,
      hasRoof: false,
      primaryColor: 0xff6b6b,
      secondaryColor: 0x4ecdc4
    },
    {
      id: 'edm_tent',
      name: 'Electronic Dance Tent',
      type: 'edm_tent',
      position: new THREE.Vector3(-25, 0, -10),
      size: new THREE.Vector3(12, 6, 8),
      capacity: 800,
      hasRoof: true,
      primaryColor: 0x9b59b6,
      secondaryColor: 0xe74c3c
    },
    {
      id: 'art_pavilion',
      name: 'Art Installation Pavilion',
      type: 'art_installation',
      position: new THREE.Vector3(25, 0, -10),
      size: new THREE.Vector3(10, 5, 10),
      capacity: 300,
      hasRoof: true,
      primaryColor: 0x3498db,
      secondaryColor: 0xf39c12
    },
    {
      id: 'chill_zone',
      name: 'Chill Out Zone',
      type: 'chill_out',
      position: new THREE.Vector3(0, 0, 15),
      size: new THREE.Vector3(14, 4, 12),
      capacity: 500,
      hasRoof: false,
      primaryColor: 0x2ecc71,
      secondaryColor: 0xe67e22
    }
  ]

  // Ambient lighting
  private ambientLight: THREE.AmbientLight
  private directionalLight: THREE.DirectionalLight
  private festivalLights: THREE.SpotLight[] = []

  constructor() {
    this.scene = new THREE.Scene()
    this.scene.name = 'FestivalScene'

    // Set initial fog for atmosphere
    this.scene.fog = new THREE.FogExp2(0x1a1a2e, 0.02)

    this.createGround()
    this.createSkybox()
    this.createLighting()
    this.createFestivalStages()
    this.createDecorations()
    this.createAtmosphere()
    this.updateTimeOfDay()
  }

  private createGround(): void {
    // Create large ground plane for festival grounds
    const groundGeometry = new THREE.PlaneGeometry(200, 200, 50, 50)

    // Create grass texture with some dirt paths
    const groundMaterial = new THREE.MeshLambertMaterial({
      color: 0x2d5016,
      transparent: true
    })

    this.ground = new THREE.Mesh(groundGeometry, groundMaterial)
    this.ground.rotation.x = -Math.PI / 2
    this.ground.position.y = -0.1
    this.ground.receiveShadow = true
    this.ground.name = 'festival_ground'

    // Add ground texture variation
    this.addGroundTextures()

    this.scene.add(this.ground)
  }

  private addGroundTextures(): void {
    // Add dirt paths between stages
    const pathMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 })
    const pathGeometry = new THREE.PlaneGeometry(4, 60)

    // Main pathway
    const mainPath = new THREE.Mesh(pathGeometry, pathMaterial)
    mainPath.rotation.x = -Math.PI / 2
    mainPath.position.set(0, 0, -2)
    mainPath.name = 'main_path'
    this.scene.add(mainPath)

    // Side paths
    const sidePath1 = new THREE.Mesh(new THREE.PlaneGeometry(3, 40), pathMaterial)
    sidePath1.rotation.x = -Math.PI / 2
    sidePath1.rotation.z = Math.PI / 4
    sidePath1.position.set(-15, 0, -5)
    this.scene.add(sidePath1)

    const sidePath2 = new THREE.Mesh(new THREE.PlaneGeometry(3, 40), pathMaterial)
    sidePath2.rotation.x = -Math.PI / 2
    sidePath2.rotation.z = -Math.PI / 4
    sidePath2.position.set(15, 0, -5)
    this.scene.add(sidePath2)
  }

  private createSkybox(): void {
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32)
    const skyMaterial = new THREE.MeshBasicMaterial({
      color: this.timeOfDay.skyColor,
      side: THREE.BackSide
    })

    this.skybox = new THREE.Mesh(skyGeometry, skyMaterial)
    this.skybox.name = 'festival_skybox'
    this.scene.add(this.skybox)
  }

  private createLighting(): void {
    // Ambient lighting for general scene illumination
    this.ambientLight = new THREE.AmbientLight(0x404040, this.timeOfDay.ambientIntensity)
    this.ambientLight.name = 'ambient_light'
    this.lighting.add(this.ambientLight)

    // Main directional light (sun/moon)
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    this.directionalLight.position.copy(this.timeOfDay.sunPosition)
    this.directionalLight.castShadow = true

    // Configure shadow properties
    this.directionalLight.shadow.mapSize.width = 2048
    this.directionalLight.shadow.mapSize.height = 2048
    this.directionalLight.shadow.camera.near = 0.5
    this.directionalLight.shadow.camera.far = 100
    this.directionalLight.shadow.camera.left = -50
    this.directionalLight.shadow.camera.right = 50
    this.directionalLight.shadow.camera.top = 50
    this.directionalLight.shadow.camera.bottom = -50

    this.directionalLight.name = 'directional_light'
    this.lighting.add(this.directionalLight)

    // Create festival stage lighting
    this.createFestivalLighting()

    this.scene.add(this.lighting)
  }

  private createFestivalLighting(): void {
    // Add colorful festival spotlights
    const lightColors = [0xff0080, 0x00ff80, 0x8000ff, 0xff8000, 0x0080ff, 0x80ff00]
    const lightPositions = [
      new THREE.Vector3(-8, 12, -15),
      new THREE.Vector3(8, 12, -15),
      new THREE.Vector3(-20, 8, -8),
      new THREE.Vector3(20, 8, -8),
      new THREE.Vector3(0, 15, 5),
      new THREE.Vector3(-10, 10, 10)
    ]

    lightPositions.forEach((position, index) => {
      const spotlight = new THREE.SpotLight(
        lightColors[index % lightColors.length],
        this.timeOfDay.spotlightIntensity,
        30,
        Math.PI / 6,
        0.5,
        0.8
      )

      spotlight.position.copy(position)
      spotlight.target.position.set(
        position.x * 0.3,
        0,
        position.z - 5
      )

      spotlight.castShadow = true
      spotlight.shadow.mapSize.width = 512
      spotlight.shadow.mapSize.height = 512

      spotlight.name = `festival_spotlight_${index}`
      this.festivalLights.push(spotlight)
      this.lighting.add(spotlight)
      this.lighting.add(spotlight.target)
    })
  }

  private createFestivalStages(): void {
    this.stageConfigs.forEach(config => {
      const stageGroup = this.createStage(config)
      this.stages.set(config.id, stageGroup)
      this.scene.add(stageGroup)
    })
  }

  private createStage(config: FestivalStageConfig): THREE.Group {
    const stageGroup = new THREE.Group()
    stageGroup.name = `stage_${config.id}`
    stageGroup.position.copy(config.position)

    // Stage platform
    const platformGeometry = new THREE.BoxGeometry(config.size.x, 1, config.size.z)
    const platformMaterial = new THREE.MeshLambertMaterial({
      color: config.primaryColor,
      transparent: true,
      opacity: 0.8
    })

    const platform = new THREE.Mesh(platformGeometry, platformMaterial)
    platform.position.y = 0.5
    platform.castShadow = true
    platform.receiveShadow = true
    platform.name = `${config.id}_platform`
    stageGroup.add(platform)

    // Stage backdrop
    const backdropGeometry = new THREE.PlaneGeometry(config.size.x, config.size.y)
    const backdropMaterial = new THREE.MeshLambertMaterial({
      color: config.secondaryColor,
      transparent: true,
      opacity: 0.9
    })

    const backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial)
    backdrop.position.set(0, config.size.y / 2, -config.size.z / 2)
    backdrop.name = `${config.id}_backdrop`
    stageGroup.add(backdrop)

    // Add roof for covered stages
    if (config.hasRoof) {
      this.addStageRoof(stageGroup, config)
    }

    // Add stage equipment based on type
    this.addStageEquipment(stageGroup, config)

    return stageGroup
  }

  private addStageRoof(stageGroup: THREE.Group, config: FestivalStageConfig): void {
    const roofGeometry = new THREE.PlaneGeometry(config.size.x + 4, config.size.z + 4)
    const roofMaterial = new THREE.MeshLambertMaterial({
      color: 0x2c3e50,
      transparent: true,
      opacity: 0.7
    })

    const roof = new THREE.Mesh(roofGeometry, roofMaterial)
    roof.rotation.x = -Math.PI / 2
    roof.position.y = config.size.y + 2
    roof.castShadow = true
    roof.name = `${config.id}_roof`

    // Add support beams
    const beamGeometry = new THREE.CylinderGeometry(0.1, 0.1, config.size.y + 2)
    const beamMaterial = new THREE.MeshLambertMaterial({ color: 0x34495e })

    const beamPositions = [
      [-config.size.x / 2, 0, -config.size.z / 2],
      [config.size.x / 2, 0, -config.size.z / 2],
      [-config.size.x / 2, 0, config.size.z / 2],
      [config.size.x / 2, 0, config.size.z / 2]
    ]

    beamPositions.forEach((pos, index) => {
      const beam = new THREE.Mesh(beamGeometry, beamMaterial)
      beam.position.set(pos[0], (config.size.y + 2) / 2, pos[2])
      beam.castShadow = true
      beam.name = `${config.id}_beam_${index}`
      stageGroup.add(beam)
    })

    stageGroup.add(roof)
  }

  private addStageEquipment(stageGroup: THREE.Group, config: FestivalStageConfig): void {
    switch (config.type) {
      case 'main':
        this.addMainStageEquipment(stageGroup, config)
        break
      case 'edm_tent':
        this.addEDMStageEquipment(stageGroup, config)
        break
      case 'art_installation':
        this.addArtInstallationEquipment(stageGroup, config)
        break
      case 'chill_out':
        this.addChillOutEquipment(stageGroup, config)
        break
    }
  }

  private addMainStageEquipment(stageGroup: THREE.Group, config: FestivalStageConfig): void {
    // Large LED screens
    const screenGeometry = new THREE.PlaneGeometry(6, 4)
    const screenMaterial = new THREE.MeshBasicMaterial({
      color: 0x111111,
      emissive: 0x222222
    })

    const leftScreen = new THREE.Mesh(screenGeometry, screenMaterial)
    leftScreen.position.set(-4, 3, -config.size.z / 2 + 0.1)
    leftScreen.name = `${config.id}_screen_left`
    stageGroup.add(leftScreen)

    const rightScreen = new THREE.Mesh(screenGeometry, screenMaterial)
    rightScreen.position.set(4, 3, -config.size.z / 2 + 0.1)
    rightScreen.name = `${config.id}_screen_right`
    stageGroup.add(rightScreen)

    // Speaker towers
    this.addSpeakerTowers(stageGroup, config, [-6, 6])

    // Light rigging
    this.addLightRigging(stageGroup, config)
  }

  private addEDMStageEquipment(stageGroup: THREE.Group, config: FestivalStageConfig): void {
    // DJ booth
    const boothGeometry = new THREE.BoxGeometry(3, 1.2, 1.5)
    const boothMaterial = new THREE.MeshLambertMaterial({ color: 0x2c3e50 })

    const djBooth = new THREE.Mesh(boothGeometry, boothMaterial)
    djBooth.position.set(0, 1.6, 0)
    djBooth.castShadow = true
    djBooth.name = `${config.id}_dj_booth`
    stageGroup.add(djBooth)

    // Laser projectors
    this.addLaserProjectors(stageGroup, config)

    // Sound system
    this.addSoundSystem(stageGroup, config)
  }

  private addArtInstallationEquipment(stageGroup: THREE.Group, config: FestivalStageConfig): void {
    // Art projection surfaces
    const surfaces = [
      { pos: [-3, 2, 0], rot: [0, Math.PI / 4, 0] },
      { pos: [3, 2, 0], rot: [0, -Math.PI / 4, 0] },
      { pos: [0, 3, 2], rot: [0, Math.PI, 0] }
    ]

    surfaces.forEach((surface, index) => {
      const surfaceGeometry = new THREE.PlaneGeometry(2, 3)
      const surfaceMaterial = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9
      })

      const artSurface = new THREE.Mesh(surfaceGeometry, surfaceMaterial)
      artSurface.position.set(...surface.pos)
      artSurface.rotation.set(...surface.rot)
      artSurface.name = `${config.id}_surface_${index}`
      stageGroup.add(artSurface)
    })

    // Interactive elements
    this.addInteractiveElements(stageGroup, config)
  }

  private addChillOutEquipment(stageGroup: THREE.Group, config: FestivalStageConfig): void {
    // Ambient lighting poles
    const polePositions = [
      [-4, 0, -4], [4, 0, -4], [-4, 0, 4], [4, 0, 4], [0, 0, 0]
    ]

    polePositions.forEach((pos, index) => {
      const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 4)
      const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x7f8c8d })

      const pole = new THREE.Mesh(poleGeometry, poleMaterial)
      pole.position.set(pos[0], 2, pos[2])
      pole.castShadow = true
      pole.name = `${config.id}_pole_${index}`
      stageGroup.add(pole)

      // Add ambient light
      const ambientSpot = new THREE.SpotLight(0xffeaa7, 0.3, 8, Math.PI / 3, 0.8, 1)
      ambientSpot.position.set(pos[0], 4, pos[2])
      ambientSpot.target.position.set(pos[0], 0, pos[2])
      ambientSpot.name = `${config.id}_ambient_${index}`
      stageGroup.add(ambientSpot)
      stageGroup.add(ambientSpot.target)
    })
  }

  private addSpeakerTowers(stageGroup: THREE.Group, config: FestivalStageConfig, positions: number[]): void {
    positions.forEach((x, index) => {
      const towerGeometry = new THREE.BoxGeometry(1, 6, 1)
      const towerMaterial = new THREE.MeshLambertMaterial({ color: 0x34495e })

      const tower = new THREE.Mesh(towerGeometry, towerMaterial)
      tower.position.set(x, 3, config.size.z / 2 + 1)
      tower.castShadow = true
      tower.name = `${config.id}_speaker_${index}`
      stageGroup.add(tower)
    })
  }

  private addLightRigging(stageGroup: THREE.Group, config: FestivalStageConfig): void {
    // Overhead light rigging
    const riggingGeometry = new THREE.CylinderGeometry(0.05, 0.05, config.size.x)
    const riggingMaterial = new THREE.MeshLambertMaterial({ color: 0x95a5a6 })

    const rigging = new THREE.Mesh(riggingGeometry, riggingMaterial)
    rigging.rotation.z = Math.PI / 2
    rigging.position.set(0, config.size.y + 1, 0)
    rigging.castShadow = true
    rigging.name = `${config.id}_rigging`
    stageGroup.add(rigging)
  }

  private addLaserProjectors(stageGroup: THREE.Group, config: FestivalStageConfig): void {
    const laserPositions = [
      [-2, 4, -config.size.z / 2],
      [2, 4, -config.size.z / 2],
      [0, 6, config.size.z / 2]
    ]

    laserPositions.forEach((pos, index) => {
      const laserGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.5)
      const laserMaterial = new THREE.MeshLambertMaterial({ color: 0xe74c3c })

      const laser = new THREE.Mesh(laserGeometry, laserMaterial)
      laser.position.set(...pos)
      laser.name = `${config.id}_laser_${index}`
      stageGroup.add(laser)
    })
  }

  private addSoundSystem(stageGroup: THREE.Group, config: FestivalStageConfig): void {
    // Subwoofers
    const subPositions = [
      [-4, 0.5, config.size.z / 2],
      [4, 0.5, config.size.z / 2]
    ]

    subPositions.forEach((pos, index) => {
      const subGeometry = new THREE.BoxGeometry(1.5, 1, 1.5)
      const subMaterial = new THREE.MeshLambertMaterial({ color: 0x2c3e50 })

      const sub = new THREE.Mesh(subGeometry, subMaterial)
      sub.position.set(...pos)
      sub.castShadow = true
      sub.name = `${config.id}_sub_${index}`
      stageGroup.add(sub)
    })
  }

  private addInteractiveElements(stageGroup: THREE.Group, config: FestivalStageConfig): void {
    // Interactive art pieces
    const elementPositions = [
      [-2, 1, 1], [2, 1, 1], [0, 1, -1]
    ]

    elementPositions.forEach((pos, index) => {
      const elementGeometry = new THREE.DodecahedronGeometry(0.5)
      const elementMaterial = new THREE.MeshLambertMaterial({
        color: 0x9b59b6,
        transparent: true,
        opacity: 0.8
      })

      const element = new THREE.Mesh(elementGeometry, elementMaterial)
      element.position.set(...pos)
      element.name = `${config.id}_interactive_${index}`
      stageGroup.add(element)
    })
  }

  private createDecorations(): void {
    this.decorations.name = 'festival_decorations'

    // Food and merchandise stalls
    this.createStalls()

    // Festival banners and flags
    this.createBanners()

    // Seating areas
    this.createSeatingAreas()

    this.scene.add(this.decorations)
  }

  private createStalls(): void {
    const stallPositions = [
      { pos: [-35, 0, 5], type: 'food' },
      { pos: [-30, 0, 10], type: 'merch' },
      { pos: [35, 0, 5], type: 'drinks' },
      { pos: [30, 0, 10], type: 'art' }
    ]

    stallPositions.forEach((stall, index) => {
      const stallGroup = new THREE.Group()

      // Stall structure
      const stallGeometry = new THREE.BoxGeometry(3, 3, 3)
      const stallMaterial = new THREE.MeshLambertMaterial({
        color: index % 2 === 0 ? 0xe67e22 : 0x3498db
      })

      const stallMesh = new THREE.Mesh(stallGeometry, stallMaterial)
      stallMesh.position.y = 1.5
      stallMesh.castShadow = true
      stallMesh.name = `stall_${stall.type}`

      stallGroup.add(stallMesh)
      stallGroup.position.set(...stall.pos)
      stallGroup.name = `stall_group_${index}`

      this.decorations.add(stallGroup)
    })
  }

  private createBanners(): void {
    const bannerPositions = [
      [-15, 8, -25], [15, 8, -25], [0, 12, 20]
    ]

    bannerPositions.forEach((pos, index) => {
      const bannerGeometry = new THREE.PlaneGeometry(8, 2)
      const bannerMaterial = new THREE.MeshLambertMaterial({
        color: [0xff6b6b, 0x4ecdc4, 0xffeaa7][index]
      })

      const banner = new THREE.Mesh(bannerGeometry, bannerMaterial)
      banner.position.set(...pos)
      banner.name = `banner_${index}`

      this.decorations.add(banner)
    })
  }

  private createSeatingAreas(): void {
    // Create scattered seating areas
    const seatingAreas = [
      { center: [-20, 0, 20], radius: 8 },
      { center: [20, 0, 20], radius: 6 },
      { center: [0, 0, 35], radius: 10 }
    ]

    seatingAreas.forEach((area, areaIndex) => {
      const seatingGroup = new THREE.Group()

      // Create circular arrangement of benches
      const benchCount = Math.floor(area.radius / 1.5)
      for (let i = 0; i < benchCount; i++) {
        const angle = (i / benchCount) * Math.PI * 2
        const x = area.center[0] + Math.cos(angle) * area.radius
        const z = area.center[2] + Math.sin(angle) * area.radius

        const benchGeometry = new THREE.BoxGeometry(2, 0.3, 0.5)
        const benchMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 })

        const bench = new THREE.Mesh(benchGeometry, benchMaterial)
        bench.position.set(x, 0.15, z)
        bench.rotation.y = angle + Math.PI / 2
        bench.castShadow = true
        bench.name = `bench_${areaIndex}_${i}`

        seatingGroup.add(bench)
      }

      seatingGroup.name = `seating_area_${areaIndex}`
      this.decorations.add(seatingGroup)
    })
  }

  private createAtmosphere(): void {
    this.atmosphere.name = 'festival_atmosphere'

    // Create particle systems for atmospheric effects
    this.createFireflies()

    this.scene.add(this.atmosphere)
  }

  private createFireflies(): void {
    const fireflyCount = 50
    const positions = new Float32Array(fireflyCount * 3)

    for (let i = 0; i < fireflyCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100
      positions[i * 3 + 1] = Math.random() * 8 + 2
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100
    }

    const fireflyGeometry = new THREE.BufferGeometry()
    fireflyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const fireflyMaterial = new THREE.PointsMaterial({
      color: 0xffeaa7,
      size: 0.3,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    })

    const fireflies = new THREE.Points(fireflyGeometry, fireflyMaterial)
    fireflies.name = 'fireflies'
    this.atmosphere.add(fireflies)
  }

  public updateTimeOfDay(hour: number, minute: number): void {
    this.timeOfDay.hour = hour
    this.timeOfDay.minute = minute

    // Calculate sun position based on time
    const timeProgress = (hour + minute / 60) / 24
    const sunAngle = timeProgress * Math.PI * 2 - Math.PI / 2

    this.timeOfDay.sunPosition.set(
      Math.cos(sunAngle) * 50,
      Math.sin(sunAngle) * 30 + 10,
      -20
    )

    // Update sky color and lighting intensity
    if (hour >= 6 && hour < 20) {
      // Day time
      this.timeOfDay.skyColor = 0x87CEEB
      this.timeOfDay.ambientIntensity = 0.6
      this.timeOfDay.spotlightIntensity = 0.3
    } else {
      // Night time
      this.timeOfDay.skyColor = 0x1a1a2e
      this.timeOfDay.ambientIntensity = 0.2
      this.timeOfDay.spotlightIntensity = 1.0
    }

    this.applyTimeOfDayChanges()
  }

  private applyTimeOfDayChanges(): void {
    // Update skybox color
    if (this.skybox.material instanceof THREE.MeshBasicMaterial) {
      this.skybox.material.color.setHex(this.timeOfDay.skyColor)
    }

    // Update ambient lighting
    this.ambientLight.intensity = this.timeOfDay.ambientIntensity

    // Update directional light
    this.directionalLight.position.copy(this.timeOfDay.sunPosition)
    this.directionalLight.intensity = this.timeOfDay.ambientIntensity

    // Update festival lights intensity
    this.festivalLights.forEach(light => {
      light.intensity = this.timeOfDay.spotlightIntensity
    })

    // Update fog color
    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.setHex(this.timeOfDay.skyColor)
    }
  }

  public updateWeather(weather: Partial<WeatherState>): void {
    Object.assign(this.weather, weather)
    this.applyWeatherEffects()
  }

  private applyWeatherEffects(): void {
    // Remove existing weather particles
    if (this.weatherParticles) {
      this.scene.remove(this.weatherParticles)
      this.weatherParticles = null
    }

    // Update visibility with fog
    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.density = 0.02 * (1 - this.weather.visibility)
    }

    // Add weather particles based on weather type
    switch (this.weather.type) {
      case 'rain':
        this.createRainParticles()
        break
      case 'storm':
        this.createStormParticles()
        break
      case 'cloudy':
        // Just reduce visibility, no particles needed
        break
    }
  }

  private createRainParticles(): void {
    const rainCount = Math.floor(1000 * this.weather.intensity)
    const positions = new Float32Array(rainCount * 3)

    for (let i = 0; i < rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200
      positions[i * 3 + 1] = Math.random() * 50 + 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200
    }

    const rainGeometry = new THREE.BufferGeometry()
    rainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const rainMaterial = new THREE.PointsMaterial({
      color: 0x6db4f2,
      size: 0.1,
      transparent: true,
      opacity: 0.6
    })

    this.weatherParticles = new THREE.Points(rainGeometry, rainMaterial)
    this.weatherParticles.name = 'rain_particles'
    this.scene.add(this.weatherParticles)
  }

  private createStormParticles(): void {
    this.createRainParticles()

    // Add lightning effect (flash lighting)
    if (Math.random() < 0.01) {
      this.createLightningFlash()
    }
  }

  private createLightningFlash(): void {
    const flash = new THREE.DirectionalLight(0xffffff, 2)
    flash.position.set(
      Math.random() * 100 - 50,
      50,
      Math.random() * 100 - 50
    )

    this.scene.add(flash)

    setTimeout(() => {
      this.scene.remove(flash)
    }, 150)
  }

  public update(deltaTime: number): void {
    // Animate fireflies
    const fireflies = this.atmosphere.getObjectByName('fireflies')
    if (fireflies instanceof THREE.Points) {
      fireflies.rotation.y += deltaTime * 0.1

      // Make fireflies bob up and down
      const positions = fireflies.geometry.attributes.position
      for (let i = 0; i < positions.count; i++) {
        positions.setY(i, positions.getY(i) + Math.sin(Date.now() * 0.001 + i) * 0.01)
      }
      positions.needsUpdate = true
    }

    // Animate weather particles
    if (this.weatherParticles) {
      const positions = this.weatherParticles.geometry.attributes.position
      const windEffect = this.weather.windDirection.clone().multiplyScalar(this.weather.windSpeed * deltaTime)

      for (let i = 0; i < positions.count; i++) {
        // Apply wind and gravity
        positions.setY(i, positions.getY(i) - deltaTime * 10)
        positions.setX(i, positions.getX(i) + windEffect.x)
        positions.setZ(i, positions.getZ(i) + windEffect.z)

        // Reset particles that fall below ground
        if (positions.getY(i) < 0) {
          positions.setY(i, 50)
          positions.setX(i, (Math.random() - 0.5) * 200)
          positions.setZ(i, (Math.random() - 0.5) * 200)
        }
      }
      positions.needsUpdate = true
    }

    // Animate festival lights
    this.festivalLights.forEach((light, index) => {
      const time = Date.now() * 0.001
      light.intensity = this.timeOfDay.spotlightIntensity * (0.8 + Math.sin(time + index) * 0.2)
    })
  }

  public getScene(): THREE.Scene {
    return this.scene
  }

  public getStage(stageId: string): THREE.Group | undefined {
    return this.stages.get(stageId)
  }

  public getAllStages(): Map<string, THREE.Group> {
    return this.stages
  }

  public getStageConfigs(): FestivalStageConfig[] {
    return [...this.stageConfigs]
  }

  public getTimeOfDay(): TimeOfDay {
    return { ...this.timeOfDay }
  }

  public getWeather(): WeatherState {
    return { ...this.weather }
  }

  public dispose(): void {
    // Dispose of all materials and geometries
    this.scene.traverse(child => {
      if (child instanceof THREE.Mesh) {
        if (child.material instanceof THREE.Material) {
          child.material.dispose()
        }
        if (child.geometry) {
          child.geometry.dispose()
        }
      }
    })

    // Clear all groups
    this.stages.clear()
    this.decorations.clear()
    this.lighting.clear()
    this.atmosphere.clear()

    // Clear scene
    this.scene.clear()
  }
}