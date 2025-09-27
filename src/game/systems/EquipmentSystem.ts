import { type Player, type PlayerSkills } from '../entities/Player';

export interface EquipmentItem {
  id: string;
  name: string;
  description: string;
  type: 'projector' | 'computer' | 'controller' | 'software' | 'accessory';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  cost: number;
  level: number;
  requirements?: {
    skill: keyof PlayerSkills;
    level: number;
  }[];
  stats: {
    [key: string]: number;
  };
  effects?: string[];
  icon: string;
  image?: string;
}

export interface EquipmentUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  requirements?: {
    skill: keyof PlayerSkills;
    level: number;
  }[];
  statBoosts: {
    [key: string]: number;
  };
}

export class EquipmentSystem {
  private static instance: EquipmentSystem;
  private equipmentDatabase: Map<string, EquipmentItem> = new Map();
  private upgradeDatabase: Map<string, EquipmentUpgrade[]> = new Map();

  private constructor() {
    this.initializeEquipmentDatabase();
    this.initializeUpgradeDatabase();
  }

  public static getInstance(): EquipmentSystem {
    if (!EquipmentSystem.instance) {
      EquipmentSystem.instance = new EquipmentSystem();
    }
    return EquipmentSystem.instance;
  }

  private initializeEquipmentDatabase(): void {
    const equipment: EquipmentItem[] = [
      // Computers
      {
        id: 'basic-laptop',
        name: 'Basic Laptop',
        description: 'A simple laptop for getting started with VJ software',
        type: 'computer',
        rarity: 'common',
        cost: 0,
        level: 1,
        stats: {
          processing: 1,
          memory: 1,
          graphics: 1
        },
        icon: '💻'
      },
      {
        id: 'gaming-laptop',
        name: 'Gaming Laptop',
        description: 'A powerful gaming laptop with dedicated graphics',
        type: 'computer',
        rarity: 'uncommon',
        cost: 500,
        level: 3,
        requirements: [
          { skill: 'technicalMapping', level: 2 }
        ],
        stats: {
          processing: 3,
          memory: 2,
          graphics: 4
        },
        icon: '🎮'
      },
      {
        id: 'workstation',
        name: 'Professional Workstation',
        description: 'A high-end workstation built for professional VJ work',
        type: 'computer',
        rarity: 'rare',
        cost: 2000,
        level: 6,
        requirements: [
          { skill: 'technicalMapping', level: 5 },
          { skill: 'equipmentMastery', level: 4 }
        ],
        stats: {
          processing: 6,
          memory: 5,
          graphics: 7
        },
        effects: ['Multi-output support', 'Real-time effects'],
        icon: '🖥️'
      },
      {
        id: 'custom-rig',
        name: 'Custom VJ Rig',
        description: 'A custom-built rig optimized for VJ performance',
        type: 'computer',
        rarity: 'epic',
        cost: 5000,
        level: 8,
        requirements: [
          { skill: 'technicalMapping', level: 7 },
          { skill: 'equipmentMastery', level: 7 }
        ],
        stats: {
          processing: 9,
          memory: 8,
          graphics: 10
        },
        effects: ['Multi-output support', 'Real-time effects', 'Advanced shader support'],
        icon: '⚡'
      },

      // Projectors
      {
        id: 'basic-projector',
        name: 'Basic Projector',
        description: 'A simple home projector for practice',
        type: 'projector',
        rarity: 'common',
        cost: 200,
        level: 1,
        stats: {
          brightness: 1,
          resolution: 1,
          colorAccuracy: 1
        },
        icon: '📽️'
      },
      {
        id: 'venue-projector',
        name: 'Venue Projector',
        description: 'A mid-range projector suitable for small venues',
        type: 'projector',
        rarity: 'uncommon',
        cost: 800,
        level: 3,
        requirements: [
          { skill: 'equipmentMastery', level: 2 }
        ],
        stats: {
          brightness: 3,
          resolution: 3,
          colorAccuracy: 2
        },
        icon: '🎬'
      },
      {
        id: 'professional-projector',
        name: 'Professional Projector',
        description: 'A high-end projector for professional installations',
        type: 'projector',
        rarity: 'rare',
        cost: 3000,
        level: 6,
        requirements: [
          { skill: 'equipmentMastery', level: 5 }
        ],
        stats: {
          brightness: 6,
          resolution: 6,
          colorAccuracy: 5
        },
        effects: ['Edge blending support', 'Advanced color correction'],
        icon: '🌟'
      },
      {
        id: 'laser-projector',
        name: 'Laser Projector',
        description: 'State-of-the-art laser projector for premium installations',
        type: 'projector',
        rarity: 'legendary',
        cost: 10000,
        level: 9,
        requirements: [
          { skill: 'equipmentMastery', level: 8 },
          { skill: 'technicalMapping', level: 7 }
        ],
        stats: {
          brightness: 10,
          resolution: 9,
          colorAccuracy: 10
        },
        effects: ['Edge blending support', 'Advanced color correction', 'Instant on/off', 'Extended lifespan'],
        icon: '🔥'
      },

      // Controllers
      {
        id: 'midi-controller',
        name: 'MIDI Controller',
        description: 'A basic MIDI controller for real-time control',
        type: 'controller',
        rarity: 'common',
        cost: 150,
        level: 2,
        requirements: [
          { skill: 'technicalMapping', level: 1 }
        ],
        stats: {
          responsiveness: 2,
          features: 1
        },
        icon: '🎛️'
      },
      {
        id: 'vj-controller',
        name: 'VJ Controller',
        description: 'A specialized controller designed for VJ performance',
        type: 'controller',
        rarity: 'uncommon',
        cost: 400,
        level: 4,
        requirements: [
          { skill: 'technicalMapping', level: 3 }
        ],
        stats: {
          responsiveness: 4,
          features: 3
        },
        effects: ['Crossfader support', 'Effect knobs'],
        icon: '🎚️'
      },
      {
        id: 'professional-controller',
        name: 'Professional VJ Controller',
        description: 'A high-end controller with advanced features',
        type: 'controller',
        rarity: 'rare',
        cost: 1200,
        level: 7,
        requirements: [
          { skill: 'technicalMapping', level: 6 },
          { skill: 'equipmentMastery', level: 5 }
        ],
        stats: {
          responsiveness: 7,
          features: 6
        },
        effects: ['Crossfader support', 'Effect knobs', 'Touch strips', 'Custom mapping'],
        icon: '🎹'
      },

      // Software
      {
        id: 'basic-vj-software',
        name: 'Basic VJ Software',
        description: 'Free open-source VJ software for beginners',
        type: 'software',
        rarity: 'common',
        cost: 0,
        level: 1,
        stats: {
          features: 1,
          stability: 2
        },
        icon: '📱'
      },
      {
        id: 'intermediate-vj-software',
        name: 'VJ Pro',
        description: 'Commercial VJ software with more features',
        type: 'software',
        rarity: 'uncommon',
        cost: 300,
        level: 3,
        requirements: [
          { skill: 'technicalMapping', level: 2 }
        ],
        stats: {
          features: 3,
          stability: 3
        },
        effects: ['Real-time effects', 'Multiple layers'],
        icon: '💿'
      },
      {
        id: 'professional-vj-software',
        name: 'VJ Master Suite',
        description: 'Professional VJ software suite with advanced features',
        type: 'software',
        rarity: 'epic',
        cost: 1500,
        level: 6,
        requirements: [
          { skill: 'technicalMapping', level: 5 }
        ],
        stats: {
          features: 7,
          stability: 6
        },
        effects: ['Real-time effects', 'Multiple layers', 'Advanced mapping', 'Plugin support'],
        icon: '🏆'
      },

      // Accessories
      {
        id: 'capture-card',
        name: 'Video Capture Card',
        description: 'Capture external video sources',
        type: 'accessory',
        rarity: 'uncommon',
        cost: 200,
        level: 2,
        stats: {
          inputSources: 2
        },
        effects: ['External video input'],
        icon: '📹'
      },
      {
        id: 'audio-interface',
        name: 'Audio Interface',
        description: 'Professional audio input/output interface',
        type: 'accessory',
        rarity: 'rare',
        cost: 500,
        level: 4,
        requirements: [
          { skill: 'equipmentMastery', level: 3 }
        ],
        stats: {
          audioQuality: 5
        },
        effects: ['High-quality audio', 'Multiple inputs'],
        icon: '🎵'
      }
    ];

    equipment.forEach(item => {
      this.equipmentDatabase.set(item.id, item);
    });
  }

