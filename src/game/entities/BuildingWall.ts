import * as THREE from 'three'

export type SurfaceType = 'brick' | 'concrete' | 'metal' | 'painted' | 'glass' | 'wood'

export interface BuildingWallConfig {
  id: string
  position: THREE.Vector3
  dimensions: THREE.Vector3 // width, height, depth
  surfaceType: SurfaceType
  reflectivity: number // 0-1, affects projection quality
  roughness?: number
  color?: number
  normalMapIntensity?: number
}

export interface ProjectionData {
  texture: THREE.Texture
  projectionMatrix: THREE.Matrix4
  viewMatrix: THREE.Matrix4
  intensity: number
  isActive: boolean
}

export class BuildingWall {
  private config: BuildingWallConfig
  private group: THREE.Group
  private wallMesh!: THREE.Mesh
  private projectionPlane!: THREE.Mesh
  private surfaceMaterial!: THREE.MeshStandardMaterial
  private projectionMaterial!: THREE.ShaderMaterial
  private currentProjection: ProjectionData | null = null
  private detailElements: THREE.Mesh[] = []

  constructor(config: BuildingWallConfig) {
    this.config = {
      roughness: 0.8,
      color: 0x666666,
      normalMapIntensity: 1.0,
      ...config
    }

    this.group = new THREE.Group()
    this.group.name = `building_wall_${this.config.id}`

    this.createWallGeometry()
    this.createSurfaceMaterial()
    this.createProjectionSystem()
    this.addSurfaceDetails()
    this.setupPhysics()
  }

  private createWallGeometry() {
    const geometry = new THREE.BoxGeometry(
      this.config.dimensions.x,
      this.config.dimensions.y,
      this.config.dimensions.z
    )

    // Create UV coordinates for better texture mapping
    this.setupUVMapping(geometry)

    this.wallMesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial())
    this.wallMesh.position.copy(this.config.position)
    this.wallMesh.castShadow = true
    this.wallMesh.receiveShadow = true
    this.wallMesh.name = `wall_mesh_${this.config.id}`

    // Add metadata for interaction
    this.wallMesh.userData = {
      type: 'projection_surface',
      wallId: this.config.id,
      surfaceType: this.config.surfaceType,
      reflectivity: this.config.reflectivity,
      canProject: true
    }

