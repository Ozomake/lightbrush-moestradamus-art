import * as THREE from 'three'

export type ProjectorType = 'standard' | 'high_power' | 'laser' | 'led_wall' | 'mobile_rig'
export type ProjectorStatus = 'idle' | 'active' | 'maintenance' | 'broken' | 'setup'
export type ProjectorMode = 'static' | 'animated' | 'reactive' | 'synchronized' | 'interactive'

export interface ProjectorConfig {
  id: string
  type: ProjectorType
  position: THREE.Vector3
  rotation: THREE.Euler
  power: number // watts
  brightness: number // lumens
  resolution: { width: number, height: number }
  throwDistance: { min: number, max: number }
  fov: number
  aspect: number
  costPerHour: number
  setupTime: number // minutes
  reliability: number // 0-1, affects breakdown chance
  weatherResistance: number // 0-1, affects weather damage
}

export interface ProjectorRig {
  id: string
  name: string
  projectors: FestivalProjector[]
  position: THREE.Vector3
  rotation: THREE.Euler
  maxProjectors: number
  powerRequirement: number
  crewRequired: number
  rigType: 'ground' | 'truss' | 'tower' | 'mobile'
  transportCost: number
  setupComplexity: number // 1-10
}

export interface ProjectionContent {
  id: string
  name: string
  type: 'video' | 'generative' | 'reactive'
  duration: number // seconds
  beatsPerMinute?: number
  energyLevel: number // 1-10
  complexity: number // affects CPU/GPU load
  genre: string
  tags: string[]
  popularity: number // 0-100
}

export interface ProjectorPerformance {
  efficiency: number // 0-1
  heatLevel: number // 0-100
  maintenanceNeeded: number // 0-100
  hoursUsed: number
  breakdownRisk: number // 0-1
  powerConsumption: number
  crowdReaction: number // 0-100
}

export class FestivalProjector {
  private config: ProjectorConfig
  private group: THREE.Group
  private projectorMesh!: THREE.Mesh
  private spotLight!: THREE.SpotLight
  private projectionCamera!: THREE.PerspectiveCamera
  private frustumHelper: THREE.CameraHelper | null = null

  // Projection system
  private projectionTexture: THREE.Texture | null = null
  private projectionMaterial: THREE.ShaderMaterial | null = null
  private projectionSurfaces: THREE.Mesh[] = []
  private currentContent: ProjectionContent | null = null

  // Status and performance
  private status: ProjectorStatus = 'idle'
  private mode: ProjectorMode = 'static'
  private performance!: ProjectorPerformance
  private isSetupComplete: boolean = false
  private setupProgress: number = 0

  // Environmental factors
  private ambientTemperature: number = 20 // Celsius
  private humidity: number = 50 // percentage
  private weatherProtection: boolean = false

  // Real-time effects
  private audioAnalyzer: AnalyserNode | null = null
  private beatDetector: BeatDetector | null = null
  private colorPalette: THREE.Color[] = []
  private animationMixer: THREE.AnimationMixer | null = null

  // Interaction
  private isDragging: boolean = false
  private canvasTexture: THREE.CanvasTexture | null = null
  private canvas2d: CanvasRenderingContext2D | null = null

  constructor(config: ProjectorConfig) {
    this.config = config
    this.group = new THREE.Group()
    this.group.name = `festival_projector_${config.id}`

    this.initializePerformance()
    this.createProjectorHardware()
    this.createProjectionSystem()
    this.createInteractionSystems()
    this.generateColorPalette()

    // Position the projector
    this.group.position.copy(config.position)
    this.group.rotation.copy(config.rotation)
  }

  private initializePerformance(): void {
    this.performance = {
      efficiency: 0.9,
      heatLevel: 20,
      maintenanceNeeded: 0,
      hoursUsed: 0,
      breakdownRisk: 0,
      powerConsumption: this.config.power * 0.8, // Start at 80% rated power
      crowdReaction: 50
    }
  }

  private createProjectorHardware(): void {
    // Create different projector types
    switch (this.config.type) {
      case 'standard':
        this.createStandardProjector()
        break
      case 'high_power':
        this.createHighPowerProjector()
        break
      case 'laser':
        this.createLaserProjector()
        break
      case 'led_wall':
        this.createLEDWall()
        break
      case 'mobile_rig':
        this.createMobileRig()
        break
    }

    this.createProjectionLight()
    this.createFrustumVisualization()
  }

