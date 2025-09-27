import * as THREE from 'three'

export interface ShadowArea {
  position: THREE.Vector3
  radius: number
  intensity: number // 0-1, how much stealth bonus it provides
}

export interface UrbanProp {
  id: string
  mesh: THREE.Mesh
  position: THREE.Vector3
  canHideBehind: boolean
  shadowArea?: ShadowArea
}

export class ParkingLotScene {
  private scene: THREE.Group
  private shadowAreas: ShadowArea[] = []
  private urbanProps: UrbanProp[] = []
  private streetLights: THREE.SpotLight[] = []
  private neonLights: THREE.Mesh[] = []

  constructor() {
    this.scene = new THREE.Group()
    this.scene.name = 'parking_lot_scene'
    this.createEnvironment()
    this.createLighting()
    this.createUrbanProps()
    this.createAtmosphere()
  }

  private createEnvironment() {
    // Ground - asphalt parking lot
    const groundGeometry = new THREE.PlaneGeometry(100, 100)
    const groundTexture = this.createAsphaltTexture()
    const groundMaterial = new THREE.MeshStandardMaterial({
      map: groundTexture,
      normalMap: this.createAsphaltNormalMap(),
      roughness: 0.9,
      metalness: 0.1
    })

    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = 0
    ground.receiveShadow = true
    ground.name = 'parking_lot_ground'
    this.scene.add(ground)

    // Parking lot lines
    this.createParkingLines()

    // Building structures (basic geometry, detailed walls will be separate entities)
    this.createBuildingStructures()

    // Urban infrastructure
    this.createUrbanInfrastructure()
  }

  private createAsphaltTexture(): THREE.Texture {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!

    // Base asphalt color
    ctx.fillStyle = '#2c2c2c'
    ctx.fillRect(0, 0, 512, 512)

    // Add texture variation
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 512
      const size = Math.random() * 3 + 1
      const opacity = Math.random() * 0.3

      ctx.fillStyle = `rgba(${Math.random() * 50 + 30}, ${Math.random() * 50 + 30}, ${Math.random() * 50 + 30}, ${opacity})`
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(10, 10)
    return texture
  }

  private createAsphaltNormalMap(): THREE.Texture {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')!

    // Base normal color (flat surface)
    ctx.fillStyle = '#8080ff'
    ctx.fillRect(0, 0, 256, 256)

    // Add bumps and cracks
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 256
      const y = Math.random() * 256
      const width = Math.random() * 20 + 5
      const height = Math.random() * 2 + 1

      ctx.fillStyle = Math.random() > 0.5 ? '#9090ff' : '#7070ff'
      ctx.fillRect(x, y, width, height)
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(5, 5)
    return texture
  }

