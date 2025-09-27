# Quick Start Guide

This guide will help you get the LightBrush Website project up and running quickly on your local machine.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [First Steps](#first-steps)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software
- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)
- **Git**: For version control

### System Requirements
- **RAM**: Minimum 8GB (16GB recommended for optimal 3D performance)
- **Graphics**: Dedicated GPU recommended for Three.js development
- **Browser**: Modern browser with WebGL 2.0 support (Chrome 91+, Firefox 89+, Safari 14+)

### Recommended Tools
- **Visual Studio Code**: With the following extensions:
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - GitLens
  - Prettier - Code formatter
  - ESLint

---

## Installation

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-username/lightbrush-website.git

# Navigate to the project directory
cd lightbrush-website
```

### 2. Install Dependencies

```bash
# Install all project dependencies
npm install
```

This will install all required packages including:
- React 19.1.1 and React DOM
- Three.js 0.180.0 and React Three Fiber
- TypeScript 5.8.3
- Vite 7.1.7
- Tailwind CSS 4.1.13
- Zustand 5.0.8
- And many more development dependencies

### 3. Environment Setup

Create a `.env.local` file in the root directory for local environment variables:

```bash
# Copy the example environment file
cp .env.example .env.local
```

Edit `.env.local` with your local configuration:

```env
# Development settings
VITE_DEV_MODE=true
VITE_PERFORMANCE_MONITORING=true

# Asset URLs (optional - uses local assets by default)
VITE_ASSET_BASE_URL=http://localhost:5173

# Analytics (optional)
VITE_ANALYTICS_ID=your-analytics-id
```

---

## Development Setup

### 1. Start the Development Server

```bash
# Start the Vite development server
npm run dev
```

The application will be available at:
- **Local**: http://localhost:5173
- **Network**: http://192.168.x.x:5173 (for testing on other devices)

### 2. Verify Installation

Open your browser and navigate to http://localhost:5173. You should see:

1. **Interactive 3D Hero Section**: Floating orbs with particle effects
2. **Navigation Menu**: Header with working navigation
3. **Performance Overlay** (if enabled): FPS and memory usage display
4. **No Console Errors**: Check browser developer tools

### 3. Development Tools

#### Enable Performance Monitoring
Access the performance overlay by pressing `Ctrl/Cmd + Shift + P` or by adding `?debug=true` to the URL.

#### Hot Module Replacement (HMR)
Vite provides instant hot reloading. Changes to your code will be reflected immediately without losing application state.

#### Browser Developer Tools
Use the browser's developer tools to:
- Monitor WebGL performance
- Debug Three.js objects
- Check network requests for assets
- Analyze bundle sizes

---

## Project Structure

```
lightbrush-website/
├── public/                 # Static assets
│   ├── textures/          # Texture files
│   ├── models/            # 3D model files
│   └── audio/             # Audio files
├── src/                   # Source code
│   ├── components/        # React components
│   │   ├── 3d/           # Three.js components
│   │   ├── ui/           # UI components
│   │   ├── game/         # Game components
│   │   ├── simulator/    # Simulator components
│   │   └── layout/       # Layout components
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand stores
│   ├── utils/            # Utility functions
│   ├── pages/            # Page components
│   ├── services/         # External services
│   └── types/            # TypeScript type definitions
├── docs/                 # Documentation
├── dist/                 # Built application (generated)
└── tests/                # Test files
```

---

## Available Scripts

### Development Scripts

```bash
# Start development server
npm run dev

# Start development server with host binding (for network access)
npm run dev -- --host

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Code Quality Scripts

```bash
# Run ESLint
npm run lint

# Run ESLint with auto-fix
npm run lint:fix

# Format code with Prettier
npm run format

# Type checking
npm run type-check
```

### Testing Scripts

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate test coverage report
npm run test:coverage
```

### Git Hooks Scripts

```bash
# Set up git hooks (run automatically after npm install)
npm run prepare

# Manually run pre-commit hooks
npm run pre-commit
```

---

## First Steps

### 1. Explore the 3D Hero Section

Navigate to the home page and interact with the 3D hero section:

- **Mouse/Trackpad**: Drag to rotate the camera
- **Scroll**: Navigate through the page
- **Performance**: Monitor FPS in the top-right corner (if debug mode is enabled)

### 2. Access the Projection Simulator

1. Click on "Simulator" in the navigation
2. Explore the projection mapping interface
3. Try adding surfaces and projectors
4. Load different content types

### 3. Play the VJ Career Game

1. Navigate to the "Game" section
2. Start a new career
3. Complete the tutorial
4. Experience the 3D game environment

### 4. Check Performance

Monitor application performance:

```typescript
// Enable performance monitoring in your component
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