  private createStandardProjector(): void {
    // Professional projector housing
    const housingGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.8)
    const housingMaterial = new THREE.MeshLambertMaterial({
      color: 0x2c3e50,
      emissive: 0x1a1a1a
    })

    this.projectorMesh = new THREE.Mesh(housingGeometry, housingMaterial)
    this.projectorMesh.castShadow = true
    this.projectorMesh.name = `${this.config.id}_housing`

    // Lens assembly
    const lensGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16)
    const lensMaterial = new THREE.MeshPhongMaterial({
      color: 0x111111,
      shininess: 200,
      transparent: true,
      opacity: 0.9
    })

    const lens = new THREE.Mesh(lensGeometry, lensMaterial)
    lens.position.set(0, 0, 0.4)
    lens.rotation.x = Math.PI / 2
    lens.name = `${this.config.id}_lens`

    // Cooling vents
    this.createCoolingVents()

    // Mount/bracket
    this.createProjectorMount()

    this.group.add(this.projectorMesh)
    this.group.add(lens)
  }

  private createHighPowerProjector(): void {
    // Larger, more robust housing
    const housingGeometry = new THREE.BoxGeometry(0.8, 0.6, 1.2)
    const housingMaterial = new THREE.MeshLambertMaterial({
      color: 0x34495e,
      emissive: 0x2c3e50
    })

    this.projectorMesh = new THREE.Mesh(housingGeometry, housingMaterial)
    this.projectorMesh.castShadow = true

    // Multiple lenses
    for (let i = 0; i < 2; i++) {
      const lensGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.15, 16)
      const lensMaterial = new THREE.MeshPhongMaterial({
        color: 0x0a0a0a,
        shininess: 300
      })

      const lens = new THREE.Mesh(lensGeometry, lensMaterial)
      lens.position.set(i === 0 ? -0.2 : 0.2, 0, 0.6)
      lens.rotation.x = Math.PI / 2

      this.group.add(lens)
    }

    // Heat exchanger
    this.createHeatExchanger()

    this.group.add(this.projectorMesh)
  }

  private createLaserProjector(): void {
    // Compact laser housing
    const housingGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.6, 12)
    const housingMaterial = new THREE.MeshLambertMaterial({
      color: 0xe74c3c,
      emissive: 0x8b0000
    })

    this.projectorMesh = new THREE.Mesh(housingGeometry, housingMaterial)
    this.projectorMesh.castShadow = true

    // Laser aperture
    const apertureGeometry = new THREE.CircleGeometry(0.05, 16)
    const apertureMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000
      // emissive: 0xff0000,
      // emissiveIntensity: 0.5
    })

    const aperture = new THREE.Mesh(apertureGeometry, apertureMaterial)
    aperture.position.set(0, 0.3, 0)
    aperture.rotation.x = -Math.PI / 2

    this.group.add(this.projectorMesh)
    this.group.add(aperture)
  }

  private createLEDWall(): void {
    // LED panel array
    const panelGeometry = new THREE.BoxGeometry(2, 1.5, 0.2)
    const panelMaterial = new THREE.MeshBasicMaterial({
      color: 0x111111
      // emissive: 0x333333
    })

    this.projectorMesh = new THREE.Mesh(panelGeometry, panelMaterial)

    // LED grid simulation
    const ledCount = 32 * 24 // Simulate LED resolution
    const ledGeometry = new THREE.PlaneGeometry(2, 1.5, 31, 23)
    const ledMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000
      // emissive: 0x111111
    })

    const ledGrid = new THREE.Mesh(ledGeometry, ledMaterial)
    ledGrid.position.z = 0.11

    this.group.add(this.projectorMesh)
    this.group.add(ledGrid)
  }

  private createMobileRig(): void {
    // Mobile base
    const baseGeometry = new THREE.BoxGeometry(1, 0.2, 1)
    const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x7f8c8d })

    const base = new THREE.Mesh(baseGeometry, baseMaterial)
    base.position.y = -0.5

    // Telescoping pole
    const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2)
    const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x95a5a6 })

    const pole = new THREE.Mesh(poleGeometry, poleMaterial)
    pole.position.y = 0.5

    // Standard projector on top
    this.createStandardProjector()
    this.projectorMesh.position.y = 1.5

    // Wheels
    for (let i = 0; i < 4; i++) {
      const wheelGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 12)
      const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x2c3e50 })

      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial)
      wheel.rotation.z = Math.PI / 2
      wheel.position.set(
        i % 2 === 0 ? -0.4 : 0.4,
        -0.4,
        i < 2 ? -0.4 : 0.4
      )

      this.group.add(wheel)
    }

    this.group.add(base)
    this.group.add(pole)
  }

  private createCoolingVents(): void {
    // Cooling fan visualization
    const ventPositions = [
      { x: -0.25, y: 0, z: -0.3 },
      { x: 0.25, y: 0, z: -0.3 }
    ]

    ventPositions.forEach((pos, index) => {
      const ventGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 12)
      const ventMaterial = new THREE.MeshLambertMaterial({
        color: 0x95a5a6,
        transparent: true,
        opacity: 0.7
      })

      const vent = new THREE.Mesh(ventGeometry, ventMaterial)
      vent.position.set(pos.x, pos.y, pos.z)
      vent.rotation.x = Math.PI / 2
      vent.name = `${this.config.id}_vent_${index}`

      this.group.add(vent)
    })
  }

  private createProjectorMount(): void {
    // Universal mount
    const mountGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.3)
    const mountMaterial = new THREE.MeshLambertMaterial({ color: 0x5a6c7d })

    const mount = new THREE.Mesh(mountGeometry, mountMaterial)
    mount.position.y = -0.25
    mount.name = `${this.config.id}_mount`

    // Adjustment mechanisms
    const adjustGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.15, 8)
    const adjustMaterial = new THREE.MeshLambertMaterial({ color: 0x34495e })

    for (let i = 0; i < 3; i++) {
      const adjust = new THREE.Mesh(adjustGeometry, adjustMaterial)
      adjust.position.set(
        Math.cos(i * (Math.PI * 2 / 3)) * 0.1,
        -0.3,
        Math.sin(i * (Math.PI * 2 / 3)) * 0.1
      )
      this.group.add(adjust)
    }

    this.group.add(mount)
  }

  private createHeatExchanger(): void {
    // Heat sink fins
    for (let i = 0; i < 8; i++) {
      const finGeometry = new THREE.BoxGeometry(0.02, 0.3, 0.4)
      const finMaterial = new THREE.MeshLambertMaterial({ color: 0x7f8c8d })

      const fin = new THREE.Mesh(finGeometry, finMaterial)
      fin.position.set(-0.35 + i * 0.1, 0, -0.2)

      this.group.add(fin)
    }
  }

  private createProjectionLight(): void {
    // Main projection light
    this.spotLight = new THREE.SpotLight(
      0xffffff,
      this.config.brightness / 10000, // Convert lumens to Three.js intensity
      this.config.throwDistance.max,
      this.config.fov * Math.PI / 180,
      0.3,
      0.8
    )

    this.spotLight.position.set(0, 0, 0.5)
    this.spotLight.target.position.set(0, 0, -5)

    // Configure shadows
    this.spotLight.castShadow = true
    this.spotLight.shadow.mapSize.width = 1024
    this.spotLight.shadow.mapSize.height = 1024
    this.spotLight.shadow.camera.near = 0.1
    this.spotLight.shadow.camera.far = this.config.throwDistance.max
    this.spotLight.shadow.focus = 1

    this.spotLight.name = `${this.config.id}_spotlight`

    this.group.add(this.spotLight)
    this.group.add(this.spotLight.target)
  }

  private createProjectionSystem(): void {
    // Create projection camera matching the projector's specifications
    this.projectionCamera = new THREE.PerspectiveCamera(
      this.config.fov,
      this.config.aspect,
      this.config.throwDistance.min,
      this.config.throwDistance.max
    )

    this.projectionCamera.position.set(0, 0, 0.5)
    this.projectionCamera.name = `${this.config.id}_camera`
    this.group.add(this.projectionCamera)

    // Create canvas for dynamic content generation
    this.createDynamicCanvas()

    // Create projection shader material
    this.createProjectionMaterial()
  }

  private createDynamicCanvas(): void {
    const canvas = document.createElement('canvas')
    canvas.width = this.config.resolution.width
    canvas.height = this.config.resolution.height

    this.canvas2d = canvas.getContext('2d')
    this.canvasTexture = new THREE.CanvasTexture(canvas)
    this.canvasTexture.name = `${this.config.id}_canvas_texture`
  }

  private createProjectionMaterial(): void {
    // Advanced projection shader
    const vertexShader = `
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      varying vec3 vNormal;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);

        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `

    const fragmentShader = `
      uniform sampler2D projectionTexture;
      uniform mat4 projectorMatrix;
      uniform mat4 projectorProjectionMatrix;
      uniform float intensity;
      uniform float time;
      uniform vec3 projectorPosition;
      uniform float fadeDistance;
      uniform bool reactive;
      uniform float audioLevel;
      uniform float beatStrength;

      varying vec2 vUv;
      varying vec3 vWorldPosition;
      varying vec3 vNormal;

      void main() {
        // Calculate projection coordinates
        vec4 projectorSpacePos = projectorProjectionMatrix * projectorMatrix * vec4(vWorldPosition, 1.0);
        vec3 projCoords = projectorSpacePos.xyz / projectorSpacePos.w;

        // Check if fragment is within projection frustum
        if (projCoords.x < -1.0 || projCoords.x > 1.0 ||
            projCoords.y < -1.0 || projCoords.y > 1.0 ||
            projCoords.z < -1.0 || projCoords.z > 1.0) {
          discard;
        }

        // Convert to UV coordinates
        vec2 projUv = projCoords.xy * 0.5 + 0.5;

        // Sample projection texture
        vec4 projectedColor = texture2D(projectionTexture, projUv);

        // Calculate distance from projector
        float distance = length(vWorldPosition - projectorPosition);
        float distanceFactor = 1.0 - smoothstep(fadeDistance * 0.7, fadeDistance, distance);

        // Calculate angle factor (surface normal vs projection direction)
        vec3 projectionDir = normalize(projectorPosition - vWorldPosition);
        float angleFactor = max(0.0, dot(vNormal, projectionDir));

        // Apply reactive effects
        float finalIntensity = intensity * distanceFactor * angleFactor;

        if (reactive) {
          finalIntensity *= (0.8 + 0.2 * audioLevel + 0.3 * beatStrength * sin(time * 10.0));
        }

        // Apply color and intensity
        gl_FragColor = projectedColor * finalIntensity;
        gl_FragColor.a *= finalIntensity;
      }
    `

    this.projectionMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        projectionTexture: { value: this.canvasTexture },
        projectorMatrix: { value: new THREE.Matrix4() },
        projectorProjectionMatrix: { value: new THREE.Matrix4() },
        intensity: { value: 1.0 },
        time: { value: 0 },
        projectorPosition: { value: new THREE.Vector3() },
        fadeDistance: { value: this.config.throwDistance.max },
        reactive: { value: false },
        audioLevel: { value: 0 },
        beatStrength: { value: 0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  }

  private createFrustumVisualization(): void {
    this.frustumHelper = new THREE.CameraHelper(this.projectionCamera)
    this.frustumHelper.visible = false
    this.frustumHelper.name = `${this.config.id}_frustum`
    this.group.add(this.frustumHelper)
  }

  private createInteractionSystems(): void {
    // Make projector draggable
    this.projectorMesh.userData = {
      type: 'draggable',
      isDraggable: true,
      onDragStart: () => this.onDragStart(),
      onDrag: (position: THREE.Vector3) => this.onDrag(position),
      onDragEnd: () => this.onDragEnd()
    }

    // Add hover effects
    this.projectorMesh.userData.onHover = () => this.onHover()
    this.projectorMesh.userData.onHoverEnd = () => this.onHoverEnd()
  }

  private generateColorPalette(): void {
    // Generate color palette based on projector type
    const basePalettes = {
      standard: [0x4ecdc4, 0xff6b6b, 0xffeaa7, 0x74b9ff, 0xa29bfe],
      high_power: [0xe17055, 0x00b894, 0x0984e3, 0x6c5ce7, 0xfd79a8],
      laser: [0xff0080, 0x00ff80, 0x8000ff, 0xff8000, 0x0080ff],
      led_wall: [0xff6b6b, 0x4ecdc4, 0xffeaa7, 0x74b9ff, 0xa29bfe],
      mobile_rig: [0x95a5a6, 0x3498db, 0xe74c3c, 0x2ecc71, 0xf39c12]
    }

    const palette = basePalettes[this.config.type]
    this.colorPalette = palette.map(color => new THREE.Color(color))
  }

  // Audio analysis setup
  public connectAudioSource(audioElement: HTMLAudioElement): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = audioContext.createMediaElementSource(audioElement)

      this.audioAnalyzer = audioContext.createAnalyser()
      this.audioAnalyzer.fftSize = 256

      source.connect(this.audioAnalyzer)
      this.audioAnalyzer.connect(audioContext.destination)

      this.beatDetector = new BeatDetector(this.audioAnalyzer)
    } catch (error) {
      console.warn('Failed to connect audio source:', error)
    }
  }

  // Content management
  public loadContent(content: ProjectionContent): void {
    this.currentContent = content
    this.generateContentVisuals(content)

    // Update projector mode based on content
    if (content.type === 'reactive') {
      this.mode = 'reactive'
      if (this.projectionMaterial) {
        this.projectionMaterial.uniforms.reactive.value = true
      }
    }
  }

  private generateContentVisuals(content: ProjectionContent): void {
    if (!this.canvas2d || !this.canvasTexture) return

    const canvas = this.canvas2d.canvas
    this.canvas2d.clearRect(0, 0, canvas.width, canvas.height)

    switch (content.type) {
      case 'video':
        this.generateVideoContent(content)
        break
      case 'generative':
        this.generateGenerativeContent(content)
        break
      case 'reactive':
        this.generateReactiveContent(content)
        break
    }

    this.canvasTexture.needsUpdate = true
  }

  private generateVideoContent(content: ProjectionContent): void {
    if (!this.canvas2d) return

    // Simulate video content with animated patterns
    const time = Date.now() * 0.001

    // Background gradient
    const gradient = this.canvas2d.createLinearGradient(0, 0, this.canvas2d.canvas.width, this.canvas2d.canvas.height)
    gradient.addColorStop(0, `hsl(${(time * 10) % 360}, 70%, 30%)`)
    gradient.addColorStop(1, `hsl(${(time * 15) % 360}, 70%, 50%)`)

    this.canvas2d.fillStyle = gradient
    this.canvas2d.fillRect(0, 0, this.canvas2d.canvas.width, this.canvas2d.canvas.height)

    // Animated shapes
    for (let i = 0; i < content.complexity; i++) {
      const x = (Math.sin(time + i) * 0.3 + 0.5) * this.canvas2d.canvas.width
      const y = (Math.cos(time * 1.5 + i) * 0.3 + 0.5) * this.canvas2d.canvas.height
      const size = 20 + Math.sin(time * 2 + i) * 15

      this.canvas2d.fillStyle = `hsl(${(time * 30 + i * 60) % 360}, 80%, 60%)`
      this.canvas2d.beginPath()
      this.canvas2d.arc(x, y, size, 0, Math.PI * 2)
      this.canvas2d.fill()
    }
  }

  private generateGenerativeContent(content: ProjectionContent): void {
    if (!this.canvas2d) return

    const time = Date.now() * 0.001
    const canvas = this.canvas2d.canvas

    // Procedural pattern generation
    this.canvas2d.fillStyle = 'black'
    this.canvas2d.fillRect(0, 0, canvas.width, canvas.height)

    // Fractal-like patterns
    const iterations = Math.floor(content.complexity / 2)
    for (let i = 0; i < iterations; i++) {
      const scale = 1 / (i + 1)
      const offset = time * (i + 1) * 0.1

      this.drawFractalPattern(
        canvas.width / 2,
        canvas.height / 2,
        100 * scale,
        offset,
        this.colorPalette[i % this.colorPalette.length]
      )
    }
  }

  private drawFractalPattern(x: number, y: number, size: number, offset: number, color: THREE.Color): void {
    if (!this.canvas2d) return

    this.canvas2d.strokeStyle = `rgb(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)})`
    this.canvas2d.lineWidth = 2

    const points = 6
    this.canvas2d.beginPath()

    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2 + offset
      const px = x + Math.cos(angle) * size
      const py = y + Math.sin(angle) * size

      if (i === 0) {
        this.canvas2d.moveTo(px, py)
      } else {
        this.canvas2d.lineTo(px, py)
      }
    }

    this.canvas2d.stroke()
  }

  private generateReactiveContent(content: ProjectionContent): void {
    if (!this.canvas2d || !this.audioAnalyzer) return

    const frequencyData = new Uint8Array(this.audioAnalyzer.frequencyBinCount)
    this.audioAnalyzer.getByteFrequencyData(frequencyData)

    const canvas = this.canvas2d.canvas
    this.canvas2d.fillStyle = 'rgba(0, 0, 0, 0.1)'
    this.canvas2d.fillRect(0, 0, canvas.width, canvas.height)

    // Visualize audio data
    const barWidth = canvas.width / frequencyData.length

    for (let i = 0; i < frequencyData.length; i++) {
      const barHeight = (frequencyData[i] / 255) * canvas.height * 0.8
      const hue = (i / frequencyData.length) * 360

      this.canvas2d.fillStyle = `hsla(${hue}, 70%, 60%, 0.8)`
      this.canvas2d.fillRect(
        i * barWidth,
        canvas.height - barHeight,
        barWidth - 1,
        barHeight
      )
    }
  }

  // Interaction handlers
  private onDragStart(): void {
    this.isDragging = true
    if (this.frustumHelper) {
      this.frustumHelper.visible = true
    }
  }

  private onDrag(newPosition: THREE.Vector3): void {
    if (!this.isDragging) return

    this.group.position.copy(newPosition)
    this.config.position.copy(newPosition)

    // Update light and camera positions
    if (this.spotLight) {
      this.updateProjectionTransforms()
    }

    // Update shader uniforms
    if (this.projectionMaterial) {
      this.projectionMaterial.uniforms.projectorPosition.value.copy(newPosition)
    }
  }

  private onDragEnd(): void {
    this.isDragging = false
    if (this.frustumHelper) {
      this.frustumHelper.visible = false
    }
  }

  private onHover(): void {
    if (this.projectorMesh.material instanceof THREE.MeshLambertMaterial) {
      this.projectorMesh.material.emissive.setHex(0x444444)
    }
  }

  private onHoverEnd(): void {
    if (this.projectorMesh.material instanceof THREE.MeshLambertMaterial) {
      this.projectorMesh.material.emissive.setHex(0x1a1a1a)
    }
  }

  // Setup and maintenance
  public startSetup(): boolean {
    if (this.status !== 'idle') return false

    this.status = 'setup'
    this.setupProgress = 0
    this.isSetupComplete = false

    return true
  }

  public updateSetup(deltaTime: number, crewEfficiency: number = 1.0): void {
    if (this.status !== 'setup') return

    const setupRate = crewEfficiency / (this.config.setupTime * 60) // Convert minutes to seconds
    this.setupProgress += setupRate * deltaTime

    if (this.setupProgress >= 1.0) {
      this.completeSetup()
    }
  }

  private completeSetup(): void {
    this.setupProgress = 1.0
    this.isSetupComplete = true
    this.status = 'idle'

    // Enable projection capabilities
    if (this.spotLight) {
      this.spotLight.intensity = this.config.brightness / 10000
    }
  }

  public startProjection(): boolean {
    if (!this.isSetupComplete || this.status === 'broken') return false

    this.status = 'active'
    this.updateProjectionTransforms()

    return true
  }

  public stopProjection(): void {
    this.status = 'idle'
    if (this.spotLight) {
      this.spotLight.intensity = 0
    }
  }

  private updateProjectionTransforms(): void {
    if (!this.projectionMaterial) return

    // Update projection matrix
    this.projectionCamera.updateMatrixWorld()
    this.projectionCamera.updateProjectionMatrix()

    this.projectionMaterial.uniforms.projectorMatrix.value.copy(
      this.projectionCamera.matrixWorldInverse
    )
    this.projectionMaterial.uniforms.projectorProjectionMatrix.value.copy(
      this.projectionCamera.projectionMatrix
    )
  }

  // Performance monitoring
  public update(deltaTime: number, ambientTemp: number = 20, humidity: number = 50): void {
    this.ambientTemperature = ambientTemp
    this.humidity = humidity

    // Update operating hours
    if (this.status === 'active') {
      this.performance.hoursUsed += deltaTime / 3600
    }

    // Heat simulation
    this.updateHeatLevel(deltaTime)

    // Maintenance decay
    this.updateMaintenanceLevel(deltaTime)

    // Performance calculations
    this.updatePerformanceMetrics(deltaTime)

    // Environmental effects
    this.applyEnvironmentalEffects()

    // Update visual effects
    this.updateVisualEffects(deltaTime)

    // Check for breakdowns
    this.checkForBreakdown()
  }

  private updateHeatLevel(deltaTime: number): void {
    const targetHeat = this.status === 'active' ?
      this.ambientTemperature + (this.performance.powerConsumption / this.config.power) * 40 :
      this.ambientTemperature

    // Heat transfer simulation
    const heatTransferRate = 0.1 // K/s
    this.performance.heatLevel += (targetHeat - this.performance.heatLevel) * heatTransferRate * deltaTime

    // Overheating protection
    if (this.performance.heatLevel > 80) {
      this.performance.efficiency *= 0.95 // Reduce efficiency when overheating
    }
  }

  private updateMaintenanceLevel(deltaTime: number): void {
    if (this.status === 'active') {
      const maintenanceDecayRate = 0.1 / 3600 // 0.1% per hour
      this.performance.maintenanceNeeded += maintenanceDecayRate * deltaTime * 100

      // Heat accelerates maintenance needs
      const heatFactor = Math.max(1, this.performance.heatLevel / 60)
      this.performance.maintenanceNeeded *= heatFactor
    }

    this.performance.maintenanceNeeded = Math.min(100, this.performance.maintenanceNeeded)
  }

  private updatePerformanceMetrics(deltaTime: number): void {
    // Efficiency calculation
    const baseEfficiency = this.config.reliability
    const maintenancePenalty = this.performance.maintenanceNeeded * 0.01
    const heatPenalty = Math.max(0, (this.performance.heatLevel - 60) * 0.01)

    this.performance.efficiency = Math.max(0.1, baseEfficiency - maintenancePenalty - heatPenalty)

    // Power consumption
    if (this.status === 'active') {
      this.performance.powerConsumption = this.config.power * (0.8 + (1 - this.performance.efficiency) * 0.3)
    } else {
      this.performance.powerConsumption = this.config.power * 0.05 // Standby power
    }

    // Breakdown risk
    this.performance.breakdownRisk =
      (this.performance.maintenanceNeeded * 0.01) +
      (Math.max(0, this.performance.heatLevel - 70) * 0.02) +
      ((100 - this.config.reliability * 100) * 0.01)
  }

  private applyEnvironmentalEffects(): void {
    // Weather resistance effects
    if (!this.weatherProtection) {
      if (this.humidity > 80) {
        this.performance.breakdownRisk += 0.01
      }

      if (this.ambientTemperature > 35 || this.ambientTemperature < 0) {
        this.performance.efficiency *= 0.95
      }
    }
  }

  private updateVisualEffects(deltaTime: number): void {
    if (this.status !== 'active' || !this.projectionMaterial) return

    // Update shader time uniform
    this.projectionMaterial.uniforms.time.value += deltaTime

    // Update audio reactivity
    if (this.mode === 'reactive' && this.audioAnalyzer) {
      const frequencyData = new Uint8Array(this.audioAnalyzer.frequencyBinCount)
      this.audioAnalyzer.getByteFrequencyData(frequencyData)

      const audioLevel = frequencyData.reduce((sum, value) => sum + value, 0) / (frequencyData.length * 255)
      this.projectionMaterial.uniforms.audioLevel.value = audioLevel

      // Beat detection
      if (this.beatDetector) {
        const beatStrength = this.beatDetector.detect() ? 1.0 : 0.0
        this.projectionMaterial.uniforms.beatStrength.value = beatStrength
      }
    }

    // Update dynamic content
    if (this.currentContent && this.currentContent.type !== 'video') {
      this.generateContentVisuals(this.currentContent)
    }

    // Efficiency-based intensity variation
    if (this.spotLight) {
      const baseIntensity = this.config.brightness / 10000
      this.spotLight.intensity = baseIntensity * this.performance.efficiency
    }
  }

  private checkForBreakdown(): void {
    if (this.status === 'broken') return

    if (Math.random() < this.performance.breakdownRisk * 0.001) { // Per-frame breakdown chance
      this.breakdown()
    }
  }

  private breakdown(): void {
    this.status = 'broken'
    this.performance.efficiency = 0

    if (this.spotLight) {
      this.spotLight.intensity = 0
    }

    // Visual indication of breakdown
    if (this.projectorMesh.material instanceof THREE.MeshLambertMaterial) {
      this.projectorMesh.material.emissive.setHex(0x8b0000)
    }

    console.log(`Projector ${this.config.id} has broken down!`)
  }

  // Maintenance and repair
  public performMaintenance(): number {
    const maintenanceCost = this.calculateMaintenanceCost()

    this.performance.maintenanceNeeded = 0
    this.performance.efficiency = this.config.reliability
    this.performance.breakdownRisk = 0
    this.performance.heatLevel = this.ambientTemperature

    if (this.status === 'broken') {
      this.status = 'idle'
      if (this.projectorMesh.material instanceof THREE.MeshLambertMaterial) {
        this.projectorMesh.material.emissive.setHex(0x1a1a1a)
      }
    }

    return maintenanceCost
  }

  private calculateMaintenanceCost(): number {
    const baseCost = this.config.costPerHour * 2 // 2 hours labor
    const partsCost = this.performance.maintenanceNeeded * 10
    const breakdownMultiplier = this.status === 'broken' ? 2.5 : 1

    return (baseCost + partsCost) * breakdownMultiplier
  }

  // Weather protection
  public installWeatherProtection(): number {
    if (this.weatherProtection) return 0

    this.weatherProtection = true
    this.config.weatherResistance = 0.9

    // Visual indication
    // Add rain cover or housing
    const coverGeometry = new THREE.BoxGeometry(
      ((this.projectorMesh.geometry as any).parameters?.width || 1) * 1.2,
      ((this.projectorMesh.geometry as any).parameters?.height || 1) * 1.2,
      ((this.projectorMesh.geometry as any).parameters?.depth || 1) * 1.2
    )
    const coverMaterial = new THREE.MeshLambertMaterial({
      color: 0x95a5a6,
      transparent: true,
      opacity: 0.3
    })

    const cover = new THREE.Mesh(coverGeometry, coverMaterial)
    cover.name = `${this.config.id}_weather_cover`
    this.group.add(cover)

    return 500 // Installation cost
  }

  // Projection surface management
  public addProjectionSurface(surface: THREE.Mesh): void {
    if (!this.projectionSurfaces.includes(surface)) {
      this.projectionSurfaces.push(surface)

      // Apply projection material to surface
      if (this.projectionMaterial) {
        surface.material = this.projectionMaterial
      }
    }
  }

  public removeProjectionSurface(surface: THREE.Mesh): void {
    const index = this.projectionSurfaces.indexOf(surface)
    if (index > -1) {
      this.projectionSurfaces.splice(index, 1)
    }
  }

  // Getters
  public getGroup(): THREE.Group {
    return this.group
  }

  public getConfig(): ProjectorConfig {
    return { ...this.config }
  }

  public getStatus(): ProjectorStatus {
    return this.status
  }

  public getPerformance(): ProjectorPerformance {
    return { ...this.performance }
  }

  public getSetupProgress(): number {
    return this.setupProgress
  }

  public isOperational(): boolean {
    return this.isSetupComplete && this.status !== 'broken'
  }

  public getSpotLight(): THREE.SpotLight {
    return this.spotLight
  }

  public getProjectionCamera(): THREE.PerspectiveCamera {
    return this.projectionCamera
  }

  public getCurrentContent(): ProjectionContent | null {
    return this.currentContent
  }

  public getProjectionSurfaces(): THREE.Mesh[] {
    return [...this.projectionSurfaces]
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

    // Dispose textures
    if (this.canvasTexture) {
      this.canvasTexture.dispose()
    }

    if (this.projectionTexture) {
      this.projectionTexture.dispose()
    }

    // Clear arrays
    this.projectionSurfaces.length = 0
    this.colorPalette.length = 0

    // Clear group
    this.group.clear()
  }
}

// Helper class for beat detection
class BeatDetector {
  private analyser: AnalyserNode
  private frequencyData: Uint8Array
  private lastBeatTime: number = 0
  private threshold: number = 50

  constructor(analyser: AnalyserNode) {
    this.analyser = analyser
    this.frequencyData = new Uint8Array(analyser.frequencyBinCount)
  }

  public detect(): boolean {
    this.analyser.getByteFrequencyData(this.frequencyData)

    // Analyze bass frequencies (0-10% of spectrum)
    const bassEnd = Math.floor(this.frequencyData.length * 0.1)
    let bassSum = 0

    for (let i = 0; i < bassEnd; i++) {
      bassSum += this.frequencyData[i]
    }

    const bassAverage = bassSum / bassEnd
    const currentTime = Date.now()

    // Simple beat detection based on bass peaks
    if (bassAverage > this.threshold && currentTime - this.lastBeatTime > 100) {
      this.lastBeatTime = currentTime
      return true
    }

    return false
  }

  public setThreshold(threshold: number): void {
    this.threshold = threshold
  }
}