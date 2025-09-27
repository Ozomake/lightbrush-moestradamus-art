import { Level, type LevelConfig, type GameObject, type Trigger } from './Level';
import { InputManager } from '../engine/InputManager';
import { usePlayerStore } from '../../store/playerStore';
import { useGameStore } from '../../store/gameStore';

export class HomeLevel extends Level {
  constructor() {
    const config: LevelConfig = {
      id: 'home',
      name: 'Your VJ Studio',
      description: 'Your personal creative space where your VJ journey begins',
      backgroundMusic: 'home_ambient',
      ambientSounds: ['computer_hum', 'fan_noise'],
      requiredLevel: 1
    };

    super(config);
  }

  protected initializeLevel(): void {
    // Set up the home studio environment
    this.setupStudioObjects();
    this.setupInteractionTriggers();
    this.setupTutorialTriggers();

    console.log('Home level initialized - Welcome to your VJ studio!');
  }

  protected updateLevel(deltaTime: number): void {
    // Update level-specific logic
    this.updateStudioLights(deltaTime);
    this.updateComputerScreen(deltaTime);

    // Check for tutorial conditions
    this.checkTutorialConditions();
  }

  protected renderLevel(ctx: CanvasRenderingContext2D): void {
    // Render the studio environment
    this.renderStudioBackground(ctx);
    this.renderFurniture(ctx);
    this.renderEquipment(ctx);
    this.renderLighting(ctx);
  }

  protected handleLevelInput(inputManager: InputManager): void {
    const movement = inputManager.getMovementInput();
    const actions = inputManager.getActionInputs();

    // Handle player movement
    if (movement.x !== 0 || movement.y !== 0) {
      this.movePlayer(movement.x * 200, movement.y * 200); // 200 pixels per second
    }

    // Handle interactions
    if (actions.interact) {
      this.handleInteraction();
    }
  }

  private setupStudioObjects(): void {
    // Computer setup
    this.addGameObject({
      id: 'main_computer',
      x: 300,
      y: 200,
      width: 100,
      height: 80,
      type: 'interactive',
      data: {
        name: 'Gaming Computer',
        description: 'Your main VJ setup computer',
        interactionType: 'computer'
      }
    });

    // Projector mount
    this.addGameObject({
      id: 'projector_mount',
      x: 200,
      y: 100,
      width: 60,
      height: 40,
      type: 'interactive',
      data: {
        name: 'Projector Mount',
        description: 'Mount for your VJ projector',
        interactionType: 'projector_setup'
      }
    });

    // Practice wall
    this.addGameObject({
      id: 'practice_wall',
      x: 50,
      y: 50,
      width: 400,
      height: 20,
      type: 'interactive',
      data: {
        name: 'Practice Wall',
        description: 'Your projection surface for practice',
        interactionType: 'projection_wall'
      }
    });

    // Bookshelf with VJ resources
    this.addGameObject({
      id: 'bookshelf',
      x: 450,
      y: 150,
      width: 80,
      height: 120,
      type: 'interactive',
      data: {
        name: 'VJ Resource Library',
        description: 'Books and guides about VJ techniques',
        interactionType: 'learning_resource'
      }
    });

    // Music equipment
    this.addGameObject({
      id: 'audio_interface',
      x: 350,
      y: 300,
      width: 60,
      height: 40,
      type: 'interactive',
      data: {
        name: 'Audio Interface',
        description: 'Connect your audio sources',
        interactionType: 'audio_setup'
      }
    });

    // Storage boxes
    this.addGameObject({
      id: 'equipment_storage',
      x: 500,
      y: 300,
      width: 80,
      height: 60,
      type: 'interactive',
      data: {
        name: 'Equipment Storage',
        description: 'Store your VJ equipment here',
        interactionType: 'storage'
      }
    });

    // Door to outside (transition)
    this.addGameObject({
      id: 'exit_door',
      x: 600,
      y: 180,
      width: 20,
      height: 80,
      type: 'interactive',
      data: {
        name: 'Exit',
        description: 'Go outside to explore the VJ world',
        interactionType: 'door'
      }
    });
  }

