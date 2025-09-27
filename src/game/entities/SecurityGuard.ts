import * as THREE from 'three'

export type GuardState = 'patrolling' | 'investigating' | 'searching' | 'alerted' | 'returning'

export interface SecurityGuardConfig {
  id: string
  position: THREE.Vector3
  patrolRoute: THREE.Vector3[]
  visionRange: number
  visionAngle: number // In radians
  speed: number
  alertLevel?: number // 0-1, how quickly guard detects player
  flashlightIntensity?: number
}

export interface DetectionEvent {
  position: THREE.Vector3
  timestamp: number
  confidence: number // 0-1
  source: 'vision' | 'sound' | 'flashlight'
}

export class SecurityGuard {
  private config: SecurityGuardConfig
  private group: THREE.Group
  private guardMesh: THREE.Mesh
  private flashlightGroup: THREE.Group
  private flashlight: THREE.SpotLight
  private visionCone: THREE.Mesh
  private visionConeMaterial: THREE.ShaderMaterial

  // AI State
  private currentState: GuardState = 'patrolling'
  private currentPatrolIndex: number = 0
  private currentTarget: THREE.Vector3
  private lastKnownPlayerPosition: THREE.Vector3 | null = null
  private suspicionLevel: number = 0
  private alertTimer: number = 0
  private investigationTimer: number = 0
  private searchTimer: number = 0

  // Movement
  private velocity: THREE.Vector3 = new THREE.Vector3()
  private rotation: number = 0
  private targetRotation: number = 0
  private rotationSpeed: number = 2.0

  // Detection
  private detectionEvents: DetectionEvent[] = []
  private maxDetectionEvents: number = 5
  private detectionRadius: number = 1.5 // Close detection radius
  private flashlightOn: boolean = true

  // Animation
  private walkCycle: number = 0
  private bobAmplitude: number = 0.05
  private bobFrequency: number = 4.0

  constructor(config: SecurityGuardConfig) {
    this.config = {
      alertLevel: 0.7,
      flashlightIntensity: 3.0,
      ...config
    }

    this.group = new THREE.Group()
    this.group.name = `security_guard_${this.config.id}`

    this.currentTarget = this.config.patrolRoute[0].clone()

    this.createGuardModel()
    this.createFlashlight()
    this.createVisionCone()
    this.initializeAI()

    // Position the guard
    this.group.position.copy(this.config.position)
    this.updateRotationToTarget()
  }

