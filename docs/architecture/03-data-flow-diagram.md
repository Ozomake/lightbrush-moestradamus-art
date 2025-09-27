# Data Flow Architecture

## State Management Overview

```mermaid
graph TB
    subgraph "Application State"
        ZUSTAND[Zustand Store]
        GAME_STORE[Game Store]
        PLAYER_STORE[Player Store]
    end

    subgraph "UI Components"
        UI_COMP[UI Components]
        GAME_UI[Game UI]
        SETTINGS[Settings UI]
        HUD[Game HUD]
    end

    subgraph "Game Engine"
        ENGINE[Game Engine]
        AUDIO[Audio Manager]
        PHYSICS[Physics System]
        ENTITIES[Entity System]
    end

    subgraph "External Systems"
        LOCAL_STORAGE[Local Storage]
        MONITORING[Performance Monitor]
        BROWSER_API[Browser APIs]
    end

    subgraph "3D Rendering"
        R3F[React Three Fiber]
        THREE_JS[Three.js Scene]
        SHADERS[Shader System]
    end

    UI_COMP --> ZUSTAND
    GAME_UI --> GAME_STORE
    SETTINGS --> GAME_STORE
    HUD --> GAME_STORE

    ZUSTAND --> GAME_STORE
    ZUSTAND --> PLAYER_STORE

    GAME_STORE --> ENGINE
    ENGINE --> AUDIO
    ENGINE --> PHYSICS
    ENGINE --> ENTITIES

    GAME_STORE --> LOCAL_STORAGE
    GAME_STORE --> MONITORING

    ENGINE --> R3F
    R3F --> THREE_JS
    THREE_JS --> SHADERS

    MONITORING --> BROWSER_API

    style ZUSTAND fill:#e8f5e8
    style ENGINE fill:#fff3e0
    style R3F fill:#f3e5f5
    style MONITORING fill:#fce4ec
```

## Zustand Store Architecture

```mermaid
graph TD
    subgraph "GameStore State Slices"
        GAME_STATE[Game Engine State]
        UI_STATE[UI State]
        DIALOG[Dialog System]
        NOTIFY[Notification System]
        LOADING[Loading State]
        VJ_CAREER[VJ Career Game]
        SETTINGS[Game Settings]
    end

    subgraph "Game Engine State"
        INIT[isInitialized]
        RUNNING[isRunning]
        PAUSED[isPaused]
        SCENE[currentScene]
    end

    subgraph "UI State"
        HUD_SHOW[showHUD]
        MENU[showMenu]
        INVENTORY[showInventory]
        SKILLS[showSkillTree]
        ACHIEVEMENTS[showAchievements]
        SETTINGS_UI[showSettings]
    end

    subgraph "VJ Career State"
        PLAYER_DATA[Player Stats]
        VENUE[Current Venue]
        PERFORMING[Performance State]
    end

    subgraph "Settings State"
        GRAPHICS[Graphics Settings]
        AUDIO_SETTINGS[Audio Settings]
        CONTROLS[Control Settings]
        ACCESSIBILITY[Accessibility]
    end

    GAME_STATE --> INIT
    GAME_STATE --> RUNNING
    GAME_STATE --> PAUSED
    GAME_STATE --> SCENE

    UI_STATE --> HUD_SHOW
    UI_STATE --> MENU
    UI_STATE --> INVENTORY
    UI_STATE --> SKILLS
    UI_STATE --> ACHIEVEMENTS
    UI_STATE --> SETTINGS_UI

    VJ_CAREER --> PLAYER_DATA
    VJ_CAREER --> VENUE
    VJ_CAREER --> PERFORMING

    SETTINGS --> GRAPHICS
    SETTINGS --> AUDIO_SETTINGS
    SETTINGS --> CONTROLS
    SETTINGS --> ACCESSIBILITY
```

## Data Flow Patterns

