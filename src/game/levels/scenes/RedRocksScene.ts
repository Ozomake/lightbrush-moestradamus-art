import * as THREE from 'three';

export interface RedRocksConfig {
  amphitheaterRadius: number;
  stageWidth: number;
  stageDepth: number;
  seatingTiers: number;
  weatherConditions: 'clear_day' | 'clear_night' | 'sunset' | 'cloudy' | 'rain';
  timeOfDay: 'dawn' | 'day' | 'sunset' | 'night';
  crowdDensity: number;
}

export interface ColoradoLandscape {
  mountainRanges: THREE.Mesh[];
  rockFormations: THREE.Mesh[];
  vegetation: THREE.Mesh[];
  sky: THREE.Mesh;
  stars?: THREE.Points;
}

export class RedRocksScene {
  private scene: THREE.Scene;
  private amphitheater: THREE.Group;
  private landscape: ColoradoLandscape;
  private lighting: THREE.Group;
  private stage: THREE.Group;
  private seating: THREE.Group;
  private config: RedRocksConfig;

  // Visual effects
  private particles: THREE.Points[] = [];
  private lasers: THREE.Mesh[] = [];
  private fireworks: THREE.Group;
  private fog: THREE.Mesh[] = [];

  // Animation state
  private time: number = 0;
  private beatTime: number = 0;
  private sunsetProgression: number = 0;

  // Materials
  private materials: { [key: string]: THREE.Material } = {};

  constructor(config: Partial<RedRocksConfig> = {}) {
    this.config = {
      amphitheaterRadius: 150,
      stageWidth: 60,
      stageDepth: 40,
      seatingTiers: 70,
      weatherConditions: 'clear_night',
      timeOfDay: 'night',
      crowdDensity: 0.8,
      ...config
    };

    this.scene = new THREE.Scene();
    this.amphitheater = new THREE.Group();
    this.lighting = new THREE.Group();
    this.stage = new THREE.Group();
    this.seating = new THREE.Group();
    this.fireworks = new THREE.Group();

    this.landscape = {
      mountainRanges: [],
      rockFormations: [],
      vegetation: [],
      sky: new THREE.Mesh()
    };
  }

  public async initialize(): Promise<void> {
    try {
      // Initialize materials first
      this.createMaterials();

      // Build the iconic Red Rocks amphitheater
      await this.buildAmphitheater();

      // Create Colorado landscape backdrop
      await this.buildColoradoLandscape();

      // Setup professional stage
      await this.buildStage();

      // Create tiered seating
      await this.buildSeating();

      // Setup atmospheric lighting
      this.setupLighting();

      // Initialize visual effects systems
      this.initializeEffectsSystems();

      // Add everything to the main scene
      this.scene.add(this.amphitheater);
      this.scene.add(this.lighting);
      this.scene.add(this.fireworks);

      // Setup environmental conditions
      this.setupEnvironmentalConditions();

      console.log('Red Rocks scene initialized successfully');

    } catch (error) {
      console.error('Failed to initialize Red Rocks scene:', error);
      throw error;
    }
  }

  private createMaterials(): void {
    // Red Rock sandstone material
    this.materials.redRock = new THREE.MeshLambertMaterial({
      color: 0xCC5500,
      roughness: 0.8,
      metalness: 0.1
    });

    // Stage materials
    this.materials.stage = new THREE.MeshPhongMaterial({
      color: 0x222222,
      shininess: 10
    });

    this.materials.ledPanel = new THREE.MeshPhongMaterial({
      color: 0x000000,
      emissive: 0x111111,
      shininess: 100
    });

    // Seating materials
    this.materials.concrete = new THREE.MeshLambertMaterial({
      color: 0x666666
    });

    this.materials.metal = new THREE.MeshPhongMaterial({
      color: 0x888888,
      shininess: 80,
      metalness: 0.6
    });

    // Natural materials
    this.materials.vegetation = new THREE.MeshLambertMaterial({
      color: 0x2E7D32,
      transparent: true,
      opacity: 0.9
    });

    this.materials.sky = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float sunsetProgression;
        varying vec3 vWorldPosition;

        void main() {
          vec3 direction = normalize(vWorldPosition);

          // Colorado sky gradient
          float h = direction.y;
          vec3 dayColor = mix(vec3(0.5, 0.7, 1.0), vec3(0.2, 0.5, 1.0), h);
          vec3 sunsetColor = mix(vec3(1.0, 0.4, 0.1), vec3(0.8, 0.2, 0.8), h);
          vec3 nightColor = mix(vec3(0.01, 0.01, 0.05), vec3(0.05, 0.05, 0.1), h);

          vec3 finalColor = mix(dayColor, sunsetColor, sunsetProgression);
          finalColor = mix(finalColor, nightColor, max(0.0, sunsetProgression - 0.5) * 2.0);

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      uniforms: {
        time: { value: 0.0 },
        sunsetProgression: { value: 0.8 } // Start at night
      },
      side: THREE.BackSide
    });