  private createGuardModel() {
    const guardGroup = new THREE.Group()

    // Body
    const bodyGeometry = new THREE.CapsuleGeometry(0.3, 1.4, 4, 8)
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x333366, // Dark blue security uniform
      roughness: 0.8,
      metalness: 0.1
    })

    this.guardMesh = new THREE.Mesh(bodyGeometry, bodyMaterial)
    this.guardMesh.position.y = 1.0
    this.guardMesh.castShadow = true
    guardGroup.add(this.guardMesh)

    // Head
    const headGeometry = new THREE.SphereGeometry(0.2, 8, 6)
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0xffdbac, // Skin tone
      roughness: 0.7
    })

    const head = new THREE.Mesh(headGeometry, headMaterial)
    head.position.y = 1.9
    head.castShadow = true
    guardGroup.add(head)

    // Security hat
    const hatGeometry = new THREE.CylinderGeometry(0.25, 0.22, 0.15, 8)
    const hatMaterial = new THREE.MeshStandardMaterial({
      color: 0x222244,
      roughness: 0.9
    })

    const hat = new THREE.Mesh(hatGeometry, hatMaterial)
    hat.position.y = 2.0
    hat.castShadow = true
    guardGroup.add(hat)

    // Badge/reflective strip
    const badgeGeometry = new THREE.BoxGeometry(0.15, 0.08, 0.02)
    const badgeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x444400,
      emissiveIntensity: 0.2
    })

    const badge = new THREE.Mesh(badgeGeometry, badgeMaterial)
    badge.position.set(0, 1.3, 0.31)
    guardGroup.add(badge)

    // Arms (simplified)
    const armGeometry = new THREE.CapsuleGeometry(0.08, 0.6, 4, 6)
    const armMaterial = new THREE.MeshStandardMaterial({
      color: 0x333366,
      roughness: 0.8
    })

    const leftArm = new THREE.Mesh(armGeometry, armMaterial)
    leftArm.position.set(-0.4, 1.2, 0)
    leftArm.rotation.z = Math.PI / 8
    leftArm.castShadow = true
    guardGroup.add(leftArm)

    const rightArm = new THREE.Mesh(armGeometry, armMaterial)
    rightArm.position.set(0.4, 1.2, 0)
    rightArm.rotation.z = -Math.PI / 8
    rightArm.castShadow = true
    guardGroup.add(rightArm)

    // Legs
    const legGeometry = new THREE.CapsuleGeometry(0.1, 0.8, 4, 6)
    const legMaterial = new THREE.MeshStandardMaterial({
      color: 0x222244,
      roughness: 0.9
    })

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial)
    leftLeg.position.set(-0.15, 0.4, 0)
    leftLeg.castShadow = true
    guardGroup.add(leftLeg)

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial)
    rightLeg.position.set(0.15, 0.4, 0)
    rightLeg.castShadow = true
    guardGroup.add(rightLeg)

    // Utility belt
    const beltGeometry = new THREE.CylinderGeometry(0.32, 0.32, 0.1, 8)
    const beltMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.7,
      metalness: 0.3
    })

    const belt = new THREE.Mesh(beltGeometry, beltMaterial)
    belt.position.y = 0.8
    guardGroup.add(belt)

    this.group.add(guardGroup)
  }

  private createFlashlight() {
    this.flashlightGroup = new THREE.Group()

    // Flashlight body
    const flashlightGeometry = new THREE.CylinderGeometry(0.04, 0.06, 0.3, 8)
    const flashlightMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.8,
      roughness: 0.3
    })

    const flashlightMesh = new THREE.Mesh(flashlightGeometry, flashlightMaterial)
    flashlightMesh.position.set(0.35, 1.2, 0.2)
    flashlightMesh.rotation.x = -Math.PI / 6
    this.flashlightGroup.add(flashlightMesh)

    // Flashlight beam
    this.flashlight = new THREE.SpotLight(
      0xffffaa, // Warm white light
      this.config.flashlightIntensity!,
      this.config.visionRange * 1.2,
      Math.PI / 8, // Narrow beam
      0.5, // Penumbra
      1.0 // Decay
    )

    this.flashlight.position.set(0.35, 1.2, 0.2)
    this.flashlight.target.position.set(0.35, 1.2, 3)

    // Flashlight shadows
    this.flashlight.castShadow = true
    this.flashlight.shadow.mapSize.width = 1024
    this.flashlight.shadow.mapSize.height = 1024
    this.flashlight.shadow.camera.near = 0.1
    this.flashlight.shadow.camera.far = this.config.visionRange
    this.flashlight.shadow.focus = 1

    this.flashlightGroup.add(this.flashlight)
    this.flashlightGroup.add(this.flashlight.target)

    this.group.add(this.flashlightGroup)
  }

  private createVisionCone() {
    // Create a cone geometry for visualization
    const coneGeometry = new THREE.ConeGeometry(
      this.config.visionRange * Math.tan(this.config.visionAngle / 2),
      this.config.visionRange,
      16,
      1,
      true
    )

    this.visionConeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0xff0000) },
        uOpacity: { value: 0.2 },
        uTime: { value: 0 },
        uAlertLevel: { value: 0 },
        uDetectionStrength: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform float uTime;
        uniform float uAlertLevel;
        uniform float uDetectionStrength;

        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {
          // Create scanning effect
          float scan = sin(vPosition.z * 0.5 + uTime * 3.0) * 0.5 + 0.5;

          // Distance falloff
          float distanceFactor = 1.0 - length(vPosition.xz) / 8.0;

          // Alert intensity
          float alertIntensity = uAlertLevel * 2.0 + 0.3;

          // Detection pulse
          float pulse = sin(uTime * 5.0) * 0.3 + 0.7;

          float alpha = uOpacity * scan * distanceFactor * alertIntensity * pulse;

          // Color shifts based on alert level
          vec3 color = mix(vec3(0.0, 0.5, 1.0), vec3(1.0, 0.0, 0.0), uAlertLevel);

          gl_FragColor = vec4(color, alpha * (1.0 + uDetectionStrength));
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })

    this.visionCone = new THREE.Mesh(coneGeometry, this.visionConeMaterial)
    this.visionCone.position.y = 1.7 // Eye level
    this.visionCone.rotation.x = Math.PI / 2
    this.visionCone.rotation.z = Math.PI
    this.visionCone.visible = false // Initially hidden
    this.visionCone.name = `vision_cone_${this.config.id}`

    this.group.add(this.visionCone)
  }

  private initializeAI() {
    // Set initial state based on config
    this.currentState = 'patrolling'
    this.suspicionLevel = 0
    this.alertTimer = 0

    // Randomize starting patrol position
    this.currentPatrolIndex = Math.floor(Math.random() * this.config.patrolRoute.length)
    this.updatePatrolTarget()
  }

  private updatePatrolTarget() {
    if (this.config.patrolRoute.length === 0) return

    this.currentTarget = this.config.patrolRoute[this.currentPatrolIndex].clone()
    this.updateRotationToTarget()
  }

  private updateRotationToTarget() {
    if (!this.currentTarget) return

    const direction = this.currentTarget.clone().sub(this.group.position)
    direction.y = 0 // Keep horizontal
    direction.normalize()

    this.targetRotation = Math.atan2(direction.x, direction.z)
  }

  private updateMovement(deltaTime: number) {
    if (!this.currentTarget) return

    const currentPosition = this.group.position
    const distanceToTarget = currentPosition.distanceTo(this.currentTarget)

    // Rotation interpolation
    let rotationDiff = this.targetRotation - this.rotation
    while (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2
    while (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2

    this.rotation += rotationDiff * this.rotationSpeed * deltaTime
    this.group.rotation.y = this.rotation

    // Movement based on state
    let moveSpeed = this.config.speed

    switch (this.currentState) {
      case 'patrolling':
        moveSpeed = this.config.speed
        break
      case 'investigating':
        moveSpeed = this.config.speed * 1.5
        break
      case 'searching':
        moveSpeed = this.config.speed * 0.7
        break
      case 'alerted':
        moveSpeed = this.config.speed * 2.0
        break
      case 'returning':
        moveSpeed = this.config.speed
        break
    }

    if (distanceToTarget > 0.5) {
      // Move towards target
      const direction = this.currentTarget.clone().sub(currentPosition)
      direction.y = 0
      direction.normalize()
      direction.multiplyScalar(moveSpeed * deltaTime)

      this.velocity.lerp(direction, 3.0 * deltaTime)
      this.group.position.add(this.velocity)

      // Update walk cycle
      this.walkCycle += deltaTime * this.bobFrequency * moveSpeed
      const bobOffset = Math.sin(this.walkCycle) * this.bobAmplitude
      this.guardMesh.position.y = 1.0 + bobOffset
    } else {
      // Reached target
      this.onReachedTarget()
      this.velocity.multiplyScalar(0.9) // Decelerate
    }

    // Update flashlight direction
    this.updateFlashlight()
  }

  private updateFlashlight() {
    const flashlightDirection = new THREE.Vector3(0, -0.2, 1)
    flashlightDirection.applyEuler(new THREE.Euler(0, this.rotation, 0))

    const flashlightWorldPos = this.group.position.clone()
    flashlightWorldPos.y += 1.2

    this.flashlight.target.position.copy(flashlightWorldPos).add(flashlightDirection.multiplyScalar(3))

    // Flashlight sweeping in investigation mode
    if (this.currentState === 'investigating' || this.currentState === 'searching') {
      const sweepAngle = Math.sin(Date.now() * 0.003) * 0.3
      const sweepDirection = flashlightDirection.clone()
      sweepDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), sweepAngle)
      this.flashlight.target.position.copy(flashlightWorldPos).add(sweepDirection.multiplyScalar(4))
    }
  }

  private onReachedTarget() {
    switch (this.currentState) {
      case 'patrolling':
        // Move to next patrol point
        this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.config.patrolRoute.length
        this.updatePatrolTarget()
        break

      case 'investigating':
        // Start searching at the investigation point
        this.currentState = 'searching'
        this.searchTimer = 5.0 // Search for 5 seconds
        break

      case 'searching':
        // Continue searching or return to patrol
        if (this.searchTimer <= 0) {
          this.currentState = 'returning'
          this.findNearestPatrolPoint()
        }
        break

      case 'returning':
        // Resume normal patrol
        this.currentState = 'patrolling'
        this.suspicionLevel = Math.max(0, this.suspicionLevel - 0.3)
        this.updatePatrolTarget()
        break

      case 'alerted':
        // Start investigating the alert location
        this.currentState = 'investigating'
        this.investigationTimer = 3.0
        break
    }
  }

  private findNearestPatrolPoint() {
    let nearestDistance = Infinity
    let nearestIndex = 0

    this.config.patrolRoute.forEach((point, index) => {
      const distance = this.group.position.distanceTo(point)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = index
      }
    })

    this.currentPatrolIndex = nearestIndex
    this.updatePatrolTarget()
  }

  private updateAI(deltaTime: number) {
    // Update timers
    this.alertTimer = Math.max(0, this.alertTimer - deltaTime)
    this.investigationTimer = Math.max(0, this.investigationTimer - deltaTime)
    this.searchTimer = Math.max(0, this.searchTimer - deltaTime)

    // Update suspicion level decay
    if (this.currentState === 'patrolling') {
      this.suspicionLevel = Math.max(0, this.suspicionLevel - deltaTime * 0.1)
    }

    // State transitions
    switch (this.currentState) {
      case 'investigating':
        if (this.investigationTimer <= 0) {
          this.currentState = 'searching'
          this.searchTimer = 5.0
        }
        break

      case 'searching':
        if (this.searchTimer <= 0) {
          this.currentState = 'returning'
          this.findNearestPatrolPoint()
        }
        break

      case 'alerted':
        if (this.alertTimer <= 0) {
          this.currentState = 'investigating'
          this.investigationTimer = 3.0
        }
        break
    }

    // Clean old detection events
    const currentTime = Date.now()
    this.detectionEvents = this.detectionEvents.filter(
      event => currentTime - event.timestamp < 10000 // Keep events for 10 seconds
    )

    // Update vision cone material
    this.visionConeMaterial.uniforms.uAlertLevel.value = this.suspicionLevel
    this.visionConeMaterial.uniforms.uDetectionStrength.value = this.getDetectionStrength()
    this.visionConeMaterial.uniforms.uTime.value = currentTime * 0.001
  }

  private getDetectionStrength(): number {
    // Calculate detection strength based on recent events
    const recentEvents = this.detectionEvents.filter(
      event => Date.now() - event.timestamp < 3000 // Last 3 seconds
    )

    return recentEvents.reduce((sum, event) => sum + event.confidence, 0) / 3.0
  }

  // Public methods for game interaction

  public canSeePosition(position: THREE.Vector3): boolean {
    const guardPosition = this.group.position.clone()
    guardPosition.y += 1.7 // Eye level

    const direction = position.clone().sub(guardPosition)
    const distance = direction.length()

    // Check distance
    if (distance > this.config.visionRange) return false

    direction.normalize()

    // Check angle
    const forwardDirection = new THREE.Vector3(0, 0, 1)
    forwardDirection.applyEuler(new THREE.Euler(0, this.rotation, 0))

    const angle = Math.acos(direction.dot(forwardDirection))

    if (angle > this.config.visionAngle / 2) return false

    // TODO: Add raycast for obstacles
    // For now, assume line of sight is clear

    return true
  }

  public detectPlayer(playerPosition: THREE.Vector3, isPlayerHidden: boolean): boolean {
    if (!this.canSeePosition(playerPosition)) return false

    const distance = this.group.position.distanceTo(playerPosition)
    let detectionChance = this.config.alertLevel!

    // Modify detection based on distance
    detectionChance *= Math.max(0.1, 1.0 - distance / this.config.visionRange)

    // Modify detection based on stealth
    if (isPlayerHidden) {
      detectionChance *= 0.3 // Much harder to detect when hidden
    }

    // Modify detection based on current state
    switch (this.currentState) {
      case 'alerted':
      case 'investigating':
        detectionChance *= 1.5
        break
      case 'searching':
        detectionChance *= 1.2
        break
    }

    // Add detection event
    if (Math.random() < detectionChance * 0.1) { // Per-frame detection chance
      this.addDetectionEvent(playerPosition, detectionChance, 'vision')

      this.suspicionLevel = Math.min(1.0, this.suspicionLevel + 0.05)

      if (this.suspicionLevel > 0.8) {
        this.alertToPlayer(playerPosition)
        return true
      }
    }

    return false
  }

  private addDetectionEvent(position: THREE.Vector3, confidence: number, source: 'vision' | 'sound' | 'flashlight') {
    const event: DetectionEvent = {
      position: position.clone(),
      timestamp: Date.now(),
      confidence: Math.min(1.0, confidence),
      source
    }

    this.detectionEvents.push(event)

    // Keep only recent events
    if (this.detectionEvents.length > this.maxDetectionEvents) {
      this.detectionEvents.shift()
    }
  }

  public alertToPlayer(playerPosition: THREE.Vector3) {
    this.currentState = 'alerted'
    this.alertTimer = 2.0
    this.lastKnownPlayerPosition = playerPosition.clone()
    this.currentTarget = playerPosition.clone()
    this.suspicionLevel = 1.0
    this.updateRotationToTarget()

    // Turn on flashlight if not already on
    this.flashlightOn = true
    this.flashlight.intensity = this.config.flashlightIntensity! * 1.5
  }

  public investigateSound(position: THREE.Vector3) {
    if (this.currentState === 'patrolling' || this.currentState === 'returning') {
      this.currentState = 'investigating'
      this.currentTarget = position.clone()
      this.suspicionLevel = Math.min(1.0, this.suspicionLevel + 0.3)
      this.updateRotationToTarget()
    }
  }

  public getDetectionLevel(): number {
    return this.suspicionLevel
  }

  public getCurrentState(): GuardState {
    return this.currentState
  }

  public showVisionCone(show: boolean = true) {
    this.visionCone.visible = show
  }

  public setFlashlightState(on: boolean) {
    this.flashlightOn = on
    this.flashlight.intensity = on ? this.config.flashlightIntensity! : 0
  }

  public getPosition(): THREE.Vector3 {
    return this.group.position.clone()
  }

  public getRotation(): number {
    return this.rotation
  }

  public getVisionRange(): number {
    return this.config.visionRange
  }

  public getVisionAngle(): number {
    return this.config.visionAngle
  }

  public getLastKnownPlayerPosition(): THREE.Vector3 | null {
    return this.lastKnownPlayerPosition ? this.lastKnownPlayerPosition.clone() : null
  }

  public update(deltaTime: number) {
    this.updateMovement(deltaTime)
    this.updateAI(deltaTime)
    this.updateFlashlight()
  }

  public getGroup(): THREE.Group {
    return this.group
  }

  public getConfig(): SecurityGuardConfig {
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

    // Dispose vision cone material
    this.visionConeMaterial.dispose()

    // Clear arrays
    this.detectionEvents.length = 0

    // Clear the group
    this.group.clear()
  }
}

export default SecurityGuard