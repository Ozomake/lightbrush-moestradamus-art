import * as THREE from 'three';

// Resource pool interface for different Three.js object types
interface PooledResource {
  id: string;
  inUse: boolean;
  lastUsed: number;
  createdAt: number;
}

// Geometry pool for frequently used geometries
class GeometryPool {
  private static instance: GeometryPool;
  private pools = new Map<string, Array<THREE.BufferGeometry & PooledResource>>();
  private maxPoolSize = 50;
  private maxAge = 30000; // 30 seconds

  static getInstance(): GeometryPool {
    if (!GeometryPool.instance) {
      GeometryPool.instance = new GeometryPool();
    }
    return GeometryPool.instance;
  }

  getGeometry<T extends THREE.BufferGeometry>(
    type: string,
    factory: () => T,
    ...args: any[]
  ): T {
    const key = `${type}_${JSON.stringify(args)}`;
    let pool = this.pools.get(key);

    if (!pool) {
      pool = [];
      this.pools.set(key, pool);
    }

    // Find available geometry in pool
    const available = pool.find(geo => !geo.inUse);

    if (available) {
      available.inUse = true;
      available.lastUsed = performance.now();
      return available as unknown as T;
    }

    // Create new geometry if pool not full
    if (pool.length < this.maxPoolSize) {
      const geometry = factory();
      const pooledGeometry = geometry as unknown as T & PooledResource;
      (pooledGeometry as any).id = `${key}_${pool.length}`;
      (pooledGeometry as any).inUse = true;
      (pooledGeometry as any).lastUsed = performance.now();
      (pooledGeometry as any).createdAt = performance.now();
      pool.push(pooledGeometry as unknown as THREE.BufferGeometry & PooledResource);
      return pooledGeometry;
    }

    // Fallback: create non-pooled geometry
    console.warn(`Geometry pool ${key} is full, creating non-pooled instance`);
    return factory();
  }

  releaseGeometry(geometry: THREE.BufferGeometry & PooledResource): void {
    if (geometry.inUse !== undefined) {
      geometry.inUse = false;
      geometry.lastUsed = performance.now();
    }
  }

  cleanup(): void {
    const now = performance.now();

    for (const [key, pool] of this.pools.entries()) {
      // Remove old unused geometries
      const toRemove = pool.filter(geo =>
        !geo.inUse && (now - geo.lastUsed) > this.maxAge
      );

      toRemove.forEach(geo => {
        geo.dispose();
        const index = pool.indexOf(geo);
        if (index > -1) {
          pool.splice(index, 1);
        }
      });

      // Remove empty pools
      if (pool.length === 0) {
        this.pools.delete(key);
      }
    }
  }

  getStats() {
    const stats = new Map<string, { total: number; inUse: number; available: number }>();

    for (const [key, pool] of this.pools.entries()) {
      const inUse = pool.filter(geo => geo.inUse).length;
      stats.set(key, {
        total: pool.length,
        inUse,
        available: pool.length - inUse,
      });
    }

    return stats;
  }
}

// Material pool for frequently used materials
class MaterialPool {
  private static instance: MaterialPool;
  private pools = new Map<string, Array<THREE.Material & PooledResource>>();
  private maxPoolSize = 30;
  private maxAge = 60000; // 60 seconds

  static getInstance(): MaterialPool {
    if (!MaterialPool.instance) {
      MaterialPool.instance = new MaterialPool();
    }
    return MaterialPool.instance;
  }

  getMaterial<T extends THREE.Material>(
    type: string,
    factory: () => T,
    properties: any = {}
  ): T {
    const key = `${type}_${JSON.stringify(properties)}`;
    let pool = this.pools.get(key);

    if (!pool) {
      pool = [];
      this.pools.set(key, pool);
    }

    // Find available material in pool
    const available = pool.find(mat => !mat.inUse);

    if (available) {
      available.inUse = true;
      available.lastUsed = performance.now();
      // Update material properties
      Object.assign(available, properties);
      return available as unknown as T;
    }

    // Create new material if pool not full
    if (pool.length < this.maxPoolSize) {
      const material = factory();
      const pooledMaterial = material as unknown as T & PooledResource;
      Object.assign(pooledMaterial, properties);
      (pooledMaterial as any).id = `${key}_${pool.length}`;
      (pooledMaterial as any).inUse = true;
      (pooledMaterial as any).lastUsed = performance.now();
      (pooledMaterial as any).createdAt = performance.now();
      pool.push(pooledMaterial as unknown as THREE.Material & PooledResource);
      return pooledMaterial;
    }

    // Fallback: create non-pooled material
    console.warn(`Material pool ${key} is full, creating non-pooled instance`);
    const material = factory();
    Object.assign(material, properties);
    return material;
  }

