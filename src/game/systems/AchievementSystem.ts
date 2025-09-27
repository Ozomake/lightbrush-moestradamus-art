import { type Player, type PlayerSkills } from '../entities/Player';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: 'skill' | 'equipment' | 'social' | 'milestone' | 'secret';
  points: number;
  requirements: AchievementRequirement[];
  rewards?: AchievementReward[];
  hidden?: boolean; // Hidden until unlocked
}

export interface AchievementRequirement {
  type: 'skill_level' | 'total_experience' | 'equipment_owned' | 'reputation' | 'custom';
  skill?: keyof PlayerSkills;
  value: number;
  customCheck?: (player: Player) => boolean;
  description: string;
}

export interface AchievementReward {
  type: 'experience' | 'reputation' | 'item' | 'unlock';
  value?: number;
  itemId?: string;
  unlockId?: string;
}

export interface AchievementProgress {
  achievementId: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  unlockedAt?: Date;
}

export class AchievementSystem {
  private static instance: AchievementSystem;
  private achievements: Map<string, Achievement> = new Map();
  private playerProgress: Map<string, AchievementProgress> = new Map();

  private constructor() {
    this.initializeAchievements();
  }

  public static getInstance(): AchievementSystem {
    if (!AchievementSystem.instance) {
      AchievementSystem.instance = new AchievementSystem();
    }
    return AchievementSystem.instance;
  }

