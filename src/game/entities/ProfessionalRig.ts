import * as THREE from 'three';

export interface ProfessionalRigConfig {
  projectorCount: number;
  ledPanelCount: number;
  cameraCount: number;
  mixingConsole: 'professional_grade' | 'broadcast_grade' | 'touring_grade';
  backupSystems: boolean;
  redundancy: 'none' | 'partial' | 'full';
}

export interface ProjectorUnit {
  id: string;
  type: 'laser' | 'led' | 'hybrid';
  lumens: number;
  resolution: { width: number; height: number };
  position: THREE.Vector3;
  rotation: THREE.Euler;
  mesh: THREE.Mesh;
  active: boolean;
  temperature: number;
  hoursUsed: number;
  malfunctionChance: number;
  status: 'operational' | 'overheating' | 'malfunction' | 'backup_active';
}

export interface CameraUnit {
  id: string;
  type: 'fixed' | 'ptz' | 'handheld';
  position: THREE.Vector3;
  target: THREE.Vector3;
  mesh: THREE.Mesh;
  active: boolean;
  recording: boolean;
  feedQuality: number;
  batteryLevel?: number; // For handheld cameras
}

export interface MixingConsole {
  type: ProfessionalRigConfig['mixingConsole'];
  channelCount: number;
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  interfaces: {
    videoInputs: number;
    audioInputs: number;
    outputs: number;
    effects: string[];
  };
  operationalStatus: 'normal' | 'warning' | 'critical' | 'offline';
}

export interface RigPerformance {
  totalPowerConsumption: number;
  systemTemperature: number;
  uptime: number;
  failureRate: number;
  backupSystemActivations: number;
  performanceScore: number; // Overall system performance 0-100
}

export class ProfessionalRig {
  private config: ProfessionalRigConfig;
  private rigGroup: THREE.Group;

  // Equipment components
  private projectors: Map<string, ProjectorUnit> = new Map();
  private cameras: Map<string, CameraUnit> = new Map();
  private mixingConsole: MixingConsole;
  private powerDistribution: THREE.Mesh[] = [];
  private coolingSystem: THREE.Mesh[] = [];

  // Performance monitoring
  private performance: RigPerformance = {
    totalPowerConsumption: 0,
    systemTemperature: 25,
    uptime: 0,
    failureRate: 0,
    backupSystemActivations: 0,
    performanceScore: 100
  };

  // Operational state
  private emergencyMode: boolean = false;
  private maintenanceMode: boolean = false;
  private systemAlerts: string[] = [];

  // Environmental monitoring
  private ambientTemperature: number = 25;
  private humidity: number = 45;
  private ventilationActive: boolean = true;

  // Backup systems
  private backupProjectors: Map<string, ProjectorUnit> = new Map();
  private powerBackup: {
    active: boolean;
    capacity: number;
    remaining: number;
  } = {
    active: false,
    capacity: 100,
    remaining: 100
  };

  constructor(config: ProfessionalRigConfig) {
    this.config = config;
    this.rigGroup = new THREE.Group();

    this.initializeProjectors();
    this.initializeCameras();
    this.initializeMixingConsole();
    this.initializeInfrastructure();

    if (config.backupSystems) {
      this.initializeBackupSystems();
    }

    this.startMonitoringSystems();

    console.log(`Professional rig initialized: ${config.projectorCount} projectors, ${config.cameraCount} cameras`);
    console.log(`Backup systems: ${config.backupSystems ? 'Enabled' : 'Disabled'}`);
    console.log(`Redundancy level: ${config.redundancy}`);
  }

  private initializeProjectors(): void {
    const projectorTypes: ProjectorUnit['type'][] = ['laser', 'led', 'hybrid'];

    for (let i = 0; i < this.config.projectorCount; i++) {
      const type = projectorTypes[Math.floor(Math.random() * projectorTypes.length)];
      const projector = this.createProjectorUnit(i, type);
      this.projectors.set(projector.id, projector);
      this.rigGroup.add(projector.mesh);
    }

    console.log(`Initialized ${this.projectors.size} projector units`);
  }