  private createParkingLines() {
    const lineGeometry = new THREE.PlaneGeometry(0.2, 10)
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })

    // Create parking space lines
    for (let i = -8; i <= 8; i += 2) {
      const line1 = new THREE.Mesh(lineGeometry, lineMaterial)
      line1.rotation.x = -Math.PI / 2
      line1.position.set(i, 0.01, -20)
      this.scene.add(line1)

      const line2 = new THREE.Mesh(lineGeometry, lineMaterial)
      line2.rotation.x = -Math.PI / 2
      line2.position.set(i, 0.01, 20)
      this.scene.add(line2)
    }

    // Horizontal lines
    const horizontalLineGeometry = new THREE.PlaneGeometry(20, 0.2)
    const horizontalLine1 = new THREE.Mesh(horizontalLineGeometry, lineMaterial)
    horizontalLine1.rotation.x = -Math.PI / 2
    horizontalLine1.position.set(0, 0.01, -15)
    this.scene.add(horizontalLine1)

    const horizontalLine2 = new THREE.Mesh(horizontalLineGeometry, lineMaterial)
    horizontalLine2.rotation.x = -Math.PI / 2
    horizontalLine2.position.set(0, 0.01, 15)
    this.scene.add(horizontalLine2)
  }

  private createBuildingStructures() {
    // Main building (backdrop)
    const mainBuildingGeometry = new THREE.BoxGeometry(14, 8, 2)
    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.8,
      metalness: 0.2
    })

    const mainBuilding = new THREE.Mesh(mainBuildingGeometry, buildingMaterial)
    mainBuilding.position.set(0, 4, -11)
    mainBuilding.castShadow = true
    this.scene.add(mainBuilding)

    // Side buildings
    const sideBuildingGeometry = new THREE.BoxGeometry(10, 6, 1.5)

    const leftBuilding = new THREE.Mesh(sideBuildingGeometry, buildingMaterial)
    leftBuilding.position.set(-15, 3, -5.5)
    leftBuilding.castShadow = true
    this.scene.add(leftBuilding)

    const rightBuilding = new THREE.Mesh(sideBuildingGeometry, buildingMaterial)
    rightBuilding.position.set(15, 4, 0.5)
    rightBuilding.castShadow = true
    this.scene.add(rightBuilding)

    // Warehouse building
    const warehouseGeometry = new THREE.BoxGeometry(12, 10, 2)
    const warehouse = new THREE.Mesh(warehouseGeometry, buildingMaterial)
    warehouse.position.set(-8, 5, 9)
    warehouse.castShadow = true
    this.scene.add(warehouse)

    // Add rooftop details
    this.addRooftopDetails()
  }

  private addRooftopDetails() {
    // HVAC units
    const hvacGeometry = new THREE.BoxGeometry(2, 0.8, 1.5)
    const hvacMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 })

    const hvac1 = new THREE.Mesh(hvacGeometry, hvacMaterial)
    hvac1.position.set(-2, 8.4, -11)
    this.scene.add(hvac1)

    const hvac2 = new THREE.Mesh(hvacGeometry, hvacMaterial)
    hvac2.position.set(3, 8.4, -11)
    this.scene.add(hvac2)

    // Satellite dishes
    const dishGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 16)
    const dishMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa })

    const dish = new THREE.Mesh(dishGeometry, dishMaterial)
    dish.position.set(12, 8.2, 0.5)
    dish.rotation.x = -Math.PI / 6
    this.scene.add(dish)
  }

  private createLighting() {
    // Street lights with realistic illumination
    const streetLightPositions = [
      new THREE.Vector3(-10, 6, -25),
      new THREE.Vector3(10, 6, -25),
      new THREE.Vector3(-15, 6, 0),
      new THREE.Vector3(15, 6, 0),
      new THREE.Vector3(-5, 6, 25),
      new THREE.Vector3(5, 6, 25)
    ]

    streetLightPositions.forEach((position, index) => {
      // Street light pole
      const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 6, 8)
      const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 })
      const pole = new THREE.Mesh(poleGeometry, poleMaterial)
      pole.position.copy(position)
      pole.position.y = 3
      pole.castShadow = true
      this.scene.add(pole)

      // Street light fixture
      const fixtureGeometry = new THREE.CylinderGeometry(0.4, 0.3, 0.8, 6)
      const fixtureMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 })
      const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial)
      fixture.position.copy(position)
      fixture.position.y = 6.4
      this.scene.add(fixture)

      // Street light
      const streetLight = new THREE.SpotLight(
        0xffaa44, // Warm street light color
        2.0,
        25,
        Math.PI / 6,
        0.5,
        0.8
      )
      streetLight.position.copy(position)
      streetLight.target.position.set(position.x, 0, position.z)
      streetLight.castShadow = true
      streetLight.shadow.mapSize.width = 1024
      streetLight.shadow.mapSize.height = 1024
      streetLight.name = `street_light_${index}`

      this.scene.add(streetLight)
      this.scene.add(streetLight.target)
      this.streetLights.push(streetLight)

      // Create shadow area around each light
      this.shadowAreas.push({
        position: new THREE.Vector3(position.x + 3, 0, position.z + 3),
        radius: 4,
        intensity: 0.6
      })
    })

    // Building ambient lighting
    this.addBuildingLights()

    // Neon signs and cyberpunk elements
    this.addNeonLights()
  }

  private addBuildingLights() {
    // Window lights
    const windowPositions = [
      { pos: new THREE.Vector3(-3, 2, -10.5), color: 0x4488ff },
      { pos: new THREE.Vector3(0, 3, -10.5), color: 0xff4488 },
      { pos: new THREE.Vector3(4, 2.5, -10.5), color: 0x44ff88 },
      { pos: new THREE.Vector3(-12, 4, -5), color: 0xffaa44 },
      { pos: new THREE.Vector3(12, 3, 0.8), color: 0x8844ff }
    ]

    windowPositions.forEach((window, index) => {
      const windowLight = new THREE.PointLight(window.color, 0.8, 15, 2)
      windowLight.position.copy(window.pos)
      windowLight.name = `window_light_${index}`
      this.scene.add(windowLight)

      // Window glow effect
      const glowGeometry = new THREE.PlaneGeometry(1.5, 1.5)
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: window.color,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
      })
      const glow = new THREE.Mesh(glowGeometry, glowMaterial)
      glow.position.copy(window.pos)
      this.scene.add(glow)
    })
  }

  private addNeonLights() {
    // Neon sign on main building
    const neonSignGeometry = new THREE.PlaneGeometry(6, 1.5)
    const neonSignMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0066,
      transparent: true,
      opacity: 0.8,
      emissive: 0xff0066,
      emissiveIntensity: 0.3
    })

    const neonSign = new THREE.Mesh(neonSignGeometry, neonSignMaterial)
    neonSign.position.set(0, 5, -9.8)
    this.scene.add(neonSign)
    this.neonLights.push(neonSign)

    // Side neon strips
    const stripGeometry = new THREE.PlaneGeometry(0.2, 8)
    const stripMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.6,
      emissive: 0x00ffff,
      emissiveIntensity: 0.2
    })

    const leftStrip = new THREE.Mesh(stripGeometry, stripMaterial)
    leftStrip.position.set(-9.5, 3, -4.8)
    this.scene.add(leftStrip)
    this.neonLights.push(leftStrip)

    const rightStrip = new THREE.Mesh(stripGeometry.clone(), stripMaterial.clone())
    rightStrip.material.color.setHex(0xffff00)
    rightStrip.material.emissive.setHex(0xffff00)
    rightStrip.position.set(9.5, 4, 1.2)
    this.scene.add(rightStrip)
    this.neonLights.push(rightStrip)
  }

  private createUrbanProps() {
    // Cars parked in the lot
    this.createParkedCars()

    // Dumpsters for cover
    this.createDumpsters()

    // Concrete barriers
    this.createBarriers()

    // Urban clutter
    this.createUrbanClutter()
  }

  private createParkedCars() {
    const carPositions = [
      { pos: new THREE.Vector3(-6, 0.8, -18), rotation: 0 },
      { pos: new THREE.Vector3(-2, 0.8, -18), rotation: 0 },
      { pos: new THREE.Vector3(4, 0.8, -18), rotation: 0 },
      { pos: new THREE.Vector3(-4, 0.8, 18), rotation: Math.PI },
      { pos: new THREE.Vector3(2, 0.8, 18), rotation: Math.PI },
      { pos: new THREE.Vector3(6, 0.8, 18), rotation: Math.PI }
    ]

    carPositions.forEach((carData, index) => {
      const car = this.createCar(carData.pos, carData.rotation)
      car.name = `parked_car_${index}`
      this.scene.add(car.mesh)
      this.urbanProps.push(car)

      // Cars provide cover
      this.shadowAreas.push({
        position: new THREE.Vector3(carData.pos.x - 1, 0, carData.pos.z),
        radius: 2.5,
        intensity: 0.8
      })
    })
  }

  private createCar(position: THREE.Vector3, rotation: number): UrbanProp {
    const carGroup = new THREE.Group()

    // Car body
    const bodyGeometry = new THREE.BoxGeometry(4, 1.2, 1.8)
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: Math.random() > 0.5 ? 0x333333 : 0x666666,
      metalness: 0.8,
      roughness: 0.2
    })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.y = 0.6
    body.castShadow = true
    carGroup.add(body)

    // Car windows
    const windowGeometry = new THREE.BoxGeometry(3.5, 0.8, 1.6)
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x111133,
      transparent: true,
      opacity: 0.3,
      metalness: 0.1,
      roughness: 0.1
    })
    const windows = new THREE.Mesh(windowGeometry, windowMaterial)
    windows.position.y = 1.4
    carGroup.add(windows)

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 8)
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 })

    const wheelPositions = [
      new THREE.Vector3(-1.3, 0.4, 1.1),
      new THREE.Vector3(1.3, 0.4, 1.1),
      new THREE.Vector3(-1.3, 0.4, -1.1),
      new THREE.Vector3(1.3, 0.4, -1.1)
    ]

    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial)
      wheel.position.copy(pos)
      wheel.rotation.z = Math.PI / 2
      wheel.castShadow = true
      carGroup.add(wheel)
    })

    carGroup.position.copy(position)
    carGroup.rotation.y = rotation

    return {
      id: `car_${Date.now()}`,
      mesh: carGroup,
      position: position.clone(),
      canHideBehind: true,
      shadowArea: {
        position: new THREE.Vector3(position.x - 1, 0, position.z),
        radius: 2.5,
        intensity: 0.8
      }
    }
  }

  private createDumpsters() {
    const dumpsterPositions = [
      new THREE.Vector3(-18, 1, -8),
      new THREE.Vector3(18, 1, -12),
      new THREE.Vector3(-12, 1, 15)
    ]

    dumpsterPositions.forEach((position, index) => {
      const dumpster = this.createDumpster(position)
      dumpster.name = `dumpster_${index}`
      this.scene.add(dumpster.mesh)
      this.urbanProps.push(dumpster)

      // Dumpsters provide excellent cover
      this.shadowAreas.push({
        position: new THREE.Vector3(position.x + 1, 0, position.z + 1),
        radius: 3,
        intensity: 0.9
      })
    })
  }

  private createDumpster(position: THREE.Vector3): UrbanProp {
    const dumpsterGroup = new THREE.Group()

    // Main container
    const containerGeometry = new THREE.BoxGeometry(3, 2, 1.8)
    const containerMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d4a22,
      roughness: 0.8,
      metalness: 0.3
    })
    const container = new THREE.Mesh(containerGeometry, containerMaterial)
    container.position.y = 1
    container.castShadow = true
    dumpsterGroup.add(container)

    // Lid
    const lidGeometry = new THREE.BoxGeometry(3.1, 0.2, 1.9)
    const lid = new THREE.Mesh(lidGeometry, containerMaterial)
    lid.position.y = 2.1
    lid.rotation.x = -0.3
    dumpsterGroup.add(lid)

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8)
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 })

    const wheel1 = new THREE.Mesh(wheelGeometry, wheelMaterial)
    wheel1.position.set(-1.2, 0.3, 1.1)
    wheel1.rotation.z = Math.PI / 2
    dumpsterGroup.add(wheel1)

    const wheel2 = new THREE.Mesh(wheelGeometry, wheelMaterial)
    wheel2.position.set(1.2, 0.3, 1.1)
    wheel2.rotation.z = Math.PI / 2
    dumpsterGroup.add(wheel2)

    dumpsterGroup.position.copy(position)

    return {
      id: `dumpster_${Date.now()}`,
      mesh: dumpsterGroup,
      position: position.clone(),
      canHideBehind: true,
      shadowArea: {
        position: new THREE.Vector3(position.x + 1, 0, position.z + 1),
        radius: 3,
        intensity: 0.9
      }
    }
  }

  private createBarriers() {
    const barrierPositions = [
      new THREE.Vector3(-25, 0.5, -10),
      new THREE.Vector3(-25, 0.5, 0),
      new THREE.Vector3(-25, 0.5, 10),
      new THREE.Vector3(25, 0.5, -5),
      new THREE.Vector3(25, 0.5, 5),
    ]

    barrierPositions.forEach((position, index) => {
      const barrierGeometry = new THREE.BoxGeometry(1, 1, 8)
      const barrierMaterial = new THREE.MeshStandardMaterial({
        color: 0x666666,
        roughness: 0.9,
        metalness: 0.1
      })

      const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial)
      barrier.position.copy(position)
      barrier.castShadow = true
      barrier.name = `barrier_${index}`
      this.scene.add(barrier)

      this.urbanProps.push({
        id: `barrier_${index}`,
        mesh: barrier,
        position: position.clone(),
        canHideBehind: true,
        shadowArea: {
          position: new THREE.Vector3(position.x + 0.8, 0, position.z),
          radius: 1.5,
          intensity: 0.7
        }
      })

      // Add shadow area
      this.shadowAreas.push({
        position: new THREE.Vector3(position.x + 0.8, 0, position.z),
        radius: 1.5,
        intensity: 0.7
      })
    })
  }

  private createUrbanClutter() {
    // Trash cans
    const trashCanPositions = [
      new THREE.Vector3(-8, 0.8, -22),
      new THREE.Vector3(12, 0.8, -22),
      new THREE.Vector3(-20, 0.8, 8)
    ]

    trashCanPositions.forEach((position, index) => {
      const canGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1.6, 8)
      const canMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 })

      const trashCan = new THREE.Mesh(canGeometry, canMaterial)
      trashCan.position.copy(position)
      trashCan.castShadow = true
      trashCan.name = `trash_can_${index}`
      this.scene.add(trashCan)
    })

    // Electrical boxes
    const boxPositions = [
      new THREE.Vector3(-22, 1, -15),
      new THREE.Vector3(22, 1, 12)
    ]

    boxPositions.forEach((position, index) => {
      const boxGeometry = new THREE.BoxGeometry(1.2, 2, 0.8)
      const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 })

      const electricalBox = new THREE.Mesh(boxGeometry, boxMaterial)
      electricalBox.position.copy(position)
      electricalBox.castShadow = true
      electricalBox.name = `electrical_box_${index}`
      this.scene.add(electricalBox)
    })
  }

  private createAtmosphere() {
    // Particle system for urban atmosphere (simplified)
    this.createParticleEffects()

    // Dynamic lighting effects
    this.setupDynamicLighting()
  }

  private createParticleEffects() {
    // Steam from manholes/vents
    const steamPositions = [
      new THREE.Vector3(-10, 0, -5),
      new THREE.Vector3(8, 0, 12)
    ]

    steamPositions.forEach((position, index) => {
      const steamGeometry = new THREE.PlaneGeometry(2, 2)
      const steamMaterial = new THREE.MeshBasicMaterial({
        color: 0xaaaaaa,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
      })

      const steam = new THREE.Mesh(steamGeometry, steamMaterial)
      steam.position.copy(position)
      steam.position.y = 1
      steam.name = `steam_${index}`
      this.scene.add(steam)
    })
  }

  private setupDynamicLighting() {
    // This will be used for flickering effects and dynamic lighting changes
    // Implemented in the update method
  }

  // Public methods for game mechanics

  public getShadowAreas(): ShadowArea[] {
    return [...this.shadowAreas]
  }

  public getUrbanProps(): UrbanProp[] {
    return [...this.urbanProps]
  }

  public getHidingSpots(): THREE.Vector3[] {
    return this.urbanProps
      .filter(prop => prop.canHideBehind)
      .map(prop => prop.position.clone())
  }

  public isPositionInShadows(position: THREE.Vector3): boolean {
    return this.shadowAreas.some(area => {
      const distance = position.distanceTo(area.position)
      return distance <= area.radius
    })
  }

  public getShadowIntensityAtPosition(position: THREE.Vector3): number {
    let maxIntensity = 0

    this.shadowAreas.forEach(area => {
      const distance = position.distanceTo(area.position)
      if (distance <= area.radius) {
        const intensity = area.intensity * (1 - distance / area.radius)
        maxIntensity = Math.max(maxIntensity, intensity)
      }
    })

    return maxIntensity
  }

  public update(deltaTime: number) {
    const time = Date.now() * 0.001

    // Animate neon lights (flickering effect)
    this.neonLights.forEach((neon, index) => {
      const material = neon.material as THREE.MeshBasicMaterial
      const flicker = Math.sin(time * 10 + index * 2) * 0.1 + 0.9
      material.opacity = 0.8 * flicker

      if (material.emissive) {
        material.emissiveIntensity = 0.3 * flicker
      }
    })

    // Animate street lights (subtle variation)
    this.streetLights.forEach((light, index) => {
      const variation = Math.sin(time * 0.5 + index) * 0.1 + 0.9
      light.intensity = 2.0 * variation
    })

    // Animate steam effects
    this.scene.children.forEach(child => {
      if (child.name.includes('steam')) {
        child.position.y = 1 + Math.sin(time + child.position.x) * 0.2
        const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial
        material.opacity = 0.2 * (Math.sin(time * 2 + child.position.z) * 0.3 + 0.7)
      }
    })
  }

  public getScene(): THREE.Group {
    return this.scene
  }

  public dispose() {
    // Dispose of textures and materials
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

    // Clear arrays
    this.shadowAreas.length = 0
    this.urbanProps.length = 0
    this.streetLights.length = 0
    this.neonLights.length = 0

    // Clear the scene
    this.scene.clear()
  }
}

export default ParkingLotScene