  private setupInteractionTriggers(): void {
    // Computer interaction
    this.addTrigger({
      id: 'computer_trigger',
      x: 295,
      y: 195,
      width: 110,
      height: 90,
      action: 'dialog',
      data: {
        character: 'System',
        text: 'Your VJ workstation is ready! This is where you\'ll create your visual art. Would you like to learn the basics?',
        options: [
          { text: 'Yes, teach me the basics!', action: 'start_basic_tutorial' },
          { text: 'I\'ll figure it out myself', action: 'close' },
          { text: 'Show me the software', action: 'open_software' }
        ]
      }
    });

    // Projector interaction
    this.addTrigger({
      id: 'projector_trigger',
      x: 195,
      y: 95,
      width: 70,
      height: 50,
      action: 'dialog',
      data: {
        character: 'System',
        text: 'This is your projector mount. You\'ll need to buy a projector to start creating immersive visuals.',
        options: [
          { text: 'How do I get a projector?', action: 'equipment_info' },
          { text: 'Open equipment shop', action: 'shop' },
          { text: 'Maybe later', action: 'close' }
        ]
      },
      condition: () => {
        const player = usePlayerStore.getState().player;
        return !player.getEquipment().projector;
      }
    });

    // Learning resource trigger
    this.addTrigger({
      id: 'learning_trigger',
      x: 445,
      y: 145,
      width: 90,
      height: 130,
      action: 'dialog',
      data: {
        character: 'VJ Guide',
        text: 'Welcome to the world of VJing! These resources will help you learn. What interests you most?',
        options: [
          { text: 'Color Theory', action: 'learn_color_theory' },
          { text: 'Technical Setup', action: 'learn_technical' },
          { text: 'Performance Tips', action: 'learn_performance' },
          { text: 'I\'ll explore on my own', action: 'close' }
        ]
      }
    });

    // First time tutorial trigger
    this.addTrigger({
      id: 'welcome_trigger',
      x: 250,
      y: 250,
      width: 100,
      height: 100,
      action: 'dialog',
      data: {
        character: 'VJ Mentor',
        text: 'Welcome to your VJ studio! This is where your journey begins. I\'m here to help you become an amazing visual artist.',
        options: [
          { text: 'Let\'s get started!', action: 'start_welcome_tutorial' },
          { text: 'I want to explore first', action: 'close' }
        ]
      },
      condition: () => {
        const player = usePlayerStore.getState().player;
        return !player.hasUnlockedContent('welcome_tutorial_completed');
      }
    });
  }

  private setupTutorialTriggers(): void {
    // Skills tutorial trigger
    this.addTrigger({
      id: 'skills_tutorial_trigger',
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      action: 'dialog',
      data: {
        character: 'VJ Mentor',
        text: 'I notice you haven\'t opened your skill tree yet. Press K to see your abilities and plan your growth!',
        options: [
          { text: 'Show me my skills', action: 'open_skills' },
          { text: 'I\'ll check it later', action: 'close' }
        ]
      },
      condition: () => {
        const player = usePlayerStore.getState().player;
        return player.getStats().level >= 2 && !player.hasUnlockedContent('skills_tutorial_seen');
      }
    });
  }

  private movePlayer(dx: number, dy: number): void {
    const deltaTime = 1/60; // Assume 60 FPS for movement calculation
    const player = usePlayerStore.getState().player;
    const currentPos = player.getPosition();

    // Simple bounds checking for the studio
    const newX = Math.max(0, Math.min(650, currentPos.x + (dx * deltaTime)));
    const newY = Math.max(0, Math.min(400, currentPos.y + (dy * deltaTime)));

    player.setPosition(newX, newY);
  }