    this.group.add(this.wallMesh)
  }

  private setupUVMapping(geometry: THREE.BoxGeometry) {
    const uvAttribute = geometry.attributes.uv
    const uvArray = uvAttribute.array as Float32Array

    // Enhance UV mapping for better projection results
    // Front face (the main projection surface)
    const scaleU = this.config.dimensions.x / 10
    const scaleV = this.config.dimensions.y / 10

    // Apply scaling to front face UVs
    for (let i = 0; i < 8; i += 2) { // Front face vertices
      uvArray[i] *= scaleU     // U coordinate
      uvArray[i + 1] *= scaleV // V coordinate
    }

    uvAttribute.needsUpdate = true
  }

  private createSurfaceMaterial() {
    const baseTexture = this.generateSurfaceTexture()
    const normalTexture = this.generateNormalMap()
    const roughnessTexture = this.generateRoughnessMap()

    this.surfaceMaterial = new THREE.MeshStandardMaterial({
      map: baseTexture,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(
        this.config.normalMapIntensity!,
        this.config.normalMapIntensity!
      ),
      roughnessMap: roughnessTexture,
      roughness: this.config.roughness!,
      metalness: this.getSurfaceMetalness(),
      color: this.config.color!
    })

    this.wallMesh.material = this.surfaceMaterial
  }

  private generateSurfaceTexture(): THREE.Texture {
    const canvas = document.createElement('canvas')
    const size = 512
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!

    switch (this.config.surfaceType) {
      case 'brick':
        this.drawBrickTexture(ctx, size)
        break
      case 'concrete':
        this.drawConcreteTexture(ctx, size)
        break
      case 'metal':
        this.drawMetalTexture(ctx, size)
        break
      case 'painted':
        this.drawPaintedTexture(ctx, size)
        break
      case 'glass':
        this.drawGlassTexture(ctx, size)
        break
      case 'wood':
        this.drawWoodTexture(ctx, size)
        break
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(2, 2)
    return texture
  }

  private drawBrickTexture(ctx: CanvasRenderingContext2D, size: number) {
    // Base brick color
    ctx.fillStyle = '#8B4513'
    ctx.fillRect(0, 0, size, size)

    const brickWidth = size / 8
    const brickHeight = size / 16
    const mortarWidth = 3

    ctx.fillStyle = '#A0A0A0' // Mortar color

    // Draw mortar lines
    for (let y = 0; y < size; y += brickHeight) {
      ctx.fillRect(0, y, size, mortarWidth)

      const offsetX = (Math.floor(y / brickHeight) % 2) * (brickWidth / 2)
      for (let x = 0; x < size; x += brickWidth) {
        ctx.fillRect((x + offsetX) % size, y, mortarWidth, brickHeight)
      }
    }

    // Add brick variation
    ctx.fillStyle = '#654321'
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * size
      const y = Math.random() * size
      const w = Math.random() * 20 + 10
      const h = Math.random() * 10 + 5
      ctx.fillRect(x, y, w, h)
    }
  }

  private drawConcreteTexture(ctx: CanvasRenderingContext2D, size: number) {
    // Base concrete color
    ctx.fillStyle = '#C0C0C0'
    ctx.fillRect(0, 0, size, size)

    // Add concrete speckles and variations
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * size
      const y = Math.random() * size
      const radius = Math.random() * 3 + 1
      const darkness = Math.random() * 0.3

      ctx.fillStyle = `rgba(${100 - darkness * 100}, ${100 - darkness * 100}, ${100 - darkness * 100}, 0.5)`
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }

    // Add stains and weathering
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * size
      const y = Math.random() * size
      const width = Math.random() * 50 + 20
      const height = Math.random() * 100 + 30

      ctx.fillStyle = `rgba(80, 80, 80, ${Math.random() * 0.3 + 0.1})`
      ctx.fillRect(x, y, width, height)
    }
  }

  private drawMetalTexture(ctx: CanvasRenderingContext2D, size: number) {
    // Base metal color
    ctx.fillStyle = '#707070'
    ctx.fillRect(0, 0, size, size)

    // Add metal panels
    const panelHeight = size / 6
    ctx.fillStyle = '#606060'
    for (let y = 0; y < size; y += panelHeight) {
      ctx.fillRect(0, y, size, 2)
    }

    // Add rivets
    ctx.fillStyle = '#505050'
    for (let y = panelHeight / 2; y < size; y += panelHeight) {
      for (let x = 20; x < size; x += 40) {
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Add scratches and wear
    ctx.strokeStyle = '#808080'
    ctx.lineWidth = 1
    for (let i = 0; i < 20; i++) {
      ctx.beginPath()
      ctx.moveTo(Math.random() * size, Math.random() * size)
      ctx.lineTo(Math.random() * size, Math.random() * size)
      ctx.stroke()
    }
  }

  private drawPaintedTexture(ctx: CanvasRenderingContext2D, size: number) {
    // Base painted wall color
    const colors = ['#F0F0F0', '#E0E0FF', '#FFE0E0', '#E0FFE0', '#FFFFD0']
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]
    ctx.fillRect(0, 0, size, size)

    // Add paint imperfections
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * size
      const y = Math.random() * size
      const radius = Math.random() * 5 + 2

      ctx.fillStyle = `rgba(200, 200, 200, ${Math.random() * 0.3})`
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }

    // Add peeling paint
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * size
      const y = Math.random() * size
      const width = Math.random() * 30 + 10
      const height = Math.random() * 20 + 5

      ctx.fillStyle = '#D0D0D0'
      ctx.fillRect(x, y, width, height)
    }
  }

  private drawGlassTexture(ctx: CanvasRenderingContext2D, size: number) {
    // Base glass color
    ctx.fillStyle = 'rgba(200, 220, 255, 0.8)'
    ctx.fillRect(0, 0, size, size)

    // Add window frames
    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 4

    // Vertical frames
    for (let x = size / 4; x < size; x += size / 4) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, size)
      ctx.stroke()
    }

    // Horizontal frames
    for (let y = size / 4; y < size; y += size / 4) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(size, y)
      ctx.stroke()
    }

    // Add reflections
    for (let i = 0; i < 3; i++) {
      const x = Math.random() * size
      const y = Math.random() * size
      const width = Math.random() * 100 + 50
      const height = Math.random() * 50 + 25

      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`
      ctx.fillRect(x, y, width, height)
    }
  }

  private drawWoodTexture(ctx: CanvasRenderingContext2D, size: number) {
    // Base wood color
    ctx.fillStyle = '#8B4513'
    ctx.fillRect(0, 0, size, size)

    // Add wood grain
    ctx.strokeStyle = '#654321'
    ctx.lineWidth = 2

    for (let y = 0; y < size; y += 20) {
      ctx.beginPath()
      ctx.moveTo(0, y + Math.sin(0) * 5)
      for (let x = 0; x < size; x += 10) {
        ctx.lineTo(x, y + Math.sin(x * 0.1) * 5)
      }
      ctx.stroke()
    }

    // Add wood planks
    const plankHeight = size / 8
    ctx.strokeStyle = '#5D4037'
    ctx.lineWidth = 1

    for (let y = 0; y < size; y += plankHeight) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(size, y)
      ctx.stroke()
    }
  }

  private generateNormalMap(): THREE.Texture {
    const canvas = document.createElement('canvas')
    const size = 256
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!

    // Base normal color (pointing out)
    ctx.fillStyle = '#8080FF'
    ctx.fillRect(0, 0, size, size)

    // Add surface-specific normal variations
    switch (this.config.surfaceType) {
      case 'brick':
        this.addBrickNormals(ctx, size)
        break
      case 'concrete':
        this.addConcreteNormals(ctx, size)
        break
      case 'metal':
        this.addMetalNormals(ctx, size)
        break
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(2, 2)
    return texture
  }

  private addBrickNormals(ctx: CanvasRenderingContext2D, size: number) {
    // Add depth to brick mortar lines
    const brickHeight = size / 16
    ctx.fillStyle = '#7070F0' // Recessed mortar

    for (let y = 0; y < size; y += brickHeight) {
      ctx.fillRect(0, y, size, 3)
    }
  }

  private addConcreteNormals(ctx: CanvasRenderingContext2D, size: number) {
    // Add random bump variations
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * size
      const y = Math.random() * size
      const radius = Math.random() * 4 + 2
      const variation = Math.random() * 40 + 108 // 108-148 range

      ctx.fillStyle = `rgb(${variation}, ${variation}, 255)`
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  private addMetalNormals(ctx: CanvasRenderingContext2D, size: number) {
    // Add panel seams
    const panelHeight = size / 6
    ctx.fillStyle = '#6060F0'

    for (let y = 0; y < size; y += panelHeight) {
      ctx.fillRect(0, y, size, 2)
    }
  }

  private generateRoughnessMap(): THREE.Texture {
    const canvas = document.createElement('canvas')
    const size = 256
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!

    const baseRoughness = Math.floor(this.config.roughness! * 255)
    ctx.fillStyle = `rgb(${baseRoughness}, ${baseRoughness}, ${baseRoughness})`
    ctx.fillRect(0, 0, size, size)

    // Add surface-specific roughness variations
    switch (this.config.surfaceType) {
      case 'metal':
        // Smoother metal areas
        for (let i = 0; i < 20; i++) {
          const x = Math.random() * size
          const y = Math.random() * size
          const radius = Math.random() * 20 + 10

          ctx.fillStyle = 'rgb(50, 50, 50)' // Smoother areas
          ctx.beginPath()
          ctx.arc(x, y, radius, 0, Math.PI * 2)
          ctx.fill()
        }
        break
      case 'glass':
        // Very smooth glass
        ctx.fillStyle = 'rgb(20, 20, 20)'
        ctx.fillRect(0, 0, size, size)
        break
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(2, 2)
    return texture
  }

  private getSurfaceMetalness(): number {
    switch (this.config.surfaceType) {
      case 'metal': return 0.9
      case 'glass': return 0.1
      case 'concrete': return 0.1
      case 'brick': return 0.0
      case 'painted': return 0.0
      case 'wood': return 0.0
      default: return 0.1
    }
  }

  private createProjectionSystem() {
    // Create a separate plane for projection mapping
    const projectionGeometry = new THREE.PlaneGeometry(
      this.config.dimensions.x,
      this.config.dimensions.y
    )

    this.projectionMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uProjectionTexture: { value: null },
        uProjectionMatrix: { value: new THREE.Matrix4() },
        uViewMatrix: { value: new THREE.Matrix4() },
        uIntensity: { value: 1.0 },
        uSurfaceTexture: { value: this.surfaceMaterial.map },
        uReflectivity: { value: this.config.reflectivity },
        uTime: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec4 vWorldPosition;
        varying vec3 vNormal;
        varying vec4 vProjectedCoord;

        uniform mat4 uProjectionMatrix;
        uniform mat4 uViewMatrix;

        void main() {
          vUv = uv;
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition;
          vNormal = normalize(normalMatrix * normal);

          // Calculate projection coordinates
          vProjectedCoord = uProjectionMatrix * uViewMatrix * worldPosition;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uProjectionTexture;
        uniform sampler2D uSurfaceTexture;
        uniform float uIntensity;
        uniform float uReflectivity;
        uniform float uTime;

        varying vec2 vUv;
        varying vec4 vWorldPosition;
        varying vec3 vNormal;
        varying vec4 vProjectedCoord;

        void main() {
          vec3 surfaceColor = texture2D(uSurfaceTexture, vUv).rgb;

          // Calculate projection UV coordinates
          vec3 projCoord = vProjectedCoord.xyz / vProjectedCoord.w;
          vec2 projUV = projCoord.xy * 0.5 + 0.5;

          // Check if pixel is within projection bounds
          if (projUV.x < 0.0 || projUV.x > 1.0 || projUV.y < 0.0 || projUV.y > 1.0 || projCoord.z < 0.0) {
            gl_FragColor = vec4(surfaceColor, 1.0);
            return;
          }

          // Sample projection texture
          vec4 projectionColor = texture2D(uProjectionTexture, projUV);

          // Calculate angle-based falloff
          vec3 projectionDirection = normalize(vec3(0.0, 0.0, -1.0));
          float angleFactor = max(0.0, dot(vNormal, projectionDirection));

          // Add subtle animation
          float pulse = sin(uTime * 2.0) * 0.1 + 0.9;

          // Blend projection with surface
          vec3 finalColor = mix(
            surfaceColor,
            projectionColor.rgb * uReflectivity * angleFactor * pulse,
            projectionColor.a * uIntensity * angleFactor
          );

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    })

    this.projectionPlane = new THREE.Mesh(projectionGeometry, this.projectionMaterial)
    this.projectionPlane.position.copy(this.config.position)
    this.projectionPlane.position.z += 0.01 // Slight offset to avoid z-fighting
    this.projectionPlane.name = `projection_plane_${this.config.id}`

    this.group.add(this.projectionPlane)
  }

  private addSurfaceDetails() {
    switch (this.config.surfaceType) {
      case 'brick':
        this.addBrickDetails()
        break
      case 'concrete':
        this.addConcreteDetails()
        break
      case 'metal':
        this.addMetalDetails()
        break
      case 'glass':
        this.addGlassDetails()
        break
    }
  }

  private addBrickDetails() {
    // Add window frames or architectural details
    const frameGeometry = new THREE.BoxGeometry(
      this.config.dimensions.x * 0.8,
      this.config.dimensions.y * 0.6,
      0.1
    )
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 })

    const frame = new THREE.Mesh(frameGeometry, frameMaterial)
    frame.position.copy(this.config.position)
    frame.position.z += this.config.dimensions.z / 2 + 0.05

    this.detailElements.push(frame)
    this.group.add(frame)
  }

  private addConcreteDetails() {
    // Add construction seams
    for (let i = 0; i < 3; i++) {
      const seamGeometry = new THREE.BoxGeometry(this.config.dimensions.x, 0.05, 0.02)
      const seamMaterial = new THREE.MeshStandardMaterial({ color: 0x505050 })

      const seam = new THREE.Mesh(seamGeometry, seamMaterial)
      seam.position.copy(this.config.position)
      seam.position.y += (i - 1) * (this.config.dimensions.y / 4)
      seam.position.z += this.config.dimensions.z / 2 + 0.01

      this.detailElements.push(seam)
      this.group.add(seam)
    }
  }

  private addMetalDetails() {
    // Add support beams
    const beamGeometry = new THREE.BoxGeometry(0.2, this.config.dimensions.y, 0.2)
    const beamMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.8,
      roughness: 0.3
    })

    for (let i = 0; i < 3; i++) {
      const beam = new THREE.Mesh(beamGeometry, beamMaterial)
      beam.position.copy(this.config.position)
      beam.position.x += (i - 1) * (this.config.dimensions.x / 3)
      beam.position.z += this.config.dimensions.z / 2 + 0.1

      this.detailElements.push(beam)
      this.group.add(beam)
    }
  }

  private addGlassDetails() {
    // Add window mullions
    const mullionMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 })

    // Vertical mullions
    for (let i = 1; i < 4; i++) {
      const mullionGeometry = new THREE.BoxGeometry(0.05, this.config.dimensions.y, 0.05)
      const mullion = new THREE.Mesh(mullionGeometry, mullionMaterial)
      mullion.position.copy(this.config.position)
      mullion.position.x += (i - 2) * (this.config.dimensions.x / 4)
      mullion.position.z += this.config.dimensions.z / 2 + 0.025

      this.detailElements.push(mullion)
      this.group.add(mullion)
    }

    // Horizontal mullions
    for (let i = 1; i < 3; i++) {
      const mullionGeometry = new THREE.BoxGeometry(this.config.dimensions.x, 0.05, 0.05)
      const mullion = new THREE.Mesh(mullionGeometry, mullionMaterial)
      mullion.position.copy(this.config.position)
      mullion.position.y += (i - 1.5) * (this.config.dimensions.y / 3)
      mullion.position.z += this.config.dimensions.z / 2 + 0.025

      this.detailElements.push(mullion)
      this.group.add(mullion)
    }
  }

  private setupPhysics() {
    // Add collision detection data
    this.wallMesh.userData.physics = {
      type: 'static',
      collisionShape: 'box',
      dimensions: this.config.dimensions
    }
  }

  // Public methods for projection mapping

  public applyProjection(
    texture: THREE.Texture,
    projectionMatrix: THREE.Matrix4,
    viewMatrix: THREE.Matrix4,
    intensity: number = 1.0
  ) {
    this.currentProjection = {
      texture,
      projectionMatrix: projectionMatrix.clone(),
      viewMatrix: viewMatrix.clone(),
      intensity,
      isActive: true
    }

    // Update shader uniforms
    this.projectionMaterial.uniforms.uProjectionTexture.value = texture
    this.projectionMaterial.uniforms.uProjectionMatrix.value = projectionMatrix
    this.projectionMaterial.uniforms.uViewMatrix.value = viewMatrix
    this.projectionMaterial.uniforms.uIntensity.value = intensity

    this.projectionPlane.visible = true
  }

  public clearProjection() {
    this.currentProjection = null
    this.projectionMaterial.uniforms.uProjectionTexture.value = null
    this.projectionMaterial.uniforms.uIntensity.value = 0
    this.projectionPlane.visible = false
  }

  public getProjectionQuality(angle: number, distance: number): number {
    // Calculate projection quality based on angle and distance
    const angleQuality = Math.max(0, Math.cos(angle))
    const distanceQuality = Math.max(0, 1 - distance / 20) // Falloff over 20 units
    const surfaceQuality = this.config.reflectivity

    return angleQuality * distanceQuality * surfaceQuality
  }

  public isPointOnSurface(point: THREE.Vector3, tolerance: number = 0.1): boolean {
    // Check if a point is on the wall surface
    const localPoint = point.clone().sub(this.config.position)

    return Math.abs(localPoint.x) <= this.config.dimensions.x / 2 + tolerance &&
           Math.abs(localPoint.y) <= this.config.dimensions.y / 2 + tolerance &&
           Math.abs(localPoint.z) <= this.config.dimensions.z / 2 + tolerance
  }

  public getSurfaceNormalAtPoint(_point: THREE.Vector3): THREE.Vector3 {
    // For now, return the front-facing normal
    // In a more complex implementation, this could vary based on surface details
    return new THREE.Vector3(0, 0, 1)
  }

  public update(deltaTime: number) {
    // Update animation time for shader effects
    if (this.projectionMaterial) {
      this.projectionMaterial.uniforms.uTime.value += deltaTime
    }

    // Update projection effects if active
    if (this.currentProjection && this.currentProjection.isActive) {
      // Add subtle projection animations or effects here
      const pulse = Math.sin(Date.now() * 0.003) * 0.1 + 0.9
      this.projectionMaterial.uniforms.uIntensity.value =
        this.currentProjection.intensity * pulse
    }
  }

  // Getters and utility methods

  public getGroup(): THREE.Group {
    return this.group
  }

  public getMesh(): THREE.Mesh {
    return this.wallMesh
  }

  public getConfig(): BuildingWallConfig {
    return { ...this.config }
  }

  public getCurrentProjection(): ProjectionData | null {
    return this.currentProjection ? { ...this.currentProjection } : null
  }

  public getSurfaceArea(): number {
    return this.config.dimensions.x * this.config.dimensions.y
  }

  public getCenter(): THREE.Vector3 {
    return this.config.position.clone()
  }

  public getBounds(): THREE.Box3 {
    const box = new THREE.Box3()
    box.setFromCenterAndSize(this.config.position, this.config.dimensions)
    return box
  }

  public dispose() {
    // Dispose of materials and textures
    this.surfaceMaterial.dispose()
    this.projectionMaterial.dispose()

    if (this.surfaceMaterial.map) this.surfaceMaterial.map.dispose()
    if (this.surfaceMaterial.normalMap) this.surfaceMaterial.normalMap.dispose()
    if (this.surfaceMaterial.roughnessMap) this.surfaceMaterial.roughnessMap.dispose()

    // Dispose detail elements
    this.detailElements.forEach(element => {
      if (element.material instanceof THREE.Material) {
        element.material.dispose()
      }
      element.geometry.dispose()
    })

    // Dispose geometries
    this.wallMesh.geometry.dispose()
    this.projectionPlane.geometry.dispose()

    // Clear arrays
    this.detailElements.length = 0

    // Clear the group
    this.group.clear()
  }
}

export default BuildingWall