  releaseMaterial(material: THREE.Material & PooledResource): void {
    if (material.inUse !== undefined) {
      material.inUse = false;
      material.lastUsed = performance.now();
    }
  }

  cleanup(): void {
    const now = performance.now();

    for (const [key, pool] of this.pools.entries()) {
      // Remove old unused materials
      const toRemove = pool.filter(mat =>
        !mat.inUse && (now - mat.lastUsed) > this.maxAge
      );

      toRemove.forEach(mat => {
        mat.dispose();
        const index = pool.indexOf(mat);
        if (index > -1) {
          pool.splice(index, 1);
        }
      });

      // Remove empty pools
      if (pool.length === 0) {
        this.pools.delete(key);
      }
    }
  }

  getStats() {
    const stats = new Map<string, { total: number; inUse: number; available: number }>();

    for (const [key, pool] of this.pools.entries()) {
      const inUse = pool.filter(mat => mat.inUse).length;
      stats.set(key, {
        total: pool.length,
        inUse,
        available: pool.length - inUse,
      });
    }

    return stats;
  }
}

// Texture pool for frequently used textures
class TexturePool {
  private static instance: TexturePool;
  private cache = new Map<string, THREE.Texture>();
  private maxCacheSize = 100;

  static getInstance(): TexturePool {
    if (!TexturePool.instance) {
      TexturePool.instance = new TexturePool();
    }
    return TexturePool.instance;
  }

  getTexture(url: string, loader?: THREE.TextureLoader): Promise<THREE.Texture> {
    if (this.cache.has(url)) {
      return Promise.resolve(this.cache.get(url)!.clone());
    }

    const textureLoader = loader || new THREE.TextureLoader();

    return new Promise((resolve, reject) => {
      textureLoader.load(
        url,
        (texture) => {
          // Cache the texture if we have space
          if (this.cache.size < this.maxCacheSize) {
            this.cache.set(url, texture.clone());
          }
          resolve(texture);
        },
        undefined,
        reject
      );
    });
  }

  preloadTextures(urls: string[]): Promise<THREE.Texture[]> {
    return Promise.all(urls.map(url => this.getTexture(url)));
  }

  disposeTexture(url: string): void {
    const texture = this.cache.get(url);
    if (texture) {
      texture.dispose();
      this.cache.delete(url);
    }
  }

  cleanup(): void {
    // Remove least recently used textures if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const entries = Array.from(this.cache.entries());
      const toRemove = entries.slice(0, Math.floor(this.maxCacheSize * 0.2));

      toRemove.forEach(([url, texture]) => {
        texture.dispose();
        this.cache.delete(url);
      });
    }
  }

  getStats() {
    return {
      cached: this.cache.size,
      maxSize: this.maxCacheSize,
    };
  }
}

// Object pool for reusable Three.js objects (meshes, groups, etc.)
class ObjectPool {
  private static instance: ObjectPool;
  private pools = new Map<string, Array<THREE.Object3D & PooledResource>>();
  private maxPoolSize = 20;

  static getInstance(): ObjectPool {
    if (!ObjectPool.instance) {
      ObjectPool.instance = new ObjectPool();
    }
    return ObjectPool.instance;
  }

  getObject<T extends THREE.Object3D>(
    type: string,
    factory: () => T
  ): T {
    let pool = this.pools.get(type);

    if (!pool) {
      pool = [];
      this.pools.set(type, pool);
    }

    // Find available object in pool
    const available = pool.find(obj => !obj.inUse);

    if (available) {
      available.inUse = true;
      available.lastUsed = performance.now();
      // Reset object state
      available.position.set(0, 0, 0);
      available.rotation.set(0, 0, 0);
      available.scale.set(1, 1, 1);
      available.visible = true;
      return available as unknown as T;
    }

    // Create new object if pool not full
    if (pool.length < this.maxPoolSize) {
      const object = factory();
      const pooledObject = object as unknown as T & PooledResource;
      (pooledObject as any).id = `${type}_${pool.length}`;
      (pooledObject as any).inUse = true;
      (pooledObject as any).lastUsed = performance.now();
      (pooledObject as any).createdAt = performance.now();
      pool.push(pooledObject as unknown as THREE.Object3D & PooledResource);
      return pooledObject;
    }

    // Fallback: create non-pooled object
    console.warn(`Object pool ${type} is full, creating non-pooled instance`);
    return factory();
  }

