import * as THREE from 'three';

export interface CrowdConfig {
  amphitheaterLayout: boolean;
  capacity: number;
  energyLevel: number; // 0-1 scale
  reactions: CrowdReaction[];
  weatherConditions: 'clear_day' | 'clear_night' | 'sunset' | 'cloudy' | 'rain';
  ticketsSold?: number;
  vipSection?: boolean;
}

export type CrowdReaction =
  | 'silent'
  | 'polite_applause'
  | 'applause'
  | 'cheering'
  | 'screaming'
  | 'dancing'
  | 'jumping'
  | 'phone_lights'
  | 'crowd_surfing'
  | 'standing_ovation';

export interface AudienceMember {
  id: string;
  position: THREE.Vector3;
  mesh: THREE.Mesh;
  energyLevel: number;
  reactionTendency: number; // How easily they get excited (0-1)
  currentReaction: CrowdReaction;
  hasPhone: boolean;
  phoneLight?: THREE.PointLight;
  dancingAnimation?: {
    amplitude: number;
    frequency: number;
    phase: number;
  };
}

export interface CrowdSection {
  name: string;
  members: AudienceMember[];
  averageEnergy: number;
  sectionReaction: CrowdReaction;
  capacity: number;
  filled: number;
}

export class RedRocksCrowd {
  private config: CrowdConfig;
  private crowdGroup: THREE.Group;
  private sections: Map<string, CrowdSection> = new Map();
  private allMembers: AudienceMember[] = [];

  // Crowd dynamics
  private globalEnergy: number = 0.3;
  private beatResponseRate: number = 0.7;
  private energyDecayRate: number = 0.02;
  private reactionThresholds = {
    silent: 0.0,
    polite_applause: 0.2,
    applause: 0.4,
    cheering: 0.6,
    screaming: 0.75,
    dancing: 0.5,
    jumping: 0.8,
    phone_lights: 0.3,
    standing_ovation: 0.9
  };

  // Audio simulation
  private crowdAudio: {
    volume: number;
    type: 'silence' | 'murmur' | 'applause' | 'cheering' | 'roar';
    intensity: number;
  } = {
    volume: 0.1,
    type: 'murmur',
    intensity: 0.3
  };

  // Visual effects
  private phoneFlashlights: THREE.PointLight[] = [];
  private crowdWave: {
    active: boolean;
    speed: number;
    currentRow: number;
    direction: 'left_to_right' | 'right_to_left' | 'front_to_back';
  } = {
    active: false,
    speed: 2.0,
    currentRow: 0,
    direction: 'front_to_back'
  };

  // Performance metrics
  private performanceResponse: {
    totalReactions: number;
    standingOvationTime: number;
    phoneFlashlightActivations: number;
    crowdWaveCount: number;
    averageEngagement: number;
  } = {
    totalReactions: 0,
    standingOvationTime: 0,
    phoneFlashlightActivations: 0,
    crowdWaveCount: 0,
    averageEngagement: 0
  };

  constructor(config: CrowdConfig) {
    this.config = {
      ticketsSold: Math.floor(config.capacity * 0.85), // Assume 85% capacity
      vipSection: true,
      ...config
    };

    this.crowdGroup = new THREE.Group();
    this.globalEnergy = config.energyLevel;

    this.initializeCrowdSections();
    this.populateCrowd();
    this.setupCrowdDynamics();

    console.log(`Red Rocks crowd initialized: ${this.config.ticketsSold}/${this.config.capacity} attendees`);
  }

  private initializeCrowdSections(): void {
    // Red Rocks amphitheater sections
    const sectionConfigs = [
      { name: 'VIP_Front', capacity: 200, position: 'front', premium: true },
      { name: 'Reserved_Lower', capacity: 1500, position: 'lower', premium: false },
      { name: 'Reserved_Upper', capacity: 2000, position: 'upper', premium: false },
      { name: 'General_Rocks', capacity: 3500, position: 'rocks', premium: false },
      { name: 'General_Hill', capacity: 1800, position: 'hill', premium: false }
    ];

    sectionConfigs.forEach(sectionConfig => {
      const fillRate = sectionConfig.premium ? 0.95 : 0.80; // Premium sections more likely to be full
      const filled = Math.floor(sectionConfig.capacity * fillRate);

      const section: CrowdSection = {
        name: sectionConfig.name,
        members: [],
        averageEnergy: this.globalEnergy + (sectionConfig.premium ? 0.1 : 0),
        sectionReaction: 'silent',
        capacity: sectionConfig.capacity,
        filled: filled
      };

      this.sections.set(sectionConfig.name, section);
    });

    console.log(`Initialized ${this.sections.size} crowd sections`);
  }

