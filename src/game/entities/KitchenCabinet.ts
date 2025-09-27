import * as THREE from 'three'

export interface CabinetConfig {
  position: THREE.Vector3
  isUpper: boolean
  index: number
  doorCount: number
}

export class KitchenCabinet {
  private group: THREE.Group
  private doors: THREE.Mesh[]
  private config: CabinetConfig
  private originalMaterials: THREE.Material[]
  private projectionTexture: THREE.Texture | null = null
  private isProjectionActive: boolean = false

  constructor(config: CabinetConfig) {
    this.config = config
    this.group = new THREE.Group()
    this.doors = []
    this.originalMaterials = []

    this.createCabinet()
    this.setupInteraction()
  }

  private createCabinet() {
    // Create wood texture
    const woodTexture = new THREE.TextureLoader().load('/textures/wood-grain.jpg')
    woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping
    woodTexture.repeat.set(2, 2)

    const woodMaterial = new THREE.MeshPhongMaterial({
      color: 0x8B4513,
      map: woodTexture,
      shininess: 30
    })

    // Cabinet dimensions
    const cabinetWidth = this.config.isUpper ? 1.8 : 2.0
    const cabinetHeight = this.config.isUpper ? 0.7 : 0.8
    const cabinetDepth = this.config.isUpper ? 0.4 : 0.6

    // Create cabinet body
    const cabinetGeometry = new THREE.BoxGeometry(
      cabinetWidth,
      cabinetHeight,
      cabinetDepth
    )
    const cabinetBody = new THREE.Mesh(cabinetGeometry, woodMaterial)
    cabinetBody.name = `cabinet_body_${this.config.index}`
    this.group.add(cabinetBody)

    // Create doors
    this.createDoors(cabinetWidth, cabinetHeight, cabinetDepth)

    // Position the entire cabinet
    this.group.position.copy(this.config.position)
    this.group.name = `kitchen_cabinet_${this.config.index}`
  }

  private createDoors(cabinetWidth: number, cabinetHeight: number, cabinetDepth: number) {
    const doorWidth = cabinetWidth / this.config.doorCount - 0.05 // Small gap between doors
    const doorHeight = cabinetHeight - 0.1 // Slight margin
    const doorThickness = 0.05

    for (let i = 0; i < this.config.doorCount; i++) {
      // Create door geometry
      const doorGeometry = new THREE.BoxGeometry(
        doorWidth,
        doorHeight,
        doorThickness
      )

      // Create door material (will be enhanced with projection)
      const doorMaterial = new THREE.MeshPhongMaterial({
        color: 0x8B4513,
        shininess: 30
      })

      const door = new THREE.Mesh(doorGeometry, doorMaterial)

      // Position door
      const doorOffsetX = (i - (this.config.doorCount - 1) / 2) * (doorWidth + 0.05)
      door.position.set(
        doorOffsetX,
        0,
        cabinetDepth / 2 + doorThickness / 2
      )

      door.name = `cabinet_door_${this.config.index}_${i}`
      door.userData = {
        type: 'projectionTarget',
        cabinetIndex: this.config.index,
        doorIndex: i,
        isUpper: this.config.isUpper,
        canReceiveProjection: true
      }

      this.doors.push(door)
      this.originalMaterials.push(doorMaterial.clone())
      this.group.add(door)
    }
  }

  private setupInteraction() {
    this.doors.forEach((door, index) => {
      // Add hover effect capability
      door.userData.onHover = () => this.onDoorHover(index)
      door.userData.onHoverEnd = () => this.onDoorHoverEnd(index)
      door.userData.onClick = () => this.onDoorClick(index)
    })
  }

  private onDoorHover(doorIndex: number) {
    const door = this.doors[doorIndex]
    if (!door || this.isProjectionActive) return

    // Subtle highlight effect
    if (door.material instanceof THREE.MeshPhongMaterial) {
      door.material.emissive.setHex(0x222222)
      door.material.needsUpdate = true
    }
  }