  private initializeAchievements(): void {
    const achievements: Achievement[] = [
      // Skill Achievements
      {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Reach level 2 in any skill',
        icon: '👶',
        rarity: 'common',
        category: 'skill',
        points: 10,
        requirements: [
          {
            type: 'custom',
            value: 1,
            description: 'Reach level 2 in any skill',
            customCheck: (player) => {
              const skills = player.getSkills();
              return Object.values(skills).some(level => level >= 2);
            }
          }
        ],
        rewards: [
          { type: 'experience', value: 50 }
        ]
      },
      {
        id: 'technical_mapping_novice',
        name: 'Mapping Novice',
        description: 'Reach Technical Mapping level 3',
        icon: '🔧',
        rarity: 'common',
        category: 'skill',
        points: 15,
        requirements: [
          {
            type: 'skill_level',
            skill: 'technicalMapping',
            value: 3,
            description: 'Technical Mapping level 3'
          }
        ],
        rewards: [
          { type: 'experience', value: 75 },
          { type: 'unlock', unlockId: 'mapping_tutorial_advanced' }
        ]
      },
      {
        id: 'technical_mapping_expert',
        name: 'Mapping Expert',
        description: 'Reach Technical Mapping level 7',
        icon: '⚙️',
        rarity: 'rare',
        category: 'skill',
        points: 50,
        requirements: [
          {
            type: 'skill_level',
            skill: 'technicalMapping',
            value: 7,
            description: 'Technical Mapping level 7'
          }
        ],
        rewards: [
          { type: 'experience', value: 200 },
          { type: 'reputation', value: 100 },
          { type: 'unlock', unlockId: 'expert_mapping_tools' }
        ]
      },
      {
        id: 'technical_mapping_master',
        name: 'Mapping Master',
        description: 'Reach Technical Mapping level 10',
        icon: '🏆',
        rarity: 'legendary',
        category: 'skill',
        points: 100,
        requirements: [
          {
            type: 'skill_level',
            skill: 'technicalMapping',
            value: 10,
            description: 'Technical Mapping level 10'
          }
        ],
        rewards: [
          { type: 'experience', value: 500 },
          { type: 'reputation', value: 300 },
          { type: 'unlock', unlockId: 'mapping_master_title' }
        ]
      },
      {
        id: 'artistic_vision_novice',
        name: 'Creative Eye',
        description: 'Reach Artistic Vision level 3',
        icon: '🎨',
        rarity: 'common',
        category: 'skill',
        points: 15,
        requirements: [
          {
            type: 'skill_level',
            skill: 'artisticVision',
            value: 3,
            description: 'Artistic Vision level 3'
          }
        ],
        rewards: [
          { type: 'experience', value: 75 }
        ]
      },
      {
        id: 'artistic_vision_master',
        name: 'Visionary Artist',
        description: 'Reach Artistic Vision level 10',
        icon: '🌟',
        rarity: 'legendary',
        category: 'skill',
        points: 100,
        requirements: [
          {
            type: 'skill_level',
            skill: 'artisticVision',
            value: 10,
            description: 'Artistic Vision level 10'
          }
        ],
        rewards: [
          { type: 'experience', value: 500 },
          { type: 'reputation', value: 300 }
        ]
      },
      {
        id: 'equipment_mastery_expert',
        name: 'Gear Head',
        description: 'Reach Equipment Mastery level 7',
        icon: '🛠️',
        rarity: 'rare',
        category: 'skill',
        points: 50,
        requirements: [
          {
            type: 'skill_level',
            skill: 'equipmentMastery',
            value: 7,
            description: 'Equipment Mastery level 7'
          }
        ],
        rewards: [
          { type: 'experience', value: 200 },
          { type: 'reputation', value: 100 }
        ]
      },
      {
        id: 'social_media_influencer',
        name: 'Social Media Influencer',
        description: 'Reach Social Media level 8',
        icon: '📱',
        rarity: 'epic',
        category: 'social',
        points: 75,
        requirements: [
          {
            type: 'skill_level',
            skill: 'socialMedia',
            value: 8,
            description: 'Social Media level 8'
          }
        ],
        rewards: [
          { type: 'experience', value: 300 },
          { type: 'reputation', value: 200 },
          { type: 'unlock', unlockId: 'influencer_perks' }
        ]
      },
      {
        id: 'collaboration_master',
        name: 'Team Player',
        description: 'Reach Collaboration level 10',
        icon: '🤝',
        rarity: 'legendary',
        category: 'social',
        points: 100,
        requirements: [
          {
            type: 'skill_level',
            skill: 'collaboration',
            value: 10,
            description: 'Collaboration level 10'
          }
        ],
        rewards: [
          { type: 'experience', value: 500 },
          { type: 'reputation', value: 300 }
        ]
      },

      // Multi-skill achievements
      {
        id: 'well_rounded',
        name: 'Well Rounded',
        description: 'Reach level 5 in all skills',
        icon: '⭐',
        rarity: 'epic',
        category: 'skill',
        points: 75,
        requirements: [
          {
            type: 'custom',
            value: 5,
            description: 'All skills at level 5',
            customCheck: (player) => {
              const skills = player.getSkills();
              return Object.values(skills).every(level => level >= 5);
            }
          }
        ],
        rewards: [
          { type: 'experience', value: 300 },
          { type: 'reputation', value: 150 },
          { type: 'unlock', unlockId: 'balanced_bonus' }
        ]
      },
      {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Reach level 10 in all skills',
        icon: '💎',
        rarity: 'legendary',
        category: 'skill',
        points: 200,
        requirements: [
          {
            type: 'custom',
            value: 10,
            description: 'All skills at level 10',
            customCheck: (player) => {
              const skills = player.getSkills();
              return Object.values(skills).every(level => level >= 10);
            }
          }
        ],
        rewards: [
          { type: 'experience', value: 1000 },
          { type: 'reputation', value: 500 },
          { type: 'unlock', unlockId: 'master_vj_title' }
        ]
      },

      // Equipment achievements
      {
        id: 'first_upgrade',
        name: 'First Upgrade',
        description: 'Purchase your first equipment upgrade',
        icon: '📦',
        rarity: 'common',
        category: 'equipment',
        points: 10,
        requirements: [
          {
            type: 'custom',
            value: 1,
            description: 'Own any non-starter equipment',
            customCheck: (player) => {
              const inventory = player.getInventory();
              const equipment = player.getEquipment();

              // Check for any equipment other than starting items
              const hasUpgrade = Array.from(inventory.keys()).some(item =>
                item !== 'basic-laptop' && item !== 'basic-vj-software'
              ) || Object.values(equipment).some(item =>
                item && item !== 'basic-laptop' && item !== 'basic-vj-software'
              );

              return hasUpgrade;
            }
          }
        ],
        rewards: [
          { type: 'experience', value: 25 }
        ]
      },
      {
        id: 'gear_collector',
        name: 'Gear Collector',
        description: 'Own 10 different pieces of equipment',
        icon: '🎛️',
        rarity: 'uncommon',
        category: 'equipment',
        points: 25,
        requirements: [
          {
            type: 'custom',
            value: 10,
            description: 'Own 10 different equipment items',
            customCheck: (player) => {
              const inventory = player.getInventory();
              return inventory.size >= 10;
            }
          }
        ],
        rewards: [
          { type: 'experience', value: 100 },
          { type: 'reputation', value: 50 }
        ]
      },
      {
        id: 'high_end_setup',
        name: 'High-End Setup',
        description: 'Own a professional projector and workstation',
        icon: '💻',
        rarity: 'rare',
        category: 'equipment',
        points: 40,
        requirements: [
          {
            type: 'custom',
            value: 1,
            description: 'Own professional projector and workstation',
            customCheck: (player) => {
              const inventory = player.getInventory();
              const equipment = player.getEquipment();

              const hasProProjector = inventory.has('professional-projector') ||
                                     inventory.has('laser-projector') ||
                                     equipment.projector === 'professional-projector' ||
                                     equipment.projector === 'laser-projector';

              const hasWorkstation = inventory.has('workstation') ||
                                    inventory.has('custom-rig') ||
                                    equipment.computer === 'workstation' ||
                                    equipment.computer === 'custom-rig';

              return hasProProjector && hasWorkstation;
            }
          }
        ],
        rewards: [
          { type: 'experience', value: 200 },
          { type: 'reputation', value: 100 }
        ]
      },

      // Milestone achievements
      {
        id: 'level_10',
        name: 'Rising Star',
        description: 'Reach player level 10',
        icon: '⭐',
        rarity: 'uncommon',
        category: 'milestone',
        points: 20,
        requirements: [
          {
            type: 'custom',
            value: 10,
            description: 'Player level 10',
            customCheck: (player) => player.getStats().level >= 10
          }
        ],
        rewards: [
          { type: 'experience', value: 100 },
          { type: 'reputation', value: 50 }
        ]
      },
      {
        id: 'level_25',
        name: 'Experienced VJ',
        description: 'Reach player level 25',
        icon: '🌟',
        rarity: 'rare',
        category: 'milestone',
        points: 50,
        requirements: [
          {
            type: 'custom',
            value: 25,
            description: 'Player level 25',
            customCheck: (player) => player.getStats().level >= 25
          }
        ],
        rewards: [
          { type: 'experience', value: 250 },
          { type: 'reputation', value: 150 }
        ]
      },
      {
        id: 'reputation_1000',
        name: 'Well Known',
        description: 'Earn 1000 reputation',
        icon: '👑',
        rarity: 'uncommon',
        category: 'social',
        points: 25,
        requirements: [
          {
            type: 'reputation',
            value: 1000,
            description: '1000 reputation'
          }
        ],
        rewards: [
          { type: 'experience', value: 150 }
        ]
      },
      {
        id: 'reputation_5000',
        name: 'Famous VJ',
        description: 'Earn 5000 reputation',
        icon: '🏆',
        rarity: 'epic',
        category: 'social',
        points: 75,
        requirements: [
          {
            type: 'reputation',
            value: 5000,
            description: '5000 reputation'
          }
        ],
        rewards: [
          { type: 'experience', value: 400 },
          { type: 'unlock', unlockId: 'vip_access' }
        ]
      },

      // Secret achievements
      {
        id: 'secret_combo',
        name: 'Secret Combo',
        description: 'Discover a hidden feature',
        icon: '🔒',
        rarity: 'rare',
        category: 'secret',
        points: 30,
        hidden: true,
        requirements: [
          {
            type: 'custom',
            value: 1,
            description: 'Perform secret combination',
            customCheck: () => false // This would be triggered by specific game events
          }
        ],
        rewards: [
          { type: 'experience', value: 100 },
          { type: 'unlock', unlockId: 'secret_feature' }
        ]
      },

      // Red Rocks Level 4 Achievements
      {
        id: 'red_rocks_performer',
        name: 'Red Rocks Performer',
        description: 'Perform at the legendary Red Rocks Amphitheatre',
        icon: '🏔️',
        rarity: 'epic',
        category: 'milestone',
        points: 100,
        requirements: [
          {
            type: 'custom',
            value: 1,
            description: 'Complete Red Rocks Level 4',
            customCheck: (player) => player.hasUnlockedContent('red_rocks_completed')
          }
        ],
        rewards: [
          { type: 'experience', value: 500 },
          { type: 'reputation', value: 300 },
          { type: 'unlock', unlockId: 'red_rocks_performer_title' }
        ]
      },
      {
        id: 'red_rocks_legend',
        name: 'Red Rocks Legend',
        description: 'Achieve a perfect 90+ rating at Red Rocks Amphitheatre',
        icon: '⭐',
        rarity: 'legendary',
        category: 'milestone',
        points: 200,
        requirements: [
          {
            type: 'custom',
            value: 1,
            description: 'Score 90+ at Red Rocks',
            customCheck: (player) => player.hasUnlockedContent('red_rocks_legend_rating')
          }
        ],
        rewards: [
          { type: 'experience', value: 1000 },
          { type: 'reputation', value: 500 },
          { type: 'unlock', unlockId: 'red_rocks_legend_status' },
          { type: 'unlock', unlockId: 'legendary_vj_title' }
        ]
      },
      {
        id: 'visual_virtuoso',
        name: 'Visual Virtuoso',
        description: 'Master the art of visual performance with flawless execution',
        icon: '🎨',
        rarity: 'legendary',
        category: 'skill',
        points: 150,
        requirements: [
          {
            type: 'custom',
            value: 1,
            description: 'Perfect visual performance',
            customCheck: (player) => player.hasUnlockedContent('visual_virtuoso_performance')
          }
        ],
        rewards: [
          { type: 'experience', value: 750 },
          { type: 'reputation', value: 400 },
          { type: 'unlock', unlockId: 'virtuoso_effects_pack' }
        ]
      },
      {
        id: 'lightbrush_master',
        name: 'Lightbrush Master',
        description: 'Complete the ultimate VJ journey and become a true master',
        icon: '🏆',
        rarity: 'legendary',
        category: 'milestone',
        points: 250,
        requirements: [
          {
            type: 'custom',
            value: 1,
            description: 'Complete the VJ Career RPG',
            customCheck: (player) => player.hasUnlockedContent('game_completed')
          }
        ],
        rewards: [
          { type: 'experience', value: 1500 },
          { type: 'reputation', value: 750 },
          { type: 'unlock', unlockId: 'master_vj_certification' },
          { type: 'unlock', unlockId: 'post_game_content' }
        ]
      },
      {
        id: 'red_rocks_star',
        name: 'Red Rocks Star',
        description: 'Earn a 75+ rating at Red Rocks with great crowd reaction',
        icon: '🌟',
        rarity: 'rare',
        category: 'social',
        points: 75,
        requirements: [
          {
            type: 'custom',
            value: 1,
            description: 'Score 75+ at Red Rocks',
            customCheck: (player) => player.hasUnlockedContent('red_rocks_star_rating')
          }
        ],
        rewards: [
          { type: 'experience', value: 400 },
          { type: 'reputation', value: 250 },
          { type: 'unlock', unlockId: 'star_performer_perks' }
        ]
      },
      {
        id: 'crowd_favorite',
        name: 'Crowd Favorite',
        description: 'Get the crowd to their feet with outstanding energy',
        icon: '👏',
        rarity: 'rare',
        category: 'social',
        points: 60,
        requirements: [
          {
            type: 'custom',
            value: 1,
            description: 'Achieve high crowd energy',
            customCheck: (player) => player.hasUnlockedContent('crowd_favorite_energy')
          }
        ],
        rewards: [
          { type: 'experience', value: 300 },
          { type: 'reputation', value: 200 },
          { type: 'unlock', unlockId: 'crowd_interaction_tools' }
        ]
      },
      {
        id: 'technical_master',
        name: 'Technical Master',
        description: 'Handle equipment malfunctions with professional expertise',
        icon: '⚙️',
        rarity: 'rare',
        category: 'skill',
        points: 80,
        requirements: [
          {
            type: 'custom',
            value: 1,
            description: 'Successfully manage technical crises',
            customCheck: (player) => player.hasUnlockedContent('technical_crisis_master')
          }
        ],
        rewards: [
          { type: 'experience', value: 350 },
          { type: 'reputation', value: 175 },
          { type: 'unlock', unlockId: 'advanced_troubleshooting' }
        ]
      },
      {
        id: 'pyrotechnic_vj',
        name: 'Pyrotechnic VJ',
        description: 'Master the combination of fireworks and laser shows',
        icon: '🎆',
        rarity: 'epic',
        category: 'skill',
        points: 90,
        requirements: [
          {
            type: 'custom',
            value: 1,
            description: 'Execute perfect fireworks and laser finale',
            customCheck: (player) => player.hasUnlockedContent('pyrotechnic_finale_master')
          }
        ],
        rewards: [
          { type: 'experience', value: 450 },
          { type: 'reputation', value: 275 },
          { type: 'unlock', unlockId: 'pyrotechnic_effects_suite' }
        ]
      },
      {
        id: 'colorado_native',
        name: 'Colorado Native',
        description: 'Feel at home performing in the beautiful Colorado landscape',
        icon: '🏔️',
        rarity: 'uncommon',
        category: 'milestone',
        points: 40,
        requirements: [
          {
            type: 'custom',
            value: 1,
            description: 'Appreciate the Red Rocks environment',
            customCheck: (player) => player.hasUnlockedContent('colorado_appreciation')
          }
        ],
        rewards: [
          { type: 'experience', value: 200 },
          { type: 'reputation', value: 100 },
          { type: 'unlock', unlockId: 'colorado_themed_effects' }
        ]
      },
      {
        id: 'amphitheater_architect',
        name: 'Amphitheater Architect',
        description: 'Understand and master the unique acoustics and visuals of Red Rocks',
        icon: '🏛️',
        rarity: 'rare',
        category: 'skill',
        points: 70,
        requirements: [
          {
            type: 'custom',
            value: 1,
            description: 'Master amphitheater performance dynamics',
            customCheck: (player) => player.hasUnlockedContent('amphitheater_mastery')
          }
        ],
        rewards: [
          { type: 'experience', value: 325 },
          { type: 'reputation', value: 200 },
          { type: 'unlock', unlockId: 'architectural_lighting_tools' }
        ]
      },
      {
        id: 'led_wall_specialist',
        name: 'LED Wall Specialist',
        description: 'Master the massive LED display systems at Red Rocks',
        icon: '📺',
        rarity: 'rare',
        category: 'equipment',
        points: 65,
        requirements: [
          {
            type: 'custom',
            value: 1,
            description: 'Excel with professional LED wall systems',
            customCheck: (player) => player.hasUnlockedContent('led_wall_mastery')
          }
        ],
        rewards: [
          { type: 'experience', value: 300 },
          { type: 'reputation', value: 150 },
          { type: 'unlock', unlockId: 'advanced_led_controls' }
        ]
      },
      {
        id: 'beat_sync_master',
        name: 'Beat Sync Master',
        description: 'Perfect synchronization with music and crowd energy',
        icon: '🎵',
        rarity: 'epic',
        category: 'skill',
        points: 85,
        requirements: [
          {
            type: 'custom',
            value: 1,
            description: 'Achieve perfect beat synchronization',
            customCheck: (player) => player.hasUnlockedContent('beat_sync_perfection')
          }
        ],
        rewards: [
          { type: 'experience', value: 400 },
          { type: 'reputation', value: 225 },
          { type: 'unlock', unlockId: 'rhythm_visualization_tools' }
        ]
      },
      {
        id: 'standing_ovation',
        name: 'Standing Ovation',
        description: 'Receive a standing ovation from the entire Red Rocks crowd',
        icon: '👏',
        rarity: 'epic',
        category: 'social',
        points: 120,
        requirements: [
          {
            type: 'custom',
            value: 1,
            description: 'Earn standing ovation from full crowd',
            customCheck: (player) => player.hasUnlockedContent('standing_ovation_achieved')
          }
        ],
        rewards: [
          { type: 'experience', value: 600 },
          { type: 'reputation', value: 350 },
          { type: 'unlock', unlockId: 'ovation_memories' }
        ]
      },
      {
        id: 'phone_light_symphony',
        name: 'Phone Light Symphony',
        description: 'Create a magical moment with thousands of phone flashlights',
        icon: '📱',
        rarity: 'rare',
        category: 'social',
        points: 55,
        requirements: [
          {
            type: 'custom',
            value: 1,
            description: 'Activate crowd phone lights en masse',
            customCheck: (player) => player.hasUnlockedContent('phone_light_symphony')
          }
        ],
        rewards: [
          { type: 'experience', value: 275 },
          { type: 'reputation', value: 175 },
          { type: 'unlock', unlockId: 'crowd_interaction_mastery' }
        ]
      },
      {
        id: 'equipment_crisis_manager',
        name: 'Equipment Crisis Manager',
        description: 'Successfully handle multiple equipment failures during the show',
        icon: '🚨',
        rarity: 'rare',
        category: 'skill',
        points: 70,
        requirements: [
          {
            type: 'custom',
            value: 1,
            description: 'Manage multiple equipment crises',
            customCheck: (player) => player.hasUnlockedContent('crisis_management_expert')
          }
        ],
        rewards: [
          { type: 'experience', value: 350 },
          { type: 'reputation', value: 200 },
          { type: 'unlock', unlockId: 'emergency_protocols' }
        ]
      },
      {
        id: 'finale_creator',
        name: 'Finale Creator',
        description: 'Craft an unforgettable finale experience',
        icon: '🎭',
        rarity: 'epic',
        category: 'skill',
        points: 95,
        requirements: [
          {
            type: 'custom',
            value: 1,
            description: 'Create spectacular finale sequence',
            customCheck: (player) => player.hasUnlockedContent('finale_creator_mastery')
          }
        ],
        rewards: [
          { type: 'experience', value: 500 },
          { type: 'reputation', value: 300 },
          { type: 'unlock', unlockId: 'finale_composition_tools' }
        ]
      },
      {
        id: 'professional_review_excellence',
        name: 'Professional Review Excellence',
        description: 'Receive perfect 10/10 ratings from industry professionals',
        icon: '⭐',
        rarity: 'legendary',
        category: 'milestone',
        points: 180,
        requirements: [
          {
            type: 'custom',
            value: 1,
            description: 'Achieve perfect professional ratings',
            customCheck: (player) => player.hasUnlockedContent('perfect_professional_rating')
          }
        ],
        rewards: [
          { type: 'experience', value: 800 },
          { type: 'reputation', value: 500 },
          { type: 'unlock', unlockId: 'industry_recognition' }
        ]
      },
      {
        id: 'red_rocks_hall_of_fame',
        name: 'Red Rocks Hall of Fame',
        description: 'Join the legendary performers who have graced Red Rocks',
        icon: '🏛️',
        rarity: 'legendary',
        category: 'milestone',
        points: 300,
        hidden: true,
        requirements: [
          {
            type: 'custom',
            value: 1,
            description: 'Achieve legendary status at Red Rocks',
            customCheck: (player) => {
              return player.hasAchievement('red_rocks_legend') &&
                     player.hasAchievement('standing_ovation') &&
                     player.hasAchievement('professional_review_excellence') &&
                     player.getStats().reputation >= 10000;
            }
          }
        ],
        rewards: [
          { type: 'experience', value: 2000 },
          { type: 'reputation', value: 1000 },
          { type: 'unlock', unlockId: 'hall_of_fame_status' },
          { type: 'unlock', unlockId: 'eternal_recognition' }
        ]
      }
    ];

    achievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  // Achievement management
  public getAchievement(id: string): Achievement | undefined {
    return this.achievements.get(id);
  }

  public getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  public getVisibleAchievements(): Achievement[] {
    return this.getAllAchievements().filter(a => !a.hidden);
  }

  public getAchievementsByCategory(category: Achievement['category']): Achievement[] {
    return this.getAllAchievements().filter(a => a.category === category);
  }

  // Progress tracking
  public checkAchievements(player: Player): string[] {
    const newUnlocks: string[] = [];

    this.achievements.forEach((achievement, id) => {
      if (player.hasAchievement(id)) return; // Already unlocked

      let progress = 0;
      let maxProgress = 1;
      let completed = true;

      // Check all requirements
      for (const req of achievement.requirements) {
        const reqResult = this.checkRequirement(player, req);
        progress += reqResult.progress;
        maxProgress += reqResult.maxProgress;

        if (!reqResult.completed) {
          completed = false;
        }
      }

      // Update progress
      this.playerProgress.set(id, {
        achievementId: id,
        progress,
        maxProgress,
        completed,
        unlockedAt: completed ? new Date() : undefined
      });

      // Unlock if completed
      if (completed && player.unlockAchievement(id)) {
        newUnlocks.push(id);
        this.grantAchievementRewards(player, achievement);
      }
    });

    return newUnlocks;
  }

  private checkRequirement(player: Player, requirement: AchievementRequirement): {
    progress: number;
    maxProgress: number;
    completed: boolean;
  } {
    switch (requirement.type) {
      case 'skill_level':
        if (requirement.skill) {
          const currentLevel = player.getSkillLevel(requirement.skill);
          return {
            progress: Math.min(currentLevel, requirement.value),
            maxProgress: requirement.value,
            completed: currentLevel >= requirement.value
          };
        }
        break;

      case 'total_experience':
        const experience = player.getStats().experience;
        return {
          progress: Math.min(experience, requirement.value),
          maxProgress: requirement.value,
          completed: experience >= requirement.value
        };

      case 'reputation':
        const reputation = player.getStats().reputation;
        return {
          progress: Math.min(reputation, requirement.value),
          maxProgress: requirement.value,
          completed: reputation >= requirement.value
        };

      case 'equipment_owned':
        const inventory = player.getInventory();
        const totalItems = Array.from(inventory.values()).reduce((sum, count) => sum + count, 0);
        return {
          progress: Math.min(totalItems, requirement.value),
          maxProgress: requirement.value,
          completed: totalItems >= requirement.value
        };

      case 'custom':
        if (requirement.customCheck) {
          const completed = requirement.customCheck(player);
          return {
            progress: completed ? requirement.value : 0,
            maxProgress: requirement.value,
            completed
          };
        }
        break;
    }

    return { progress: 0, maxProgress: 1, completed: false };
  }

  private grantAchievementRewards(player: Player, achievement: Achievement): void {
    if (!achievement.rewards) return;

    achievement.rewards.forEach(reward => {
      switch (reward.type) {
        case 'experience':
          if (reward.value) {
            player.addExperience(reward.value);
          }
          break;

        case 'reputation':
          if (reward.value) {
            player.addReputation(reward.value);
          }
          break;

        case 'item':
          if (reward.itemId) {
            player.addToInventory(reward.itemId, 1);
          }
          break;

        case 'unlock':
          if (reward.unlockId) {
            player.unlockContent(reward.unlockId);
          }
          break;
      }
    });
  }

  // Progress queries
  public getAchievementProgress(achievementId: string): AchievementProgress | undefined {
    return this.playerProgress.get(achievementId);
  }

  public getAllProgress(): AchievementProgress[] {
    return Array.from(this.playerProgress.values());
  }

  public getCompletedAchievements(): AchievementProgress[] {
    return this.getAllProgress().filter(p => p.completed);
  }

  public getInProgressAchievements(): AchievementProgress[] {
    return this.getAllProgress().filter(p => !p.completed && p.progress > 0);
  }

  // Statistics
  public getAchievementStats(player: Player): {
    total: number;
    unlocked: number;
    totalPoints: number;
    earnedPoints: number;
    completionPercentage: number;
  } {
    const totalAchievements = this.achievements.size;
    const unlockedAchievements = player.getAchievements().size;

    const totalPoints = Array.from(this.achievements.values())
      .reduce((sum, a) => sum + a.points, 0);

    const earnedPoints = Array.from(player.getAchievements())
      .map(id => this.achievements.get(id)?.points || 0)
      .reduce((sum, points) => sum + points, 0);

    return {
      total: totalAchievements,
      unlocked: unlockedAchievements,
      totalPoints,
      earnedPoints,
      completionPercentage: (unlockedAchievements / totalAchievements) * 100
    };
  }

  public getRecentAchievements(player: Player, limit: number = 5): Achievement[] {
    const playerAchievements = Array.from(player.getAchievements());

    return playerAchievements
      .slice(-limit)
      .map(id => this.achievements.get(id))
      .filter(a => a !== undefined) as Achievement[];
  }

  // Special achievement triggers
  public triggerSecretAchievement(player: Player, secretId: string): boolean {
    const achievement = this.achievements.get(secretId);
    if (!achievement || !achievement.hidden) return false;

    if (player.unlockAchievement(secretId)) {
      this.grantAchievementRewards(player, achievement);
      return true;
    }

    return false;
  }

  // Achievement recommendations
  public getNearCompletionAchievements(player: Player, threshold: number = 0.7): Achievement[] {
    return Array.from(this.achievements.values())
      .filter(achievement => {
        if (player.hasAchievement(achievement.id)) return false;

        const progress = this.playerProgress.get(achievement.id);
        if (!progress) return false;

        const completionRatio = progress.progress / progress.maxProgress;
        return completionRatio >= threshold;
      })
      .sort((a, b) => {
        const progressA = this.playerProgress.get(a.id);
        const progressB = this.playerProgress.get(b.id);

        const ratioA = progressA ? progressA.progress / progressA.maxProgress : 0;
        const ratioB = progressB ? progressB.progress / progressB.maxProgress : 0;

        return ratioB - ratioA;
      });
  }
}