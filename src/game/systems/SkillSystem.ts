import { type Player, type PlayerSkills } from '../entities/Player';

export interface SkillDefinition {
  id: keyof PlayerSkills;
  name: string;
  description: string;
  icon: string;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  prerequisites?: {
    skill: keyof PlayerSkills;
    level: number;
  }[];
  unlocks: {
    level: number;
    content: string[];
    description: string;
  }[];
}

export interface SkillTreeNode {
  skill: keyof PlayerSkills;
  position: { x: number; y: number };
  connections: (keyof PlayerSkills)[];
}

export class SkillSystem {
  private static instance: SkillSystem;
  private skillDefinitions: Map<keyof PlayerSkills, SkillDefinition> = new Map();
  private skillTree: SkillTreeNode[] = [];

  private constructor() {
    this.initializeSkillDefinitions();
    this.initializeSkillTree();
  }

  public static getInstance(): SkillSystem {
    if (!SkillSystem.instance) {
      SkillSystem.instance = new SkillSystem();
    }
    return SkillSystem.instance;
  }

  private initializeSkillDefinitions(): void {
    const skills: SkillDefinition[] = [
      {
        id: 'technicalMapping',
        name: 'Technical Mapping',
        description: 'Master the technical aspects of VJ mapping and projection',
        icon: '🔧',
        maxLevel: 10,
        baseCost: 20,
        costMultiplier: 1.5,
        unlocks: [
          {
            level: 2,
            content: ['basic-mapping-tutorial'],
            description: 'Unlock basic mapping tutorial'
          },
          {
            level: 3,
            content: ['advanced-mapping-tools'],
            description: 'Access to advanced mapping software'
          },
          {
            level: 5,
            content: ['shader-programming', 'custom-effects'],
            description: 'Learn shader programming and create custom effects'
          },
          {
            level: 7,
            content: ['realtime-mapping'],
            description: 'Master real-time mapping techniques'
          },
          {
            level: 10,
            content: ['mapping-master-title'],
            description: 'Become a recognized mapping master'
          }
        ]
      },
      {
        id: 'artisticVision',
        name: 'Artistic Vision',
        description: 'Develop your creative eye and artistic sensibility',
        icon: '🎨',
        maxLevel: 10,
        baseCost: 15,
        costMultiplier: 1.4,
        unlocks: [
          {
            level: 2,
            content: ['color-theory-basics'],
            description: 'Learn color theory fundamentals'
          },
          {
            level: 3,
            content: ['composition-techniques'],
            description: 'Advanced composition techniques'
          },
          {
            level: 5,
            content: ['visual-storytelling', 'mood-creation'],
            description: 'Master visual storytelling and mood creation'
          },
          {
            level: 7,
            content: ['signature-style'],
            description: 'Develop your unique artistic signature'
          },
          {
            level: 10,
            content: ['artistic-recognition'],
            description: 'Gain recognition as a visual artist'
          }
        ]
      },
      {
        id: 'equipmentMastery',
        name: 'Equipment Mastery',
        description: 'Learn to use and optimize VJ equipment',
        icon: '📹',
        maxLevel: 10,
        baseCost: 25,
        costMultiplier: 1.6,
        unlocks: [
          {
            level: 2,
            content: ['projector-basics'],
            description: 'Understanding projector fundamentals'
          },
          {
            level: 3,
            content: ['equipment-shop-access'],
            description: 'Access to equipment marketplace'
          },
          {
            level: 5,
            content: ['high-end-equipment', 'equipment-modding'],
            description: 'Unlock high-end equipment and modification options'
          },
          {
            level: 7,
            content: ['custom-rigs', 'multi-projector-setups'],
            description: 'Build custom rigs and multi-projector setups'
          },
          {
            level: 10,
            content: ['equipment-expert-title'],
            description: 'Become a recognized equipment expert'
          }
        ]
      },
      {
        id: 'socialMedia',
        name: 'Social Media',
        description: 'Build your online presence and audience',
        icon: '📱',
        maxLevel: 10,
        baseCost: 10,
        costMultiplier: 1.3,
        prerequisites: [
          { skill: 'artisticVision', level: 2 }
        ],
        unlocks: [
          {
            level: 2,
            content: ['social-media-tutorial'],
            description: 'Learn social media best practices'
          },
          {
            level: 3,
            content: ['streaming-platform'],
            description: 'Access to live streaming features'
          },
          {
            level: 5,
            content: ['content-scheduling', 'audience-analytics'],
            description: 'Advanced content management and analytics'
          },
          {
            level: 7,
            content: ['brand-partnerships'],
            description: 'Unlock brand partnership opportunities'
          },
          {
            level: 10,
            content: ['influencer-status'],
            description: 'Achieve influencer status'
          }
        ]
      },
      {
        id: 'collaboration',
        name: 'Collaboration',
        description: 'Work effectively with other artists and professionals',
        icon: '🤝',
        maxLevel: 10,
        baseCost: 18,
        costMultiplier: 1.4,
        prerequisites: [
          { skill: 'socialMedia', level: 2 }
        ],
        unlocks: [
          {
            level: 2,
            content: ['networking-basics'],
            description: 'Learn networking fundamentals'
          },
          {
            level: 3,
            content: ['team-projects'],
            description: 'Participate in collaborative projects'
          },
          {
            level: 5,
            content: ['festival-connections', 'artist-collectives'],
            description: 'Connect with festivals and artist collectives'
          },
          {
            level: 7,
            content: ['mentorship-program'],
            description: 'Join mentorship programs'
          },
          {
            level: 10,
            content: ['community-leader-title'],
            description: 'Become a recognized community leader'
          }
        ]
      }
    ];

    skills.forEach(skill => {
      this.skillDefinitions.set(skill.id, skill);
    });
  }