  releaseObject(object: THREE.Object3D & PooledResource): void {
    if (object.inUse !== undefined) {
      object.inUse = false;
      object.lastUsed = performance.now();
      // Remove from parent to prevent memory leaks
      if (object.parent) {
        object.parent.remove(object);
      }
    }
  }

  cleanup(): void {
    for (const [type, pool] of this.pools.entries()) {
      // Keep pool size reasonable
      if (pool.length > this.maxPoolSize) {
        const excess = pool.slice(this.maxPoolSize);
        excess.forEach(obj => {
          if (obj.parent) obj.parent.remove(obj);
        });
        this.pools.set(type, pool.slice(0, this.maxPoolSize));
      }
    }
  }

  getStats() {
    const stats = new Map<string, { total: number; inUse: number; available: number }>();

    for (const [type, pool] of this.pools.entries()) {
      const inUse = pool.filter(obj => obj.inUse).length;
      stats.set(type, {
        total: pool.length,
        inUse,
        available: pool.length - inUse,
      });
    }

    return stats;
  }
}

// Main ResourcePool class that coordinates all sub-pools
export class ResourcePool {
  private static instance: ResourcePool;
  private geometryPool = GeometryPool.getInstance();
  private materialPool = MaterialPool.getInstance();
  private texturePool = TexturePool.getInstance();
  private objectPool = ObjectPool.getInstance();
  private cleanupInterval: NodeJS.Timeout | null = null;

  static getInstance(): ResourcePool {
    if (!ResourcePool.instance) {
      ResourcePool.instance = new ResourcePool();
    }
    return ResourcePool.instance;
  }

  constructor() {
    // Auto-cleanup every 30 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 30000);
  }

  // Geometry methods
  getGeometry<T extends THREE.BufferGeometry>(
    type: string,
    factory: () => T,
    ...args: any[]
  ): T {
    return this.geometryPool.getGeometry(type, factory, ...args);
  }

  releaseGeometry(geometry: THREE.BufferGeometry & PooledResource): void {
    this.geometryPool.releaseGeometry(geometry);
  }

  // Material methods
  getMaterial<T extends THREE.Material>(
    type: string,
    factory: () => T,
    properties: any = {}
  ): T {
    return this.materialPool.getMaterial(type, factory, properties);
  }

  releaseMaterial(material: THREE.Material & PooledResource): void {
    this.materialPool.releaseMaterial(material);
  }

  // Texture methods
  getTexture(url: string, loader?: THREE.TextureLoader): Promise<THREE.Texture> {
    return this.texturePool.getTexture(url, loader);
  }

  preloadTextures(urls: string[]): Promise<THREE.Texture[]> {
    return this.texturePool.preloadTextures(urls);
  }

  // Object methods
  getObject<T extends THREE.Object3D>(type: string, factory: () => T): T {
    return this.objectPool.getObject(type, factory);
  }

  releaseObject(object: THREE.Object3D & PooledResource): void {
    this.objectPool.releaseObject(object);
  }

  // Cleanup and stats
  cleanup(): void {
    this.geometryPool.cleanup();
    this.materialPool.cleanup();
    this.texturePool.cleanup();
    this.objectPool.cleanup();
  }

  getAllStats() {
    return {
      geometries: this.geometryPool.getStats(),
      materials: this.materialPool.getStats(),
      textures: this.texturePool.getStats(),
      objects: this.objectPool.getStats(),
    };
  }

  dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cleanup();
  }
}

// React hook for using the resource pool
export function useResourcePool() {
  const pool = ResourcePool.getInstance();

  return {
    getGeometry: pool.getGeometry.bind(pool),
    releaseGeometry: pool.releaseGeometry.bind(pool),
    getMaterial: pool.getMaterial.bind(pool),
    releaseMaterial: pool.releaseMaterial.bind(pool),
    getTexture: pool.getTexture.bind(pool),
    preloadTextures: pool.preloadTextures.bind(pool),
    getObject: pool.getObject.bind(pool),
    releaseObject: pool.releaseObject.bind(pool),
    getStats: pool.getAllStats.bind(pool),
    cleanup: pool.cleanup.bind(pool),
  };
}

export default ResourcePool;