# Utilities API Documentation

This document provides comprehensive documentation for utility functions and classes used in the LightBrush Website project.

## Table of Contents

- [ResourcePool](#resourcepool)
- [Performance Utilities](#performance-utilities)
- [Three.js Utilities](#threejs-utilities)
- [Hook Utilities](#hook-utilities)

---

## ResourcePool

A sophisticated resource management system for Three.js objects that provides object pooling, automatic cleanup, and memory optimization.

### Overview

The ResourcePool system consists of four specialized pools:
- **GeometryPool**: Manages reusable BufferGeometry instances
- **MaterialPool**: Manages reusable Material instances
- **TexturePool**: Manages texture caching and loading
- **ObjectPool**: Manages reusable Object3D instances

### Usage

```typescript
import { ResourcePool, useResourcePool } from '../utils/ResourcePool';

// Using the singleton directly
const pool = ResourcePool.getInstance();

// Using the React hook (recommended)
function MyComponent() {
  const {
    getGeometry,
    releaseGeometry,
    getMaterial,
    releaseMaterial,
    getTexture,
    getObject,
    releaseObject,
    getStats,
    cleanup
  } = useResourcePool();

  useEffect(() => {
    // Get a box geometry
    const geometry = getGeometry('box', () => new THREE.BoxGeometry(), 1, 1, 1);

    // Get a material
    const material = getMaterial('standard', () => new THREE.MeshStandardMaterial(), {
      color: 0xff0000,
      metalness: 0.5
    });

    // Cleanup when component unmounts
    return () => {
      releaseGeometry(geometry);
      releaseMaterial(material);
    };
  }, []);
}
```

### API Reference

#### ResourcePool.getInstance()

Returns the singleton instance of the ResourcePool.

**Returns:** `ResourcePool`

#### getGeometry(type, factory, ...args)

Gets a geometry from the pool or creates a new one if none available.

**Parameters:**
- `type` (string): Unique identifier for the geometry type
- `factory` (() => T): Function that creates a new geometry instance
- `...args` (any[]): Arguments passed to the factory function for cache key generation

**Returns:** `T extends THREE.BufferGeometry`

**Example:**
```typescript
const boxGeometry = getGeometry('box', () => new THREE.BoxGeometry(), 2, 2, 2);
const sphereGeometry = getGeometry('sphere', () => new THREE.SphereGeometry(), 1, 32, 32);
```

#### releaseGeometry(geometry)

Returns a geometry to the pool for reuse.

**Parameters:**
- `geometry` (THREE.BufferGeometry & PooledResource): The geometry to release

#### getMaterial(type, factory, properties)

Gets a material from the pool or creates a new one if none available.

**Parameters:**
- `type` (string): Unique identifier for the material type
- `factory` (() => T): Function that creates a new material instance
- `properties` (object): Properties to apply to the material

**Returns:** `T extends THREE.Material`

**Example:**
```typescript
const material = getMaterial('standard', () => new THREE.MeshStandardMaterial(), {
  color: 0x00ff00,
  roughness: 0.3,
  metalness: 0.7
});
```

#### releaseMaterial(material)

Returns a material to the pool for reuse.

**Parameters:**
- `material` (THREE.Material & PooledResource): The material to release

#### getTexture(url, loader?)

Gets a texture from cache or loads it if not cached.

**Parameters:**
- `url` (string): URL of the texture to load
- `loader` (THREE.TextureLoader, optional): Custom texture loader

**Returns:** `Promise<THREE.Texture>`

**Example:**
```typescript
const texture = await getTexture('/textures/diffuse.jpg');
const normalMap = await getTexture('/textures/normal.jpg', customLoader);
```

#### preloadTextures(urls)

Preloads multiple textures for faster access later.

**Parameters:**
- `urls` (string[]): Array of texture URLs to preload

**Returns:** `Promise<THREE.Texture[]>`

#### getObject(type, factory)

Gets an Object3D from the pool or creates a new one.

**Parameters:**
- `type` (string): Unique identifier for the object type
- `factory` (() => T): Function that creates a new object instance

**Returns:** `T extends THREE.Object3D`

**Example:**
```typescript
const mesh = getObject('projectile', () => {
  const mesh = new THREE.Mesh();
  mesh.geometry = getGeometry('sphere', () => new THREE.SphereGeometry(), 0.1);
  mesh.material = getMaterial('basic', () => new THREE.MeshBasicMaterial(), { color: 0xffff00 });
  return mesh;
});
```

#### releaseObject(object)

Returns an object to the pool for reuse.

**Parameters:**
- `object` (THREE.Object3D & PooledResource): The object to release

#### getAllStats()

Returns statistics about all resource pools.

**Returns:**
```typescript
{
  geometries: Map<string, { total: number; inUse: number; available: number }>;
  materials: Map<string, { total: number; inUse: number; available: number }>;
  textures: { cached: number; maxSize: number };
  objects: Map<string, { total: number; inUse: number; available: number }>;
}
```

#### cleanup()

Performs cleanup of old and unused resources across all pools.

### Pool Configuration

Each pool has configurable limits and behaviors:

#### GeometryPool
- **Max Pool Size**: 50 geometries per type
- **Max Age**: 30 seconds for unused geometries
- **Auto-cleanup**: Removes old unused geometries

#### MaterialPool
- **Max Pool Size**: 30 materials per type
- **Max Age**: 60 seconds for unused materials
- **Property Updates**: Materials are updated with new properties when reused

#### TexturePool
- **Max Cache Size**: 100 textures
- **Caching Strategy**: LRU (Least Recently Used) eviction
- **Cloning**: Returns clones of cached textures to prevent conflicts

#### ObjectPool
- **Max Pool Size**: 20 objects per type
- **State Reset**: Objects are reset to default state when reused
- **Parent Removal**: Objects are removed from parents when released

---

## Performance Utilities

### PooledResource Interface

```typescript
interface PooledResource {
  id: string;           // Unique identifier
  inUse: boolean;       // Whether the resource is currently in use
  lastUsed: number;     // Timestamp of last use
  createdAt: number;    // Timestamp of creation
}
```

### Resource Management Best Practices

#### 1. Always Release Resources

```typescript
function MyComponent() {
  const { getGeometry, releaseGeometry } = useResourcePool();

  useEffect(() => {
    const geometry = getGeometry('box', () => new THREE.BoxGeometry());

    // Always clean up
    return () => {
      releaseGeometry(geometry);
    };
  }, []);
}
```

#### 2. Use Descriptive Type Names

```typescript
// Good: Descriptive and unique
const playerGeometry = getGeometry('player-character', factoryFn, size);
const bulletGeometry = getGeometry('bullet-projectile', factoryFn, size);

// Bad: Generic and might conflict
const geometry1 = getGeometry('mesh', factoryFn, size);
const geometry2 = getGeometry('object', factoryFn, size);
```

#### 3. Monitor Pool Usage

```typescript
function PerformanceMonitor() {
  const { getStats } = useResourcePool();

  useEffect(() => {
    const interval = setInterval(() => {
      const stats = getStats();
      console.log('Pool usage:', stats);
    }, 5000);

    return () => clearInterval(interval);
  }, []);
}
```

#### 4. Preload Critical Resources

```typescript
function GameLoader() {
  const { preloadTextures, getGeometry, getMaterial } = useResourcePool();

  useEffect(() => {
    // Preload textures
    preloadTextures([
      '/textures/player.jpg',
      '/textures/environment.jpg',
      '/textures/effects.jpg'
    ]).then(() => {
      // Pre-warm geometry and material pools
      const commonGeometries = [
        getGeometry('box', () => new THREE.BoxGeometry()),
        getGeometry('sphere', () => new THREE.SphereGeometry()),
        getGeometry('plane', () => new THREE.PlaneGeometry())
      ];

      const commonMaterials = [
        getMaterial('standard', () => new THREE.MeshStandardMaterial()),
        getMaterial('basic', () => new THREE.MeshBasicMaterial())
      ];

      // Release immediately to populate pools
      commonGeometries.forEach(releaseGeometry);
      commonMaterials.forEach(releaseMaterial);
    });
  }, []);
}
```

---

## Three.js Utilities

### Geometry Factory Functions

Common factory functions for creating geometries:

```typescript
// Box geometry factory
const createBoxGeometry = (width = 1, height = 1, depth = 1) =>
  () => new THREE.BoxGeometry(width, height, depth);

// Sphere geometry factory
const createSphereGeometry = (radius = 1, widthSegments = 32, heightSegments = 32) =>
  () => new THREE.SphereGeometry(radius, widthSegments, heightSegments);

// Usage
const box = getGeometry('box', createBoxGeometry(2, 2, 2));
const sphere = getGeometry('sphere', createSphereGeometry(1.5, 16, 16));
```

### Material Factory Functions

```typescript
// Standard material factory
const createStandardMaterial = () => new THREE.MeshStandardMaterial();

// Basic material factory
const createBasicMaterial = () => new THREE.MeshBasicMaterial();

// Lambert material factory
const createLambertMaterial = () => new THREE.MeshLambertMaterial();

// Usage with properties
const material = getMaterial('standard', createStandardMaterial, {
  color: 0xff0000,
  roughness: 0.5,
  metalness: 0.2
});
```

### Object Factory Functions

```typescript
// Mesh factory
const createMesh = (geometryType: string, materialType: string) => () => {
  const mesh = new THREE.Mesh();
  mesh.geometry = getGeometry(geometryType, createBoxGeometry());
  mesh.material = getMaterial(materialType, createStandardMaterial);
  return mesh;
};

// Group factory
const createGroup = () => () => new THREE.Group();

// Usage
const playerMesh = getObject('player', createMesh('player-box', 'player-material'));
const effectGroup = getObject('effects', createGroup());
```

---

## Hook Utilities

### useResourcePool Hook

A React hook that provides access to the ResourcePool with automatic cleanup.

```typescript
import { useResourcePool } from '../utils/ResourcePool';

function useOptimizedMesh(geometryType: string, materialProps: any) {
  const { getGeometry, getMaterial, releaseGeometry, releaseMaterial } = useResourcePool();
  const [mesh, setMesh] = useState<THREE.Mesh | null>(null);

  useEffect(() => {
    const geometry = getGeometry(geometryType, () => new THREE.BoxGeometry());
    const material = getMaterial('standard', () => new THREE.MeshStandardMaterial(), materialProps);

    const newMesh = new THREE.Mesh(geometry, material);
    setMesh(newMesh);

    return () => {
      releaseGeometry(geometry);
      releaseMaterial(material);
    };
  }, [geometryType, JSON.stringify(materialProps)]);

  return mesh;
}
```

### Memory Monitoring Hook

```typescript
function useResourceMonitoring(interval = 5000) {
  const { getStats } = useResourcePool();
  const [resourceStats, setResourceStats] = useState(null);

  useEffect(() => {
    const updateStats = () => {
      setResourceStats(getStats());
    };

    updateStats(); // Initial update
    const timer = setInterval(updateStats, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return resourceStats;
}
```

---

## Advanced Usage Examples

### Dynamic Object Creation System

```typescript
class DynamicObjectManager {
  private pool = ResourcePool.getInstance();
  private activeObjects = new Set<THREE.Object3D>();

  createProjectile(position: THREE.Vector3, velocity: THREE.Vector3): THREE.Mesh {
    const geometry = this.pool.getGeometry('projectile-sphere',
      () => new THREE.SphereGeometry(0.05, 8, 8)
    );

    const material = this.pool.getMaterial('projectile-material',
      () => new THREE.MeshBasicMaterial(),
      { color: 0xffff00 }
    );

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.userData.velocity = velocity;

    this.activeObjects.add(mesh);
    return mesh;
  }

  destroyProjectile(mesh: THREE.Mesh) {
    this.pool.releaseGeometry(mesh.geometry as any);
    this.pool.releaseMaterial(mesh.material as any);
    this.activeObjects.delete(mesh);

    if (mesh.parent) {
      mesh.parent.remove(mesh);
    }
  }

  cleanup() {
    this.activeObjects.forEach(obj => {
      this.destroyProjectile(obj as THREE.Mesh);
    });
    this.activeObjects.clear();
  }
}
```

### Texture Atlas Management

```typescript
class TextureAtlasManager {
  private pool = ResourcePool.getInstance();
  private atlases = new Map<string, THREE.Texture>();

  async loadAtlas(name: string, url: string): Promise<THREE.Texture> {
    if (this.atlases.has(name)) {
      return this.atlases.get(name)!.clone();
    }

    const texture = await this.pool.getTexture(url);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;

    this.atlases.set(name, texture);
    return texture.clone();
  }

  createMaterialFromAtlas(atlasName: string, uvOffset: [number, number], uvScale: [number, number]) {
    const atlas = this.atlases.get(atlasName);
    if (!atlas) throw new Error(`Atlas ${atlasName} not loaded`);

    return this.pool.getMaterial('atlas-material',
      () => new THREE.MeshBasicMaterial(),
      {
        map: atlas.clone(),
        transparent: true
      }
    );
  }
}
```

This comprehensive utility system provides efficient resource management for Three.js applications, ensuring optimal performance and memory usage through intelligent pooling and caching strategies.