export interface PlayerStats {
  level: number;
  experience: number;
  experienceToNext: number;
  reputation: number;
  energy: number;
  maxEnergy: number;
  money: number;
}

export interface PlayerPosition {
  x: number;
  y: number;
  scene: string;
}

export interface PlayerSkills {
  technicalMapping: number;
  artisticVision: number;
  equipmentMastery: number;
  socialMedia: number;
  collaboration: number;
}

export interface PlayerEquipment {
  projector: string | null;
  computer: string | null;
  controller: string | null;
  software: string[];
  accessories: string[];
}

export class Player {
  private stats: PlayerStats;
  private skills: PlayerSkills;
  private equipment: PlayerEquipment;
  private position: PlayerPosition;
  private inventory: Map<string, number> = new Map();
  private achievements: Set<string> = new Set();
  private unlockedContent: Set<string> = new Set();

  constructor() {
    // Initialize starting stats
    this.stats = {
      level: 1,
      experience: 0,
      experienceToNext: 100,
      reputation: 0,
      energy: 100,
      maxEnergy: 100,
      money: 0
    };

    // Initialize starting skills
    this.skills = {
      technicalMapping: 1,
      artisticVision: 1,
      equipmentMastery: 1,
      socialMedia: 1,
      collaboration: 1
    };

    // Initialize starting equipment
    this.equipment = {
      projector: null,
      computer: 'basic-laptop',
      controller: null,
      software: ['basic-vj-software'],
      accessories: []
    };

    // Initialize starting position
    this.position = {
      x: 0,
      y: 0,
      scene: 'home'
    };
  }

  // Stats management
  public getStats(): PlayerStats {
    return { ...this.stats };
  }

  public addExperience(amount: number): boolean {
    this.stats.experience += amount;

    // Check for level up
    while (this.stats.experience >= this.stats.experienceToNext) {
      this.levelUp();
    }

    return true;
  }

  private levelUp(): void {
    this.stats.experience -= this.stats.experienceToNext;
    this.stats.level++;

    // Increase max energy
    this.stats.maxEnergy += 10;
    this.stats.energy = this.stats.maxEnergy; // Restore energy on level up

    // Calculate experience needed for next level (exponential growth)
    this.stats.experienceToNext = Math.floor(100 * Math.pow(1.2, this.stats.level - 1));

    // Award skill points (could be used in a skill point system)
    this.addReputation(10);

    // Trigger level up effects
    this.onLevelUp();
  }

  private onLevelUp(): void {
    // Override in subclasses or use event system
    console.log(`Player reached level ${this.stats.level}!`);
  }

  public addReputation(amount: number): void {
    this.stats.reputation = Math.max(0, this.stats.reputation + amount);
  }

  public addMoney(amount: number): void {
    this.stats.money = Math.max(0, this.stats.money + amount);
  }

  public spendMoney(amount: number): boolean {
    if (this.stats.money >= amount) {
      this.stats.money -= amount;
      return true;
    }
    return false;
  }

  public consumeEnergy(amount: number): boolean {
    if (this.stats.energy >= amount) {
      this.stats.energy -= amount;
      return true;
    }
    return false;
  }

  public restoreEnergy(amount: number): void {
    this.stats.energy = Math.min(this.stats.maxEnergy, this.stats.energy + amount);
  }

  // Skills management
  public getSkills(): PlayerSkills {
    return { ...this.skills };
  }

  public getSkillLevel(skill: keyof PlayerSkills): number {
    return this.skills[skill];
  }

  public upgradeSkill(skill: keyof PlayerSkills, cost: number = 0): boolean {
    // Check if player can afford the upgrade (could use experience, reputation, or skill points)
    if (cost > 0 && this.stats.reputation < cost) {
      return false;
    }

    // Maximum skill level check
    if (this.skills[skill] >= 10) {
      return false;
    }

    // Apply upgrade
    this.skills[skill]++;
    if (cost > 0) {
      this.stats.reputation -= cost;
    }

    this.onSkillUpgrade(skill);
    return true;
  }

  private onSkillUpgrade(skill: keyof PlayerSkills): void {
    console.log(`${skill} upgraded to level ${this.skills[skill]}!`);

    // Unlock content based on skill levels
    this.checkSkillUnlocks(skill);
  }

  private checkSkillUnlocks(skill: keyof PlayerSkills): void {
    const level = this.skills[skill];

    switch (skill) {
      case 'technicalMapping':
        if (level >= 3) this.unlockedContent.add('advanced-mapping-tools');
        if (level >= 5) this.unlockedContent.add('shader-programming');
        if (level >= 8) this.unlockedContent.add('custom-effects');
        break;

      case 'artisticVision':
        if (level >= 3) this.unlockedContent.add('color-theory-lessons');
        if (level >= 5) this.unlockedContent.add('advanced-compositions');
        if (level >= 8) this.unlockedContent.add('signature-style');
        break;

      case 'equipmentMastery':
        if (level >= 3) this.unlockedContent.add('projector-shop');
        if (level >= 5) this.unlockedContent.add('high-end-equipment');
        if (level >= 8) this.unlockedContent.add('custom-rigs');
        break;

      case 'socialMedia':
        if (level >= 3) this.unlockedContent.add('streaming-platform');
        if (level >= 5) this.unlockedContent.add('brand-partnerships');
        if (level >= 8) this.unlockedContent.add('viral-marketing');
        break;

      case 'collaboration':
        if (level >= 3) this.unlockedContent.add('team-projects');
        if (level >= 5) this.unlockedContent.add('festival-invites');
        if (level >= 8) this.unlockedContent.add('mentorship');
        break;
    }
  }

