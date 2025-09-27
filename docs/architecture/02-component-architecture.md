# Component Architecture

## React Component Hierarchy

```mermaid
graph TD
    subgraph "Root Level"
        APP[App.tsx]
        MAIN[main.tsx]
        ROOT[createRoot]
    end

    subgraph "Core Providers"
        STRICT[StrictMode]
        MONITOR[MonitoringProvider]
        ERROR[ErrorBoundary]
        PERF[PerformanceProvider]
        GAME_PROV[GameProvider]
    end

    subgraph "Layout Components"
        CANVAS[Canvas - R3F]
        SCROLL[ScrollControls]
        SUSPENSE[Suspense]
        LOADER[Loader]
    end

    subgraph "3D Scene Components"
        MAIN_SCENE[MainScene]
        SACRED[SacredGeometry]
        MERKABA[Merkaba]
        FLOWER[FlowerOfLife]
        COMPOSITE[SacredGeometryComposite]
        SHOWCASE[ProjectShowcase3D]
        HERO3D[InteractiveHero3D]
        POST_FX[PostProcessingEffects]
    end

    subgraph "Game Components"
        VJ_GAME[VJCareerGame3D]
        GAME_WORLD[GameWorld]
        GAME_HUD[SimpleGameHUD]
        SKILL_TREE[SkillTree]
        INVENTORY[Inventory]
    end

    subgraph "Simulator Components"
        PROJ_SIM[ProjectionSimulator]
        BASIC_SIM[BasicProjectionSimulator]
        SURFACE3D[Surface3D]
        PROJ_CTRL[ProjectorControls]
        MAPPING[MappingTools]
        CONTENT_LIB[ContentLibrary]
        TUTORIAL[TutorialSystem]
        EXPORT[ExportPanel]
    end

    subgraph "UI Components"
        BUTTON[Button]
        LOADING[LoadingScreen]
        SIM_PREVIEW[SimulatorPreview]
        DEV_DASHBOARD[DevDashboardToggle]
    end

    subgraph "Optimization Components"
        LAZY3D[LazyLoader3D]
        CODE_SPLIT[CodeSplitting]
        RESOURCE_POOL[ResourcePooling]
    end

    subgraph "Page Components"
        HOME[Home]
        PORTFOLIO[Portfolio]
        ABOUT[About]
        SIMULATOR_PAGE[Simulator]
        GAME_PAGE[Game]
    end

    ROOT --> MAIN
    MAIN --> STRICT
    STRICT --> MONITOR
    MONITOR --> ERROR
    ERROR --> APP

    APP --> CANVAS
    CANVAS --> SUSPENSE
    SUSPENSE --> MAIN_SCENE
    CANVAS --> LOADER

    MAIN_SCENE --> SACRED
    MAIN_SCENE --> SHOWCASE
    MAIN_SCENE --> VJ_GAME
    MAIN_SCENE --> GAME_WORLD

    SACRED --> MERKABA
    SACRED --> FLOWER
    SACRED --> COMPOSITE

    VJ_GAME --> GAME_HUD
    VJ_GAME --> SKILL_TREE
    VJ_GAME --> INVENTORY

    PROJ_SIM --> BASIC_SIM
    PROJ_SIM --> SURFACE3D
    PROJ_SIM --> PROJ_CTRL
    PROJ_SIM --> MAPPING
    PROJ_SIM --> CONTENT_LIB
    PROJ_SIM --> TUTORIAL
    PROJ_SIM --> EXPORT

    APP --> PERF
    APP --> GAME_PROV

    MONITOR --> DEV_DASHBOARD

    LAZY3D --> CODE_SPLIT
    LAZY3D --> RESOURCE_POOL

    style APP fill:#e1f5fe
    style MONITOR fill:#f3e5f5
    style MAIN_SCENE fill:#e8f5e8
    style VJ_GAME fill:#fff3e0
    style PROJ_SIM fill:#fce4ec
```

## Component Categories

### 1. Provider Components
**Purpose**: Application-wide context and state management

- **MonitoringProvider**: Performance tracking and dev dashboard
- **PerformanceProvider**: Performance optimization context
- **GameProvider**: Game state and engine management
- **ErrorBoundary**: Error handling and recovery

```mermaid
graph LR
    subgraph "Provider Hierarchy"
        MONITOR[MonitoringProvider] --> ERROR[ErrorBoundary]
        ERROR --> PERF[PerformanceProvider]
        PERF --> GAME[GameProvider]
        GAME --> APP[App Component]
    end
```

### 2. 3D Scene Components
**Purpose**: WebGL rendering and 3D visualization

```mermaid
graph TD
    subgraph "3D Component Structure"
        CANVAS[Canvas - R3F Root]
        CANVAS --> SCENE[MainScene]
        SCENE --> GEOM[Sacred Geometry]
        SCENE --> LIGHTS[Lighting Setup]
        SCENE --> ENV[Environment]

        GEOM --> FLOWER[FlowerOfLife]
        GEOM --> MERKABA[Merkaba]
        GEOM --> COMPOSITE[SacredGeometryComposite]

        SCENE --> EFFECTS[Post Processing]
        EFFECTS --> BLOOM[Bloom Effect]
        EFFECTS --> DOF[Depth of Field]
        EFFECTS --> NOISE[Noise Effect]
    end
```

