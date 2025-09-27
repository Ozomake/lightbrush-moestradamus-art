import React, { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Texture, TextureLoader } from 'three';

// Intersection Observer hook for visibility detection
function useIntersectionObserver(
  threshold = 0.1,
  rootMargin = '100px'
): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Disconnect observer once visible to prevent unnecessary re-renders
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, isVisible];
}

// Preload manager for 3D assets
class AssetPreloader {
  private static instance: AssetPreloader;
  private loadedAssets = new Set<string>();
  private loadingPromises = new Map<string, Promise<any>>();

  static getInstance(): AssetPreloader {
    if (!AssetPreloader.instance) {
      AssetPreloader.instance = new AssetPreloader();
    }
    return AssetPreloader.instance;
  }

  async preloadComponent(componentName: string, importer: () => Promise<any>): Promise<any> {
    if (this.loadedAssets.has(componentName)) {
      return;
    }

    if (this.loadingPromises.has(componentName)) {
      return this.loadingPromises.get(componentName);
    }

    const promise = importer().then((module) => {
      this.loadedAssets.add(componentName);
      this.loadingPromises.delete(componentName);
      return module;
    });

    this.loadingPromises.set(componentName, promise);
    return promise;
  }

  isLoaded(componentName: string): boolean {
    return this.loadedAssets.has(componentName);
  }

  preloadTextures(urls: string[]): Promise<Texture[]> {
    const loader = new TextureLoader();
    return Promise.all(
      urls.map(url =>
        new Promise<Texture>((resolve, reject) => {
          loader.load(url, resolve, undefined, reject);
        })
      )
    );
  }
}

// Loading fallback component
const LoadingFallback = React.memo(() => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshBasicMaterial color="#666" transparent opacity={0.3} />
  </mesh>
));

// Performance-aware loading placeholder
function LoadingPlaceholder({
  message = "Loading 3D content...",
  showSpinner = true,
  minHeight = "200px"
}: {
  message?: string;
  showSpinner?: boolean;
  minHeight?: string;
}) {
  return (
    <div
      className="flex items-center justify-center bg-gray-900/50 backdrop-blur-sm rounded-lg"
      style={{ minHeight }}
    >
      <div className="text-center text-white">
        {showSpinner && (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
        )}
        <p className="text-sm opacity-75">{message}</p>
      </div>
    </div>
  );
}

// Adaptive quality 3D Canvas wrapper
interface AdaptiveCanvasProps {
  children: React.ReactNode;
  className?: string;
  qualityLevel?: 'high' | 'medium' | 'low' | 'auto' | 'critical';
  enableShadows?: boolean;
  enableAntialiasing?: boolean;
}

const AdaptiveCanvas = React.memo<AdaptiveCanvasProps>(({
  children,
  className = "w-full h-full",
  qualityLevel = 'auto',
  enableShadows = true,
  enableAntialiasing = true
}) => {
  const [adaptiveQuality, setAdaptiveQuality] = useState<'high' | 'medium' | 'low'>('high');

  useEffect(() => {
    if (qualityLevel === 'auto') {
      // Detect device capabilities
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

      if (!gl) {
        setAdaptiveQuality('low');
        return;
      }

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';

      // Simple device classification
      if (renderer.includes('Intel') || navigator.hardwareConcurrency < 4) {
        setAdaptiveQuality('medium');
      } else if (renderer.includes('GTX') || renderer.includes('RTX') || renderer.includes('Radeon')) {
        setAdaptiveQuality('high');
      } else {
        setAdaptiveQuality('medium');
      }
    } else if (qualityLevel === 'critical') {
      setAdaptiveQuality('low');
    } else {
      setAdaptiveQuality(qualityLevel);
    }
  }, [qualityLevel]);

  const canvasProps = {
    shadows: enableShadows && adaptiveQuality !== 'low',
    gl: {
      alpha: true,
      antialias: enableAntialiasing && adaptiveQuality === 'high',
      powerPreference: adaptiveQuality === 'high' ? 'high-performance' as const : 'default' as const,
      precision: adaptiveQuality === 'high' ? 'highp' as const : 'mediump' as const,
    },
    performance: {
      min: adaptiveQuality === 'low' ? 0.2 : adaptiveQuality === 'medium' ? 0.5 : 0.75,
    },
  };

  return (
    <Canvas className={className} {...canvasProps}>
      {children}
    </Canvas>
  );
});

// Lazy loading wrapper for 3D components
interface Lazy3DComponentProps {
  componentName: string;
  importer: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  placeholder?: React.ReactNode;
  preloadTextures?: string[];
  className?: string;
  canvasProps?: Partial<AdaptiveCanvasProps>;
  intersectionThreshold?: number;
  rootMargin?: string;
  [key: string]: any;
}