  private createProjectorUnit(index: number, type: ProjectorUnit['type']): ProjectorUnit {
    // Professional projector specifications
    let lumens: number, resolution: { width: number; height: number };

    switch (type) {
      case 'laser':
        lumens = 15000 + Math.random() * 10000; // 15k-25k lumens
        resolution = { width: 4096, height: 2160 }; // 4K
        break;
      case 'led':
        lumens = 8000 + Math.random() * 7000; // 8k-15k lumens
        resolution = { width: 1920, height: 1080 }; // HD
        break;
      case 'hybrid':
        lumens = 12000 + Math.random() * 8000; // 12k-20k lumens
        resolution = { width: 2048, height: 1080 }; // 2K
        break;
    }

    // Calculate position (arranged in grid above stage)
    const gridSize = Math.ceil(Math.sqrt(this.config.projectorCount));
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;

    const position = new THREE.Vector3(
      (col - gridSize / 2) * 8 + Math.random() * 2,
      25 + row * 4 + Math.random() * 2,
      -35 + Math.random() * 5
    );

    // Create projector mesh
    const geometry = new THREE.BoxGeometry(1.5, 1, 2.5);
    const material = new THREE.MeshPhongMaterial({
      color: type === 'laser' ? 0x2A2A2A : type === 'led' ? 0x1A1A2A : 0x2A1A2A
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);

    // Add lens
    const lensGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
    const lensMaterial = new THREE.MeshPhongMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.8
    });
    const lens = new THREE.Mesh(lensGeometry, lensMaterial);
    lens.rotation.x = Math.PI / 2;
    lens.position.z = 1.3;
    mesh.add(lens);

    // Add heat sink
    const heatSinkGeometry = new THREE.BoxGeometry(1.6, 0.3, 1.5);
    const heatSink = new THREE.Mesh(heatSinkGeometry, material);
    heatSink.position.y = -0.65;
    mesh.add(heatSink);