  private populateCrowd(): void {
    let totalPlaced = 0;

    this.sections.forEach((section, sectionName) => {
      for (let i = 0; i < section.filled && totalPlaced < this.config.ticketsSold!; i++) {
        const member = this.createAudienceMember(sectionName, i);
        section.members.push(member);
        this.allMembers.push(member);
        this.crowdGroup.add(member.mesh);

        if (member.phoneLight) {
          this.crowdGroup.add(member.phoneLight);
          this.phoneFlashlights.push(member.phoneLight);
        }

        totalPlaced++;
      }

      console.log(`Populated ${section.name}: ${section.members.length}/${section.capacity} attendees`);
    });

    console.log(`Total crowd members created: ${totalPlaced}`);
  }

  private createAudienceMember(sectionName: string, index: number): AudienceMember {
    const position = this.calculateSectionPosition(sectionName, index);

    // Create simplified person geometry (for performance with thousands)
    const geometry = new THREE.BoxGeometry(0.4, 1.7, 0.4);
    const material = new THREE.MeshLambertMaterial({
      color: new THREE.Color().setHSL(
        Math.random(), // Random hue for clothing variety
        0.3 + Math.random() * 0.4, // Moderate saturation
        0.3 + Math.random() * 0.4  // Moderate lightness
      )
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.castShadow = true;

    // Add simple head
    const headGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBB5 }); // Skin tone
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.95;
    mesh.add(head);

    // Random characteristics
    const hasPhone = Math.random() > 0.3; // 70% have phones
    let phoneLight: THREE.PointLight | undefined;

    if (hasPhone) {
      phoneLight = new THREE.PointLight(0xffffff, 0, 2);
      phoneLight.position.copy(position);
      phoneLight.position.y += 1.5;
    }

    const member: AudienceMember = {
      id: `${sectionName}_${index}`,
      position: position.clone(),
      mesh,
      energyLevel: 0.2 + Math.random() * 0.3,
      reactionTendency: Math.random(),
      currentReaction: 'silent',
      hasPhone,
      phoneLight,
      dancingAnimation: {
        amplitude: 0.1 + Math.random() * 0.2,
        frequency: 0.5 + Math.random() * 1.0,
        phase: Math.random() * Math.PI * 2
      }
    };

    return member;
  }

  private calculateSectionPosition(sectionName: string, index: number): THREE.Vector3 {
    const section = this.sections.get(sectionName)!;
    let basePosition: THREE.Vector3;
    let arrangement: 'arc' | 'grid' | 'natural';

    switch (sectionName) {
      case 'VIP_Front':
        basePosition = new THREE.Vector3(0, 2, 40);
        arrangement = 'arc';
        break;

      case 'Reserved_Lower':
        basePosition = new THREE.Vector3(0, 8, 60);
        arrangement = 'arc';
        break;

      case 'Reserved_Upper':
        basePosition = new THREE.Vector3(0, 15, 85);
        arrangement = 'arc';
        break;

      case 'General_Rocks':
        basePosition = new THREE.Vector3(0, 25, 120);
        arrangement = 'natural'; // Irregular rock formation seating
        break;

      case 'General_Hill':
        basePosition = new THREE.Vector3(0, 35, 160);
        arrangement = 'natural';
        break;

      default:
        basePosition = new THREE.Vector3(0, 10, 80);
        arrangement = 'arc';
    }

    return this.generatePositionInArrangement(basePosition, index, arrangement, section.filled);
  }