  private initializeSkillTree(): void {
    this.skillTree = [
      {
        skill: 'technicalMapping',
        position: { x: 0, y: 0 },
        connections: ['artisticVision', 'equipmentMastery']
      },
      {
        skill: 'artisticVision',
        position: { x: -150, y: 100 },
        connections: ['technicalMapping', 'socialMedia']
      },
      {
        skill: 'equipmentMastery',
        position: { x: 150, y: 100 },
        connections: ['technicalMapping']
      },
      {
        skill: 'socialMedia',
        position: { x: -150, y: 200 },
        connections: ['artisticVision', 'collaboration']
      },
      {
        skill: 'collaboration',
        position: { x: 0, y: 300 },
        connections: ['socialMedia']
      }
    ];
  }

  // Skill information
  public getSkillDefinition(skill: keyof PlayerSkills): SkillDefinition | undefined {
    return this.skillDefinitions.get(skill);
  }

  public getAllSkillDefinitions(): SkillDefinition[] {
    return Array.from(this.skillDefinitions.values());
  }

  public getSkillTree(): SkillTreeNode[] {
    return [...this.skillTree];
  }

  // Skill upgrade logic
  public canUpgradeSkill(player: Player, skill: keyof PlayerSkills): { canUpgrade: boolean; reason?: string } {
    const definition = this.skillDefinitions.get(skill);
    if (!definition) {
      return { canUpgrade: false, reason: 'Skill not found' };
    }

    const currentLevel = player.getSkillLevel(skill);

    // Check max level
    if (currentLevel >= definition.maxLevel) {
      return { canUpgrade: false, reason: 'Maximum level reached' };
    }

    // Check prerequisites
    if (definition.prerequisites) {
      for (const prereq of definition.prerequisites) {
        const prereqLevel = player.getSkillLevel(prereq.skill);
        if (prereqLevel < prereq.level) {
          const prereqName = this.skillDefinitions.get(prereq.skill)?.name || prereq.skill;
          return {
            canUpgrade: false,
            reason: `Requires ${prereqName} level ${prereq.level}`
          };
        }
      }
    }

    // Check cost
    const cost = this.getUpgradeCost(skill, currentLevel);
    const playerStats = player.getStats();
    if (playerStats.reputation < cost) {
      return { canUpgrade: false, reason: `Requires ${cost} reputation` };
    }

    return { canUpgrade: true };
  }

  public getUpgradeCost(skill: keyof PlayerSkills, currentLevel: number): number {
    const definition = this.skillDefinitions.get(skill);
    if (!definition) return 0;

    return Math.floor(definition.baseCost * Math.pow(definition.costMultiplier, currentLevel));
  }

  public upgradeSkill(player: Player, skill: keyof PlayerSkills): boolean {
    const canUpgrade = this.canUpgradeSkill(player, skill);
    if (!canUpgrade.canUpgrade) {
      return false;
    }

    const currentLevel = player.getSkillLevel(skill);
    const cost = this.getUpgradeCost(skill, currentLevel);

    if (player.upgradeSkill(skill, cost)) {
      this.onSkillUpgraded(player, skill, currentLevel + 1);
      return true;
    }

    return false;
  }