  private onDoorHoverEnd(doorIndex: number) {
    const door = this.doors[doorIndex]
    if (!door || this.isProjectionActive) return

    // Remove highlight effect
    if (door.material instanceof THREE.MeshPhongMaterial) {
      door.material.emissive.setHex(0x000000)
      door.material.needsUpdate = true
    }
  }

  private onDoorClick(doorIndex: number) {
    // This will be handled by the level controller
    console.log(`Door clicked: Cabinet ${this.config.index}, Door ${doorIndex}`)
  }

  public applyProjection(
    texture: THREE.Texture,
    intensity: number = 0.8,
    blendMode: THREE.BlendingType = THREE.MultiplyBlending
  ) {
    this.projectionTexture = texture
    this.isProjectionActive = true

    this.doors.forEach((door, index) => {
      // Create projection material
      const projectionMaterial = new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          projectionTexture: { value: texture },
          intensity: { value: intensity },
          time: { value: 0 }
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vPosition;

          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D baseTexture;
          uniform sampler2D projectionTexture;
          uniform float intensity;
          uniform float time;

          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vPosition;

          void main() {
            // Base wood color
            vec3 baseColor = vec3(0.545, 0.271, 0.075); // Wood brown

            // Sample projection texture
            vec4 projection = texture2D(projectionTexture, vUv);

            // Create projection mapping effect
            vec3 projectionColor = projection.rgb * intensity;

            // Add subtle animation
            float pulse = sin(time * 2.0) * 0.1 + 0.9;
            projectionColor *= pulse;

            // Blend with base color
            vec3 finalColor = mix(baseColor, baseColor + projectionColor, projection.a * intensity);

            // Add glow effect at projection edges
            float glow = smoothstep(0.1, 0.9, projection.a) * 0.2;
            finalColor += vec3(glow);

            gl_FragColor = vec4(finalColor, 1.0);
          }
        `,
        transparent: true
      })

      // Replace door material
      door.material = projectionMaterial
    })
  }

  public removeProjection() {
    this.isProjectionActive = false
    this.projectionTexture = null

    this.doors.forEach((door, index) => {
      door.material = this.originalMaterials[index]
    })
  }

  public updateProjectionAnimation(time: number) {
    if (!this.isProjectionActive) return

    this.doors.forEach(door => {
      if (door.material instanceof THREE.ShaderMaterial) {
        door.material.uniforms.time.value = time
      }
    })
  }

  public getDoors(): THREE.Mesh[] {
    return this.doors
  }

  public getGroup(): THREE.Group {
    return this.group
  }

  public getConfig(): CabinetConfig {
    return this.config
  }

  public isValidProjectionTarget(doorIndex?: number): boolean {
    if (doorIndex !== undefined) {
      return doorIndex >= 0 && doorIndex < this.doors.length
    }
    return this.doors.length > 0
  }

  public getDoorWorldPosition(doorIndex: number): THREE.Vector3 {
    if (doorIndex < 0 || doorIndex >= this.doors.length) {
      return new THREE.Vector3()
    }

    const worldPosition = new THREE.Vector3()
    this.doors[doorIndex].getWorldPosition(worldPosition)
    return worldPosition
  }

  public getDoorBoundingBox(doorIndex: number): THREE.Box3 | null {
    if (doorIndex < 0 || doorIndex >= this.doors.length) {
      return null
    }

    const box = new THREE.Box3()
    box.setFromObject(this.doors[doorIndex])
    return box
  }

  public dispose() {
    // Dispose materials
    this.originalMaterials.forEach(material => material.dispose())
    this.doors.forEach(door => {
      if (door.material instanceof THREE.Material) {
        door.material.dispose()
      }
    })

    // Dispose geometries
    this.group.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
      }
    })

    // Clear arrays
    this.doors.length = 0
    this.originalMaterials.length = 0

    // Dispose texture
    if (this.projectionTexture) {
      this.projectionTexture.dispose()
    }
  }
}

export default KitchenCabinet