  private generatePositionInArrangement(
    basePosition: THREE.Vector3,
    index: number,
    arrangement: 'arc' | 'grid' | 'natural',
    totalMembers: number
  ): THREE.Vector3 {
    switch (arrangement) {
      case 'arc':
        const arcRadius = 60 + basePosition.z - 40; // Larger arc for further sections
        const arcAngle = Math.PI * 0.8; // 144 degrees arc
        const membersPerRow = Math.ceil(Math.sqrt(totalMembers));
        const row = Math.floor(index / membersPerRow);
        const posInRow = index % membersPerRow;

        const angleStep = arcAngle / (membersPerRow - 1);
        const angle = -arcAngle / 2 + posInRow * angleStep;

        return new THREE.Vector3(
          Math.sin(angle) * (arcRadius + row * 2),
          basePosition.y + row * 0.8,
          basePosition.z + Math.cos(angle) * (arcRadius + row * 2)
        );

      case 'grid':
        const cols = Math.ceil(Math.sqrt(totalMembers));
        const row_grid = Math.floor(index / cols);
        const col = index % cols;

        return new THREE.Vector3(
          basePosition.x + (col - cols/2) * 1.2,
          basePosition.y + row_grid * 0.8,
          basePosition.z + row_grid * 1.5
        );

      case 'natural':
        // Irregular positioning to simulate natural rock seating
        const clusterSize = 15;
        const clusterIndex = Math.floor(index / clusterSize);
        const posInCluster = index % clusterSize;

        const clusterAngle = (clusterIndex / Math.ceil(totalMembers / clusterSize)) * Math.PI;
        const clusterRadius = 40 + Math.random() * 60;

        const clusterCenter = new THREE.Vector3(
          Math.sin(clusterAngle) * clusterRadius,
          basePosition.y + Math.random() * 15,
          basePosition.z + Math.cos(clusterAngle) * clusterRadius
        );

        return new THREE.Vector3(
          clusterCenter.x + (Math.random() - 0.5) * 20,
          clusterCenter.y + (Math.random() - 0.5) * 8,
          clusterCenter.z + (Math.random() - 0.5) * 20
        );

      default:
        return basePosition.clone();
    }
  }

  private setupCrowdDynamics(): void {
    // Initialize crowd energy propagation system
    setInterval(() => {
      this.propagateEnergy();
    }, 100);

    // Reaction update system
    setInterval(() => {
      this.updateCrowdReactions();
    }, 500);

    // Performance metrics update
    setInterval(() => {
      this.updatePerformanceMetrics();
    }, 1000);
  }

  private propagateEnergy(): void {
    // Energy spreads from high-energy members to nearby members
    this.allMembers.forEach(member => {
      const nearbyMembers = this.getNearbyMembers(member, 5.0);
      let energyInfluence = 0;

      nearbyMembers.forEach(nearby => {
        const distance = member.position.distanceTo(nearby.position);
        const influence = (nearby.energyLevel - member.energyLevel) * (1 / (distance + 1)) * 0.01;
        energyInfluence += influence;
      });

      // Apply energy change
      member.energyLevel = Math.max(0, Math.min(1, member.energyLevel + energyInfluence));

      // Energy decay over time
      member.energyLevel = Math.max(0, member.energyLevel - this.energyDecayRate * 0.01);
    });

    // Update section averages
    this.sections.forEach(section => {
      const totalEnergy = section.members.reduce((sum, member) => sum + member.energyLevel, 0);
      section.averageEnergy = totalEnergy / section.members.length || 0;
    });

    // Update global energy
    const totalEnergy = this.allMembers.reduce((sum, member) => sum + member.energyLevel, 0);
    this.globalEnergy = totalEnergy / this.allMembers.length || 0;
  }

  private getNearbyMembers(member: AudienceMember, radius: number): AudienceMember[] {
    return this.allMembers.filter(other =>
      other.id !== member.id &&
      member.position.distanceTo(other.position) <= radius
    );
  }

  private updateCrowdReactions(): void {
    this.allMembers.forEach(member => {
      const previousReaction = member.currentReaction;
      member.currentReaction = this.determineReaction(member.energyLevel);

      // Trigger visual changes based on reaction
      if (member.currentReaction !== previousReaction) {
        this.applyReactionToMember(member, previousReaction);
      }
    });

    // Update section reactions
    this.sections.forEach(section => {
      const reactionCounts = new Map<CrowdReaction, number>();

      section.members.forEach(member => {
        reactionCounts.set(
          member.currentReaction,
          (reactionCounts.get(member.currentReaction) || 0) + 1
        );
      });

      // Find most common reaction in section
      let maxCount = 0;
      let dominantReaction: CrowdReaction = 'silent';

      reactionCounts.forEach((count, reaction) => {
        if (count > maxCount) {
          maxCount = count;
          dominantReaction = reaction;
        }
      });

      section.sectionReaction = dominantReaction;
    });

    // Update crowd audio
    this.updateCrowdAudio();
  }