### 1. Unidirectional Data Flow
```mermaid
sequenceDiagram
    participant User
    participant Component
    participant Store
    participant Engine
    participant Render

    User->>Component: User Action
    Component->>Store: Dispatch Action
    Store->>Store: Update State
    Store->>Engine: Notify Subscribers
    Engine->>Render: Update Visuals
    Render->>User: Visual Feedback
```

### 2. State Subscription Pattern
```mermaid
graph LR
    subgraph "Zustand Selectors"
        GAME_ENGINE[useGameEngine]
        GAME_UI[useGameUI]
        GAME_DIALOG[useGameDialog]
        GAME_NOTIFY[useGameNotifications]
        GAME_SETTINGS[useGameSettings]
        VJ_CAREER[useVJCareerGame]
    end

    subgraph "Components"
        ENGINE_COMP[Engine Components]
        UI_COMP[UI Components]
        DIALOG_COMP[Dialog Components]
        NOTIFY_COMP[Notification Components]
        SETTINGS_COMP[Settings Components]
        CAREER_COMP[VJ Career Components]
    end

    GAME_ENGINE --> ENGINE_COMP
    GAME_UI --> UI_COMP
    GAME_DIALOG --> DIALOG_COMP
    GAME_NOTIFY --> NOTIFY_COMP
    GAME_SETTINGS --> SETTINGS_COMP
    VJ_CAREER --> CAREER_COMP
```

### 3. State Persistence Flow
```mermaid
graph TD
    SETTINGS_CHANGE[Settings Change] --> UPDATE_STORE[Update Store]
    UPDATE_STORE --> SAVE_LOCAL[Save to LocalStorage]

    APP_INIT[App Initialize] --> LOAD_LOCAL[Load from LocalStorage]
    LOAD_LOCAL --> RESTORE_STORE[Restore Store State]

    ENGINE_INIT[Engine Initialize] --> APPLY_SETTINGS[Apply Settings]
    APPLY_SETTINGS --> AUDIO_CONFIG[Configure Audio]
    APPLY_SETTINGS --> GRAPHICS_CONFIG[Configure Graphics]
    APPLY_SETTINGS --> CONTROL_CONFIG[Configure Controls]
```

## State Management Details

### Game Store State Interface
```typescript
interface GameState {
  // Engine State
  isInitialized: boolean
  isRunning: boolean
  isPaused: boolean
  currentScene: string | null

  // UI State
  showHUD: boolean
  showMenu: boolean
  showInventory: boolean
  showSkillTree: boolean
  showAchievements: boolean
  showSettings: boolean

  // Dialog System
  currentDialog: DialogData | null

  // Notifications
  notifications: NotificationData[]

  // Loading State
  loading: {
    isLoading: boolean
    loadingText: string
    progress: number
  }

  // VJ Career Game
  vjCareerGame: VJCareerState

  // Settings
  settings: GameSettings
}
```

### State Update Patterns

#### 1. Synchronous Updates
```mermaid
graph LR
    ACTION[User Action] --> SETTER[State Setter]
    SETTER --> UPDATE[Immediate Update]
    UPDATE --> RERENDER[Component Re-render]
```

#### 2. Asynchronous Updates with Side Effects
```mermaid
graph TD
    ACTION[Async Action] --> LOADING[Set Loading State]
    LOADING --> OPERATION[Perform Operation]
    OPERATION --> SUCCESS{Success?}
    SUCCESS -->|Yes| UPDATE[Update State]
    SUCCESS -->|No| ERROR[Set Error State]
    UPDATE --> NOTIFY[Add Notification]
    ERROR --> NOTIFY
    NOTIFY --> CLEANUP[Clear Loading]
```

#### 3. Computed State Pattern
```mermaid
graph TD
    BASE_STATE[Base State] --> SELECTOR[Zustand Selector]
    SELECTOR --> COMPUTE[Compute Derived Values]
    COMPUTE --> MEMOIZE[Memoize Result]
    MEMOIZE --> COMPONENT[Component Consumption]
```

## State Synchronization

