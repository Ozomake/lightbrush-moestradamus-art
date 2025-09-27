# Components API Documentation

This document provides comprehensive documentation for React components used in the LightBrush Website project.

## Table of Contents

- [3D Components](#3d-components)
- [UI Components](#ui-components)
- [Game Components](#game-components)
- [Simulator Components](#simulator-components)
- [Layout Components](#layout-components)
- [Provider Components](#provider-components)
- [Optimization Components](#optimization-components)

---

## 3D Components

### InteractiveHero3D

An immersive 3D hero section with floating orbs, particle effects, and interactive controls.

#### Props

```typescript
interface InteractiveHero3DProps {
  // No props - component is self-contained
}
```

#### Features

- **Floating Orbs**: Multiple animated orbs with distortion materials and trails
- **Particle Field**: Dynamic particle system with color variations
- **Projection Effect**: Simulated projection mapping display
- **Premium Effects**: Stars, sparkles, and atmospheric lighting
- **Interactive Controls**: Orbit controls for user interaction

#### Usage

```tsx
import InteractiveHero3D from '../components/3d/InteractiveHero3D';

function HomePage() {
  return (
    <div className="relative">
      <InteractiveHero3D />
      <div className="relative z-10">
        {/* Other content */}
      </div>
    </div>
  );
}
```

#### Performance Considerations

- Uses React Three Fiber for optimal rendering
- Implements Suspense for progressive loading
- Memoized computations prevent unnecessary re-renders
- High-performance WebGL rendering

### ProjectShowcase3D

3D showcase component for displaying project portfolios with interactive elements.

#### Props

```typescript
interface ProjectShowcase3DProps {
  projects: Project[];
  selectedProject?: string;
  onProjectSelect?: (projectId: string) => void;
}

interface Project {
  id: string;
  title: string;
  description: string;
  modelUrl?: string;
  imageUrl: string;
  category: string;
}
```

#### Usage

```tsx
import ProjectShowcase3D from '../components/3d/ProjectShowcase3D';

function Portfolio() {
  const [selectedProject, setSelectedProject] = useState<string>();

  return (
    <ProjectShowcase3D
      projects={portfolioProjects}
      selectedProject={selectedProject}
      onProjectSelect={setSelectedProject}
    />
  );
}
```

### SacredGeometry

Mathematical geometry visualization component with animated patterns.

#### Props

```typescript
interface SacredGeometryProps {
  pattern: 'flower-of-life' | 'fibonacci' | 'golden-ratio' | 'mandala';
  size?: number;
  complexity?: number;
  animated?: boolean;
  color?: string;
}
```

#### Usage

```tsx
import SacredGeometry from '../components/3d/SacredGeometry';

function GeometrySection() {
  return (
    <SacredGeometry
      pattern="flower-of-life"
      size={5}
      complexity={3}
      animated={true}
      color="#8b5cf6"
    />
  );
}
```

---

## UI Components

### Button

Reusable button component with multiple variants and states.

#### Props

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}
```

#### Usage

```tsx
import Button from '../components/ui/Button';

function ActionPanel() {
  return (
    <div className="space-x-2">
      <Button variant="primary" size="lg">
        Start Game
      </Button>
      <Button variant="outline" loading={isLoading}>
        Load Project
      </Button>
      <Button variant="ghost" icon={<SettingsIcon />}>
        Settings
      </Button>
    </div>
  );
}
```

### LoadingScreen

Animated loading screen with progress indication.

#### Props

```typescript
interface LoadingScreenProps {
  isLoading: boolean;
  progress?: number;
  message?: string;
  showProgress?: boolean;
  backdrop?: boolean;
}
```

#### Usage

```tsx
import LoadingScreen from '../components/ui/LoadingScreen';

function App() {
  const { loading } = useGameStore();

  return (
    <>
      <MainContent />
      <LoadingScreen
        isLoading={loading.isLoading}
        progress={loading.progress}
        message={loading.loadingText}
        showProgress={true}
        backdrop={true}
      />
    </>
  );
}
```

### SimulatorPreview

Preview component for projection mapping simulations.

#### Props

```typescript
interface SimulatorPreviewProps {
  simulation: Simulation;
  isActive?: boolean;
  onActivate?: () => void;
  onEdit?: () => void;
  className?: string;
}

interface Simulation {
  id: string;
  name: string;
  thumbnail: string;
  duration: number;
  effects: Effect[];
}
```

#### Usage

```tsx
import SimulatorPreview from '../components/ui/SimulatorPreview';

function SimulationLibrary() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {simulations.map(simulation => (
        <SimulatorPreview
          key={simulation.id}
          simulation={simulation}
          onActivate={() => loadSimulation(simulation.id)}
          onEdit={() => editSimulation(simulation.id)}
        />
      ))}
    </div>
  );
}
```

---

## Game Components

### GameHUD

Head-up display for the game interface.

#### Props

```typescript
interface GameHUDProps {
  visible?: boolean;
  player?: Player;
  gameState?: GameState;
  onMenuClick?: () => void;
  onInventoryClick?: () => void;
  onSkillsClick?: () => void;
}

interface Player {
  level: number;
  experience: number;
  money: number;
  reputation: number;
  health?: number;
  energy?: number;
}
```

#### Usage

```tsx
import GameHUD from '../components/game/GameHUD';

function GameInterface() {
  const { showHUD } = useGameUI();
  const { vjCareerGame } = useVJCareerGame();

  if (!showHUD) return null;

  return (
    <GameHUD
      visible={showHUD}
      player={vjCareerGame.player}
      onMenuClick={() => showMenuModal()}
      onInventoryClick={() => showInventoryModal()}
      onSkillsClick={() => showSkillTreeModal()}
    />
  );
}
```

### DialogBox

Interactive dialog system for character conversations.

#### Props

```typescript
interface DialogBoxProps {
  character: string;
  text: string;
  options?: DialogOption[];
  onOptionSelect?: (action: string) => void;
  onClose?: () => void;
  avatar?: string;
  typingSpeed?: number;
}

interface DialogOption {
  text: string;
  action: string;
  disabled?: boolean;
}
```

#### Usage

```tsx
import DialogBox from '../components/game/DialogBox';

function GameDialog() {
  const { currentDialog, hideDialog } = useGameDialog();

  if (!currentDialog) return null;

  return (
    <DialogBox
      character={currentDialog.character}
      text={currentDialog.text}
      options={currentDialog.options}
      onOptionSelect={(action) => handleDialogAction(action)}
      onClose={hideDialog}
    />
  );
}
```

### VJCareerGame3D

3D game environment for the VJ career simulation.

#### Props

```typescript
interface VJCareerGame3DProps {
  venue?: string;
  isPerforming?: boolean;
  player?: Player;
  onPerformanceComplete?: (score: number) => void;
}
```

#### Usage

```tsx
import VJCareerGame3D from '../components/game/VJCareerGame3D';

function CareerGameScreen() {
  const { vjCareerGame, setPerforming } = useVJCareerGame();

  return (
    <VJCareerGame3D
      venue={vjCareerGame.scene?.venue}
      isPerforming={vjCareerGame.scene?.isPerforming}
      player={vjCareerGame.player}
      onPerformanceComplete={(score) => {
        addExperience(score);
        setPerforming(false);
      }}
    />
  );
}
```

---

## Simulator Components

### ProjectionSimulator

Main projection mapping simulator component.

#### Props

```typescript
interface ProjectionSimulatorProps {
  surfaces?: Surface3D[];
  projectors?: Projector[];
  content?: ProjectionContent;
  onExport?: (config: ProjectionConfig) => void;
}

interface Surface3D {
  id: string;
  geometry: 'plane' | 'sphere' | 'cylinder' | 'custom';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  material?: MaterialSettings;
}

interface Projector {
  id: string;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  intensity: number;
  color: string;
}
```

#### Usage

```tsx
import ProjectionSimulator from '../components/simulator/ProjectionSimulator';

function SimulatorPage() {
  const [surfaces, setSurfaces] = useState<Surface3D[]>([]);
  const [projectors, setProjectors] = useState<Projector[]>([]);

  return (
    <ProjectionSimulator
      surfaces={surfaces}
      projectors={projectors}
      content={selectedContent}
      onExport={handleExportConfig}
    />
  );
}
```

### MappingTools

Toolset for projection mapping configuration.

#### Props

```typescript
interface MappingToolsProps {
  selectedTool?: 'select' | 'move' | 'rotate' | 'scale' | 'add-surface' | 'add-projector';
  onToolChange?: (tool: string) => void;
  onAddSurface?: (type: string) => void;
  onAddProjector?: () => void;
  surfaces?: Surface3D[];
  projectors?: Projector[];
}
```

#### Usage

```tsx
import MappingTools from '../components/simulator/MappingTools';

function SimulatorInterface() {
  const [selectedTool, setSelectedTool] = useState('select');

  return (
    <div className="flex">
      <MappingTools
        selectedTool={selectedTool}
        onToolChange={setSelectedTool}
        onAddSurface={handleAddSurface}
        onAddProjector={handleAddProjector}
      />
      <SimulatorCanvas />
    </div>
  );
}
```

### ContentLibrary

Library component for managing projection content.

#### Props

```typescript
interface ContentLibraryProps {
  content: ContentItem[];
  selectedContent?: string;
  onContentSelect?: (contentId: string) => void;
  onContentUpload?: (file: File) => void;
  categories?: string[];
}

interface ContentItem {
  id: string;
  name: string;
  type: 'video' | 'image' | 'animation' | 'shader';
  url: string;
  thumbnail: string;
  category: string;
  duration?: number;
}
```

#### Usage

```tsx
import ContentLibrary from '../components/simulator/ContentLibrary';

function ContentManager() {
  const [selectedContent, setSelectedContent] = useState<string>();

  return (
    <ContentLibrary
      content={contentItems}
      selectedContent={selectedContent}
      onContentSelect={setSelectedContent}
      onContentUpload={handleContentUpload}
      categories={['Visuals', 'Animations', 'Textures', 'Shaders']}
    />
  );
}
```

---

## Layout Components

### Header

Main navigation header component.

#### Props

```typescript
interface HeaderProps {
  transparent?: boolean;
  fixed?: boolean;
  showLogo?: boolean;
  navigation?: NavigationItem[];
  onMenuClick?: () => void;
}

interface NavigationItem {
  label: string;
  href: string;
  external?: boolean;
  icon?: React.ReactNode;
}
```

#### Usage

```tsx
import Header from '../components/layout/Header';

function App() {
  return (
    <div className="min-h-screen">
      <Header
        transparent={true}
        fixed={true}
        navigation={navigationItems}
        onMenuClick={() => setMobileMenuOpen(true)}
      />
      <main>{children}</main>
    </div>
  );
}
```

### Footer

Site footer with links and information.

#### Props

```typescript
interface FooterProps {
  variant?: 'default' | 'minimal';
  showSocial?: boolean;
  showNewsletter?: boolean;
  links?: FooterLink[];
}

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}
```

### Layout

Main layout wrapper component.

#### Props

```typescript
interface LayoutProps {
  children: React.ReactNode;
  header?: boolean;
  footer?: boolean;
  className?: string;
}
```

---

## Provider Components

### GameProvider

Context provider for game state and functionality.

#### Props

```typescript
interface GameProviderProps {
  children: React.ReactNode;
  autoInit?: boolean;
  canvas?: HTMLCanvasElement;
}
```

#### Usage

```tsx
import GameProvider from '../components/providers/GameProvider';

function App() {
  return (
    <GameProvider autoInit={true}>
      <Router>
        <Routes>
          {/* Your routes */}
        </Routes>
      </Router>
    </GameProvider>
  );
}
```

### PerformanceProvider

Context provider for performance monitoring and optimization.

#### Props

```typescript
interface PerformanceProviderProps {
  children: React.ReactNode;
  enableMonitoring?: boolean;
  enableAutoOptimization?: boolean;
  updateInterval?: number;
}
```

#### Usage

```tsx
import PerformanceProvider from '../components/providers/PerformanceProvider';

function App() {
  return (
    <PerformanceProvider
      enableMonitoring={true}
      enableAutoOptimization={true}
      updateInterval={1000}
    >
      <GameProvider>
        <MainApp />
      </GameProvider>
    </PerformanceProvider>
  );
}
```

---

## Optimization Components

### LazyLoader3D

Lazy loading component for 3D models and complex scenes.

#### Props

```typescript
interface LazyLoader3DProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingDistance?: number;
  unloadDistance?: number;
  priority?: 'high' | 'medium' | 'low';
}
```

#### Usage

```tsx
import LazyLoader3D from '../components/optimization/LazyLoader3D';

function Scene() {
  return (
    <LazyLoader3D
      fallback={<SimplePlaceholder />}
      loadingDistance={50}
      priority="medium"
    >
      <ComplexModel />
    </LazyLoader3D>
  );
}
```

### MemoizedComponents

Collection of memoized component wrappers for performance optimization.

#### Usage

```tsx
import { MemoizedMesh, MemoizedGroup } from '../components/optimized/MemoizedComponents';

function OptimizedScene() {
  return (
    <MemoizedGroup position={[0, 0, 0]}>
      <MemoizedMesh geometry={complexGeometry} material={expensiveMaterial} />
    </MemoizedGroup>
  );
}
```

---

## Component Patterns

### Error Boundaries

All major components should be wrapped in error boundaries:

```tsx
import { ErrorBoundary } from '../components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <InteractiveHero3D />
    </ErrorBoundary>
  );
}
```

### Suspense Integration

3D components integrate with React Suspense:

```tsx
import { Suspense } from 'react';

function Scene() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ProjectShowcase3D />
    </Suspense>
  );
}
```

### Performance Monitoring

Components integrate with performance monitoring:

```tsx
function MyComponent() {
  const { trackFrame } = usePerformanceMonitor();

  useFrame((state, delta) => {
    const startTime = performance.now();
    // Component logic
    const renderTime = performance.now() - startTime;
    trackFrame(renderTime);
  });

  return <mesh>...</mesh>;
}
```

---

## Component Testing

### Testing 3D Components

```tsx
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import InteractiveHero3D from '../InteractiveHero3D';

test('renders without crashing', () => {
  render(
    <Canvas>
      <InteractiveHero3D />
    </Canvas>
  );
});
```

### Testing UI Components

```tsx
import { render, fireEvent, screen } from '@testing-library/react';
import Button from '../Button';

test('handles click events', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);

  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

This comprehensive component documentation provides all the necessary information for working with the React components in the LightBrush Website project.