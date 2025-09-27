import * as THREE from 'three'

export type ProjectorState = 'stored' | 'deploying' | 'ready' | 'projecting' | 'packing' | 'moving'

export interface UrbanProjectorConfig {
  position: THREE.Vector3
  setupTime: number // Time in seconds to set up
  packTime?: number // Time to pack up, defaults to setupTime / 2
  brightness: number // 0-1, affects detection risk
  isPortable: boolean
  stealthMode: boolean // Reduces brightness and setup noise
  batteryLife?: number // Minutes of operation
  projectionRange?: number
  fov?: number
}

export interface ProjectionTarget {
  position: THREE.Vector3
  surface: THREE.Object3D | null
  distance: number
  angle: number
  quality: number // 0-1, based on distance and angle
}

export class UrbanProjector {
  private config: UrbanProjectorConfig
  private group: THREE.Group
  private projectorMesh: THREE.Mesh
  private projectorLight: THREE.SpotLight
  private projectionCamera: THREE.PerspectiveCamera
  private frustumHelper: THREE.CameraHelper | null = null
  private setupProgress: number = 0
  private packProgress: number = 0

  // State management
  private currentState: ProjectorState = 'stored'
  private isSetupComplete: boolean = false
  private setupTimer: number = 0
  private packTimer: number = 0
  private batteryLevel: number = 1.0
  private noiseLevel: number = 0 // 0-1, affects detection by guards

  // Projection system
  private projectionTexture: THREE.Texture | null = null
  private currentTarget: ProjectionTarget | null = null
  private projectionTargets: ProjectionTarget[] = []
  private projectionMatrix: THREE.Matrix4 = new THREE.Matrix4()
  private viewMatrix: THREE.Matrix4 = new THREE.Matrix4()

  // Visual components
  private deploymentAnimation: THREE.Group
  private cables: THREE.Mesh[] = []
  private ventilationFan: THREE.Mesh | null = null
  private statusLEDs: THREE.Mesh[] = []

  // Animation and effects
  private animationTime: number = 0
  private setupAnimationSpeed: number = 1.0
  private fanRotation: number = 0

  constructor(config: UrbanProjectorConfig) {
    this.config = {
      packTime: config.setupTime / 2,
      batteryLife: 30, // 30 minutes default
      projectionRange: 15,
      fov: 60,
      ...config
    }

    this.group = new THREE.Group()
    this.group.name = 'urban_projector'

    this.createProjectorModel()
    this.createProjectionSystem()
    this.createDeploymentAnimation()
    this.initializeState()

    // Position the projector
    this.group.position.copy(this.config.position)
  }