function MyComponent() {
  const { metrics } = usePerformanceMonitor();

  console.log('FPS:', metrics?.fps);
  console.log('Memory:', metrics?.memoryUsage);
}
```

---

## Common Tasks

### Adding a New Component

1. **Create the component file**:
```bash
# Create a new UI component
touch src/components/ui/MyNewComponent.tsx
```

2. **Component template**:
```typescript
// src/components/ui/MyNewComponent.tsx
interface MyNewComponentProps {
  title: string;
  onAction?: () => void;
}

function MyNewComponent({ title, onAction }: MyNewComponentProps) {
  return (
    <div className="my-new-component">
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
}

export default MyNewComponent;
```

3. **Add tests**:
```bash
# Create test file
touch src/__tests__/components/ui/MyNewComponent.test.tsx
```

### Adding a New 3D Component

1. **Create Three.js component**:
```typescript
// src/components/3d/My3DComponent.tsx
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

function My3DComponent() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

export default My3DComponent;
```

### Adding a New Page

1. **Create page component**:
```typescript
// src/pages/MyNewPage.tsx
import Layout from '../components/layout/Layout';

function MyNewPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1>My New Page</h1>
        <p>Page content goes here.</p>
      </div>
    </Layout>
  );
}

export default MyNewPage;
```

2. **Add route**:
```typescript
// src/App.tsx
import MyNewPage from './pages/MyNewPage';

// Add to your routes
<Route path="/my-new-page" element={<MyNewPage />} />
```

### Working with State

1. **Using existing stores**:
```typescript
import { useGameStore } from '../store/gameStore';

function MyComponent() {
  const { isRunning, startGame } = useGameStore();

  return (
    <button onClick={startGame} disabled={isRunning}>
      {isRunning ? 'Game Running' : 'Start Game'}
    </button>
  );
}
```

2. **Creating new state**:
```typescript
// Add to existing store or create new one
const useMyStore = create<MyState>((set, get) => ({
  myValue: 0,
  increment: () => set(state => ({ myValue: state.myValue + 1 }))
}));
```

---

## Troubleshooting

### Common Issues

#### 1. Three.js Performance Issues

**Problem**: Low FPS or laggy 3D interactions

**Solutions**:
- Check if hardware acceleration is enabled in your browser
- Reduce particle count in ParticleField component
- Lower quality settings in performance monitor
- Monitor memory usage for leaks

```typescript
// Check performance metrics
const { metrics } = usePerformanceMonitor();
console.log('Current FPS:', metrics?.fps);
console.log('Memory usage:', metrics?.memoryUsage, 'MB');
```

#### 2. Build Errors

**Problem**: TypeScript compilation errors

**Solutions**:
- Run `npm run type-check` to see all TypeScript errors
- Ensure all imports have proper file extensions
- Check that all dependencies are properly installed

```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# Type check
npm run type-check
```

#### 3. Asset Loading Issues

**Problem**: Textures or models not loading

**Solutions**:
- Verify assets exist in the `public` directory
- Check file paths are correct (case-sensitive)
- Ensure asset URLs are properly configured

```typescript
// Debug asset loading
useEffect(() => {
  console.log('Loading texture from:', textureUrl);
}, [textureUrl]);
```

#### 4. WebGL Context Loss

**Problem**: 3D content stops rendering

**Solutions**:
- Add WebGL context loss handling
- Reduce memory usage
- Implement proper resource cleanup

```typescript
// Handle context loss
useEffect(() => {
  const canvas = canvasRef.current;
  if (canvas) {
    canvas.addEventListener('webglcontextlost', handleContextLoss);
    return () => canvas.removeEventListener('webglcontextlost', handleContextLoss);
  }
}, []);
```

### Getting Help

1. **Check the Console**: Browser developer tools often show helpful error messages
2. **Review Documentation**: Check the `/docs` directory for detailed API documentation
3. **Performance Issues**: Use the built-in performance monitor
4. **Three.js Issues**: Refer to Three.js documentation and React Three Fiber docs
5. **State Management**: Review Zustand documentation for store patterns

### Development Environment Issues

#### Port Already in Use
```bash
# Kill process using port 5173
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm run dev -- --port 3000
```

#### Node Version Issues
```bash
# Check Node version
node --version

# Use nvm to switch versions
nvm use 18
```

#### Permission Issues
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

---

## Next Steps

After completing the quick start:

1. **Read the Architecture Documentation**: Understand the system design
2. **Explore Components**: Review component documentation and examples
3. **Performance Optimization**: Learn about performance best practices
4. **Testing**: Set up your testing environment
5. **Deployment**: Learn about build and deployment processes

Happy coding with LightBrush! 🎨✨