  private determineReaction(energyLevel: number): CrowdReaction {
    // Add some randomness to reactions
    const adjustedEnergy = energyLevel + (Math.random() - 0.5) * 0.1;

    if (adjustedEnergy >= this.reactionThresholds.standing_ovation) return 'standing_ovation';
    if (adjustedEnergy >= this.reactionThresholds.jumping) return 'jumping';
    if (adjustedEnergy >= this.reactionThresholds.screaming) return 'screaming';
    if (adjustedEnergy >= this.reactionThresholds.cheering) return 'cheering';
    if (adjustedEnergy >= this.reactionThresholds.dancing && Math.random() > 0.5) return 'dancing';
    if (adjustedEnergy >= this.reactionThresholds.applause) return 'applause';
    if (adjustedEnergy >= this.reactionThresholds.phone_lights && Math.random() > 0.7) return 'phone_lights';
    if (adjustedEnergy >= this.reactionThresholds.polite_applause) return 'polite_applause';

    return 'silent';
  }

  private applyReactionToMember(member: AudienceMember, previousReaction: CrowdReaction): void {
    const reaction = member.currentReaction;

    // Reset previous reaction effects
    if (previousReaction === 'phone_lights' && member.phoneLight) {
      member.phoneLight.intensity = 0;
    }

    // Apply new reaction effects
    switch (reaction) {
      case 'standing_ovation':
        member.mesh.position.y = member.position.y + 0.3; // Stand up
        member.mesh.scale.y = 1.2; // Stretch arms up
        if (member.phoneLight) {
          member.phoneLight.intensity = 0.5;
          this.performanceResponse.phoneFlashlightActivations++;
        }
        break;

      case 'jumping':
        // Animate jumping (will be handled in update loop)
        member.mesh.position.y = member.position.y + 0.5;
        break;

      case 'dancing':
        // Dancing animation will be handled in update loop
        break;

      case 'phone_lights':
        if (member.phoneLight) {
          member.phoneLight.intensity = 0.3;
          member.phoneLight.color.setHSL(Math.random(), 0.8, 0.6);
          this.performanceResponse.phoneFlashlightActivations++;
        }
        break;

      case 'cheering':
      case 'screaming':
        member.mesh.rotation.z = (Math.random() - 0.5) * 0.2; // Slight lean
        break;

      case 'applause':
      case 'polite_applause':
        // Subtle arm movement animation
        member.mesh.rotation.x = Math.sin(Date.now() * 0.01) * 0.1;
        break;

      default:
        // Reset to neutral position
        member.mesh.position.y = member.position.y;
        member.mesh.scale.set(1, 1, 1);
        member.mesh.rotation.set(0, 0, 0);
        if (member.phoneLight) {
          member.phoneLight.intensity = 0;
        }
    }

    this.performanceResponse.totalReactions++;
  }

  private updateCrowdAudio(): void {
    const reactionCounts = new Map<CrowdReaction, number>();

    this.allMembers.forEach(member => {
      reactionCounts.set(
        member.currentReaction,
        (reactionCounts.get(member.currentReaction) || 0) + 1
      );
    });

    // Determine dominant audio type
    const silentCount = reactionCounts.get('silent') || 0;
    const applauseCount = (reactionCounts.get('applause') || 0) + (reactionCounts.get('polite_applause') || 0);
    const cheeringCount = (reactionCounts.get('cheering') || 0) + (reactionCounts.get('screaming') || 0);
    const standingCount = reactionCounts.get('standing_ovation') || 0;

    if (standingCount > this.allMembers.length * 0.5) {
      this.crowdAudio.type = 'roar';
      this.crowdAudio.intensity = 0.9;
      this.crowdAudio.volume = 0.8;
    } else if (cheeringCount > this.allMembers.length * 0.3) {
      this.crowdAudio.type = 'cheering';
      this.crowdAudio.intensity = 0.7;
      this.crowdAudio.volume = 0.6;
    } else if (applauseCount > this.allMembers.length * 0.2) {
      this.crowdAudio.type = 'applause';
      this.crowdAudio.intensity = 0.5;
      this.crowdAudio.volume = 0.4;
    } else if (silentCount < this.allMembers.length * 0.8) {
      this.crowdAudio.type = 'murmur';
      this.crowdAudio.intensity = 0.3;
      this.crowdAudio.volume = 0.2;
    } else {
      this.crowdAudio.type = 'silence';
      this.crowdAudio.intensity = 0.1;
      this.crowdAudio.volume = 0.1;
    }
  }

