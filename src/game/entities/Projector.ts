import * as THREE from 'three'

export interface ProjectorConfig {
  position: THREE.Vector3
  rotation: THREE.Euler
  fov: number
  aspect: number
  near: number
  far: number
  intensity: number
}

export class Projector {
  private group: THREE.Group
  private projectorMesh: THREE.Mesh
  private spotLight: THREE.SpotLight
  private frustumHelper: THREE.CameraHelper | null = null
  private projectionCamera: THREE.PerspectiveCamera
  private projectionTexture: THREE.Texture | null = null
  private isDragging: boolean = false
  private dragOffset: THREE.Vector3 = new THREE.Vector3()
  private config: ProjectorConfig

  constructor(config: ProjectorConfig) {
    this.config = config
    this.group = new THREE.Group()
    this.createProjector()
    this.createProjectionCamera()
    this.createLight()
    this.setupInteraction()
  }

  private createProjector() {
    // Create projector body geometry
    const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.4, 12)
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: 0x333333,
      shininess: 100
    })

    this.projectorMesh = new THREE.Mesh(bodyGeometry, bodyMaterial)
    this.projectorMesh.name = 'projector_body'

    // Create lens geometry
    const lensGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 16)
    const lensMaterial = new THREE.MeshPhongMaterial({
      color: 0x111111,
      shininess: 200,
      transparent: true,
      opacity: 0.8
    })

    const lens = new THREE.Mesh(lensGeometry, lensMaterial)
    lens.position.set(0, 0.22, 0)
    lens.name = 'projector_lens'

    // Create mount/stand
    const mountGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.3, 8)
    const mountMaterial = new THREE.MeshPhongMaterial({
      color: 0x555555,
      shininess: 50
    })

    const mount = new THREE.Mesh(mountGeometry, mountMaterial)
    mount.position.set(0, -0.35, 0)
    mount.name = 'projector_mount'

    // Assemble projector
    this.group.add(this.projectorMesh)
    this.group.add(lens)
    this.group.add(mount)

    // Position and orient the projector
    this.group.position.copy(this.config.position)
    this.group.rotation.copy(this.config.rotation)
    this.group.name = 'projector_group'

    // Add interaction userData
    this.projectorMesh.userData = {
      type: 'draggable',
      isDraggable: true,
      onDragStart: () => this.onDragStart(),
      onDrag: (position: THREE.Vector3) => this.onDrag(position),
      onDragEnd: () => this.onDragEnd()
    }
  }

  private createProjectionCamera() {
    this.projectionCamera = new THREE.PerspectiveCamera(
      this.config.fov,
      this.config.aspect,
      this.config.near,
      this.config.far
    )

    this.projectionCamera.position.copy(this.config.position)
    this.projectionCamera.rotation.copy(this.config.rotation)
    this.projectionCamera.name = 'projection_camera'

    // Create frustum helper for visualization
    this.frustumHelper = new THREE.CameraHelper(this.projectionCamera)
    this.frustumHelper.visible = false // Initially hidden
    this.frustumHelper.name = 'frustum_helper'
  }

  private createLight() {
    this.spotLight = new THREE.SpotLight(
      0xffffff,
      this.config.intensity,
      this.config.far,
      Math.PI / 6,
      0.3,
      0.5
    )

    this.spotLight.position.copy(this.config.position)
    this.spotLight.target.position.copy(this.config.position)
    this.spotLight.target.position.add(new THREE.Vector3(0, 0, -1))

    // Enable shadows
    this.spotLight.castShadow = true
    this.spotLight.shadow.mapSize.width = 1024
    this.spotLight.shadow.mapSize.height = 1024
    this.spotLight.shadow.camera.near = this.config.near
    this.spotLight.shadow.camera.far = this.config.far
    this.spotLight.shadow.focus = 1

    this.spotLight.name = 'projector_light'
  }

  private setupInteraction() {
    // Add hover effects
    this.projectorMesh.userData.onHover = () => {
      if (this.projectorMesh.material instanceof THREE.MeshPhongMaterial) {
        this.projectorMesh.material.emissive.setHex(0x222222)
      }
    }

    this.projectorMesh.userData.onHoverEnd = () => {
      if (this.projectorMesh.material instanceof THREE.MeshPhongMaterial) {
        this.projectorMesh.material.emissive.setHex(0x000000)
      }
    }
  }

  private onDragStart() {
    this.isDragging = true
    if (this.frustumHelper) {
      this.frustumHelper.visible = true
    }
  }

  private onDrag(newPosition: THREE.Vector3) {
    if (!this.isDragging) return

    // Update projector position
    this.group.position.copy(newPosition)

    // Update camera position
    this.projectionCamera.position.copy(newPosition)

    // Update light position
    this.spotLight.position.copy(newPosition)

    // Update light target based on projector orientation
    const direction = new THREE.Vector3(0, 0, -1)
    direction.applyEuler(this.group.rotation)
    this.spotLight.target.position.copy(newPosition).add(direction.multiplyScalar(2))

    // Update frustum helper
    if (this.frustumHelper) {
      this.frustumHelper.update()
    }
  }

  private onDragEnd() {
    this.isDragging = false
    if (this.frustumHelper) {
      this.frustumHelper.visible = false
    }
  }

  public setProjectionTexture(texture: THREE.Texture) {
    this.projectionTexture = texture
  }

  public getProjectionTexture(): THREE.Texture | null {
    return this.projectionTexture
  }

  public setRotation(rotation: THREE.Euler) {
    this.config.rotation = rotation
    this.group.rotation.copy(rotation)
    this.projectionCamera.rotation.copy(rotation)

    // Update light target based on new rotation
    const direction = new THREE.Vector3(0, 0, -1)
    direction.applyEuler(rotation)
    this.spotLight.target.position.copy(this.group.position).add(direction.multiplyScalar(2))

    if (this.frustumHelper) {
      this.frustumHelper.update()
    }
  }

  public setPosition(position: THREE.Vector3) {
    this.config.position = position
    this.group.position.copy(position)
    this.projectionCamera.position.copy(position)
    this.spotLight.position.copy(position)

    // Update light target
    const direction = new THREE.Vector3(0, 0, -1)
    direction.applyEuler(this.group.rotation)
    this.spotLight.target.position.copy(position).add(direction.multiplyScalar(2))

    if (this.frustumHelper) {
      this.frustumHelper.update()
    }
  }

  public setIntensity(intensity: number) {
    this.config.intensity = intensity
    this.spotLight.intensity = intensity
  }

  public setFOV(fov: number) {
    this.config.fov = fov
    this.projectionCamera.fov = fov
    this.projectionCamera.updateProjectionMatrix()

    if (this.frustumHelper) {
      this.frustumHelper.update()
    }
  }

  public setProjectionParameters(params: {
    fov?: number
    intensity?: number
    near?: number
    far?: number
  }) {
    if (params.fov !== undefined) {
      this.setFOV(params.fov)
    }
    if (params.intensity !== undefined) {
      this.setIntensity(params.intensity)
    }
    if (params.near !== undefined) {
      this.config.near = params.near
      this.projectionCamera.near = params.near
      this.projectionCamera.updateProjectionMatrix()
    }
    if (params.far !== undefined) {
      this.config.far = params.far
      this.projectionCamera.far = params.far
      this.spotLight.distance = params.far
      this.projectionCamera.updateProjectionMatrix()
    }
  }

  public showFrustum(show: boolean = true) {
    if (this.frustumHelper) {
      this.frustumHelper.visible = show
    }
  }

  public getProjectionMatrix(): THREE.Matrix4 {
    return this.projectionCamera.projectionMatrix.clone()
  }

  public getViewMatrix(): THREE.Matrix4 {
    return this.projectionCamera.matrixWorldInverse.clone()
  }

  public getGroup(): THREE.Group {
    return this.group
  }

  public getLight(): THREE.SpotLight {
    return this.spotLight
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.projectionCamera
  }

  public getFrustumHelper(): THREE.CameraHelper | null {
    return this.frustumHelper
  }

  public getConfig(): ProjectorConfig {
    return { ...this.config }
  }

  public isDraggingState(): boolean {
    return this.isDragging
  }

  public calculateProjectionUV(worldPosition: THREE.Vector3): THREE.Vector2 | null {
    // Convert world position to projector space
    const projectorSpacePosition = worldPosition.clone()
    projectorSpacePosition.project(this.projectionCamera)

    // Check if position is within projection frustum
    if (projectorSpacePosition.x < -1 || projectorSpacePosition.x > 1 ||
        projectorSpacePosition.y < -1 || projectorSpacePosition.y > 1 ||
        projectorSpacePosition.z < -1 || projectorSpacePosition.z > 1) {
      return null
    }

    // Convert to UV coordinates (0-1)
    const uv = new THREE.Vector2(
      (projectorSpacePosition.x + 1) / 2,
      (projectorSpacePosition.y + 1) / 2
    )

    return uv
  }

  public dispose() {
    // Dispose materials
    this.group.traverse(child => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
        child.material.dispose()
        child.geometry.dispose()
      }
    })

    // Dispose texture
    if (this.projectionTexture) {
      this.projectionTexture.dispose()
    }

    // Clear group
    this.group.clear()
  }
}

export default Projector