export const Lazy3DComponent: React.FC<Lazy3DComponentProps> = ({
  componentName,
  importer,
  fallback = <LoadingFallback />,
  placeholder = <LoadingPlaceholder />,
  preloadTextures = [],
  className = "w-full h-64",
  canvasProps = {},
  intersectionThreshold = 0.1,
  rootMargin = '100px',
  ...props
}) => {
  const [containerRef, isVisible] = useIntersectionObserver(intersectionThreshold, rootMargin);
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const preloader = AssetPreloader.getInstance();

  useEffect(() => {
    if (isVisible && !Component && !isLoading) {
      setIsLoading(true);

      Promise.all([
        preloader.preloadComponent(componentName, importer),
        preloadTextures.length > 0 ? preloader.preloadTextures(preloadTextures) : Promise.resolve([])
      ])
      .then(([module]) => {
        setComponent(() => module.default);
        setError(null);
      })
      .catch((err) => {
        console.error(`Failed to load 3D component ${componentName}:`, err);
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
    }
  }, [isVisible, Component, isLoading, componentName, importer, preloadTextures, preloader]);

  return (
    <div ref={containerRef} className={className}>
      {!isVisible ? (
        <div className="w-full h-full bg-gray-900/30 rounded-lg flex items-center justify-center">
          <span className="text-gray-400 text-sm">Scroll to load 3D content</span>
        </div>
      ) : error ? (
        <div className="w-full h-full bg-red-900/20 rounded-lg flex items-center justify-center">
          <span className="text-red-400 text-sm">Failed to load 3D content</span>
        </div>
      ) : !Component ? (
        placeholder
      ) : (
        <Suspense fallback={
          <AdaptiveCanvas {...canvasProps}>
            {fallback}
          </AdaptiveCanvas>
        }>
          <AdaptiveCanvas {...canvasProps}>
            <Component {...props} />
          </AdaptiveCanvas>
        </Suspense>
      )}
    </div>
  );
};

// Batch lazy loader for multiple 3D components
interface BatchLazy3DProps {
  components: Array<{
    name: string;
    importer: () => Promise<{ default: React.ComponentType<any> }>;
    props?: any;
    className?: string;
  }>;
  maxConcurrent?: number;
  preloadOnHover?: boolean;
}

export const BatchLazy3D: React.FC<BatchLazy3DProps> = ({
  components,
  maxConcurrent = 2,
  preloadOnHover = true
}) => {
  const [loadQueue, setLoadQueue] = useState<string[]>([]);
  const [loadingCount, setLoadingCount] = useState(0);
  const preloader = AssetPreloader.getInstance();

  const handlePreload = useCallback((componentName: string, _importer: () => Promise<any>) => {
    if (!preloader.isLoaded(componentName) && !loadQueue.includes(componentName)) {
      setLoadQueue(prev => [...prev, componentName]);
    }
  }, [preloader, loadQueue]);

  useEffect(() => {
    if (loadQueue.length > 0 && loadingCount < maxConcurrent) {
      const nextComponent = components.find(comp => loadQueue.includes(comp.name));
      if (nextComponent) {
        setLoadingCount(prev => prev + 1);
        preloader.preloadComponent(nextComponent.name, nextComponent.importer)
          .finally(() => {
            setLoadingCount(prev => prev - 1);
            setLoadQueue(prev => prev.filter(name => name !== nextComponent.name));
          });
      }
    }
  }, [loadQueue, loadingCount, maxConcurrent, components, preloader]);

  return (
    <>
      {components.map((component, _index) => (
        <div
          key={component.name}
          onMouseEnter={preloadOnHover ? () => handlePreload(component.name, component.importer) : undefined}
          className={component.className}
        >
          <Lazy3DComponent
            componentName={component.name}
            importer={component.importer}
            {...component.props}
          />
        </div>
      ))}
    </>
  );
};

// Progressive enhancement loader for 3D scenes
export const Progressive3DScene: React.FC<{
  children: React.ReactNode;
  enableProgressive?: boolean;
  className?: string;
}> = ({ children, enableProgressive = true, className = "w-full h-full" }) => {
  const [qualityLevel, setQualityLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!enableProgressive) {
      setQualityLevel('high');
      setHasLoaded(true);
      return;
    }

    // Progressive loading sequence
    const sequence = [
      { quality: 'low' as const, delay: 0 },
      { quality: 'medium' as const, delay: 1000 },
      { quality: 'high' as const, delay: 2000 },
    ];

    sequence.forEach(({ quality, delay }) => {
      setTimeout(() => {
        setQualityLevel(quality);
        if (quality === 'high') {
          setHasLoaded(true);
        }
      }, delay);
    });
  }, [enableProgressive]);

  return (
    <div className={className}>
      <AdaptiveCanvas qualityLevel={qualityLevel}>
        {children}
      </AdaptiveCanvas>
      {!hasLoaded && enableProgressive && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Quality: {qualityLevel}
        </div>
      )}
    </div>
  );
};

export { AssetPreloader, LoadingPlaceholder, AdaptiveCanvas };
export default Lazy3DComponent;