  // Equipment management
  public getEquipment(): PlayerEquipment {
    return { ...this.equipment };
  }

  public equipItem(slot: keyof Omit<PlayerEquipment, 'software' | 'accessories'>, itemId: string): boolean {
    if (this.hasInInventory(itemId)) {
      // Unequip current item if any
      const currentItem = this.equipment[slot];
      if (currentItem) {
        this.addToInventory(currentItem, 1);
      }

      // Equip new item
      this.equipment[slot] = itemId;
      this.removeFromInventory(itemId, 1);

      this.onEquipmentChange();
      return true;
    }
    return false;
  }

  public unequipItem(slot: keyof Omit<PlayerEquipment, 'software' | 'accessories'>): boolean {
    const currentItem = this.equipment[slot];
    if (currentItem) {
      this.equipment[slot] = null;
      this.addToInventory(currentItem, 1);
      this.onEquipmentChange();
      return true;
    }
    return false;
  }

  public addSoftware(softwareId: string): void {
    if (!this.equipment.software.includes(softwareId)) {
      this.equipment.software.push(softwareId);
      this.onEquipmentChange();
    }
  }

  public addAccessory(accessoryId: string): void {
    if (!this.equipment.accessories.includes(accessoryId)) {
      this.equipment.accessories.push(accessoryId);
      this.onEquipmentChange();
    }
  }

  private onEquipmentChange(): void {
    // Recalculate bonuses, update appearance, etc.
    console.log('Equipment changed');
  }

  // Inventory management
  public getInventory(): Map<string, number> {
    return new Map(this.inventory);
  }

  public addToInventory(itemId: string, quantity: number = 1): void {
    const current = this.inventory.get(itemId) || 0;
    this.inventory.set(itemId, current + quantity);
  }

  public removeFromInventory(itemId: string, quantity: number = 1): boolean {
    const current = this.inventory.get(itemId) || 0;
    if (current >= quantity) {
      if (current === quantity) {
        this.inventory.delete(itemId);
      } else {
        this.inventory.set(itemId, current - quantity);
      }
      return true;
    }
    return false;
  }

  public hasInInventory(itemId: string, quantity: number = 1): boolean {
    const current = this.inventory.get(itemId) || 0;
    return current >= quantity;
  }

  public getInventoryCount(itemId: string): number {
    return this.inventory.get(itemId) || 0;
  }

  // Position management
  public getPosition(): PlayerPosition {
    return { ...this.position };
  }

  public setPosition(x: number, y: number, scene?: string): void {
    this.position.x = x;
    this.position.y = y;
    if (scene) {
      this.position.scene = scene;
    }
  }

  public moveBy(dx: number, dy: number): void {
    this.position.x += dx;
    this.position.y += dy;
  }

  // Achievement system
  public getAchievements(): Set<string> {
    return new Set(this.achievements);
  }

  public unlockAchievement(achievementId: string): boolean {
    if (!this.achievements.has(achievementId)) {
      this.achievements.add(achievementId);
      this.onAchievementUnlocked(achievementId);
      return true;
    }
    return false;
  }

  public hasAchievement(achievementId: string): boolean {
    return this.achievements.has(achievementId);
  }

  private onAchievementUnlocked(achievementId: string): void {
    console.log(`Achievement unlocked: ${achievementId}`);
    this.addExperience(50); // Bonus experience for achievements
  }

  // Content unlocking
  public getUnlockedContent(): Set<string> {
    return new Set(this.unlockedContent);
  }

  public hasUnlockedContent(contentId: string): boolean {
    return this.unlockedContent.has(contentId);
  }

  public unlockContent(contentId: string): void {
    this.unlockedContent.add(contentId);
  }

  // Calculate effective stats with equipment bonuses
  public getEffectiveStats(): PlayerStats & { bonuses: any } {
    const baseStats = this.getStats();
    const bonuses = this.calculateEquipmentBonuses();

    return {
      ...baseStats,
      bonuses,
      // Apply bonuses to relevant stats
      maxEnergy: baseStats.maxEnergy + (bonuses.energy || 0)
    };
  }

  private calculateEquipmentBonuses(): any {
    const bonuses: any = {};

    // Calculate bonuses from equipped items
    // This would be expanded with actual equipment data
    if (this.equipment.projector) {
      bonuses.artisticVision = 1;
    }

    if (this.equipment.computer === 'high-end-workstation') {
      bonuses.technicalMapping = 2;
      bonuses.energy = 20;
    }

    return bonuses;
  }

  // Serialization for save/load
  public serialize(): string {
    return JSON.stringify({
      stats: this.stats,
      skills: this.skills,
      equipment: this.equipment,
      position: this.position,
      inventory: Array.from(this.inventory.entries()),
      achievements: Array.from(this.achievements),
      unlockedContent: Array.from(this.unlockedContent)
    });
  }

  public deserialize(data: string): void {
    try {
      const parsed = JSON.parse(data);

      this.stats = parsed.stats || this.stats;
      this.skills = parsed.skills || this.skills;
      this.equipment = parsed.equipment || this.equipment;
      this.position = parsed.position || this.position;
      this.inventory = new Map(parsed.inventory || []);
      this.achievements = new Set(parsed.achievements || []);
      this.unlockedContent = new Set(parsed.unlockedContent || []);
    } catch (error) {
      console.error('Failed to deserialize player data:', error);
    }
  }
}