  private createProjectorModel() {
    const projectorGroup = new THREE.Group()

    // Main projector case (more rugged, portable design)
    const caseGeometry = new THREE.BoxGeometry(0.4, 0.25, 0.6)
    const caseMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.8,
      metalness: 0.3
    })

    this.projectorMesh = new THREE.Mesh(caseGeometry, caseMaterial)
    this.projectorMesh.castShadow = true
    this.projectorMesh.receiveShadow = true
    projectorGroup.add(this.projectorMesh)

    // Lens (larger for street art projections)
    const lensGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 16)
    const lensMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.8
    })

    const lens = new THREE.Mesh(lensGeometry, lensMaterial)
    lens.position.set(0, 0, 0.32)
    lens.rotation.x = Math.PI / 2
    projectorGroup.add(lens)

    // Ventilation grilles
    const grilleMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.6,
      roughness: 0.7
    })

    const leftGrille = this.createVentilationGrille(grilleMaterial)
    leftGrille.position.set(-0.18, 0, -0.25)
    projectorGroup.add(leftGrille)

    const rightGrille = this.createVentilationGrille(grilleMaterial)
    rightGrille.position.set(0.18, 0, -0.25)
    projectorGroup.add(rightGrille)

    // Cooling fan (animated)
    const fanGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.01, 6)
    const fanMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.8,
      roughness: 0.3
    })

    this.ventilationFan = new THREE.Mesh(fanGeometry, fanMaterial)
    this.ventilationFan.position.set(0, 0, -0.25)
    projectorGroup.add(this.ventilationFan)

    // Power/status LEDs
    this.createStatusLEDs(projectorGroup)

    // Adjustment knobs and controls
    this.createControls(projectorGroup)

    // Portable handle
    const handleGeometry = new THREE.TorusGeometry(0.08, 0.02, 4, 8)
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.8,
      roughness: 0.4
    })

    const handle = new THREE.Mesh(handleGeometry, handleMaterial)
    handle.position.set(0, 0.2, 0)
    handle.rotation.x = Math.PI / 2
    projectorGroup.add(handle)

    // Tripod mount (when deployed)
    this.createTripodMount(projectorGroup)

    this.group.add(projectorGroup)
  }

  private createVentilationGrille(material: THREE.MeshStandardMaterial): THREE.Group {
    const grille = new THREE.Group()

    // Create grille slats
    const slatGeometry = new THREE.BoxGeometry(0.08, 0.01, 0.001)

    for (let i = 0; i < 5; i++) {
      const slat = new THREE.Mesh(slatGeometry, material)
      slat.position.y = (i - 2) * 0.02
      grille.add(slat)
    }

    return grille
  }

  private createStatusLEDs(parent: THREE.Group) {
    const ledPositions = [
      { pos: new THREE.Vector3(-0.15, 0.1, 0.3), color: 0x00ff00 }, // Power LED
      { pos: new THREE.Vector3(-0.1, 0.1, 0.3), color: 0x0088ff },  // Status LED
      { pos: new THREE.Vector3(-0.05, 0.1, 0.3), color: 0xffaa00 }, // Battery LED
      { pos: new THREE.Vector3(0, 0.1, 0.3), color: 0xff0000 },     // Warning LED
    ]

    ledPositions.forEach((ledData, index) => {
      const ledGeometry = new THREE.SphereGeometry(0.01, 8, 6)
      const ledMaterial = new THREE.MeshBasicMaterial({
        color: ledData.color,
        emissive: ledData.color,
        emissiveIntensity: 0.5
      })

      const led = new THREE.Mesh(ledGeometry, ledMaterial)
      led.position.copy(ledData.pos)
      led.name = `status_led_${index}`

      this.statusLEDs.push(led)
      parent.add(led)
    })
  }

  private createControls(parent: THREE.Group) {
    // Focus knob
    const knobGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.015, 8)
    const knobMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.7,
      roughness: 0.4
    })

    const focusKnob = new THREE.Mesh(knobGeometry, knobMaterial)
    focusKnob.position.set(0.15, 0.08, 0.2)
    parent.add(focusKnob)

    // Brightness dial
    const dialGeometry = new THREE.CylinderGeometry(0.025, 0.025, 0.01, 16)
    const dial = new THREE.Mesh(dialGeometry, knobMaterial)
    dial.position.set(0.15, 0.08, 0.1)
    parent.add(dial)

    // Port covers
    const portGeometry = new THREE.BoxGeometry(0.04, 0.015, 0.002)
    const portMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.3,
      roughness: 0.8
    })

    const usbPort = new THREE.Mesh(portGeometry, portMaterial)
    usbPort.position.set(-0.15, -0.05, 0.3)
    parent.add(usbPort)

    const powerPort = new THREE.Mesh(portGeometry, portMaterial)
    powerPort.position.set(-0.1, -0.05, 0.3)
    parent.add(powerPort)
  }

  private createTripodMount(parent: THREE.Group) {
    // Tripod legs (initially folded)
    const legGeometry = new THREE.CylinderGeometry(0.008, 0.01, 0.8, 6)
    const legMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.8,
      roughness: 0.4
    })

    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2
      const leg = new THREE.Mesh(legGeometry, legMaterial)
      leg.position.set(
        Math.cos(angle) * 0.1,
        -0.4,
        Math.sin(angle) * 0.1
      )
      leg.rotation.x = Math.PI / 2
      leg.rotation.y = angle
      leg.visible = false // Initially folded/hidden
      leg.name = `tripod_leg_${i}`

      parent.add(leg)
    }

    // Central mount
    const mountGeometry = new THREE.CylinderGeometry(0.03, 0.04, 0.1, 8)
    const mount = new THREE.Mesh(mountGeometry, legMaterial)
    mount.position.set(0, -0.2, 0)
    mount.name = 'tripod_mount'
    mount.visible = false // Initially hidden

    parent.add(mount)
  }

  private createProjectionSystem() {
    // Projection camera for calculating projection matrices
    this.projectionCamera = new THREE.PerspectiveCamera(
      this.config.fov!,
      1.0, // Aspect ratio
      0.1,
      this.config.projectionRange!
    )

    this.projectionCamera.position.copy(this.config.position)
    this.projectionCamera.name = 'urban_projector_camera'

    // Projector light
    this.projectorLight = new THREE.SpotLight(
      0xffffff,
      this.config.brightness * 2.0,
      this.config.projectionRange!,
      Math.PI / 6, // Angle
      0.5, // Penumbra
      1.0  // Decay
    )

    this.projectorLight.position.copy(this.config.position)
    this.projectorLight.target.position.copy(this.config.position)
    this.projectorLight.target.position.z -= 5

    // Shadows
    this.projectorLight.castShadow = true
    this.projectorLight.shadow.mapSize.width = 2048
    this.projectorLight.shadow.mapSize.height = 2048
    this.projectorLight.shadow.camera.near = 0.1
    this.projectorLight.shadow.camera.far = this.config.projectionRange!
    this.projectorLight.shadow.focus = 1

    // Frustum helper for debugging
    if (process.env.NODE_ENV === 'development') {
      this.frustumHelper = new THREE.CameraHelper(this.projectionCamera)
      this.frustumHelper.visible = false
    }

    // Initially hidden/inactive
    this.projectorLight.intensity = 0
    this.projectorLight.visible = false

    this.group.add(this.projectorLight)
    this.group.add(this.projectorLight.target)

    if (this.frustumHelper) {
      this.group.add(this.frustumHelper)
    }
  }

  private createDeploymentAnimation() {
    this.deploymentAnimation = new THREE.Group()
    this.deploymentAnimation.name = 'deployment_animation'

    // Power cables (extend during setup)
    this.createPowerCables()

    // Setup progress indicator
    this.createSetupIndicator()

    this.group.add(this.deploymentAnimation)
  }

  private createPowerCables() {
    const cablePositions = [
      new THREE.Vector3(-0.2, -0.1, -0.3),
      new THREE.Vector3(0.2, -0.1, -0.3)
    ]

    cablePositions.forEach((startPos, index) => {
      const cableGeometry = new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          startPos,
          startPos.clone().add(new THREE.Vector3(0, -0.3, -0.5)),
          startPos.clone().add(new THREE.Vector3((index - 0.5) * 0.8, -0.5, -1.2))
        ]),
        32,
        0.01,
        8,
        false
      )

      const cableMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.9
      })

      const cable = new THREE.Mesh(cableGeometry, cableMaterial)
      cable.name = `power_cable_${index}`
      cable.visible = false // Initially hidden

      this.cables.push(cable)
      this.deploymentAnimation.add(cable)
    })
  }

  private createSetupIndicator() {
    // Progress ring around projector
    const ringGeometry = new THREE.RingGeometry(0.3, 0.32, 32)
    const ringMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uProgress: { value: 0.0 },
        uColor1: { value: new THREE.Color(0xff6600) },
        uColor2: { value: new THREE.Color(0x00ff66) },
        uTime: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uProgress;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform float uTime;
        varying vec2 vUv;

        void main() {
          float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
          angle = (angle + 3.14159) / (2.0 * 3.14159); // Normalize to 0-1

          float pulse = sin(uTime * 5.0) * 0.1 + 0.9;

          if (angle < uProgress) {
            vec3 color = mix(uColor1, uColor2, uProgress);
            gl_FragColor = vec4(color * pulse, 0.8);
          } else {
            gl_FragColor = vec4(0.2, 0.2, 0.2, 0.3);
          }
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    })

    const progressRing = new THREE.Mesh(ringGeometry, ringMaterial)
    progressRing.rotation.x = -Math.PI / 2
    progressRing.position.y = -0.4
    progressRing.name = 'setup_progress_ring'
    progressRing.visible = false

    this.deploymentAnimation.add(progressRing)
  }

  private initializeState() {
    this.currentState = 'stored'
    this.setupProgress = 0
    this.packProgress = 0
    this.isSetupComplete = false
    this.batteryLevel = 1.0

    // Update visual state
    this.updateVisualState()
  }

  // Setup and deployment methods

  public startSetup(): boolean {
    if (this.currentState !== 'stored') {
      return false
    }

    this.currentState = 'deploying'
    this.setupTimer = this.config.setupTime
    this.setupProgress = 0

    // Calculate noise level (affects stealth)
    this.noiseLevel = this.config.stealthMode ? 0.3 : 0.8

    // Show setup animation
    this.showSetupAnimation(true)

    return true
  }

  public startPacking(): boolean {
    if (this.currentState !== 'ready' && this.currentState !== 'projecting') {
      return false
    }

    this.currentState = 'packing'
    this.packTimer = this.config.packTime!
    this.packProgress = 0

    // Stop projection
    this.stopProjection()

    // Show packing animation
    this.showSetupAnimation(false)

    return true
  }

  private showSetupAnimation(setup: boolean) {
    // Show/hide cables
    this.cables.forEach(cable => {
      cable.visible = setup
    })

    // Show/hide tripod legs
    this.group.children.forEach(child => {
      if (child.name.includes('tripod_leg') || child.name === 'tripod_mount') {
        child.visible = setup && this.setupProgress > 0.3
      }
    })

    // Show/hide progress ring
    const progressRing = this.deploymentAnimation.getObjectByName('setup_progress_ring')
    if (progressRing) {
      progressRing.visible = setup
    }
  }

  // Projection methods

  public setProjectionTexture(texture: THREE.Texture) {
    this.projectionTexture = texture

    // Update projector light with texture (simplified)
    if (this.currentState === 'projecting' || this.currentState === 'ready') {
      // In a full implementation, this would involve custom shaders
      // For now, we'll just update the light color based on texture
      this.updateProjectorLight()
    }
  }

  public startProjection(): boolean {
    if (this.currentState !== 'ready' || !this.projectionTexture) {
      return false
    }

    this.currentState = 'projecting'

    // Enable light
    this.projectorLight.visible = true
    this.projectorLight.intensity = this.config.brightness * 2.0

    // Apply stealth mode reduction
    if (this.config.stealthMode) {
      this.projectorLight.intensity *= 0.6
    }

    // Update projection matrices
    this.updateProjectionMatrices()

    // Update noise level
    this.noiseLevel = this.config.stealthMode ? 0.4 : 0.9

    return true
  }

  public stopProjection() {
    if (this.currentState === 'projecting') {
      this.currentState = 'ready'
    }

    // Disable light
    this.projectorLight.visible = false
    this.projectorLight.intensity = 0

    // Reset noise level
    this.noiseLevel = 0.1
  }

  private updateProjectorLight() {
    if (!this.projectionTexture || !this.projectorLight.visible) return

    // Simple color extraction from texture (would be more sophisticated in real implementation)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.width = 32
    canvas.height = 32

    // This is a simplified approach - in a real implementation, you'd use the GPU
    // to properly project the texture through the light
    const averageColor = this.extractAverageColor(this.projectionTexture)
    this.projectorLight.color.setHex(averageColor)
  }

  private extractAverageColor(texture: THREE.Texture): number {
    // Simplified color extraction
    // In reality, this would be much more sophisticated
    const colors = [0xffffff, 0xff6600, 0x00ff66, 0x0066ff, 0xff0066]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  private updateProjectionMatrices() {
    this.projectionCamera.updateMatrixWorld()
    this.projectionCamera.updateProjectionMatrix()

    this.projectionMatrix.copy(this.projectionCamera.projectionMatrix)
    this.viewMatrix.copy(this.projectionCamera.matrixWorldInverse)
  }

  // Target management

  public addProjectionTarget(target: ProjectionTarget) {
    this.projectionTargets.push(target)
  }

  public setCurrentTarget(target: ProjectionTarget) {
    this.currentTarget = target

    // Point projector at target
    this.pointAtTarget(target.position)
  }

  private pointAtTarget(position: THREE.Vector3) {
    const direction = position.clone().sub(this.group.position)
    direction.normalize()

    // Update projector rotation
    const targetRotation = Math.atan2(direction.x, direction.z)
    this.group.rotation.y = targetRotation

    // Update light target
    this.projectorLight.target.position.copy(position)

    // Update camera
    this.projectionCamera.lookAt(position)
    this.updateProjectionMatrices()
  }

  public findBestTarget(surfaces: THREE.Object3D[]): ProjectionTarget | null {
    if (surfaces.length === 0) return null

    let bestTarget: ProjectionTarget | null = null
    let bestScore = 0

    surfaces.forEach(surface => {
      const position = new THREE.Vector3()
      surface.getWorldPosition(position)

      const distance = this.group.position.distanceTo(position)
      if (distance > this.config.projectionRange!) return

      const direction = position.clone().sub(this.group.position).normalize()
      const forward = new THREE.Vector3(0, 0, -1).applyEuler(this.group.rotation)
      const angle = Math.acos(direction.dot(forward))

      // Calculate quality score
      const distanceScore = Math.max(0, 1 - distance / this.config.projectionRange!)
      const angleScore = Math.max(0, Math.cos(angle))
      const totalScore = distanceScore * angleScore

      if (totalScore > bestScore) {
        bestScore = totalScore
        bestTarget = {
          position,
          surface,
          distance,
          angle,
          quality: totalScore
        }
      }
    })

    return bestTarget
  }

  // State and status methods

  public getState(): ProjectorState {
    return this.currentState
  }

  public isReady(): boolean {
    return this.currentState === 'ready'
  }

  public isProjecting(): boolean {
    return this.currentState === 'projecting'
  }

  public getSetupProgress(): number {
    return this.setupProgress
  }

  public getPackProgress(): number {
    return this.packProgress
  }

  public getBatteryLevel(): number {
    return this.batteryLevel
  }

  public getNoiseLevel(): number {
    return this.noiseLevel
  }

  public getProjectionMatrix(): THREE.Matrix4 {
    return this.projectionMatrix.clone()
  }

  public getViewMatrix(): THREE.Matrix4 {
    return this.viewMatrix.clone()
  }

  public getCurrentTarget(): ProjectionTarget | null {
    return this.currentTarget
  }

  // Visual state management

  private updateVisualState() {
    // Update LED states
    this.updateStatusLEDs()

    // Update fan animation
    if (this.ventilationFan) {
      this.fanRotation += this.getFanSpeed()
      this.ventilationFan.rotation.z = this.fanRotation
    }

    // Update deployment elements visibility
    this.updateDeploymentVisuals()
  }

  private updateStatusLEDs() {
    if (this.statusLEDs.length === 0) return

    // Power LED (green when on)
    const powerLED = this.statusLEDs[0]
    const powerIntensity = this.currentState === 'stored' ? 0.1 : 1.0
    powerLED.material.emissiveIntensity = powerIntensity

    // Status LED (blue for ready, orange for deploying/packing)
    const statusLED = this.statusLEDs[1]
    if (this.currentState === 'ready') {
      statusLED.material.emissive.setHex(0x0088ff)
      statusLED.material.emissiveIntensity = 1.0
    } else if (this.currentState === 'deploying' || this.currentState === 'packing') {
      statusLED.material.emissive.setHex(0xffaa00)
      statusLED.material.emissiveIntensity = 0.8
    } else {
      statusLED.material.emissiveIntensity = 0.2
    }

    // Battery LED (changes color based on battery level)
    const batteryLED = this.statusLEDs[2]
    if (this.batteryLevel > 0.6) {
      batteryLED.material.emissive.setHex(0x00ff00)
    } else if (this.batteryLevel > 0.3) {
      batteryLED.material.emissive.setHex(0xffaa00)
    } else {
      batteryLED.material.emissive.setHex(0xff0000)
    }
    batteryLED.material.emissiveIntensity = this.batteryLevel

    // Warning LED (red when overheating or low battery)
    const warningLED = this.statusLEDs[3]
    const shouldWarn = this.batteryLevel < 0.2 || this.noiseLevel > 0.8
    warningLED.material.emissiveIntensity = shouldWarn ? 1.0 : 0.1
  }

  private getFanSpeed(): number {
    switch (this.currentState) {
      case 'projecting':
        return 0.3
      case 'deploying':
      case 'ready':
        return 0.15
      case 'packing':
        return 0.08
      default:
        return 0.02
    }
  }

  private updateDeploymentVisuals() {
    // Update progress ring
    const progressRing = this.deploymentAnimation.getObjectByName('setup_progress_ring')
    if (progressRing && progressRing.material instanceof THREE.ShaderMaterial) {
      const progress = this.currentState === 'deploying' ? this.setupProgress :
                     this.currentState === 'packing' ? 1.0 - this.packProgress : 0
      progressRing.material.uniforms.uProgress.value = progress
      progressRing.material.uniforms.uTime.value = this.animationTime
    }

    // Update tripod legs extension
    for (let i = 0; i < 3; i++) {
      const leg = this.group.getObjectByName(`tripod_leg_${i}`)
      if (leg && this.setupProgress > 0.3) {
        leg.visible = true
        const extensionAmount = Math.max(0, (this.setupProgress - 0.3) / 0.7)
        leg.scale.y = 0.3 + extensionAmount * 0.7
      }
    }
  }

  // Update method

  public update(deltaTime: number) {
    this.animationTime += deltaTime

    // Update setup/pack timers
    if (this.currentState === 'deploying') {
      this.setupTimer = Math.max(0, this.setupTimer - deltaTime)
      this.setupProgress = 1.0 - (this.setupTimer / this.config.setupTime)

      if (this.setupTimer <= 0) {
        this.currentState = 'ready'
        this.isSetupComplete = true
        this.showSetupAnimation(false)
      }
    } else if (this.currentState === 'packing') {
      this.packTimer = Math.max(0, this.packTimer - deltaTime)
      this.packProgress = 1.0 - (this.packTimer / this.config.packTime!)

      if (this.packTimer <= 0) {
        this.currentState = 'stored'
        this.isSetupComplete = false
        this.setupProgress = 0
        this.packProgress = 0
      }
    }

    // Update battery drain
    if (this.currentState === 'projecting' && this.config.batteryLife) {
      const drainRate = 1.0 / (this.config.batteryLife * 60) // Convert minutes to seconds
      this.batteryLevel = Math.max(0, this.batteryLevel - drainRate * deltaTime)

      if (this.batteryLevel <= 0) {
        this.stopProjection()
      }
    }

    // Update visual state
    this.updateVisualState()

    // Update projection matrices if projecting
    if (this.currentState === 'projecting') {
      this.updateProjectionMatrices()
    }
  }

  // Utility methods

  public getGroup(): THREE.Group {
    return this.group
  }

  public getLight(): THREE.SpotLight {
    return this.projectorLight
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.projectionCamera
  }

  public getConfig(): UrbanProjectorConfig {
    return { ...this.config }
  }

  public dispose() {
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

    // Dispose projection texture
    if (this.projectionTexture) {
      this.projectionTexture.dispose()
    }

    // Clear arrays
    this.cables.length = 0
    this.statusLEDs.length = 0
    this.projectionTargets.length = 0

    // Clear the group
    this.group.clear()
  }
}

export default UrbanProjector