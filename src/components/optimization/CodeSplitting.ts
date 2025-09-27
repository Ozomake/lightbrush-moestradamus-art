import { lazy } from 'react';

// Lazy load heavy 3D components with proper chunk names
export const LazyInteractiveHero3D = lazy(() =>
  import('../3d/optimized/OptimizedInteractiveHero3D').then(module => ({
    default: module.default
  }))
);

export const LazySacredGeometry = lazy(() =>
  import('../3d/optimized/OptimizedSacredGeometry').then(module => ({
    default: module.SacredGeometryComposite
  }))
);

export const LazyMetatronsCube = lazy(() =>
  import('../3d/optimized/OptimizedSacredGeometry').then(module => ({
    default: module.MetatronsCube
  }))
);

export const LazyFlowerOfLife = lazy(() =>
  import('../3d/optimized/OptimizedSacredGeometry').then(module => ({
    default: module.FlowerOfLife
  }))
);

export const LazyMerkaba = lazy(() =>
  import('../3d/optimized/OptimizedSacredGeometry').then(module => ({
    default: module.Merkaba
  }))
);

export const LazyPlatonicSolids = lazy(() =>
  import('../3d/optimized/OptimizedSacredGeometry').then(module => ({
    default: module.PlatonicSolids
  }))
);

// Game-related 3D components
export const LazyVJCareerGame3D = lazy(() =>
  import('../game/VJCareerGame3D')
);

export const LazyGameEnvironment3D = lazy(() =>
  import('../3d/GameEnvironment3D')
);

// Simulator components
export const LazyProjectionSimulator = lazy(() =>
  import('../simulator/ProjectionSimulator')
);

export const LazyBasicProjectionSimulator = lazy(() =>
  import('../simulator/BasicProjectionSimulator')
);

export const LazySurface3D = lazy(() =>
  import('../simulator/Surface3D')
);

// Portfolio and showcase components
export const LazyEquipmentViewer3D = lazy(() =>
  import('../portfolio/EquipmentViewer3D')
);

export const LazyProjectShowcase3D = lazy(() =>
  import('../3d/ProjectShowcase3D')
);

export const LazyWorkingHero3D = lazy(() =>
  import('../3d/WorkingHero3D')
);

export const LazyProjectionMappingSimulator = lazy(() =>
  import('../3d/ProjectionMappingSimulator')
);

// Game levels
export const LazyLevel1Kitchen = lazy(() =>
  import('../../game/levels/Level1Kitchen')
);

export const LazyLevel2ParkingLot = lazy(() =>
  import('../../game/levels/Level2ParkingLot')
);

export const LazyLevel3Festival = lazy(() =>
  import('../../game/levels/Level3Festival')
);

// Post-processing effects
export const LazyPostProcessingEffects = lazy(() =>
  import('../3d/PostProcessingEffects')
);

// Preload function for critical components
export async function preloadCriticalComponents() {
  const criticalComponents = [
    LazyInteractiveHero3D,
    LazySacredGeometry,
    LazyProjectionSimulator,
  ];

  try {
    await Promise.all(criticalComponents.map(component =>
      // Trigger the lazy loading
      component.toString()
    ));
    console.log('Critical 3D components preloaded successfully');
  } catch (error) {
    console.warn('Failed to preload some critical components:', error);
  }
}

// Progressive loading function
export async function progressiveLoadComponents(priority: 'high' | 'medium' | 'low') {
  const componentGroups = {
    high: [LazyInteractiveHero3D, LazySacredGeometry, LazyProjectionSimulator],
    medium: [LazyVJCareerGame3D, LazyEquipmentViewer3D, LazyProjectShowcase3D],
    low: [LazyLevel1Kitchen, LazyLevel2ParkingLot, LazyLevel3Festival, LazyPostProcessingEffects]
  };

  const components = componentGroups[priority] || [];

  try {
    for (const component of components) {
      await component;
      // Small delay between loads to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    console.log(`${priority} priority components loaded`);
  } catch (error) {
    console.warn(`Failed to load ${priority} priority components:`, error);
  }
}

// Route-based code splitting configuration
export const routeBasedComponents = {
  '/': [LazyInteractiveHero3D],
  '/portfolio': [LazyEquipmentViewer3D, LazyProjectShowcase3D],
  '/simulator': [LazyProjectionSimulator, LazyBasicProjectionSimulator, LazySurface3D],
  '/game': [LazyVJCareerGame3D, LazyGameEnvironment3D],
  '/sacred': [LazySacredGeometry, LazyMetatronsCube, LazyFlowerOfLife, LazyMerkaba],
  '/about': [LazyWorkingHero3D],
  '/levels': [LazyLevel1Kitchen, LazyLevel2ParkingLot, LazyLevel3Festival],
};

// Dynamic import helper with error handling
export async function loadComponentSafely<T>(
  importer: () => Promise<{ default: T }>,
  fallback?: T
): Promise<T | undefined> {
  try {
    const module = await importer();
    return module.default;
  } catch (error) {
    console.error('Failed to load component:', error);
    return fallback;
  }
}

// Bundle analyzer helper function
export function analyzeBundleSize() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Bundle analysis:');
    console.log('- Critical components: InteractiveHero3D, SacredGeometry');
    console.log('- Secondary components: Game environments, Simulators');
    console.log('- Optional components: Game levels, Effects');
  }
}

export default {
  LazyInteractiveHero3D,
  LazySacredGeometry,
  LazyMetatronsCube,
  LazyFlowerOfLife,
  LazyMerkaba,
  LazyPlatonicSolids,
  LazyVJCareerGame3D,
  LazyGameEnvironment3D,
  LazyProjectionSimulator,
  LazyBasicProjectionSimulator,
  LazySurface3D,
  LazyEquipmentViewer3D,
  LazyProjectShowcase3D,
  LazyWorkingHero3D,
  LazyProjectionMappingSimulator,
  LazyLevel1Kitchen,
  LazyLevel2ParkingLot,
  LazyLevel3Festival,
  LazyPostProcessingEffects,
  preloadCriticalComponents,
  progressiveLoadComponents,
  routeBasedComponents,
  loadComponentSafely,
  analyzeBundleSize,
};