  private updatePerformanceMetrics(): void {
    // Calculate average engagement
    const totalEngagement = this.allMembers.reduce((sum, member) => sum + member.energyLevel, 0);
    this.performanceResponse.averageEngagement = totalEngagement / this.allMembers.length;

    // Track standing ovation time
    const standingCount = this.allMembers.filter(m => m.currentReaction === 'standing_ovation').length;
    if (standingCount > this.allMembers.length * 0.6) {
      this.performanceResponse.standingOvationTime += 1; // 1 second increments
    }
  }

  // Public interface methods
  public update(deltaTime: number, performanceEnergy: number): void {
    // Update global energy based on performance quality
    this.globalEnergy += (performanceEnergy - this.globalEnergy) * deltaTime * 0.5;
    this.globalEnergy = Math.max(0, Math.min(1, this.globalEnergy));

    // Update individual member animations
    this.updateMemberAnimations(deltaTime);

    // Update crowd wave if active
    if (this.crowdWave.active) {
      this.updateCrowdWave(deltaTime);
    }

    // Apply environmental effects
    this.applyEnvironmentalEffects();
  }

  private updateMemberAnimations(deltaTime: number): void {
    const time = Date.now() / 1000;

    this.allMembers.forEach(member => {
      switch (member.currentReaction) {
        case 'dancing':
          if (member.dancingAnimation) {
            const dance = member.dancingAnimation;
            member.mesh.position.y = member.position.y +
              Math.sin(time * dance.frequency + dance.phase) * dance.amplitude;
            member.mesh.rotation.y = Math.sin(time * dance.frequency * 2 + dance.phase) * 0.2;
          }
          break;

        case 'jumping':
          const jumpPhase = (time * 2 + member.reactionTendency * 10) % (Math.PI * 2);
          const jumpHeight = Math.max(0, Math.sin(jumpPhase)) * 0.8;
          member.mesh.position.y = member.position.y + jumpHeight;
          break;

        case 'applause':
        case 'polite_applause':
          // Clapping animation
          member.mesh.rotation.x = Math.sin(time * 4 + member.reactionTendency * 10) * 0.1;
          break;

        case 'cheering':
        case 'screaming':
          // Enthusiastic arm movements
          member.mesh.rotation.z = Math.sin(time * 3 + member.reactionTendency * 10) * 0.15;
          member.mesh.scale.y = 1 + Math.sin(time * 2 + member.reactionTendency * 10) * 0.05;
          break;
      }
    });
  }

  private updateCrowdWave(deltaTime: number): void {
    // Implement crowd wave animation
    this.crowdWave.currentRow += this.crowdWave.speed * deltaTime;

    // Activate members in current wave position
    this.sections.forEach(section => {
      section.members.forEach(member => {
        const memberRow = Math.floor(member.position.z / 10); // Approximate row based on z position

        if (Math.abs(memberRow - this.crowdWave.currentRow) < 2) {
          member.energyLevel = Math.min(1, member.energyLevel + 0.5);

          // Wave arm animation
          const wavePhase = (memberRow - this.crowdWave.currentRow + 2) * 0.5;
          member.mesh.rotation.z = Math.sin(wavePhase * Math.PI) * 0.5;
          member.mesh.scale.y = 1 + Math.sin(wavePhase * Math.PI) * 0.2;
        }
      });
    });

    // End wave when it reaches the back
    if (this.crowdWave.currentRow > 20) {
      this.crowdWave.active = false;
      this.crowdWave.currentRow = 0;
      this.performanceResponse.crowdWaveCount++;
    }
  }

  private applyEnvironmentalEffects(): void {
    // Weather effects on crowd behavior
    switch (this.config.weatherConditions) {
      case 'rain':
        // People are less enthusiastic in rain
        this.globalEnergy *= 0.95;
        break;

      case 'clear_night':
        // Perfect conditions boost energy
        this.globalEnergy = Math.min(1, this.globalEnergy * 1.01);
        break;

      case 'sunset':
        // Romantic sunset boosts energy
        this.globalEnergy = Math.min(1, this.globalEnergy * 1.005);
        break;
    }
  }

  // Event response methods
  public onBeatDetected(): void {
    // Boost energy on beat
    this.allMembers.forEach(member => {
      if (member.reactionTendency > 0.5) { // Only responsive members
        member.energyLevel = Math.min(1, member.energyLevel + 0.02);
      }
    });

    // Flash phone lights on beat
    this.phoneFlashlights.forEach(light => {
      if (light.intensity > 0) {
        light.intensity = Math.min(1, light.intensity * 1.5);
        setTimeout(() => {
          light.intensity = Math.max(0, light.intensity * 0.7);
        }, 100);
      }
    });
  }