  private handleInteraction(): void {
    const player = usePlayerStore.getState().player;
    const playerPos = player.getPosition();

    // Check for nearby interactive objects
    const nearbyObjects = this.getGameObjectsInArea(
      playerPos.x - 50,
      playerPos.y - 50,
      100,
      100
    );

    const interactiveObject = nearbyObjects.find(obj => obj.type === 'interactive');

    if (interactiveObject) {
      this.interactWithObject(interactiveObject);
    }
  }

  private interactWithObject(obj: GameObject): void {
    const gameStore = useGameStore.getState();
    const playerStore = usePlayerStore.getState();

    switch (obj.data?.interactionType) {
      case 'computer':
        gameStore.showDialog(
          'Computer',
          'Your VJ workstation is humming with creative potential. What would you like to do?',
          [
            { text: 'Practice mapping', action: 'start_mapping_practice' },
            { text: 'Create new project', action: 'create_project' },
            { text: 'Review tutorials', action: 'open_tutorials' },
            { text: 'Check system specs', action: 'system_info' }
          ]
        );
        break;

      case 'projector_setup':
        if (playerStore.player.getEquipment().projector) {
          gameStore.showDialog(
            'Projector',
            'Your projector is mounted and ready! The practice wall awaits your creative vision.',
            [
              { text: 'Start projection test', action: 'test_projection' },
              { text: 'Adjust settings', action: 'projector_settings' }
            ]
          );
        } else {
          gameStore.showDialog(
            'Empty Mount',
            'You need a projector to start creating visuals. Visit the equipment shop to get started!',
            [
              { text: 'Open shop', action: 'shop' },
              { text: 'Maybe later', action: 'close' }
            ]
          );
        }
        break;

      case 'learning_resource':
        gameStore.showDialog(
          'VJ Library',
          'Your collection of VJ resources is growing! What would you like to study?',
          [
            { text: 'Visual Composition', action: 'study_composition' },
            { text: 'Technical Skills', action: 'study_technical' },
            { text: 'Industry Insights', action: 'study_industry' },
            { text: 'Browse freely', action: 'free_browse' }
          ]
        );
        break;

      case 'storage':
        gameStore.showInventoryModal();
        break;

      case 'door':
        if (playerStore.player.getStats().level >= 3) {
          gameStore.showDialog(
            'Exit',
            'Ready to explore the VJ world? There are venues, other artists, and opportunities waiting!',
            [
              { text: 'Let\'s go exploring!', action: 'transition_world_map' },
              { text: 'I need more practice first', action: 'close' }
            ]
          );
        } else {
          gameStore.showDialog(
            'Locked Door',
            'You should gain more experience before venturing out. Practice your skills first!',
            [
              { text: 'How do I gain experience?', action: 'explain_experience' },
              { text: 'I\'ll keep practicing', action: 'close' }
            ]
          );
        }
        break;
    }
  }

  private renderStudioBackground(ctx: CanvasRenderingContext2D): void {
    // Floor
    ctx.fillStyle = '#2d2d3d';
    ctx.fillRect(0, 0, 700, 450);

    // Floor pattern
    ctx.strokeStyle = '#3d3d4d';
    ctx.lineWidth = 1;
    for (let x = 0; x < 700; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 450);
      ctx.stroke();
    }
    for (let y = 0; y < 450; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(700, y);
      ctx.stroke();
    }