    return {
      id: `projector_${index}_${type}`,
      type,
      lumens,
      resolution,
      position: position.clone(),
      rotation: new THREE.Euler(0, 0, 0),
      mesh,
      active: true,
      temperature: 25,
      hoursUsed: Math.random() * 1000, // Random usage history
      malfunctionChance: 0.001,
      status: 'operational'
    };
  }

  private initializeCameras(): void {
    const cameraPositions = [
      { position: new THREE.Vector3(-40, 20, 30), type: 'ptz' as const },
      { position: new THREE.Vector3(40, 20, 30), type: 'ptz' as const },
      { position: new THREE.Vector3(0, 35, 50), type: 'fixed' as const },
      { position: new THREE.Vector3(-20, 15, 10), type: 'handheld' as const },
      { position: new THREE.Vector3(20, 15, 10), type: 'handheld' as const },
      { position: new THREE.Vector3(0, 45, 0), type: 'fixed' as const }
    ];

    for (let i = 0; i < Math.min(this.config.cameraCount, cameraPositions.length); i++) {
      const config = cameraPositions[i];
      const camera = this.createCameraUnit(i, config.type, config.position);
      this.cameras.set(camera.id, camera);
      this.rigGroup.add(camera.mesh);
    }

    console.log(`Initialized ${this.cameras.size} camera units`);
  }

  private createCameraUnit(index: number, type: CameraUnit['type'], position: THREE.Vector3): CameraUnit {
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;

    switch (type) {
      case 'ptz':
        // Pan-tilt-zoom camera
        geometry = new THREE.CylinderGeometry(0.3, 0.4, 1.2, 12);
        material = new THREE.MeshPhongMaterial({ color: 0x1A1A1A });
        break;
      case 'fixed':
        // Fixed broadcast camera
        geometry = new THREE.BoxGeometry(0.8, 0.6, 1.5);
        material = new THREE.MeshPhongMaterial({ color: 0x2A2A2A });
        break;
      case 'handheld':
        // Handheld camera
        geometry = new THREE.BoxGeometry(0.4, 0.3, 0.8);
        material = new THREE.MeshPhongMaterial({ color: 0x3A3A3A });
        break;
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);

    // Add camera lens
    const lensGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.3, 12);
    const lensMaterial = new THREE.MeshPhongMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.9
    });
    const lens = new THREE.Mesh(lensGeometry, lensMaterial);

    if (type === 'ptz') {
      lens.position.y = 0.7;
    } else {
      lens.rotation.y = Math.PI / 2;
      lens.position.z = 0.9;
    }

    mesh.add(lens);

    return {
      id: `camera_${index}_${type}`,
      type,
      position: position.clone(),
      target: new THREE.Vector3(0, 10, -25), // Default target towards stage
      mesh,
      active: true,
      recording: false,
      feedQuality: 0.9 + Math.random() * 0.1,
      batteryLevel: type === 'handheld' ? 80 + Math.random() * 20 : undefined
    };
  }

  private initializeMixingConsole(): void {
    const consoleSpecs = {
      'professional_grade': { channels: 32, inputs: 16, outputs: 8, effects: ['chroma_key', 'color_correct', 'transition'] },
      'broadcast_grade': { channels: 64, inputs: 24, outputs: 12, effects: ['chroma_key', 'color_correct', 'transition', 'streaming', 'replay'] },
      'touring_grade': { channels: 128, inputs: 48, outputs: 24, effects: ['chroma_key', 'color_correct', 'transition', 'streaming', 'replay', 'live_effects', 'backup_switching'] }
    };

    const specs = consoleSpecs[this.config.mixingConsole];

    // Create console mesh
    const geometry = new THREE.BoxGeometry(4, 0.8, 2.5);
    const material = new THREE.MeshPhongMaterial({ color: 0x1A1A1A });
    const mesh = new THREE.Mesh(geometry, material);
    const position = new THREE.Vector3(0, 1.4, 25); // Center stage position
    mesh.position.copy(position);

    // Add control surface details
    const screenGeometry = new THREE.PlaneGeometry(2, 1);
    const screenMaterial = new THREE.MeshBasicMaterial({
      color: 0x001144,
      emissive: 0x000022
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.rotation.x = -Math.PI / 6; // Angled for visibility
    screen.position.y = 0.5;
    mesh.add(screen);

    // Add faders and buttons
    for (let i = 0; i < 16; i++) {
      const faderGeometry = new THREE.BoxGeometry(0.1, 0.05, 0.3);
      const faderMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
      const fader = new THREE.Mesh(faderGeometry, faderMaterial);
      fader.position.x = (i - 8) * 0.2;
      fader.position.y = 0.4;
      fader.position.z = 0.5;
      mesh.add(fader);
    }

    this.mixingConsole = {
      type: this.config.mixingConsole,
      channelCount: specs.channels,
      mesh,
      position: position.clone(),
      interfaces: {
        videoInputs: specs.inputs,
        audioInputs: specs.inputs * 2, // Stereo pairs
        outputs: specs.outputs,
        effects: specs.effects
      },
      operationalStatus: 'normal'
    };

    this.rigGroup.add(mesh);
  }

  private initializeInfrastructure(): void {
    // Power distribution units
    this.initializePowerDistribution();

    // Cooling system
    this.initializeCoolingSystem();

    // Cable management
    this.initializeCableManagement();

    // Monitoring displays
    this.initializeMonitoringDisplays();
  }

  private initializePowerDistribution(): void {
    const pduPositions = [
      new THREE.Vector3(-30, 0.5, -20),
      new THREE.Vector3(30, 0.5, -20),
      new THREE.Vector3(0, 0.5, 40)
    ];

    pduPositions.forEach((position, index) => {
      const geometry = new THREE.BoxGeometry(1, 2, 0.3);
      const material = new THREE.MeshPhongMaterial({ color: 0x333333 });
      const pdu = new THREE.Mesh(geometry, material);
      pdu.position.copy(position);

      // Add power outlets
      for (let i = 0; i < 8; i++) {
        const outletGeometry = new THREE.CircleGeometry(0.03, 8);
        const outletMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const outlet = new THREE.Mesh(outletGeometry, outletMaterial);
        outlet.position.y = -0.8 + (i * 0.2);
        outlet.position.z = 0.16;
        pdu.add(outlet);
      }

      this.powerDistribution.push(pdu);
      this.rigGroup.add(pdu);
    });
  }

  private initializeCoolingSystem(): void {
    // Air conditioning units
    const acPositions = [
      new THREE.Vector3(-25, 8, -30),
      new THREE.Vector3(25, 8, -30)
    ];

    acPositions.forEach(position => {
      const geometry = new THREE.BoxGeometry(3, 2, 1.5);
      const material = new THREE.MeshPhongMaterial({ color: 0x4A4A4A });
      const ac = new THREE.Mesh(geometry, material);
      ac.position.copy(position);

      // Add ventilation grilles
      const grillGeometry = new THREE.PlaneGeometry(2.5, 1.5);
      const grillMaterial = new THREE.MeshBasicMaterial({
        color: 0x2A2A2A,
        transparent: true,
        opacity: 0.8
      });
      const grill = new THREE.Mesh(grillGeometry, grillMaterial);
      grill.position.z = 0.76;
      ac.add(grill);

      this.coolingSystem.push(ac);
      this.rigGroup.add(ac);
    });

    // Exhaust fans for projectors
    this.projectors.forEach(projector => {
      const fanGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 8);
      const fanMaterial = new THREE.MeshBasicMaterial({ color: 0x666666 });
      const fan = new THREE.Mesh(fanGeometry, fanMaterial);
      fan.rotation.x = Math.PI / 2;
      fan.position.y = -0.6;
      projector.mesh.add(fan);
    });
  }

  private initializeCableManagement(): void {
    // Overhead cable trays
    const cableTrayPositions = [
      { start: new THREE.Vector3(-40, 22, -40), end: new THREE.Vector3(40, 22, -40) },
      { start: new THREE.Vector3(-40, 22, 40), end: new THREE.Vector3(40, 22, 40) },
      { start: new THREE.Vector3(-40, 22, -40), end: new THREE.Vector3(-40, 22, 40) },
      { start: new THREE.Vector3(40, 22, -40), end: new THREE.Vector3(40, 22, 40) }
    ];

    cableTrayPositions.forEach(({ start, end }) => {
      const length = start.distanceTo(end);
      const geometry = new THREE.BoxGeometry(length, 0.2, 1);
      const material = new THREE.MeshPhongMaterial({ color: 0x666666 });
      const tray = new THREE.Mesh(geometry, material);

      const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      tray.position.copy(midPoint);

      // Orient the tray
      const direction = new THREE.Vector3().subVectors(end, start).normalize();
      tray.lookAt(midPoint.clone().add(direction));

      this.rigGroup.add(tray);
    });
  }

  private initializeMonitoringDisplays(): void {
    const monitorPositions = [
      new THREE.Vector3(-2.5, 2.2, 25),
      new THREE.Vector3(2.5, 2.2, 25)
    ];

    monitorPositions.forEach(position => {
      const monitorGeometry = new THREE.BoxGeometry(1.5, 1, 0.1);
      const monitorMaterial = new THREE.MeshPhongMaterial({ color: 0x1A1A1A });
      const monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
      monitor.position.copy(position);

      // Screen
      const screenGeometry = new THREE.PlaneGeometry(1.3, 0.8);
      const screenMaterial = new THREE.MeshBasicMaterial({
        color: 0x002244,
        emissive: 0x001122
      });
      const screen = new THREE.Mesh(screenGeometry, screenMaterial);
      screen.position.z = 0.06;
      monitor.add(screen);

      this.rigGroup.add(monitor);
    });
  }

  private initializeBackupSystems(): void {
    if (this.config.redundancy === 'none') return;

    // Backup projectors
    const backupCount = Math.ceil(this.config.projectorCount / 4); // 25% backup capacity
    for (let i = 0; i < backupCount; i++) {
      const backupProjector = this.createProjectorUnit(
        1000 + i, // Different ID range for backups
        'hybrid'
      );
      backupProjector.active = false;
      backupProjector.mesh.visible = false; // Hidden until activated

      this.backupProjectors.set(backupProjector.id, backupProjector);
      this.rigGroup.add(backupProjector.mesh);
    }

    // Backup power system
    const generatorGeometry = new THREE.BoxGeometry(4, 2.5, 6);
    const generatorMaterial = new THREE.MeshPhongMaterial({ color: 0x4A4A2A });
    const generator = new THREE.Mesh(generatorGeometry, generatorMaterial);
    generator.position.set(-45, 1.25, 0);
    this.rigGroup.add(generator);

    console.log(`Backup systems initialized: ${backupCount} backup projectors`);
  }

  private startMonitoringSystems(): void {
    // Performance monitoring
    setInterval(() => {
      this.updatePerformanceMetrics();
    }, 1000);

    // Equipment health checks
    setInterval(() => {
      this.performHealthChecks();
    }, 5000);

    // Temperature monitoring
    setInterval(() => {
      this.updateTemperatureMonitoring();
    }, 2000);

    // Backup system checks
    if (this.config.backupSystems) {
      setInterval(() => {
        this.checkBackupSystems();
      }, 10000);
    }
  }

  private updatePerformanceMetrics(): void {
    this.performance.uptime += 1;

    // Calculate total power consumption
    let totalPower = 0;
    this.projectors.forEach(projector => {
      if (projector.active) {
        totalPower += (projector.lumens / 1000) * 0.8; // Rough watts per 1000 lumens
      }
    });

    this.cameras.forEach(camera => {
      if (camera.active) {
        totalPower += camera.type === 'ptz' ? 50 : camera.type === 'fixed' ? 30 : 15;
      }
    });

    // Console power
    totalPower += this.config.mixingConsole === 'touring_grade' ? 200 :
                  this.config.mixingConsole === 'broadcast_grade' ? 150 : 100;

    // Cooling system power
    totalPower += this.coolingSystem.length * 500;

    this.performance.totalPowerConsumption = totalPower;

    // Calculate performance score
    const operationalProjectors = Array.from(this.projectors.values()).filter(p => p.status === 'operational').length;
    const operationalCameras = Array.from(this.cameras.values()).filter(c => c.active).length;

    const projectorScore = (operationalProjectors / this.projectors.size) * 60;
    const cameraScore = (operationalCameras / this.cameras.size) * 20;
    const temperatureScore = Math.max(0, 20 - (this.performance.systemTemperature - 25) * 2);

    this.performance.performanceScore = Math.max(0, Math.min(100, projectorScore + cameraScore + temperatureScore));
  }

  private performHealthChecks(): void {
    let systemAlerts: string[] = [];

    // Check projectors
    this.projectors.forEach(projector => {
      // Temperature monitoring
      if (projector.active) {
        projector.temperature += (Math.random() - 0.45) * 2; // Slight temperature drift
        projector.temperature = Math.max(20, Math.min(80, projector.temperature));

        if (projector.temperature > 70) {
          projector.status = 'overheating';
          systemAlerts.push(`${projector.id} overheating: ${projector.temperature.toFixed(1)}°C`);
        } else if (projector.temperature > 60) {
          systemAlerts.push(`${projector.id} running hot: ${projector.temperature.toFixed(1)}°C`);
        }

        // Usage tracking
        projector.hoursUsed += 1/3600; // Convert seconds to hours

        // Malfunction probability increases with usage and temperature
        const usageFactor = projector.hoursUsed / 5000; // Failure rate increases after 5000 hours
        const tempFactor = Math.max(0, (projector.temperature - 40) / 40);
        projector.malfunctionChance = 0.001 + usageFactor * 0.001 + tempFactor * 0.002;

        // Random malfunction check
        if (Math.random() < projector.malfunctionChance) {
          this.triggerProjectorMalfunction(projector);
        }
      }
    });

    // Check cameras
    this.cameras.forEach(camera => {
      if (camera.type === 'handheld' && camera.batteryLevel !== undefined) {
        camera.batteryLevel -= 0.1; // Battery drain
        if (camera.batteryLevel < 20) {
          systemAlerts.push(`${camera.id} low battery: ${camera.batteryLevel.toFixed(1)}%`);
        }
        if (camera.batteryLevel <= 0) {
          camera.active = false;
          systemAlerts.push(`${camera.id} battery dead - camera offline`);
        }
      }

      // Signal quality degradation
      camera.feedQuality -= Math.random() * 0.005;
      camera.feedQuality = Math.max(0.5, Math.min(1.0, camera.feedQuality));

      if (camera.feedQuality < 0.7) {
        systemAlerts.push(`${camera.id} poor signal quality: ${(camera.feedQuality * 100).toFixed(1)}%`);
      }
    });

    // Check mixing console
    if (this.performance.systemTemperature > 40) {
      this.mixingConsole.operationalStatus = 'warning';
      systemAlerts.push(`Mixing console overheating: ${this.performance.systemTemperature.toFixed(1)}°C`);
    } else if (this.performance.performanceScore < 70) {
      this.mixingConsole.operationalStatus = 'warning';
      systemAlerts.push(`System performance degraded: ${this.performance.performanceScore.toFixed(1)}%`);
    } else {
      this.mixingConsole.operationalStatus = 'normal';
    }

    this.systemAlerts = systemAlerts;

    if (systemAlerts.length > 0) {
      console.warn('Professional rig alerts:', systemAlerts);
    }
  }

  private updateTemperatureMonitoring(): void {
    // Calculate average temperature from all active equipment
    let totalTemp = this.ambientTemperature;
    let tempSources = 1;

    this.projectors.forEach(projector => {
      if (projector.active) {
        totalTemp += projector.temperature;
        tempSources++;
      }
    });

    // Add heat from mixing console
    const consoleTemp = 25 + (this.performance.totalPowerConsumption / 1000) * 5;
    totalTemp += consoleTemp;
    tempSources++;

    this.performance.systemTemperature = totalTemp / tempSources;

    // Activate cooling if needed
    if (this.performance.systemTemperature > 35 && !this.ventilationActive) {
      this.ventilationActive = true;
      console.log('Activating enhanced ventilation');
    } else if (this.performance.systemTemperature < 30 && this.ventilationActive) {
      this.ventilationActive = false;
    }

    // Update cooling system visibility
    this.coolingSystem.forEach(cooler => {
      const fanMaterial = cooler.children[0]?.material as THREE.Material;
      if (fanMaterial) {
        fanMaterial.opacity = this.ventilationActive ? 1.0 : 0.5;
      }
    });
  }

  private checkBackupSystems(): void {
    if (!this.config.backupSystems) return;

    // Check if backup activation is needed
    const failedProjectors = Array.from(this.projectors.values()).filter(p =>
      p.status === 'malfunction' || p.status === 'overheating'
    );

    if (failedProjectors.length > 0 && this.backupProjectors.size > 0) {
      this.activateBackupProjector(failedProjectors[0]);
    }

    // Monitor power backup
    if (this.performance.totalPowerConsumption > 5000 && !this.powerBackup.active) {
      this.powerBackup.active = true;
      console.log('Backup power system activated - high power draw detected');
    }

    if (this.powerBackup.active) {
      this.powerBackup.remaining -= 0.1; // Drain backup power
      if (this.powerBackup.remaining <= 0) {
        this.triggerPowerEmergency();
      }
    }
  }

  private triggerProjectorMalfunction(projector: ProjectorUnit): void {
    projector.status = 'malfunction';
    projector.active = false;

    // Visual indication
    projector.mesh.material.color.setHex(0xFF0000);

    console.warn(`Projector malfunction: ${projector.id}`);
    this.performance.failureRate += 1;

    // Auto-recovery after some time (simulating technician fix)
    setTimeout(() => {
      if (Math.random() > 0.3) { // 70% chance of successful repair
        this.repairProjector(projector);
      }
    }, 30000 + Math.random() * 60000); // 30-90 seconds repair time
  }

  private repairProjector(projector: ProjectorUnit): void {
    projector.status = 'operational';
    projector.active = true;
    projector.temperature = 25;
    projector.malfunctionChance = 0.001;

    // Restore visual
    const originalColor = projector.type === 'laser' ? 0x2A2A2A :
                         projector.type === 'led' ? 0x1A1A2A : 0x2A1A2A;
    projector.mesh.material.color.setHex(originalColor);

    console.log(`Projector repaired: ${projector.id}`);
  }

  private activateBackupProjector(failedProjector: ProjectorUnit): void {
    const backup = Array.from(this.backupProjectors.values()).find(p => !p.active);
    if (!backup) return;

    backup.active = true;
    backup.status = 'backup_active';
    backup.mesh.visible = true;

    // Position backup near the failed unit
    backup.mesh.position.copy(failedProjector.mesh.position);
    backup.mesh.position.y += 2; // Slightly higher

    console.log(`Backup projector activated: ${backup.id} replacing ${failedProjector.id}`);
    this.performance.backupSystemActivations += 1;
  }

  private triggerPowerEmergency(): void {
    this.emergencyMode = true;

    // Shut down non-essential systems
    let shutdownCount = 0;
    this.projectors.forEach(projector => {
      if (shutdownCount < Math.ceil(this.projectors.size / 2)) { // Shut down half
        projector.active = false;
        projector.status = 'backup_active';
        shutdownCount++;
      }
    });

    console.error('POWER EMERGENCY: Shutting down non-essential systems');
    this.systemAlerts.push('EMERGENCY: Power system failure - reduced capacity mode');
  }

  // Public interface methods
  public update(deltaTime: number): void {
    // Animate rotating equipment
    this.cameras.forEach(camera => {
      if (camera.type === 'ptz' && camera.active) {
        // Slow pan movement
        camera.mesh.rotation.y += Math.sin(Date.now() * 0.001) * 0.005;
        camera.mesh.rotation.x = -0.2 + Math.sin(Date.now() * 0.0015) * 0.1;
      }
    });

    // Animate cooling system fans
    if (this.ventilationActive) {
      this.coolingSystem.forEach(cooler => {
        cooler.rotation.z += deltaTime * 10; // Fan rotation
      });

      // Projector fans
      this.projectors.forEach(projector => {
        if (projector.active && projector.mesh.children.length > 0) {
          const fan = projector.mesh.children.find(child =>
            child instanceof THREE.Mesh && child.geometry instanceof THREE.CylinderGeometry
          );
          if (fan) {
            fan.rotation.z += deltaTime * 20;
          }
        }
      });
    }

    // Update console displays
    const time = Date.now() * 0.001;
    this.mixingConsole.mesh.children.forEach(child => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
        // Simulate display activity
        const intensity = 0.5 + Math.sin(time * 2) * 0.2;
        child.material.emissive.setRGB(0, 0, intensity * 0.2);
      }
    });

    // Flash warning lights for malfunctions
    const malfunctionedProjectors = Array.from(this.projectors.values()).filter(p =>
      p.status === 'malfunction' || p.status === 'overheating'
    );

    malfunctionedProjectors.forEach(projector => {
      const flashIntensity = Math.sin(time * 8) > 0 ? 1 : 0.3;
      projector.mesh.material.emissive.setRGB(flashIntensity * 0.5, 0, 0);
    });
  }

  // Equipment control methods
  public activateProjector(projectorId: string): boolean {
    const projector = this.projectors.get(projectorId);
    if (projector && projector.status === 'operational') {
      projector.active = true;
      console.log(`Activated projector: ${projectorId}`);
      return true;
    }
    return false;
  }

  public deactivateProjector(projectorId: string): boolean {
    const projector = this.projectors.get(projectorId);
    if (projector) {
      projector.active = false;
      console.log(`Deactivated projector: ${projectorId}`);
      return true;
    }
    return false;
  }

  public switchCameraFeed(cameraId: string, recording: boolean): boolean {
    const camera = this.cameras.get(cameraId);
    if (camera && camera.active) {
      camera.recording = recording;
      console.log(`Camera ${cameraId} ${recording ? 'recording' : 'stopped'}`);
      return true;
    }
    return false;
  }

  public emergencyShutdown(): void {
    console.error('EMERGENCY SHUTDOWN INITIATED');

    this.emergencyMode = true;

    // Shut down all projectors
    this.projectors.forEach(projector => {
      projector.active = false;
      projector.status = 'backup_active';
    });

    // Stop all cameras except emergency ones
    let emergencyCameras = 0;
    this.cameras.forEach(camera => {
      if (emergencyCameras < 2 && camera.type === 'fixed') {
        camera.recording = true;
        emergencyCameras++;
      } else {
        camera.active = false;
      }
    });

    this.mixingConsole.operationalStatus = 'critical';
    this.systemAlerts.push('EMERGENCY SHUTDOWN - System in safe mode');
  }

  public enterMaintenanceMode(): void {
    this.maintenanceMode = true;

    // Orderly shutdown
    this.projectors.forEach(projector => {
      projector.active = false;
    });

    this.cameras.forEach(camera => {
      camera.recording = false;
    });

    console.log('System in maintenance mode');
  }

  public exitMaintenanceMode(): void {
    this.maintenanceMode = false;
    this.emergencyMode = false;

    // Restart systems
    this.projectors.forEach(projector => {
      if (projector.status === 'operational') {
        projector.active = true;
      }
    });

    this.cameras.forEach(camera => {
      camera.active = true;
    });

    this.mixingConsole.operationalStatus = 'normal';
    this.systemAlerts = [];

    console.log('Maintenance mode ended - systems operational');
  }

  // Getters for monitoring
  public getRigGroup(): THREE.Group {
    return this.rigGroup;
  }

  public getPerformanceMetrics(): RigPerformance {
    return { ...this.performance };
  }

  public getProjectorStatus(): { id: string; status: string; temperature: number; active: boolean }[] {
    return Array.from(this.projectors.values()).map(p => ({
      id: p.id,
      status: p.status,
      temperature: p.temperature,
      active: p.active
    }));
  }

  public getCameraStatus(): { id: string; type: string; active: boolean; recording: boolean; battery?: number }[] {
    return Array.from(this.cameras.values()).map(c => ({
      id: c.id,
      type: c.type,
      active: c.active,
      recording: c.recording,
      battery: c.batteryLevel
    }));
  }

  public getSystemAlerts(): string[] {
    return [...this.systemAlerts];
  }

  public isEmergencyMode(): boolean {
    return this.emergencyMode;
  }

  public isMaintenanceMode(): boolean {
    return this.maintenanceMode;
  }

  // Cleanup
  public destroy(): void {
    // Dispose all geometries and materials
    const disposeObject = (obj: THREE.Object3D) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (obj.material instanceof THREE.Material) {
          obj.material.dispose();
        }
      }
      obj.children.forEach(child => disposeObject(child));
    };

    this.rigGroup.children.forEach(child => disposeObject(child));
    this.rigGroup.clear();

    this.projectors.clear();
    this.cameras.clear();
    this.backupProjectors.clear();
    this.powerDistribution = [];
    this.coolingSystem = [];

    console.log('Professional rig destroyed');
  }
}