  private initializeUpgradeDatabase(): void {
    // Define upgrades for specific equipment
    this.upgradeDatabase.set('basic-laptop', [
      {
        id: 'memory-upgrade',
        name: 'Memory Upgrade',
        description: 'Upgrade RAM for better performance',
        cost: 100,
        statBoosts: { memory: 1 }
      },
      {
        id: 'graphics-upgrade',
        name: 'Graphics Card Upgrade',
        description: 'Add a dedicated graphics card',
        cost: 300,
        requirements: [{ skill: 'technicalMapping', level: 3 }],
        statBoosts: { graphics: 2 }
      }
    ]);

    this.upgradeDatabase.set('venue-projector', [
      {
        id: 'lens-upgrade',
        name: 'Premium Lens',
        description: 'High-quality lens for better image clarity',
        cost: 200,
        requirements: [{ skill: 'equipmentMastery', level: 3 }],
        statBoosts: { resolution: 1, colorAccuracy: 1 }
      },
      {
        id: 'lamp-upgrade',
        name: 'High-Brightness Lamp',
        description: 'Brighter lamp for better visibility',
        cost: 150,
        statBoosts: { brightness: 2 }
      }
    ]);
  }

  // Equipment management
  public getEquipmentItem(id: string): EquipmentItem | undefined {
    return this.equipmentDatabase.get(id);
  }