### 1. Engine-Store Synchronization
```mermaid
sequenceDiagram
    participant Store
    participant Engine
    participant AudioManager
    participant Scene

    Store->>Engine: Initialize Game
    Engine->>AudioManager: Setup Audio
    Engine->>Scene: Load Scene
    Engine->>Store: Update Status
    Store->>Store: Set Initialized
```

### 2. Settings Synchronization
```mermaid
sequenceDiagram
    participant UI
    participant Store
    participant Engine
    participant LocalStorage

    UI->>Store: Update Audio Settings
    Store->>Engine: Apply to Audio Manager
    Store->>LocalStorage: Persist Settings
    Engine->>Store: Confirm Applied
    Store->>UI: Update Complete
```

### 3. Game Progress Synchronization
```mermaid
sequenceDiagram
    participant GameWorld
    participant Store
    participant Player
    participant UI

    GameWorld->>Store: Add Experience
    Store->>Store: Calculate Level
    Store->>Player: Update Player Data
    Store->>UI: Trigger Notification
    UI->>UI: Show Level Up
```

## Performance Optimization

### 1. Selective Subscriptions
```mermaid
graph TD
    STORE[Zustand Store] --> SELECTOR1[UI Selector]
    STORE --> SELECTOR2[Game Selector]
    STORE --> SELECTOR3[Settings Selector]

    SELECTOR1 --> UI_COMP[UI Components]
    SELECTOR2 --> GAME_COMP[Game Components]
    SELECTOR3 --> SETTINGS_COMP[Settings Components]

    note1[Only re-render when<br/>UI state changes]
    note2[Only re-render when<br/>game state changes]
    note3[Only re-render when<br/>settings change]

    SELECTOR1 -.-> note1
    SELECTOR2 -.-> note2
    SELECTOR3 -.-> note3
```

### 2. State Batching
```mermaid
graph LR
    MULTIPLE[Multiple Updates] --> BATCH[Batch Updates]
    BATCH --> SINGLE[Single Re-render]
    SINGLE --> COMPONENT[Component Update]
```

### 3. Middleware Integration
```mermaid
graph TD
    ACTION[Store Action] --> MIDDLEWARE[subscribeWithSelector]
    MIDDLEWARE --> SELECTOR[State Selector]
    SELECTOR --> COMPONENT[Component Update]

    MIDDLEWARE --> PERSIST[Persistence Middleware]
    PERSIST --> STORAGE[Local Storage]

    MIDDLEWARE --> DEVTOOLS[DevTools Middleware]
    DEVTOOLS --> DEBUG[Debug Interface]
```

## Error Handling in State

### 1. Error State Management
```mermaid
graph TD
    ERROR[Error Occurs] --> CATCH[Error Boundary]
    CATCH --> STORE[Update Error State]
    STORE --> NOTIFY[Add Error Notification]
    STORE --> FALLBACK[Show Fallback UI]

    NOTIFY --> AUTO_CLEAR[Auto Clear Timer]
    AUTO_CLEAR --> REMOVE[Remove Notification]
```

### 2. Recovery Mechanisms
```mermaid
graph TD
    ERROR_STATE[Error State] --> RETRY[Retry Action]
    ERROR_STATE --> RESET[Reset State]
    ERROR_STATE --> RELOAD[Reload Component]

    RETRY --> SUCCESS{Success?}
    SUCCESS -->|Yes| CLEAR[Clear Error]
    SUCCESS -->|No| ESCALATE[Escalate Error]
```

## Integration Points

### 1. Three.js Integration
- State drives 3D scene updates
- Performance monitoring for frame rates
- Settings control rendering quality

### 2. Audio System Integration
- Volume controls from settings state
- Game events trigger audio feedback
- Mute state affects all audio output

### 3. Local Storage Integration
- Automatic settings persistence
- Game progress saving
- Error state recovery

### 4. Performance Monitoring Integration
- State changes tracked for performance
- Store subscription metrics
- Memory usage monitoring