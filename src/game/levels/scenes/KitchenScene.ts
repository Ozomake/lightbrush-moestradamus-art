import * as THREE from 'three'

export class KitchenScene {
  private scene: THREE.Scene
  private materials: Map<string, THREE.Material>
  private geometries: Map<string, THREE.BufferGeometry>

  constructor() {
    this.scene = new THREE.Scene()
    this.materials = new Map()
    this.geometries = new Map()
    this.setupScene()
  }

  private setupScene() {
    // Set up scene background
    this.scene.background = new THREE.Color(0x2c1810) // Warm dark brown

    // Create reusable materials
    this.createMaterials()

    // Create reusable geometries
    this.createGeometries()

    // Build the kitchen environment
    this.createKitchenEnvironment()
    this.setupLighting()
  }

  private createMaterials() {
    // Wood materials for cabinets
    const woodTexture = new THREE.TextureLoader().load('/textures/wood-grain.jpg')
    woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping
    woodTexture.repeat.set(2, 2)

    this.materials.set('woodCabinet', new THREE.MeshPhongMaterial({
      color: 0x8B4513,
      map: woodTexture,
      shininess: 30,
      transparent: false
    }))

    // Wall material
    this.materials.set('wall', new THREE.MeshLambertMaterial({
      color: 0xF5F5DC, // Beige
    }))

    // Floor material
    this.materials.set('floor', new THREE.MeshPhongMaterial({
      color: 0x654321,
      shininess: 50
    }))

    // Countertop material
    this.materials.set('countertop', new THREE.MeshPhongMaterial({
      color: 0x708090,
      shininess: 100
    }))

    // Projection surface material (will be replaced with shader material)
    this.materials.set('projectionSurface', new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    }))
  }

  private createGeometries() {
    // Cabinet geometries
    this.geometries.set('cabinetBase', new THREE.BoxGeometry(2, 0.8, 0.6))
    this.geometries.set('cabinetUpper', new THREE.BoxGeometry(1.8, 0.7, 0.4))
    this.geometries.set('cabinetDoor', new THREE.BoxGeometry(0.9, 0.65, 0.05))

    // Room geometries
    this.geometries.set('floor', new THREE.PlaneGeometry(10, 8))
    this.geometries.set('wall', new THREE.PlaneGeometry(10, 3))
    this.geometries.set('sideWall', new THREE.PlaneGeometry(8, 3))
    this.geometries.set('countertop', new THREE.BoxGeometry(6, 0.1, 0.6))
  }

  private createKitchenEnvironment() {
    // Create floor
    const floor = new THREE.Mesh(
      this.geometries.get('floor')!,
      this.materials.get('floor')!
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = 0
    this.scene.add(floor)

    // Create back wall
    const backWall = new THREE.Mesh(
      this.geometries.get('wall')!,
      this.materials.get('wall')!
    )
    backWall.position.set(0, 1.5, -4)
    this.scene.add(backWall)

    // Create left wall
    const leftWall = new THREE.Mesh(
      this.geometries.get('sideWall')!,
      this.materials.get('wall')!
    )
    leftWall.rotation.y = Math.PI / 2
    leftWall.position.set(-5, 1.5, 0)
    this.scene.add(leftWall)

    // Create countertop
    const countertop = new THREE.Mesh(
      this.geometries.get('countertop')!,
      this.materials.get('countertop')!
    )
    countertop.position.set(0, 0.9, -3.2)
    this.scene.add(countertop)

    // Create base cabinets
    this.createBaseCabinets()

    // Create upper cabinets
    this.createUpperCabinets()
  }

  private createBaseCabinets() {
    const cabinetPositions = [
      { x: -2.5, z: -3.5 },
      { x: 0, z: -3.5 },
      { x: 2.5, z: -3.5 }
    ]

    cabinetPositions.forEach((pos, index) => {
      // Cabinet body
      const cabinet = new THREE.Mesh(
        this.geometries.get('cabinetBase')!,
        this.materials.get('woodCabinet')!
      )
      cabinet.position.set(pos.x, 0.4, pos.z)
      cabinet.name = `baseCabinet_${index}`
      this.scene.add(cabinet)

      // Cabinet doors (2 doors per cabinet)
      for (let i = 0; i < 2; i++) {
        const door = new THREE.Mesh(
          this.geometries.get('cabinetDoor')!,
          this.materials.get('woodCabinet')!
        )
        door.position.set(
          pos.x + (i === 0 ? -0.45 : 0.45),
          0.4,
          pos.z + 0.325
        )
        door.name = `baseCabinetDoor_${index}_${i}`
        door.userData = {
          type: 'projectionTarget',
          cabinetIndex: index,
          doorIndex: i,
          isBase: true
        }
        this.scene.add(door)
      }
    })
  }

  private createUpperCabinets() {
    const cabinetPositions = [
      { x: -2, z: -3.3 },
      { x: 0, z: -3.3 },
      { x: 2, z: -3.3 }
    ]

    cabinetPositions.forEach((pos, index) => {
      // Cabinet body
      const cabinet = new THREE.Mesh(
        this.geometries.get('cabinetUpper')!,
        this.materials.get('woodCabinet')!
      )
      cabinet.position.set(pos.x, 2.2, pos.z)
      cabinet.name = `upperCabinet_${index}`
      this.scene.add(cabinet)

      // Cabinet doors (2 doors per cabinet)
      for (let i = 0; i < 2; i++) {
        const door = new THREE.Mesh(
          this.geometries.get('cabinetDoor')!,
          this.materials.get('woodCabinet')!
        )
        door.position.set(
          pos.x + (i === 0 ? -0.4 : 0.4),
          2.2,
          pos.z + 0.225
        )
        door.name = `upperCabinetDoor_${index}_${i}`
        door.userData = {
          type: 'projectionTarget',
          cabinetIndex: index,
          doorIndex: i,
          isBase: false
        }
        this.scene.add(door)
      }
    })
  }

  private setupLighting() {
    // Ambient light for overall scene brightness
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    this.scene.add(ambientLight)

    // Main directional light (simulating window light)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(-5, 5, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    this.scene.add(directionalLight)

    // Warm point light for cozy atmosphere
    const pointLight = new THREE.PointLight(0xFFB366, 0.4, 10)
    pointLight.position.set(0, 2, 0)
    this.scene.add(pointLight)

    // Under-cabinet lighting
    const underCabinetLight = new THREE.SpotLight(0xFFFFFF, 0.5, 5, Math.PI / 6)
    underCabinetLight.position.set(0, 1.8, -2.5)
    underCabinetLight.target.position.set(0, 0.9, -3.2)
    this.scene.add(underCabinetLight)
    this.scene.add(underCabinetLight.target)
  }

  public getScene(): THREE.Scene {
    return this.scene
  }

  public getCabinetDoors(): THREE.Mesh[] {
    const doors: THREE.Mesh[] = []
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh &&
          child.userData.type === 'projectionTarget') {
        doors.push(child)
      }
    })
    return doors
  }

  public getMaterial(name: string): THREE.Material | undefined {
    return this.materials.get(name)
  }

  public getGeometry(name: string): THREE.BufferGeometry | undefined {
    return this.geometries.get(name)
  }

  public dispose() {
    // Dispose of materials
    this.materials.forEach(material => material.dispose())
    this.materials.clear()

    // Dispose of geometries
    this.geometries.forEach(geometry => geometry.dispose())
    this.geometries.clear()

    // Clear scene
    this.scene.clear()
  }
}

export default KitchenScene