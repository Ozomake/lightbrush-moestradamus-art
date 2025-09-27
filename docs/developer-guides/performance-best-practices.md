# Performance Best Practices

This guide provides comprehensive performance optimization strategies for the LightBrush Website project, covering React performance, Three.js optimization, memory management, and monitoring techniques.

## Table of Contents

- [React Performance Optimization](#react-performance-optimization)
- [Three.js Performance Optimization](#threejs-performance-optimization)
- [Memory Management](#memory-management)
- [Animation Performance](#animation-performance)
- [Asset Optimization](#asset-optimization)
- [Monitoring and Debugging](#monitoring-and-debugging)
- [Performance Checklist](#performance-checklist)

---

## React Performance Optimization

### 1. Component Memoization

#### React.memo for Component Memoization

Use React.memo to prevent unnecessary re-renders of functional components.

```typescript
// Expensive 3D component that should only re-render when props change
const ExpensiveParticleSystem = memo(({ count, spread, color }: ParticleSystemProps) => {
  // Expensive particle generation
  const particles = useMemo(() => generateParticles(count, spread), [count, spread]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particles, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.1} />
    </points>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for complex props
  return (
    prevProps.count === nextProps.count &&
    prevProps.spread === nextProps.spread &&
    prevProps.color === nextProps.color
  );
});
```

#### useMemo for Expensive Calculations

```typescript
function OptimizedMesh({ vertices, indices }: { vertices: number[]; indices: number[] }) {
  // Memoize expensive geometry creation
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [vertices, indices]);

  // Memoize material creation
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5,
    metalness: 0.2
  }), []);

  return <mesh geometry={geometry} material={material} />;
}
```

#### useCallback for Event Handlers

```typescript
function GameInterface() {
  const { addNotification } = useGameNotifications();

  // Memoize callback to prevent child re-renders
  const handleButtonClick = useCallback((actionType: string) => {
    addNotification({
      type: 'info',
      title: 'Action Performed',
      message: `Performed ${actionType}`
    });
  }, [addNotification]);

  return (
    <div>
      <ActionButton onClick={() => handleButtonClick('save')} />
      <ActionButton onClick={() => handleButtonClick('load')} />
    </div>
  );
}
```

### 2. State Management Optimization

#### Selective Store Subscriptions

```typescript
// Bad: Subscribes to entire store
const gameState = useGameStore();

// Good: Subscribe only to needed state
const isRunning = useGameStore(state => state.isRunning);
const playerLevel = useGameStore(state => state.vjCareerGame.player?.level);

// Better: Use specific selectors
const { isRunning, isPaused } = useGameEngine();
```

#### Batch State Updates

```typescript
// Bad: Multiple separate updates
function levelUp() {
  addExperience(100);
  setLevel(currentLevel + 1);
  addMoney(50);
  showNotification('Level up!');
}

// Good: Batch updates
function levelUp() {
  useGameStore.setState(state => ({
    vjCareerGame: {
      ...state.vjCareerGame,
      player: state.vjCareerGame.player ? {
        ...state.vjCareerGame.player,
        experience: state.vjCareerGame.player.experience + 100,
        level: state.vjCareerGame.player.level + 1,
        money: state.vjCareerGame.player.money + 50
      } : null
    },
    notifications: [...state.notifications, {
      id: Date.now().toString(),
      type: 'success',
      title: 'Level Up!',
      message: 'Congratulations on reaching the next level!',
      timestamp: Date.now()
    }]
  }));
}
```

### 3. Lazy Loading and Code Splitting

#### Route-Level Code Splitting

```typescript
import { lazy, Suspense } from 'react';
import LoadingScreen from '../components/ui/LoadingScreen';

// Lazy load page components
const HomePage = lazy(() => import('../pages/HomePage'));
const GamePage = lazy(() => import('../pages/GamePage'));
const SimulatorPage = lazy(() => import('../pages/SimulatorPage'));

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/simulator" element={<SimulatorPage />} />
      </Routes>
    </Suspense>
  );
}
```

#### Component-Level Lazy Loading

```typescript
// Lazy load expensive 3D components
const LazyParticleSystem = lazy(() => import('../components/3d/ParticleSystem'));
const LazyComplexModel = lazy(() => import('../components/3d/ComplexModel'));

function Scene3D({ showParticles, showModel }: { showParticles: boolean; showModel: boolean }) {
  return (
    <>
      {showParticles && (
        <Suspense fallback={<SimplePlaceholder />}>
          <LazyParticleSystem />
        </Suspense>
      )}
      {showModel && (
        <Suspense fallback={<ModelPlaceholder />}>
          <LazyComplexModel />
        </Suspense>
      )}
    </>
  );
}
```

---

## Three.js Performance Optimization

### 1. Geometry Optimization

#### Use BufferGeometry

```typescript
// Bad: Legacy geometry
const geometry = new THREE.Geometry();
geometry.vertices.push(new THREE.Vector3(0, 0, 0));

// Good: BufferGeometry
const geometry = new THREE.BufferGeometry();
const vertices = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
```

#### Optimize Geometry Complexity

```typescript
function AdaptiveGeometry({ distance, quality }: { distance: number; quality: string }) {
  const segments = useMemo(() => {
    if (quality === 'low' || distance > 50) return 8;
    if (quality === 'medium' || distance > 20) return 16;
    return 32;
  }, [distance, quality]);

  return (
    <sphereGeometry args={[1, segments, segments]} />
  );
}
```

#### Geometry Instancing

```typescript
function InstancedObjects({ positions }: { positions: [number, number, number][] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = positions.length;

  useEffect(() => {
    if (meshRef.current) {
      const tempObject = new THREE.Object3D();

      positions.forEach((position, i) => {
        tempObject.position.set(...position);
        tempObject.updateMatrix();
        meshRef.current!.setMatrixAt(i, tempObject.matrix);
      });

      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [positions]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry />
      <meshStandardMaterial />
    </instancedMesh>
  );
}
```

### 2. Material Optimization

#### Share Materials

```typescript
// Material pool for sharing
const materialPool = new Map<string, THREE.Material>();

function getSharedMaterial(type: string, properties: any): THREE.Material {
  const key = `${type}_${JSON.stringify(properties)}`;

  if (!materialPool.has(key)) {
    let material: THREE.Material;

    switch (type) {
      case 'standard':
        material = new THREE.MeshStandardMaterial(properties);
        break;
      case 'basic':
        material = new THREE.MeshBasicMaterial(properties);
        break;
      default:
        material = new THREE.MeshBasicMaterial(properties);
    }

    materialPool.set(key, material);
  }

  return materialPool.get(key)!;
}
```

#### Optimize Material Properties

```typescript
function OptimizedMaterial({ quality }: { quality: string }) {
  const materialProps = useMemo(() => {
    switch (quality) {
      case 'high':
        return {
          roughness: 0.3,
          metalness: 0.7,
          envMapIntensity: 1.0
        };
      case 'medium':
        return {
          roughness: 0.5,
          metalness: 0.5,
          envMapIntensity: 0.5
        };
      case 'low':
        return {
          roughness: 0.8,
          metalness: 0.2,
          envMapIntensity: 0.2
        };
      default:
        return { roughness: 0.5, metalness: 0.5 };
    }
  }, [quality]);

  return <meshStandardMaterial {...materialProps} />;
}
```

### 3. Render Optimization

#### Frustum Culling

```typescript
function FrustumCulledMesh({ children, ...props }: { children: React.ReactNode }) {
  const meshRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const [isVisible, setIsVisible] = useState(true);

  useFrame(() => {
    if (meshRef.current) {
      const frustum = new THREE.Frustum();
      const matrix = new THREE.Matrix4().multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      );
      frustum.setFromProjectionMatrix(matrix);

      const box = new THREE.Box3().setFromObject(meshRef.current);
      setIsVisible(frustum.intersectsBox(box));
    }
  });

  return (
    <group ref={meshRef} visible={isVisible} {...props}>
      {children}
    </group>
  );
}
```

#### Level of Detail (LOD)

```typescript
function LODMesh({ position }: { position: [number, number, number] }) {
  const { camera } = useThree();
  const [detail, setDetail] = useState<'high' | 'medium' | 'low'>('high');

  useFrame(() => {
    const distance = camera.position.distanceTo(new THREE.Vector3(...position));

    if (distance < 10) setDetail('high');
    else if (distance < 30) setDetail('medium');
    else setDetail('low');
  });

  return (
    <mesh position={position}>
      {detail === 'high' && <sphereGeometry args={[1, 32, 32]} />}
      {detail === 'medium' && <sphereGeometry args={[1, 16, 16]} />}
      {detail === 'low' && <sphereGeometry args={[1, 8, 8]} />}
      <meshStandardMaterial />
    </mesh>
  );
}
```

### 4. Texture Optimization

#### Texture Compression and Formats

```typescript
function OptimizedTexture({ url }: { url: string }) {
  const texture = useLoader(THREE.TextureLoader, url);

  useEffect(() => {
    if (texture) {
      // Optimize texture settings
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;

      // Compress if supported
      if (texture.format === THREE.RGBAFormat) {
        texture.format = THREE.RGBFormat; // Use RGB if alpha not needed
      }
    }
  }, [texture]);

  return texture;
}
```

#### Texture Atlasing

```typescript
function TextureAtlas() {
  const atlas = useLoader(THREE.TextureLoader, '/textures/atlas.jpg');

  const getUVTransform = (index: number) => {
    const size = 0.25; // 4x4 atlas
    const x = (index % 4) * size;
    const y = Math.floor(index / 4) * size;

    return {
      offset: [x, y],
      repeat: [size, size]
    };
  };

  return { atlas, getUVTransform };
}
```

---

## Memory Management

### 1. Three.js Resource Disposal

#### Automatic Cleanup Hook

```typescript
function useThreeJSCleanup<T extends THREE.Object3D | THREE.Material | THREE.Texture>(
  resource: T | null
) {
  useEffect(() => {
    return () => {
      if (resource) {
        if ('dispose' in resource && typeof resource.dispose === 'function') {
          resource.dispose();
        }
      }
    };
  }, [resource]);
}

// Usage
function MyComponent() {
  const geometry = useMemo(() => new THREE.BoxGeometry(), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial(), []);

  useThreeJSCleanup(geometry);
  useThreeJSCleanup(material);

  return <mesh geometry={geometry} material={material} />;
}
```

#### Resource Pool Integration

```typescript
function useOptimizedResources() {
  const { getGeometry, getMaterial, releaseGeometry, releaseMaterial } = useResourcePool();

  const createMesh = useCallback((type: string) => {
    const geometry = getGeometry('box', () => new THREE.BoxGeometry());
    const material = getMaterial('standard', () => new THREE.MeshStandardMaterial());

    return {
      geometry,
      material,
      cleanup: () => {
        releaseGeometry(geometry);
        releaseMaterial(material);
      }
    };
  }, [getGeometry, getMaterial, releaseGeometry, releaseMaterial]);

  return { createMesh };
}
```

### 2. Memory Leak Prevention

#### WeakMap for Object References

```typescript
const objectMetadata = new WeakMap<THREE.Object3D, ObjectMetadata>();

function trackObject(object: THREE.Object3D, metadata: ObjectMetadata) {
  objectMetadata.set(object, metadata);
}

function getObjectMetadata(object: THREE.Object3D) {
  return objectMetadata.get(object);
}
```

#### Event Listener Cleanup

```typescript
function useEventListener<T extends keyof WindowEventMap>(
  event: T,
  handler: (event: WindowEventMap[T]) => void,
  element: Window | Element = window
) {
  useEffect(() => {
    element.addEventListener(event, handler as EventListener);
    return () => element.removeEventListener(event, handler as EventListener);
  }, [event, handler, element]);
}
```

### 3. Memory Monitoring

#### Memory Usage Tracking

```typescript
function useMemoryMonitoring() {
  const [memoryInfo, setMemoryInfo] = useState<any>(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        setMemoryInfo((performance as any).memory);
      }
    };

    const interval = setInterval(updateMemoryInfo, 1000);
    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}

// Usage
function MemoryDisplay() {
  const memory = useMemoryMonitoring();

  if (!memory) return null;

  return (
    <div className="memory-info">
      <div>Used: {(memory.usedJSHeapSize / 1048576).toFixed(2)} MB</div>
      <div>Total: {(memory.totalJSHeapSize / 1048576).toFixed(2)} MB</div>
      <div>Limit: {(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB</div>
    </div>
  );
}
```

---

## Animation Performance

### 1. Animation Manager Integration

#### Priority-Based Animation

```typescript
function OptimizedAnimation() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Register with animation manager for performance optimization
  useAnimationRegistration(
    'optimized-rotation',
    (state, delta) => {
      if (meshRef.current) {
        meshRef.current.rotation.y += delta * 0.5;
      }
    },
    AnimationPriority.MEDIUM,
    30 // Target 30 FPS for this animation
  );

  return (
    <mesh ref={meshRef}>
      <boxGeometry />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}
```

#### Conditional Animation

```typescript
function ConditionalAnimation({ isVisible, distance }: { isVisible: boolean; distance: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { getPerformanceMetrics } = useAnimationManager();

  useAnimationRegistration(
    'conditional-animation',
    (state, delta) => {
      if (meshRef.current && isVisible && distance < 50) {
        const metrics = getPerformanceMetrics();

        // Reduce animation intensity based on performance
        const intensity = metrics.qualityLevel > 2 ? 1 : 0.5;
        meshRef.current.rotation.x += delta * intensity;
      }
    },
    AnimationPriority.LOW,
    undefined,
    [isVisible, distance]
  );

  return <mesh ref={meshRef}>...</mesh>;
}
```

### 2. RAF Optimization

#### Debounced Frame Updates

```typescript
function useDebouncedFrame(callback: (state: any, delta: number) => void, delay: number = 16) {
  const lastCall = useRef(0);

  useFrame((state, delta) => {
    const now = performance.now();
    if (now - lastCall.current >= delay) {
      callback(state, delta);
      lastCall.current = now;
    }
  });
}

// Usage - update every 16ms instead of every frame
function SlowUpdateComponent() {
  const [position, setPosition] = useState([0, 0, 0]);

  useDebouncedFrame((state) => {
    setPosition([
      Math.sin(state.clock.elapsedTime),
      Math.cos(state.clock.elapsedTime),
      0
    ]);
  }, 16);

  return <mesh position={position}>...</mesh>;
}
```

---

## Asset Optimization

### 1. Model Optimization

#### GLTF/GLB Optimization

```typescript
// Optimize GLTF loading
function useOptimizedGLTF(url: string) {
  const gltf = useLoader(GLTFLoader, url, (loader) => {
    // Configure loader for optimization
    loader.setDRACOLoader(dracoLoader);
  });

  useEffect(() => {
    if (gltf.scene) {
      // Optimize materials
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          // Optimize material
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.envMapIntensity = 0.5;
          }
        }
      });
    }
  }, [gltf]);

  return gltf;
}
```

#### Model Simplification

```typescript
function SimplifiedModel({ url, distance }: { url: string; distance: number }) {
  const shouldUseSimplified = distance > 30;
  const modelUrl = shouldUseSimplified ? url.replace('.glb', '_low.glb') : url;

  return <Model url={modelUrl} />;
}
```

### 2. Texture Optimization

#### Progressive Texture Loading

```typescript
function useProgressiveTexture(lowResUrl: string, highResUrl: string) {
  const [currentUrl, setCurrentUrl] = useState(lowResUrl);
  const texture = useLoader(THREE.TextureLoader, currentUrl);

  useEffect(() => {
    // Preload high-res texture
    const loader = new THREE.TextureLoader();
    loader.load(highResUrl, (highResTexture) => {
      setCurrentUrl(highResUrl);
    });
  }, [highResUrl]);

  return texture;
}
```

---

## Monitoring and Debugging

### 1. Performance Metrics

#### Custom Performance Monitor

```typescript
function useAdvancedPerformanceMonitoring() {
  const { metrics, history } = usePerformanceMonitor();
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    if (metrics) {
      const newAlerts: string[] = [];

      if (metrics.fps < 30) {
        newAlerts.push('Low FPS detected');
      }

      if (metrics.memoryUsage > 200) {
        newAlerts.push('High memory usage');
      }

      if (metrics.frameDrops > 10) {
        newAlerts.push('Frame drops detected');
      }

      setAlerts(newAlerts);
    }
  }, [metrics]);

  return { metrics, history, alerts };
}
```

#### Three.js Debug Info

```typescript
function useThreeJSDebugInfo() {
  const { gl } = useThree();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useFrame(() => {
    setDebugInfo({
      triangles: gl.info.render.triangles,
      calls: gl.info.render.calls,
      frame: gl.info.render.frame,
      geometries: gl.info.memory.geometries,
      textures: gl.info.memory.textures
    });
  });

  return debugInfo;
}
```

### 2. Development Tools

#### Performance Overlay

```typescript
function PerformanceOverlay() {
  const { metrics } = useAdvancedPerformanceMonitoring();
  const debugInfo = useThreeJSDebugInfo();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        setIsVisible(!isVisible);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isVisible]);

  if (!isVisible || !metrics) return null;

  return (
    <div className="fixed top-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded">
      <h3>Performance Monitor</h3>
      <div>FPS: {metrics.fps.toFixed(1)}</div>
      <div>Memory: {metrics.memoryUsage.toFixed(1)} MB</div>
      <div>Triangles: {debugInfo?.triangles || 0}</div>
      <div>Draw Calls: {debugInfo?.calls || 0}</div>
      <div>Geometries: {debugInfo?.geometries || 0}</div>
      <div>Textures: {debugInfo?.textures || 0}</div>
    </div>
  );
}
```

---

## Performance Checklist

### Pre-Launch Performance Audit

#### React Performance
- [ ] Components are properly memoized with React.memo
- [ ] Expensive calculations use useMemo
- [ ] Event handlers use useCallback
- [ ] State updates are batched
- [ ] Unnecessary re-renders are eliminated
- [ ] Code splitting is implemented for routes
- [ ] Lazy loading is used for heavy components

#### Three.js Performance
- [ ] BufferGeometry is used instead of Geometry
- [ ] Materials are shared between similar objects
- [ ] Textures are optimized and compressed
- [ ] LOD is implemented for complex objects
- [ ] Instancing is used for repeated objects
- [ ] Frustum culling is enabled
- [ ] Shadow maps are optimized

#### Memory Management
- [ ] Three.js resources are properly disposed
- [ ] Event listeners are cleaned up
- [ ] Resource pools are used for common objects
- [ ] Memory leaks are identified and fixed
- [ ] WeakMaps are used for temporary references

#### Animation Performance
- [ ] Animation manager is used for complex scenes
- [ ] Animation priority levels are set appropriately
- [ ] Conditional animations based on performance
- [ ] RAF is optimized with debouncing
- [ ] Animations can be disabled under low performance

#### Asset Optimization
- [ ] Models are optimized and compressed
- [ ] Textures use appropriate formats and sizes
- [ ] Progressive loading for large assets
- [ ] Texture atlasing is used where appropriate
- [ ] DRACO compression for GLTF models

#### Monitoring
- [ ] Performance monitoring is implemented
- [ ] Memory usage is tracked
- [ ] Frame rate is monitored
- [ ] Debug tools are available in development
- [ ] Performance budgets are defined and tracked

This comprehensive performance guide ensures that the LightBrush Website maintains excellent performance across all devices and usage scenarios.