    // Effect materials
    this.materials.laser = new THREE.MeshBasicMaterial({
      color: 0x00FF00,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.materials.particle = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 2.0,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.materials.firework = new THREE.MeshBasicMaterial({
      color: 0xFF4444,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
  }

  private async buildAmphitheater(): Promise<void> {
    // Create the iconic red rock formations that frame the amphitheater
    const rockFormations = this.createRockFormations();
    rockFormations.forEach(rock => {
      this.amphitheater.add(rock);
      this.landscape.rockFormations.push(rock);
    });

    // Build the natural stone seating area
    const naturalSeating = this.createNaturalSeating();
    this.amphitheater.add(naturalSeating);

    // Add the amphitheater's characteristic curved shape
    const amphitheaterWalls = this.createAmphitheaterWalls();
    this.amphitheater.add(amphitheaterWalls);
  }

  private createRockFormations(): THREE.Mesh[] {
    const formations: THREE.Mesh[] = [];

    // Main left formation (Ship Rock style)
    const leftRockGeometry = new THREE.BoxGeometry(80, 120, 60);
    const leftRock = new THREE.Mesh(leftRockGeometry, this.materials.redRock);
    leftRock.position.set(-100, 60, -80);
    leftRock.rotation.set(0.1, 0.3, -0.1);
    formations.push(leftRock);

    // Main right formation
    const rightRockGeometry = new THREE.BoxGeometry(75, 110, 55);
    const rightRock = new THREE.Mesh(rightRockGeometry, this.materials.redRock);
    rightRock.position.set(95, 55, -75);
    rightRock.rotation.set(-0.1, -0.2, 0.1);
    formations.push(rightRock);

    // Background formations for depth
    for (let i = 0; i < 12; i++) {
      const width = 30 + Math.random() * 40;
      const height = 60 + Math.random() * 80;
      const depth = 25 + Math.random() * 35;

      const geometry = new THREE.BoxGeometry(width, height, depth);
      const rock = new THREE.Mesh(geometry, this.materials.redRock);

      const angle = (i / 12) * Math.PI * 2;
      const radius = 200 + Math.random() * 100;
      rock.position.set(
        Math.cos(angle) * radius,
        height / 2 + Math.random() * 20,
        Math.sin(angle) * radius - 150
      );

      rock.rotation.set(
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.6,
        (Math.random() - 0.5) * 0.3
      );

      formations.push(rock);
    }

    return formations;
  }

  private createNaturalSeating(): THREE.Group {
    const seatingGroup = new THREE.Group();

    // Create terraced stone seating carved into the hillside
    for (let tier = 0; tier < this.config.seatingTiers; tier++) {
      const radius = 80 + (tier * 1.5);
      const height = tier * 0.8;
      const seatWidth = 2.0;
      const seatDepth = 0.8;

      // Number of seats increases with each tier
      const seatsInTier = Math.floor(Math.PI * radius / seatWidth);

      for (let seat = 0; seat < seatsInTier; seat++) {
        const angle = (seat / seatsInTier) * Math.PI;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        // Stone seat
        const seatGeometry = new THREE.BoxGeometry(seatWidth, 0.4, seatDepth);
        const seatMesh = new THREE.Mesh(seatGeometry, this.materials.concrete);
        seatMesh.position.set(x, height, z);
        seatingGroup.add(seatMesh);

        // Backrest (carved rock)
        const backrestGeometry = new THREE.BoxGeometry(seatWidth, 0.8, 0.2);
        const backrest = new THREE.Mesh(backrestGeometry, this.materials.redRock);
        backrest.position.set(x, height + 0.4, z + seatDepth/2);
        seatingGroup.add(backrest);
      }
    }

    return seatingGroup;
  }

  private createAmphitheaterWalls(): THREE.Group {
    const wallsGroup = new THREE.Group();

    // Create the characteristic curved walls
    const wallCurve = new THREE.EllipseCurve(0, 0, 120, 100, 0, Math.PI, false, 0);
    const wallPoints = wallCurve.getPoints(50);

    const wallShape = new THREE.Shape();
    wallShape.moveTo(wallPoints[0].x, 0);
    for (let i = 1; i < wallPoints.length; i++) {
      wallShape.lineTo(wallPoints[i].x, 0);
    }
    wallShape.lineTo(wallPoints[wallPoints.length - 1].x, 25);
    wallShape.lineTo(wallPoints[0].x, 25);
    wallShape.lineTo(wallPoints[0].x, 0);

    const wallGeometry = new THREE.ExtrudeGeometry(wallShape, {
      depth: 10,
      bevelEnabled: false
    });

    const wall = new THREE.Mesh(wallGeometry, this.materials.redRock);
    wall.position.set(0, 0, -50);
    wall.rotation.x = -Math.PI / 2;

    wallsGroup.add(wall);

    return wallsGroup;
  }

  private async buildColoradoLandscape(): Promise<void> {
    // Create distant mountain ranges
    this.createMountainRanges();

    // Create Colorado vegetation (scrub oak, pine)
    this.createVegetation();

    // Create expansive Colorado sky
    this.createSky();

    // Add stars for night shows
    if (this.config.timeOfDay === 'night') {
      this.createStars();
    }
  }

  private createMountainRanges(): void {
    // Front Range mountains in the distance
    const mountainRanges = [
      { name: 'Front Range', distance: 800, height: 200, color: 0x4A4A4A },
      { name: 'Rockies', distance: 1200, height: 300, color: 0x3A3A3A },
      { name: 'Continental Divide', distance: 1600, height: 350, color: 0x2A2A2A }
    ];

    mountainRanges.forEach((range, rangeIndex) => {
      const mountainGroup = new THREE.Group();

      for (let i = 0; i < 15; i++) {
        const baseWidth = 100 + Math.random() * 200;
        const height = range.height + (Math.random() - 0.5) * 100;

        const mountainGeometry = new THREE.ConeGeometry(baseWidth, height, 6);
        const mountainMaterial = new THREE.MeshLambertMaterial({
          color: range.color,
          transparent: true,
          opacity: 0.7 - (rangeIndex * 0.2)
        });

        const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
        mountain.position.set(
          (i - 7) * baseWidth * 0.8,
          height / 2,
          -range.distance
        );

        // Add some randomness to mountain shapes
        mountain.rotation.y = Math.random() * Math.PI * 2;
        mountain.scale.x = 0.8 + Math.random() * 0.4;
        mountain.scale.z = 0.8 + Math.random() * 0.4;

        mountainGroup.add(mountain);
      }

      this.landscape.mountainRanges.push(mountainGroup);
      this.scene.add(mountainGroup);
    });
  }

  private createVegetation(): void {
    // Colorado scrub oak and pine trees around the amphitheater
    const vegetationGroup = new THREE.Group();

    // Scrub oak patches
    for (let i = 0; i < 200; i++) {
      const bushGeometry = new THREE.SphereGeometry(2 + Math.random() * 3, 8, 6);
      const bush = new THREE.Mesh(bushGeometry, this.materials.vegetation);

      const angle = Math.random() * Math.PI * 2;
      const distance = 150 + Math.random() * 300;
      bush.position.set(
        Math.cos(angle) * distance,
        bushGeometry.parameters.radius / 2,
        Math.sin(angle) * distance
      );

      bush.scale.y = 0.6 + Math.random() * 0.4;
      vegetationGroup.add(bush);
    }

    // Pine trees on the hillsides
    for (let i = 0; i < 80; i++) {
      const treeHeight = 15 + Math.random() * 25;
      const treeGeometry = new THREE.ConeGeometry(3 + Math.random() * 2, treeHeight, 8);
      const tree = new THREE.Mesh(treeGeometry, this.materials.vegetation);

      const angle = Math.random() * Math.PI * 2;
      const distance = 200 + Math.random() * 400;
      const elevation = Math.random() * 50;

      tree.position.set(
        Math.cos(angle) * distance,
        treeHeight / 2 + elevation,
        Math.sin(angle) * distance
      );

      vegetationGroup.add(tree);
    }

    this.landscape.vegetation.push(vegetationGroup);
    this.scene.add(vegetationGroup);
  }

  private createSky(): void {
    const skyGeometry = new THREE.SphereGeometry(1500, 32, 32);
    this.landscape.sky = new THREE.Mesh(skyGeometry, this.materials.sky);
    this.scene.add(this.landscape.sky);
  }

  private createStars(): void {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 3000;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const radius = 1200 + Math.random() * 400;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.6 + 0.4); // Keep stars above horizon

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.cos(phi);
      positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const starMaterial = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 1.5,
      sizeAttenuation: false
    });

    this.landscape.stars = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.landscape.stars);
  }

  private async buildStage(): Promise<void> {
    // Main stage platform
    const stageGeometry = new THREE.BoxGeometry(
      this.config.stageWidth,
      2,
      this.config.stageDepth
    );
    const stageMesh = new THREE.Mesh(stageGeometry, this.materials.stage);
    stageMesh.position.set(0, 1, -25);
    this.stage.add(stageMesh);

    // LED wall mounting structure
    const ledMountGeometry = new THREE.BoxGeometry(
      this.config.stageWidth + 10,
      40,
      5
    );
    const ledMount = new THREE.Mesh(ledMountGeometry, this.materials.metal);
    ledMount.position.set(0, 21, -50);
    this.stage.add(ledMount);

    // Side LED panels
    const sideLEDGeometry = new THREE.BoxGeometry(5, 30, 20);

    const leftLED = new THREE.Mesh(sideLEDGeometry, this.materials.ledPanel);
    leftLED.position.set(-35, 16, -35);
    this.stage.add(leftLED);

    const rightLED = new THREE.Mesh(sideLEDGeometry, this.materials.ledPanel);
    rightLED.position.set(35, 16, -35);
    this.stage.add(rightLED);

    // Professional rigging
    await this.buildRigging();

    this.scene.add(this.stage);
  }

  private async buildRigging(): Promise<void> {
    // Lighting trusses
    const trussGeometry = new THREE.BoxGeometry(80, 2, 2);
    const trussMaterial = this.materials.metal;

    for (let i = 0; i < 4; i++) {
      const truss = new THREE.Mesh(trussGeometry, trussMaterial);
      truss.position.set(0, 25 + (i * 8), -15 - (i * 10));
      this.stage.add(truss);

      // Add lights to each truss
      for (let j = 0; j < 8; j++) {
        const lightGeometry = new THREE.CylinderGeometry(1, 1.5, 3, 8);
        const light = new THREE.Mesh(lightGeometry, this.materials.metal);
        light.position.set(
          -35 + (j * 10),
          truss.position.y - 2,
          truss.position.z
        );
        this.stage.add(light);
      }
    }

    // Projection booth
    const boothGeometry = new THREE.BoxGeometry(15, 8, 10);
    const booth = new THREE.Mesh(boothGeometry, this.materials.concrete);
    booth.position.set(0, 45, 20);
    this.stage.add(booth);
  }

  private async buildSeating(): Promise<void> {
    // Modern seating sections added to the natural rock seating
    const sectionConfigs = [
      { name: 'VIP', rows: 5, seatsPerRow: 20, position: { x: 0, y: 5, z: 30 } },
      { name: 'Premium', rows: 10, seatsPerRow: 30, position: { x: 0, y: 8, z: 50 } },
      { name: 'General', rows: 20, seatsPerRow: 45, position: { x: 0, y: 12, z: 80 } }
    ];

    sectionConfigs.forEach(config => {
      const sectionGroup = new THREE.Group();

      for (let row = 0; row < config.rows; row++) {
        for (let seat = 0; seat < config.seatsPerRow; seat++) {
          const seatGeometry = new THREE.BoxGeometry(0.8, 0.5, 0.8);
          const seatMesh = new THREE.Mesh(seatGeometry, this.materials.concrete);

          const angle = ((seat - config.seatsPerRow / 2) / config.seatsPerRow) * Math.PI * 0.8;
          const radius = config.position.z + (row * 2);

          seatMesh.position.set(
            Math.sin(angle) * radius,
            config.position.y + (row * 0.6),
            Math.cos(angle) * radius
          );

          seatMesh.rotation.y = -angle;
          sectionGroup.add(seatMesh);
        }
      }

      this.seating.add(sectionGroup);
    });

    this.scene.add(this.seating);
  }

  private setupLighting(): void {
    // Ambient Colorado lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.lighting.add(ambientLight);

    // Main stage lighting
    const stageLight = new THREE.DirectionalLight(0xffffff, 1.0);
    stageLight.position.set(0, 50, 0);
    stageLight.target.position.set(0, 0, -25);
    stageLight.castShadow = true;
    this.lighting.add(stageLight);
    this.lighting.add(stageLight.target);

    // Colorado sunset/night lighting
    if (this.config.timeOfDay === 'sunset' || this.config.timeOfDay === 'night') {
      const warmLight = new THREE.DirectionalLight(0xff6b35, 0.6);
      warmLight.position.set(-200, 50, 100);
      this.lighting.add(warmLight);
    }

    // Audience area lighting
    for (let i = 0; i < 6; i++) {
      const audienceLight = new THREE.SpotLight(0xffffff, 0.3, 100, Math.PI / 6);
      const angle = (i / 6) * Math.PI;
      audienceLight.position.set(
        Math.cos(angle) * 60,
        30,
        Math.sin(angle) * 60 + 20
      );
      audienceLight.target.position.set(0, 10, 50);
      this.lighting.add(audienceLight);
      this.lighting.add(audienceLight.target);
    }

    this.scene.add(this.lighting);
  }

  private initializeEffectsSystems(): void {
    // Particle system for various effects
    this.initializeParticleSystem();

    // Laser show system
    this.initializeLaserSystem();

    // Fog machine effects
    this.initializeFogSystem();

    // Fireworks system
    this.initializeFireworksSystem();
  }

  private initializeParticleSystem(): void {
    const particleCount = 10000;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 200;
      positions[i3 + 1] = Math.random() * 100;
      positions[i3 + 2] = (Math.random() - 0.5) * 200;

      colors[i3] = Math.random();
      colors[i3 + 1] = Math.random();
      colors[i3 + 2] = Math.random();
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 2,
      transparent: true,
      opacity: 0,
      vertexColors: true,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    this.particles.push(particleSystem);
    this.scene.add(particleSystem);
  }

  private initializeLaserSystem(): void {
    // Create laser beam geometry
    const laserCount = 12;
    for (let i = 0; i < laserCount; i++) {
      const laserGeometry = new THREE.CylinderGeometry(0.1, 0.1, 100, 8);
      const laserMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(i / laserCount, 1, 0.5),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
      });

      const laser = new THREE.Mesh(laserGeometry, laserMaterial);
      laser.position.set(
        (i - laserCount / 2) * 8,
        25,
        -40
      );
      laser.rotation.x = Math.PI / 2;

      this.lasers.push(laser);
      this.scene.add(laser);
    }
  }

  private initializeFogSystem(): void {
    // Create fog cloud effects
    for (let i = 0; i < 5; i++) {
      const fogGeometry = new THREE.SphereGeometry(20, 16, 8);
      const fogMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
      });

      const fogCloud = new THREE.Mesh(fogGeometry, fogMaterial);
      fogCloud.position.set(
        (Math.random() - 0.5) * 100,
        5,
        -20 + (Math.random() - 0.5) * 40
      );

      this.fog.push(fogCloud);
      this.scene.add(fogCloud);
    }
  }

  private initializeFireworksSystem(): void {
    // Fireworks launch points around the amphitheater
    const launchPoints = [
      { x: -80, y: 0, z: -100 },
      { x: 80, y: 0, z: -100 },
      { x: -120, y: 20, z: -50 },
      { x: 120, y: 20, z: -50 },
      { x: 0, y: 30, z: -120 }
    ];

    launchPoints.forEach((point, index) => {
      const fireworkGroup = new THREE.Group();
      fireworkGroup.position.set(point.x, point.y, point.z);
      this.fireworks.add(fireworkGroup);
    });
  }

  private setupEnvironmentalConditions(): void {
    // Configure lighting and atmosphere based on weather and time
    switch (this.config.weatherConditions) {
      case 'clear_night':
        this.scene.fog = new THREE.Fog(0x000022, 200, 1000);
        break;
      case 'sunset':
        this.scene.fog = new THREE.Fog(0x442200, 150, 800);
        break;
      case 'cloudy':
        this.scene.fog = new THREE.Fog(0x666666, 100, 600);
        break;
      case 'rain':
        this.scene.fog = new THREE.Fog(0x333355, 50, 400);
        this.addRainEffect();
        break;
    }
  }

  private addRainEffect(): void {
    const rainGeometry = new THREE.BufferGeometry();
    const rainCount = 2000;
    const positions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 400;
      positions[i3 + 1] = Math.random() * 200;
      positions[i3 + 2] = (Math.random() - 0.5) * 400;
    }

    rainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const rainMaterial = new THREE.PointsMaterial({
      color: 0x4444AA,
      size: 1,
      transparent: true,
      opacity: 0.6
    });

    const rain = new THREE.Points(rainGeometry, rainMaterial);
    this.scene.add(rain);
  }

  // Public methods for gameplay interaction
  public update(deltaTime: number): void {
    this.time += deltaTime;

    // Animate sky shader
    if (this.materials.sky instanceof THREE.ShaderMaterial) {
      this.materials.sky.uniforms.time.value = this.time;
    }

    // Animate stars twinkling
    if (this.landscape.stars) {
      this.landscape.stars.rotation.y += deltaTime * 0.01;
    }

    // Update particle effects
    this.updateParticleEffects(deltaTime);

    // Update fog movement
    this.updateFogEffects(deltaTime);
  }

  private updateParticleEffects(deltaTime: number): void {
    this.particles.forEach(particleSystem => {
      if (particleSystem.geometry.attributes.position) {
        const positions = particleSystem.geometry.attributes.position.array as Float32Array;

        for (let i = 1; i < positions.length; i += 3) {
          positions[i] += Math.sin(this.time + i) * 0.5; // Floating motion
        }

        particleSystem.geometry.attributes.position.needsUpdate = true;
      }
    });
  }

  private updateFogEffects(deltaTime: number): void {
    this.fog.forEach((fogCloud, index) => {
      fogCloud.position.x += Math.sin(this.time + index) * 0.2;
      fogCloud.material.opacity = Math.max(0, Math.sin(this.time * 0.5 + index) * 0.3);
    });
  }

  public syncToBeat(): void {
    this.beatTime = this.time;

    // Flash stage lights
    this.lighting.children.forEach(light => {
      if (light instanceof THREE.DirectionalLight || light instanceof THREE.SpotLight) {
        const originalIntensity = light.intensity;
        light.intensity = originalIntensity * 1.5;
        setTimeout(() => {
          light.intensity = originalIntensity;
        }, 100);
      }
    });

    // Particle burst
    if (this.particles.length > 0) {
      const particleSystem = this.particles[0];
      if (particleSystem.material instanceof THREE.PointsMaterial) {
        particleSystem.material.opacity = 0.8;
        setTimeout(() => {
          particleSystem.material.opacity = 0.2;
        }, 200);
      }
    }
  }

  public triggerEffect(effect: string): void {
    console.log(`Triggering Red Rocks effect: ${effect}`);

    switch (effect) {
      case 'strobe':
        this.triggerStrobeEffect();
        break;
      case 'color_cycle':
        this.triggerColorCycleEffect();
        break;
      case 'particle_burst':
        this.triggerParticleBurst();
        break;
      case 'laser_show':
        this.triggerLaserShow();
        break;
      case 'fog_machine':
        this.triggerFogEffect();
        break;
      case 'fireworks':
        this.triggerFireworks();
        break;
    }
  }

  private triggerStrobeEffect(): void {
    let strobeCount = 0;
    const strobeInterval = setInterval(() => {
      this.lighting.children.forEach(light => {
        if (light instanceof THREE.DirectionalLight) {
          light.intensity = strobeCount % 2 === 0 ? 2 : 0;
        }
      });

      strobeCount++;
      if (strobeCount >= 10) {
        clearInterval(strobeInterval);
        // Restore normal lighting
        this.lighting.children.forEach(light => {
          if (light instanceof THREE.DirectionalLight) {
            light.intensity = 1;
          }
        });
      }
    }, 100);
  }

  private triggerColorCycleEffect(): void {
    this.lighting.children.forEach((light, index) => {
      if (light instanceof THREE.DirectionalLight || light instanceof THREE.SpotLight) {
        const hue = (this.time + index) % 1;
        light.color.setHSL(hue, 0.8, 0.6);
      }
    });
  }

  private triggerParticleBurst(): void {
    if (this.particles.length > 0) {
      const particleSystem = this.particles[0];
      if (particleSystem.material instanceof THREE.PointsMaterial) {
        particleSystem.material.opacity = 1.0;
        particleSystem.material.size = 4.0;

        setTimeout(() => {
          particleSystem.material.opacity = 0.2;
          particleSystem.material.size = 2.0;
        }, 1000);
      }
    }
  }

  private triggerLaserShow(): void {
    this.lasers.forEach((laser, index) => {
      laser.material.opacity = 0.8;
      laser.rotation.z = (this.time + index) * 2;

      setTimeout(() => {
        laser.material.opacity = 0;
      }, 3000);
    });
  }

  private triggerFogEffect(): void {
    this.fog.forEach(fogCloud => {
      fogCloud.material.opacity = 0.6;
      fogCloud.scale.multiplyScalar(1.5);

      setTimeout(() => {
        fogCloud.material.opacity = 0;
        fogCloud.scale.divideScalar(1.5);
      }, 10000);
    });
  }

  private triggerFireworks(): void {
    this.fireworks.children.forEach((launchPoint, index) => {
      setTimeout(() => {
        this.launchFirework(launchPoint as THREE.Group);
      }, index * 500);
    });
  }

  private launchFirework(launchPoint: THREE.Group): void {
    // Create firework trail
    const trailGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const trail = new THREE.Mesh(trailGeometry, this.materials.firework);

    trail.position.copy(launchPoint.position);
    this.scene.add(trail);

    // Animate launch
    const targetHeight = launchPoint.position.y + 80 + Math.random() * 40;
    const duration = 2000;
    const startTime = Date.now();

    const animateLaunch = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress < 1) {
        trail.position.y = launchPoint.position.y + (targetHeight - launchPoint.position.y) * progress;
        requestAnimationFrame(animateLaunch);
      } else {
        // Explode
        this.explodeFirework(trail.position);
        this.scene.remove(trail);
      }
    };

    animateLaunch();
  }

  private explodeFirework(position: THREE.Vector3): void {
    const explosionParticles = 50;
    const particles: THREE.Mesh[] = [];

    for (let i = 0; i < explosionParticles; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.3, 4, 4);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random(), 1, 0.6),
        transparent: true,
        opacity: 1
      });

      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.copy(position);

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40
      );

      particles.push(particle);
      this.scene.add(particle);

      // Animate particle
      const startTime = Date.now();
      const duration = 3000;

      const animateParticle = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress < 1) {
          particle.position.add(velocity.clone().multiplyScalar(0.02));
          velocity.y -= 0.5; // Gravity
          particle.material.opacity = 1 - progress;
          requestAnimationFrame(animateParticle);
        } else {
          this.scene.remove(particle);
        }
      };

      animateParticle();
    }
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public destroy(): void {
    // Clean up all Three.js resources
    this.scene.clear();

    // Dispose materials
    Object.values(this.materials).forEach(material => {
      if (material.dispose) {
        material.dispose();
      }
    });

    // Dispose geometries and textures would go here
    console.log('Red Rocks scene destroyed');
  }
}