  public reactToVisualEffect(effectType: string, intensity: number): void {
    const energyBoost = intensity * 0.1;

    switch (effectType) {
      case 'strobe':
        // Strong reaction to strobe effects
        this.allMembers.forEach(member => {
          member.energyLevel = Math.min(1, member.energyLevel + energyBoost * 2);
        });
        break;

      case 'laser_show':
        // Excitement for laser shows
        this.allMembers.forEach(member => {
          member.energyLevel = Math.min(1, member.energyLevel + energyBoost * 1.5);
        });
        break;

      case 'fireworks':
        // Massive reaction to fireworks
        this.allMembers.forEach(member => {
          member.energyLevel = Math.min(1, member.energyLevel + energyBoost * 3);
        });
        this.startCrowdWave();
        break;

      case 'fog_machine':
        // Moderate atmospheric effect
        this.allMembers.forEach(member => {
          member.energyLevel = Math.min(1, member.energyLevel + energyBoost * 0.5);
        });
        break;
    }
  }

  public activatePhoneLights(): void {
    console.log('Activating phone lights across the crowd!');

    this.phoneFlashlights.forEach(light => {
      light.intensity = 0.4;
      light.color.setHSL(Math.random(), 0.3, 0.8); // Mostly white with slight color variation
    });

    // Gradual activation wave
    let activationDelay = 0;
    this.allMembers.forEach(member => {
      if (member.hasPhone && member.phoneLight) {
        setTimeout(() => {
          member.phoneLight!.intensity = 0.4;
          member.currentReaction = 'phone_lights';
        }, activationDelay);
        activationDelay += Math.random() * 2000; // Stagger activation over 2 seconds
      }
    });

    this.performanceResponse.phoneFlashlightActivations += this.phoneFlashlights.length;
  }

  public startCrowdWave(): void {
    console.log('Starting crowd wave!');

    this.crowdWave.active = true;
    this.crowdWave.currentRow = 0;
    this.crowdWave.direction = Math.random() > 0.5 ? 'front_to_back' : 'left_to_right';
    this.crowdWave.speed = 2 + Math.random() * 2; // Variable wave speed
  }

  public triggerStandingOvation(): void {
    console.log('Crowd giving standing ovation!');

    this.allMembers.forEach((member, index) => {
      setTimeout(() => {
        member.energyLevel = 1.0;
        member.currentReaction = 'standing_ovation';
        this.applyReactionToMember(member, 'silent');
      }, Math.random() * 5000); // Stagger over 5 seconds
    });
  }

  // Getters for monitoring and stats
  public getCrowdGroup(): THREE.Group {
    return this.crowdGroup;
  }

  public getGlobalEnergy(): number {
    return this.globalEnergy;
  }

  public getCrowdAudio(): typeof this.crowdAudio {
    return { ...this.crowdAudio };
  }

  public getPerformanceMetrics(): typeof this.performanceResponse {
    return { ...this.performanceResponse };
  }

  public getSectionStats(): { name: string; energy: number; reaction: CrowdReaction; attendance: number }[] {
    return Array.from(this.sections.entries()).map(([name, section]) => ({
      name,
      energy: section.averageEnergy,
      reaction: section.sectionReaction,
      attendance: section.filled / section.capacity
    }));
  }

  public getReactionBreakdown(): Map<CrowdReaction, number> {
    const breakdown = new Map<CrowdReaction, number>();

    this.allMembers.forEach(member => {
      breakdown.set(
        member.currentReaction,
        (breakdown.get(member.currentReaction) || 0) + 1
      );
    });

    return breakdown;
  }

  // Cleanup
  public destroy(): void {
    // Dispose all geometries and materials
    this.allMembers.forEach(member => {
      member.mesh.geometry.dispose();
      if (member.mesh.material instanceof THREE.Material) {
        member.mesh.material.dispose();
      }

      // Dispose child meshes (heads)
      member.mesh.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material instanceof THREE.Material) {
            child.material.dispose();
          }
        }
      });
    });

    this.crowdGroup.clear();
    this.sections.clear();
    this.allMembers = [];
    this.phoneFlashlights = [];

    console.log('Red Rocks crowd destroyed');
  }
}