  public getAllEquipment(): EquipmentItem[] {
    return Array.from(this.equipmentDatabase.values());
  }

  public getEquipmentByType(type: EquipmentItem['type']): EquipmentItem[] {
    return this.getAllEquipment().filter(item => item.type === type);
  }

  public getAvailableEquipment(player: Player): EquipmentItem[] {
    const playerSkills = player.getSkills();
    const playerStats = player.getStats();

    return this.getAllEquipment().filter(item => {
      // Check level requirement
      if (item.level > playerStats.level) return false;

      // Check skill requirements
      if (item.requirements) {
        for (const req of item.requirements) {
          if (playerSkills[req.skill] < req.level) return false;
        }
      }

      return true;
    });
  }

  public canAffordEquipment(player: Player, equipmentId: string): boolean {
    const item = this.getEquipmentItem(equipmentId);
    if (!item) return false;

    const playerStats = player.getStats();
    return playerStats.reputation >= item.cost;
  }

  public purchaseEquipment(player: Player, equipmentId: string): boolean {
    const item = this.getEquipmentItem(equipmentId);
    if (!item) return false;

    const playerStats = player.getStats();

    // Check if player can afford and meets requirements
    if (!this.canAffordEquipment(player, equipmentId)) return false;
    if (!this.getAvailableEquipment(player).some(eq => eq.id === equipmentId)) return false;

    // Purchase the item
    player.addReputation(-item.cost);
    player.addToInventory(equipmentId, 1);

    return true;
  }

  // Equipment upgrades
  public getUpgrades(equipmentId: string): EquipmentUpgrade[] {
    return this.upgradeDatabase.get(equipmentId) || [];
  }

  public canUpgradeEquipment(player: Player, equipmentId: string, upgradeId: string): boolean {
    const upgrades = this.getUpgrades(equipmentId);
    const upgrade = upgrades.find(u => u.id === upgradeId);

    if (!upgrade) return false;

    const playerSkills = player.getSkills();
    const playerStats = player.getStats();

    // Check cost
    if (playerStats.reputation < upgrade.cost) return false;

    // Check requirements
    if (upgrade.requirements) {
      for (const req of upgrade.requirements) {
        if (playerSkills[req.skill] < req.level) return false;
      }
    }

    // Check if player owns the equipment
    if (!player.hasInInventory(equipmentId)) return false;

    return true;
  }

  public upgradeEquipment(player: Player, equipmentId: string, upgradeId: string): boolean {
    if (!this.canUpgradeEquipment(player, equipmentId, upgradeId)) return false;

    const upgrades = this.getUpgrades(equipmentId);
    const upgrade = upgrades.find(u => u.id === upgradeId);

    if (!upgrade) return false;

    // Apply upgrade
    player.addReputation(-upgrade.cost);

    // For simplicity, we'll track upgrades by adding upgraded items to inventory
    const upgradedId = `${equipmentId}_${upgradeId}`;
    player.removeFromInventory(equipmentId, 1);
    player.addToInventory(upgradedId, 1);

    return true;
  }