  private onSkillUpgraded(player: Player, skill: keyof PlayerSkills, newLevel: number): void {
    const definition = this.skillDefinitions.get(skill);
    if (!definition) return;

    // Check for unlocks at this level
    const unlock = definition.unlocks.find(u => u.level === newLevel);
    if (unlock) {
      unlock.content.forEach(contentId => {
        player.unlockContent(contentId);
      });

      // Trigger unlock notification
      this.triggerUnlockNotification(definition.name, newLevel, unlock.description);
    }

    // Award experience for skill upgrade
    player.addExperience(newLevel * 10);
  }

  private triggerUnlockNotification(skillName: string, level: number, description: string): void {
    // This would trigger a UI notification
    console.log(`${skillName} Level ${level}: ${description}`);
  }

  // Skill recommendations
  public getRecommendedSkills(player: Player): (keyof PlayerSkills)[] {
    const skills = player.getSkills();
    const recommendations: (keyof PlayerSkills)[] = [];

    // Find skills that can be upgraded and are balanced
    const averageLevel = Object.values(skills).reduce((sum, level) => sum + level, 0) / Object.keys(skills).length;

    Object.entries(skills).forEach(([skill, level]) => {
      const skillKey = skill as keyof PlayerSkills;
      const canUpgrade = this.canUpgradeSkill(player, skillKey);

      if (canUpgrade.canUpgrade && level <= averageLevel + 1) {
        recommendations.push(skillKey);
      }
    });

    return recommendations;
  }

  // Skill synergies
  public getSkillSynergies(skills: PlayerSkills): { [key: string]: number } {
    const synergies: { [key: string]: number } = {};

    // Technical + Artistic synergy
    const techArtSynergy = Math.min(skills.technicalMapping, skills.artisticVision);
    if (techArtSynergy >= 3) {
      synergies['Creative Technician'] = techArtSynergy;
    }

    // Equipment + Technical synergy
    const equipTechSynergy = Math.min(skills.equipmentMastery, skills.technicalMapping);
    if (equipTechSynergy >= 3) {
      synergies['Technical Expert'] = equipTechSynergy;
    }

    // Social + Collaboration synergy
    const socialCollabSynergy = Math.min(skills.socialMedia, skills.collaboration);
    if (socialCollabSynergy >= 3) {
      synergies['Community Builder'] = socialCollabSynergy;
    }

    // All-rounder bonus
    const minSkill = Math.min(...Object.values(skills));
    if (minSkill >= 5) {
      synergies['Jack of All Trades'] = minSkill;
    }

    // Master specialist bonus
    const maxSkill = Math.max(...Object.values(skills));
    if (maxSkill >= 8) {
      synergies['Master Specialist'] = maxSkill;
    }

    return synergies;
  }

  // Progress tracking
  public getSkillProgress(player: Player): { [key in keyof PlayerSkills]: { current: number; max: number; percentage: number } } {
    const skills = player.getSkills();
    const progress: any = {};

    Object.keys(skills).forEach(skillKey => {
      const skill = skillKey as keyof PlayerSkills;
      const definition = this.skillDefinitions.get(skill);
      if (definition) {
        const current = skills[skill];
        const max = definition.maxLevel;
        progress[skill] = {
          current,
          max,
          percentage: (current / max) * 100
        };
      }
    });

    return progress;
  }

  // Achievement checking
  public checkSkillAchievements(player: Player): string[] {
    const skills = player.getSkills();
    const newAchievements: string[] = [];

    // Check various skill-based achievements
    Object.entries(skills).forEach(([skillKey, level]) => {
      const skill = skillKey as keyof PlayerSkills;

      // Milestone achievements
      [3, 5, 7, 10].forEach(milestone => {
        const achievementId = `${skill}_level_${milestone}`;
        if (level >= milestone && !player.hasAchievement(achievementId)) {
          player.unlockAchievement(achievementId);
          newAchievements.push(achievementId);
        }
      });
    });

    // Synergy achievements
    const synergies = this.getSkillSynergies(skills);
    Object.keys(synergies).forEach(synergyName => {
      const achievementId = `synergy_${synergyName.toLowerCase().replace(/\s+/g, '_')}`;
      if (!player.hasAchievement(achievementId)) {
        player.unlockAchievement(achievementId);
        newAchievements.push(achievementId);
      }
    });

    return newAchievements;
  }
}