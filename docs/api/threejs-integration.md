# Three.js Integration API Documentation

This document provides comprehensive documentation for Three.js integration patterns and utilities used in the LightBrush Website project.

## Table of Contents

- [React Three Fiber Integration](#react-three-fiber-integration)
- [Three.js Utilities](#threejs-utilities)
- [Custom Hooks](#custom-hooks)
- [Performance Optimization](#performance-optimization)
- [Shader Integration](#shader-integration)
- [Animation Systems](#animation-systems)
- [Best Practices](#best-practices)

---

## React Three Fiber Integration

### Canvas Configuration

The main Canvas component is configured for optimal performance and quality.

```tsx
import { Canvas } from '@react-three/fiber';

function App() {
  return (
    <Canvas
      style={{ background: 'transparent' }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true
      }}
      shadows
      camera={{ position: [0, 5, 15], fov: 50 }}
      frameloop="demand" // For performance optimization
    >
      <Scene />
    </Canvas>
  );
}
```

### Canvas Properties

- **gl**: WebGL renderer configuration
  - `alpha: true`: Enables transparency
  - `antialias: true`: Smooth edges
  - `powerPreference: 'high-performance'`: Prefer discrete GPU
  - `stencil: false`: Disable stencil buffer for performance
- **shadows**: Enables shadow mapping
- **frameloop**: Controls rendering loop ('always', 'demand', 'never')

### Scene Setup

```tsx
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';

function Scene() {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, 5, 15]}
        fov={50}
        near={0.1}
        far={1000}
      />

      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <spotLight
        position={[0, 15, 5]}
        angle={0.4}
        penumbra={1}
        intensity={2}
        castShadow
      />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        maxPolarAngle={Math.PI / 2}
        autoRotate
        autoRotateSpeed={0.5}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}
```

---

## Three.js Utilities

### Geometry Utilities

#### createOptimizedGeometry

Creates performance-optimized geometries with proper disposal handling.

```typescript
import * as THREE from 'three';
import { useResourcePool } from '../utils/ResourcePool';

function useOptimizedGeometry<T extends THREE.BufferGeometry>(
  type: string,
  factory: () => T,
  dependencies: any[] = []
): T {
  const { getGeometry, releaseGeometry } = useResourcePool();

  const geometry = useMemo(() => {
    return getGeometry(type, factory, ...dependencies);
  }, dependencies);

  useEffect(() => {
    return () => releaseGeometry(geometry);
  }, [geometry]);

  return geometry;
}

// Usage
function OptimizedMesh() {
  const geometry = useOptimizedGeometry(
    'box',
    () => new THREE.BoxGeometry(1, 1, 1),
    [1, 1, 1] // Dependencies for cache key
  );

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}
```

#### Common Geometry Factories

```typescript
// Box geometry factory
export const createBoxGeometry = (width = 1, height = 1, depth = 1) =>
  () => new THREE.BoxGeometry(width, height, depth);

// Sphere geometry factory
export const createSphereGeometry = (
  radius = 1,
  widthSegments = 32,
  heightSegments = 32
) => () => new THREE.SphereGeometry(radius, widthSegments, heightSegments);

// Plane geometry factory
export const createPlaneGeometry = (width = 1, height = 1) =>
  () => new THREE.PlaneGeometry(width, height);

// Cylinder geometry factory
export const createCylinderGeometry = (
  radiusTop = 1,
  radiusBottom = 1,
  height = 1,
  radialSegments = 32
) => () => new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
```

### Material Utilities

#### createOptimizedMaterial

Creates and manages materials with property updates and disposal.

```typescript
function useOptimizedMaterial<T extends THREE.Material>(
  type: string,
  factory: () => T,
  properties: Partial<T> = {}
): T {
  const { getMaterial, releaseMaterial } = useResourcePool();

  const material = useMemo(() => {
    return getMaterial(type, factory, properties);
  }, [type, JSON.stringify(properties)]);

  useEffect(() => {
    return () => releaseMaterial(material);
  }, [material]);

  return material;
}

// Usage
function StyledMesh() {
  const material = useOptimizedMaterial(
    'standard',
    () => new THREE.MeshStandardMaterial(),
    {
      color: 0xff0000,
      roughness: 0.5,
      metalness: 0.2
    }
  );

  return (
    <mesh material={material}>
      <boxGeometry args={[1, 1, 1]} />
    </mesh>
  );
}
```

#### Material Factories

```typescript
// Standard material factory
export const createStandardMaterial = () => new THREE.MeshStandardMaterial({
  roughness: 0.5,
  metalness: 0.1
});

// Physical material factory
export const createPhysicalMaterial = () => new THREE.MeshPhysicalMaterial({
  roughness: 0.3,
  metalness: 0.7,
  transmission: 0,
  thickness: 0
});

// Basic material factory
export const createBasicMaterial = () => new THREE.MeshBasicMaterial();

// Lambert material factory
export const createLambertMaterial = () => new THREE.MeshLambertMaterial();

// Toon material factory
export const createToonMaterial = () => new THREE.MeshToonMaterial();
```

### Texture Utilities

#### useTexture Hook

Enhanced texture loading with caching and error handling.

```typescript
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';

function useTexture(url: string, onLoad?: (texture: THREE.Texture) => void) {
  const texture = useLoader(TextureLoader, url);

  useEffect(() => {
    if (texture && onLoad) {
      onLoad(texture);
    }
  }, [texture, onLoad]);

  return texture;
}

// Advanced texture hook with resource pooling
function useOptimizedTexture(url: string) {
  const { getTexture } = useResourcePool();
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    getTexture(url).then(setTexture);
  }, [url]);

  return texture;
}

// Usage
function TexturedMesh() {
  const diffuseMap = useTexture('/textures/diffuse.jpg');
  const normalMap = useTexture('/textures/normal.jpg');

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <meshStandardMaterial
        map={diffuseMap}
        normalMap={normalMap}
      />
    </mesh>
  );
}
```

---

## Custom Hooks

### useThree Integration

Accessing Three.js context and utilities.

```typescript
import { useThree, useFrame } from '@react-three/fiber';

function CameraController() {
  const { camera, scene, gl } = useThree();

  useEffect(() => {
    // Configure camera
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame((state, delta) => {
    // Update camera or scene on each frame
    camera.position.x = Math.sin(state.clock.elapsedTime) * 5;
  });

  return null;
}
```

### useFrame Optimization

Optimized frame updates with performance monitoring.

```typescript
import { useFrame } from '@react-three/fiber';
import { useAnimationRegistration } from '../hooks/useAnimationManager';

function AnimatedComponent() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Using the animation manager for performance optimization
  useAnimationRegistration(
    'mesh-rotation',
    (state, delta) => {
      if (meshRef.current) {
        meshRef.current.rotation.y += delta * 0.5;
        meshRef.current.rotation.x += delta * 0.2;
      }
    },
    AnimationPriority.MEDIUM,
    60, // Target 60 FPS
    [] // Dependencies
  );

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}
```

### useLoader with Error Handling

Enhanced asset loading with error boundaries and fallbacks.

```typescript
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function useModelLoader(url: string, fallback?: string) {
  const [modelUrl, setModelUrl] = useState(url);
  const [error, setError] = useState<Error | null>(null);

  try {
    const gltf = useLoader(GLTFLoader, modelUrl);
    return { model: gltf.scene, error: null };
  } catch (err) {
    if (fallback && modelUrl !== fallback) {
      setModelUrl(fallback);
      setError(err as Error);
    } else {
      throw err;
    }
  }

  return { model: null, error };
}

// Usage
function ModelComponent({ modelUrl }: { modelUrl: string }) {
  const { model, error } = useModelLoader(modelUrl, '/models/fallback.glb');

  if (error) {
    console.warn('Model loading error:', error);
  }

  return model ? <primitive object={model} /> : null;
}
```

---

## Performance Optimization

### Level of Detail (LOD)

Implement LOD for complex models based on distance.

```typescript
import { useFrame, useThree } from '@react-three/fiber';

function LODMesh({ position, highDetailModel, lowDetailModel }: {
  position: [number, number, number];
  highDetailModel: React.ReactNode;
  lowDetailModel: React.ReactNode;
}) {
  const { camera } = useThree();
  const [useHighDetail, setUseHighDetail] = useState(true);
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (meshRef.current) {
      const distance = camera.position.distanceTo(meshRef.current.position);
      const shouldUseHighDetail = distance < 20;

      if (shouldUseHighDetail !== useHighDetail) {
        setUseHighDetail(shouldUseHighDetail);
      }
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {useHighDetail ? highDetailModel : lowDetailModel}
    </group>
  );
}
```

### Frustum Culling

Automatic culling of objects outside camera view.

```typescript
function FrustumCulledMesh({ children, position }: {
  children: React.ReactNode;
  position: [number, number, number];
}) {
  const { camera } = useThree();
  const [isVisible, setIsVisible] = useState(true);
  const meshRef = useRef<THREE.Group>(null);

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
    <group ref={meshRef} position={position} visible={isVisible}>
      {children}
    </group>
  );
}
```

### Instanced Rendering

Optimize rendering of multiple similar objects.

```typescript
import { useMemo, useRef } from 'react';
import { InstancedMesh, Object3D } from 'three';

function InstancedObjects({ count, positions }: {
  count: number;
  positions: [number, number, number][];
}) {
  const instancedMeshRef = useRef<InstancedMesh>(null);

  const { geometry, material } = useMemo(() => ({
    geometry: new THREE.BoxGeometry(0.1, 0.1, 0.1),
    material: new THREE.MeshStandardMaterial({ color: 'orange' })
  }), []);

  useEffect(() => {
    if (instancedMeshRef.current) {
      const temp = new Object3D();

      for (let i = 0; i < count; i++) {
        const [x, y, z] = positions[i] || [0, 0, 0];
        temp.position.set(x, y, z);
        temp.updateMatrix();
        instancedMeshRef.current.setMatrixAt(i, temp.matrix);
      }

      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [count, positions]);

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[geometry, material, count]}
    />
  );
}
```

---

## Shader Integration

### Custom Shader Materials

Creating and using custom GLSL shaders.

```typescript
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

// Define custom shader material
const CustomShaderMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color(0.2, 0.0, 0.1),
    intensity: 1.0
  },
  // Vertex shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float time;
    uniform vec3 color;
    uniform float intensity;
    varying vec2 vUv;

    void main() {
      vec2 p = vUv - 0.5;
      float r = length(p);
      float angle = atan(p.y, p.x);

      float wave = sin(r * 10.0 - time * 2.0) * 0.5 + 0.5;
      vec3 finalColor = color * wave * intensity;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

// Extend Three.js with the custom material
extend({ CustomShaderMaterial });

// TypeScript declaration
declare module '@react-three/fiber' {
  interface ThreeElements {
    customShaderMaterial: any;
  }
}

// Usage component
function ShaderMesh() {
  const materialRef = useRef<any>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.time = state.clock.elapsedTime;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <customShaderMaterial
        ref={materialRef}
        color={[0.8, 0.2, 0.9]}
        intensity={1.5}
      />
    </mesh>
  );
}
```

### Post-Processing Effects

Implementing post-processing with drei/postprocessing.

```typescript
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';

function PostProcessingEffects() {
  return (
    <EffectComposer multisampling={8}>
      <Bloom
        intensity={1.5}
        luminanceThreshold={0.9}
        luminanceSmoothing={0.025}
        height={300}
      />
      <ChromaticAberration
        offset={[0.001, 0.001]}
      />
    </EffectComposer>
  );
}
```

---

## Animation Systems

### Spring Animations

Using react-spring for smooth Three.js animations.

```typescript
import { useSpring, animated } from '@react-spring/three';

function SpringAnimatedMesh() {
  const [active, setActive] = useState(false);

  const { scale, rotation } = useSpring({
    scale: active ? [1.5, 1.5, 1.5] : [1, 1, 1],
    rotation: active ? [0, Math.PI, 0] : [0, 0, 0],
    config: { tension: 300, friction: 30 }
  });

  return (
    <animated.mesh
      scale={scale}
      rotation={rotation}
      onClick={() => setActive(!active)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </animated.mesh>
  );
}
```

### Timeline Animations

Creating complex animation sequences.

```typescript
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

function TimelineAnimation() {
  const meshRef = useRef<THREE.Mesh>(null);

  useGSAP(() => {
    if (meshRef.current) {
      const tl = gsap.timeline({ repeat: -1, yoyo: true });

      tl.to(meshRef.current.position, {
        y: 2,
        duration: 1,
        ease: "power2.inOut"
      })
      .to(meshRef.current.rotation, {
        y: Math.PI * 2,
        duration: 2,
        ease: "none"
      }, 0);
    }
  }, []);

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
}
```

---

## Best Practices

### 1. Resource Management

Always dispose of Three.js resources properly:

```typescript
useEffect(() => {
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshStandardMaterial();

  return () => {
    geometry.dispose();
    material.dispose();
  };
}, []);
```

### 2. Performance Monitoring

Integrate with performance monitoring:

```typescript
function PerformanceAwareComponent() {
  const { trackFrame } = usePerformanceMonitor();

  useFrame((state, delta) => {
    const startTime = performance.now();

    // Component logic here

    const renderTime = performance.now() - startTime;
    trackFrame(renderTime);
  });

  return <mesh>...</mesh>;
}
```

### 3. Conditional Rendering

Use conditional rendering for performance:

```typescript
function ConditionalMesh({ distance }: { distance: number }) {
  const shouldRender = distance < 50;

  return shouldRender ? (
    <mesh>
      <complexGeometry />
      <expensiveMaterial />
    </mesh>
  ) : null;
}
```

### 4. Memoization

Memoize expensive computations:

```typescript
function OptimizedComponent({ count }: { count: number }) {
  const positions = useMemo(() => {
    return Array.from({ length: count }, (_, i) => [
      Math.random() * 10,
      Math.random() * 10,
      Math.random() * 10
    ]);
  }, [count]);

  return <InstancedObjects positions={positions} />;
}
```

### 5. Error Boundaries

Wrap Three.js components in error boundaries:

```typescript
function ThreeJSErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={<div>3D content failed to load</div>}
      onError={(error) => console.error('Three.js error:', error)}
    >
      <Suspense fallback={<LoadingMesh />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}
```

This comprehensive Three.js integration documentation provides all the patterns and utilities needed for building performant 3D experiences in the LightBrush Website project.