  // Equipment comparison
  public compareEquipment(item1Id: string, item2Id: string): { [stat: string]: number } {
    const item1 = this.getEquipmentItem(item1Id);
    const item2 = this.getEquipmentItem(item2Id);

    if (!item1 || !item2) return {};

    const comparison: { [stat: string]: number } = {};
    const allStats = new Set([...Object.keys(item1.stats), ...Object.keys(item2.stats)]);

    allStats.forEach(stat => {
      const stat1 = item1.stats[stat] || 0;
      const stat2 = item2.stats[stat] || 0;
      comparison[stat] = stat1 - stat2;
    });

    return comparison;
  }

  // Equipment recommendations
  public getRecommendedEquipment(player: Player): EquipmentItem[] {
    const available = this.getAvailableEquipment(player);
    const currentEquipment = player.getEquipment();
    const playerSkills = player.getSkills();

    return available
      .filter(item => {
        // Don't recommend if player already owns a better version
        const currentInSlot = currentEquipment[item.type as keyof typeof currentEquipment];
        if (currentInSlot && typeof currentInSlot === 'string') {
          const currentItem = this.getEquipmentItem(currentInSlot);
          if (currentItem && currentItem.level >= item.level) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Prioritize by player's strongest skills
        let scoreA = 0;
        let scoreB = 0;

        if (a.requirements) {
          scoreA += a.requirements.reduce((sum, req) => sum + playerSkills[req.skill], 0);
        }
        if (b.requirements) {
          scoreB += b.requirements.reduce((sum, req) => sum + playerSkills[req.skill], 0);
        }

        return scoreB - scoreA;
      })
      .slice(0, 5);
  }

  // Equipment effects calculation
  public calculateEquipmentBonuses(player: Player): { [key: string]: number } {
    const equipment = player.getEquipment();
    const bonuses: { [key: string]: number } = {};

    // Calculate bonuses from each equipped item
    Object.entries(equipment).forEach(([slot, itemId]) => {
      if (typeof itemId === 'string') {
        const item = this.getEquipmentItem(itemId);
        if (item) {
          Object.entries(item.stats).forEach(([stat, value]) => {
            bonuses[stat] = (bonuses[stat] || 0) + value;
          });
        }
      }
    });

    // Software bonuses
    if (equipment.software) {
      equipment.software.forEach(softwareId => {
        const item = this.getEquipmentItem(softwareId);
        if (item) {
          Object.entries(item.stats).forEach(([stat, value]) => {
            bonuses[stat] = (bonuses[stat] || 0) + value;
          });
        }
      });
    }

    // Accessory bonuses
    if (equipment.accessories) {
      equipment.accessories.forEach(accessoryId => {
        const item = this.getEquipmentItem(accessoryId);
        if (item) {
          Object.entries(item.stats).forEach(([stat, value]) => {
            bonuses[stat] = (bonuses[stat] || 0) + value;
          });
        }
      });
    }

    return bonuses;
  }

  // Equipment sets and synergies
  public getEquipmentSynergies(player: Player): string[] {
    const equipment = player.getEquipment();
    const synergies: string[] = [];

    // Professional setup synergy
    const hasHighEndComputer = equipment.computer === 'workstation' || equipment.computer === 'custom-rig';
    const hasHighEndProjector = equipment.projector === 'professional-projector' || equipment.projector === 'laser-projector';
    const hasController = equipment.controller !== null;

    if (hasHighEndComputer && hasHighEndProjector && hasController) {
      synergies.push('Professional Setup');
    }

    // Beginner synergy
    const hasBasicEquipment = equipment.computer === 'basic-laptop' && equipment.projector === 'basic-projector';
    if (hasBasicEquipment) {
      synergies.push('Getting Started');
    }

    return synergies;
  }

  // Market simulation
  public getMarketPrices(): { [itemId: string]: { current: number; trend: 'up' | 'down' | 'stable' } } {
    // Simulate market fluctuations
    const prices: { [itemId: string]: { current: number; trend: 'up' | 'down' | 'stable' } } = {};

    this.getAllEquipment().forEach(item => {
      const baseFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
      const current = Math.floor(item.cost * baseFactor);

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (baseFactor < 0.9) trend = 'down';
      else if (baseFactor > 1.1) trend = 'up';

      prices[item.id] = { current, trend };
    });

    return prices;
  }
}