### 3. Game System Components
**Purpose**: Interactive game mechanics and UI

```mermaid
graph TD
    subgraph "Game Architecture"
        VJ[VJCareerGame3D]
        VJ --> ENGINE[Game Engine]
        VJ --> HUD[SimpleGameHUD]
        VJ --> WORLD[Game World]

        ENGINE --> AUDIO[Audio Manager]
        ENGINE --> PHYSICS[Physics System]
        ENGINE --> ENTITIES[Entity System]

        HUD --> STATS[Player Stats]
        HUD --> CONTROLS[Game Controls]
        HUD --> NOTIFICATIONS[Notifications]
    end
```

### 4. Simulator Components
**Purpose**: Projection mapping simulation and tools

```mermaid
graph TD
    subgraph "Simulator System"
        SIM[ProjectionSimulator]
        SIM --> BASIC[BasicProjectionSimulator]
        SIM --> SURFACE[Surface3D]
        SIM --> CONTROLS[ProjectorControls]

        SIM --> TOOLS[MappingTools]
        TOOLS --> CALIBRATE[Calibration]
        TOOLS --> GEOMETRY_EDIT[Geometry Editor]
        TOOLS --> TEXTURE_MAP[Texture Mapping]

        SIM --> CONTENT[ContentLibrary]
        CONTENT --> VIDEOS[Video Library]
        CONTENT --> IMAGES[Image Library]
        CONTENT --> EFFECTS_LIB[Effects Library]
    end
```

## Component Interaction Patterns

### 1. Data Flow Pattern
```mermaid
sequenceDiagram
    participant User
    participant UI
    participant Store
    participant Engine
    participant Canvas

    User->>UI: User Interaction
    UI->>Store: Update State
    Store->>Engine: Engine Update
    Engine->>Canvas: Render Update
    Canvas->>User: Visual Feedback
```

### 2. Error Handling Pattern
```mermaid
graph TD
    ERROR[ErrorBoundary] --> CATCH[Catch Errors]
    CATCH --> LOG[Log Error]
    CATCH --> FALLBACK[Show Fallback UI]
    CATCH --> REPORT[Report to Monitoring]

    REPORT --> RECOVERY[Recovery Options]
    RECOVERY --> RELOAD[Reload Component]
    RECOVERY --> RESET[Reset State]
    RECOVERY --> REDIRECT[Redirect User]
```

### 3. Performance Optimization Pattern
```mermaid
graph TD
    PERF[PerformanceProvider] --> MONITOR[Monitor Metrics]
    MONITOR --> LAZY[Lazy Loading]
    MONITOR --> SPLIT[Code Splitting]
    MONITOR --> POOL[Resource Pooling]

    LAZY --> COMPONENTS[Lazy Components]
    SPLIT --> CHUNKS[Dynamic Chunks]
    POOL --> REUSE[Object Reuse]
```

## Component Responsibilities

### Core Components

| Component | Primary Responsibility | Secondary Responsibilities |
|-----------|----------------------|---------------------------|
| App.tsx | Application root and routing | Canvas setup, layout structure |
| MainScene | 3D scene orchestration | Lighting, environment, cameras |
| MonitoringProvider | Performance tracking | Development tools, debugging |
| ErrorBoundary | Error capture and recovery | User feedback, error reporting |

### 3D Rendering Components

| Component | Purpose | Dependencies |
|-----------|---------|--------------|
| SacredGeometry | Mathematical 3D forms | Three.js, R3F |
| ProjectShowcase3D | Portfolio display | Drei, animations |
| PostProcessingEffects | Visual enhancement | EffectComposer, passes |
| InteractiveHero3D | Hero section 3D | User interaction, physics |

### Game Components

| Component | Purpose | State Dependencies |
|-----------|---------|-------------------|
| VJCareerGame3D | Main game logic | GameStore, PlayerStore |
| SimpleGameHUD | Game interface | Player stats, notifications |
| SkillTree | Character progression | Player experience, skills |
| Inventory | Item management | Player inventory, equipment |

### Utility Components

| Component | Purpose | Usage Pattern |
|-----------|---------|---------------|
| LazyLoader3D | Performance optimization | Async component loading |
| CodeSplitting | Bundle optimization | Dynamic imports |
| Button | Reusable UI element | Consistent styling, interactions |
| LoadingScreen | User feedback | Async operations, transitions |

## Component Communication

### 1. Props Down Pattern
- Parent components pass data via props
- Unidirectional data flow
- Type-safe interfaces

### 2. Context Up Pattern
- Global state via React Context
- Provider pattern for shared state
- Selective subscriptions

### 3. Event Delegation
- Custom events for component communication
- Game engine event system
- Performance monitoring events

## Scalability Considerations

### 1. Component Splitting
- Feature-based component organization
- Lazy loading for large components
- Dynamic imports for performance

### 2. State Management
- Modular store structure
- Selectors for efficient subscriptions
- Computed values for derived state

### 3. Type Safety
- Strict TypeScript interfaces
- Component prop validation
- Generic components for reusability