    // Walls
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 700, 20); // Top wall
    ctx.fillRect(0, 0, 20, 450); // Left wall
    ctx.fillRect(680, 0, 20, 450); // Right wall
    ctx.fillRect(0, 430, 700, 20); // Bottom wall
  }

  private renderFurniture(ctx: CanvasRenderingContext2D): void {
    // Desk
    ctx.fillStyle = '#8b5a3c';
    ctx.fillRect(280, 280, 150, 80);

    // Chair
    ctx.fillStyle = '#4a5d23';
    ctx.fillRect(320, 320, 40, 40);

    // Window
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(600, 80, 80, 60);
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 3;
    ctx.strokeRect(600, 80, 80, 60);
    ctx.strokeRect(640, 80, 0, 60);
  }

  private renderEquipment(ctx: CanvasRenderingContext2D): void {
    const player = usePlayerStore.getState().player;
    const equipment = player.getEquipment();

    // Render equipped items in the scene
    if (equipment.computer) {
      ctx.fillStyle = '#333';
      ctx.fillRect(300, 200, 100, 80);
      ctx.fillStyle = '#000';
      ctx.fillRect(310, 210, 80, 50); // Screen
      if (equipment.computer !== 'basic-laptop') {
        // Better computers have RGB lighting
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(300, 275, 100, 5);
      }
    }

    if (equipment.projector) {
      ctx.fillStyle = '#555';
      ctx.fillRect(200, 100, 60, 40);
      // Projection beam
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 20;
      ctx.beginPath();
      ctx.moveTo(230, 120);
      ctx.lineTo(250, 60);
      ctx.stroke();
    }

    if (equipment.controller) {
      ctx.fillStyle = '#222';
      ctx.fillRect(320, 260, 60, 20);
      // Control knobs
      ctx.fillStyle = '#666';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(330 + i * 15, 270, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private renderLighting(ctx: CanvasRenderingContext2D): void {
    // Ambient lighting
    const gradient = ctx.createRadialGradient(350, 200, 0, 350, 200, 300);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 700, 450);

    // Computer glow
    const player = usePlayerStore.getState().player;
    if (player.getEquipment().computer) {
      const computerGlow = ctx.createRadialGradient(350, 240, 0, 350, 240, 100);
      computerGlow.addColorStop(0, 'rgba(100, 150, 255, 0.2)');
      computerGlow.addColorStop(1, 'rgba(100, 150, 255, 0)');
      ctx.fillStyle = computerGlow;
      ctx.fillRect(250, 150, 200, 180);
    }
  }

  private updateStudioLights(deltaTime: number): void {
    // Animate the lighting based on time or music
    // This could sync with background music beats
  }

  private updateComputerScreen(deltaTime: number): void {
    // Animate the computer screen with VJ software interface
    // Could show different states based on player actions
  }

  private checkTutorialConditions(): void {
    const player = usePlayerStore.getState().player;
    const stats = player.getStats();

    // Trigger skill tutorial when player reaches level 2
    if (stats.level >= 2 && !player.hasUnlockedContent('skills_tutorial_seen')) {
      setTimeout(() => {
        useGameStore.getState().addNotification({
          type: 'info',
          title: 'New Feature Unlocked!',
          message: 'Press K to open your Skill Tree and see how to improve your VJ abilities!'
        });
        player.unlockContent('skills_tutorial_seen');
      }, 2000);
    }

    // Equipment tutorial when player has some reputation
    if (stats.reputation >= 100 && !player.hasUnlockedContent('equipment_tutorial_seen')) {
      setTimeout(() => {
        useGameStore.getState().addNotification({
          type: 'info',
          title: 'Shop Available!',
          message: 'You can now afford basic equipment. Press I to open inventory and visit the shop!'
        });
        player.unlockContent('equipment_tutorial_seen');
      }, 1000);
    }
  }

  protected onFirstVisit(): void {
    // Welcome the player to their studio
    setTimeout(() => {
      useGameStore.getState().showDialog(
        'VJ Mentor',
        'Welcome to your personal VJ studio! This is where your creative journey begins. Take your time to explore and get familiar with your equipment.',
        [
          { text: 'Thanks for the tour!', action: 'close' },
          { text: 'How do I get started?', action: 'basic_tutorial' }
        ]
      );
    }, 1000);
  }

  protected onLevelEnter(): void {
    // Play appropriate music and set mood
    console.log('Entering cozy VJ studio...');

    // Check for any pending achievements or level-ups
    const playerStore = usePlayerStore.getState();
    playerStore.checkAchievements();
  }
}