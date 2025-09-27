import { Vector3 } from 'three'

export type SurfaceType = 'building' | 'object' | 'vehicle'

export interface SurfaceGeometry {
  type: 'box' | 'cylinder' | 'sphere' | 'custom'
  dimensions: {
    width: number
    height: number
    depth: number
    radius?: number
  }
  position: Vector3
  uvMapping: UVMapping[]
}

export interface UVMapping {
  face: string
  coordinates: {
    u: [number, number]
    v: [number, number]
  }
  transform: {
    offset: [number, number]
    scale: [number, number]
    rotation: number
  }
}

export interface SurfacePreset {
  id: string
  name: string
  description: string
  geometry: SurfaceGeometry
  materialProperties: {
    reflectivity: number
    roughness: number
    color: string
    ambient: number
  }
  recommendedProjectors: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

// Building Presets
export const buildingPresets: Record<string, SurfacePreset> = {
  modern: {
    id: 'building-modern',
    name: 'Modern Building Facade',
    description: 'Clean, flat surfaces ideal for large-scale projections',
    geometry: {
      type: 'box',
      dimensions: { width: 20, height: 15, depth: 2 },
      position: new Vector3(0, 0, 0),
      uvMapping: [
        {
          face: 'front',
          coordinates: { u: [0, 1], v: [0, 1] },
          transform: { offset: [0, 0], scale: [1, 1], rotation: 0 }
        }
      ]
    },
    materialProperties: {
      reflectivity: 0.1,
      roughness: 0.3,
      color: '#f5f5f5',
      ambient: 0.2
    },
    recommendedProjectors: 1,
    difficulty: 'beginner'
  },
  historic: {
    id: 'building-historic',
    name: 'Historic Building',
    description: 'Complex architecture with columns, arches, and ornate details',
    geometry: {
      type: 'custom',
      dimensions: { width: 18, height: 20, depth: 4 },
      position: new Vector3(0, 0, 0),
      uvMapping: [
        {
          face: 'front',
          coordinates: { u: [0, 1], v: [0, 1] },
          transform: { offset: [0, 0], scale: [1, 1], rotation: 0 }
        },
        {
          face: 'columns',
          coordinates: { u: [0, 0.2], v: [0, 1] },
          transform: { offset: [0.1, 0], scale: [0.8, 1], rotation: 0 }
        }
      ]
    },
    materialProperties: {
      reflectivity: 0.05,
      roughness: 0.8,
      color: '#d4c5a8',
      ambient: 0.15
    },
    recommendedProjectors: 2,
    difficulty: 'advanced'
  },
  skyscraper: {
    id: 'building-skyscraper',
    name: 'Skyscraper Tower',
    description: 'Tall building with glass and steel surfaces',
    geometry: {
      type: 'box',
      dimensions: { width: 8, height: 40, depth: 8 },
      position: new Vector3(0, 20, 0),
      uvMapping: [
        {
          face: 'front',
          coordinates: { u: [0, 1], v: [0, 1] },
          transform: { offset: [0, 0], scale: [1, 1], rotation: 0 }
        },
        {
          face: 'side',
          coordinates: { u: [0, 1], v: [0, 1] },
          transform: { offset: [0, 0], scale: [1, 1], rotation: 0 }
        }
      ]
    },
    materialProperties: {
      reflectivity: 0.3,
      roughness: 0.1,
      color: '#e8e8e8',
      ambient: 0.3
    },
    recommendedProjectors: 3,
    difficulty: 'intermediate'
  }
}

// Object Presets
export const objectPresets: Record<string, SurfacePreset> = {
  sphere: {
    id: 'object-sphere',
    name: 'Sphere',
    description: 'Perfect for dome projections and spherical mapping',
    geometry: {
      type: 'sphere',
      dimensions: { width: 6, height: 6, depth: 6, radius: 3 },
      position: new Vector3(0, 3, 0),
      uvMapping: [
        {
          face: 'surface',
          coordinates: { u: [0, 1], v: [0, 1] },
          transform: { offset: [0, 0], scale: [1, 1], rotation: 0 }
        }
      ]
    },
    materialProperties: {
      reflectivity: 0.2,
      roughness: 0.5,
      color: '#ffffff',
      ambient: 0.2
    },
    recommendedProjectors: 4,
    difficulty: 'advanced'
  },
  cube: {
    id: 'object-cube',
    name: 'Cube',
    description: 'Simple geometric form with six distinct faces',
    geometry: {
      type: 'box',
      dimensions: { width: 4, height: 4, depth: 4 },
      position: new Vector3(0, 2, 0),
      uvMapping: [
        {
          face: 'front',
          coordinates: { u: [0, 1], v: [0, 1] },
          transform: { offset: [0, 0], scale: [1, 1], rotation: 0 }
        },
        {
          face: 'right',
          coordinates: { u: [0, 1], v: [0, 1] },
          transform: { offset: [0, 0], scale: [1, 1], rotation: 0 }
        },
        {
          face: 'top',
          coordinates: { u: [0, 1], v: [0, 1] },
          transform: { offset: [0, 0], scale: [1, 1], rotation: 0 }
        }
      ]
    },
    materialProperties: {
      reflectivity: 0.15,
      roughness: 0.4,
      color: '#f0f0f0',
      ambient: 0.2
    },
    recommendedProjectors: 2,
    difficulty: 'beginner'
  },
  sculpture: {
    id: 'object-sculpture',
    name: 'Complex Sculpture',
    description: 'Irregular organic shape with complex geometry',
    geometry: {
      type: 'custom',
      dimensions: { width: 5, height: 8, depth: 3 },
      position: new Vector3(0, 4, 0),
      uvMapping: [
        {
          face: 'surface',
          coordinates: { u: [0, 1], v: [0, 1] },
          transform: { offset: [0, 0], scale: [1, 1], rotation: 0 }
        }
      ]
    },
    materialProperties: {
      reflectivity: 0.1,
      roughness: 0.7,
      color: '#c8c8c8',
      ambient: 0.15
    },
    recommendedProjectors: 3,
    difficulty: 'advanced'
  }
}

// Vehicle Presets
export const vehiclePresets: Record<string, SurfacePreset> = {
  car: {
    id: 'vehicle-car',
    name: 'Car',
    description: 'Modern car with curved surfaces and reflective paint',
    geometry: {
      type: 'custom',
      dimensions: { width: 4.5, height: 1.5, depth: 2 },
      position: new Vector3(0, 0.75, 0),
      uvMapping: [
        {
          face: 'hood',
          coordinates: { u: [0, 1], v: [0, 1] },
          transform: { offset: [0, 0], scale: [1, 1], rotation: 0 }
        },
        {
          face: 'side',
          coordinates: { u: [0, 1], v: [0, 1] },
          transform: { offset: [0, 0], scale: [1, 1], rotation: 0 }
        },
        {
          face: 'roof',
          coordinates: { u: [0, 1], v: [0, 1] },
          transform: { offset: [0, 0], scale: [1, 1], rotation: 0 }
        }
      ]
    },
    materialProperties: {
      reflectivity: 0.8,
      roughness: 0.1,
      color: '#2c3e50',
      ambient: 0.3
    },
    recommendedProjectors: 2,
    difficulty: 'intermediate'
  },
  truck: {
    id: 'vehicle-truck',
    name: 'Truck',
    description: 'Large flat surfaces ideal for advertising projections',
    geometry: {
      type: 'box',
      dimensions: { width: 8, height: 3, depth: 2.5 },
      position: new Vector3(0, 1.5, 0),
      uvMapping: [
        {
          face: 'side',
          coordinates: { u: [0, 1], v: [0, 1] },
          transform: { offset: [0, 0], scale: [1, 1], rotation: 0 }
        },
        {
          face: 'rear',
          coordinates: { u: [0, 1], v: [0, 1] },
          transform: { offset: [0, 0], scale: [1, 1], rotation: 0 }
        }
      ]
    },
    materialProperties: {
      reflectivity: 0.2,
      roughness: 0.6,
      color: '#ffffff',
      ambient: 0.2
    },
    recommendedProjectors: 1,
    difficulty: 'beginner'
  },
  airplane: {
    id: 'vehicle-airplane',
    name: 'Airplane',
    description: 'Aircraft with wings and fuselage for large-scale projection',
    geometry: {
      type: 'custom',
      dimensions: { width: 25, height: 6, depth: 4 },
      position: new Vector3(0, 3, 0),
      uvMapping: [
        {
          face: 'fuselage',
          coordinates: { u: [0, 1], v: [0, 1] },
          transform: { offset: [0, 0], scale: [1, 1], rotation: 0 }
        },
        {
          face: 'wing',
          coordinates: { u: [0, 1], v: [0, 1] },
          transform: { offset: [0, 0], scale: [1, 1], rotation: 0 }
        }
      ]
    },
    materialProperties: {
      reflectivity: 0.4,
      roughness: 0.3,
      color: '#e0e0e0',
      ambient: 0.25
    },
    recommendedProjectors: 4,
    difficulty: 'advanced'
  }
}

// Combined presets
export const surfacePresets = {
  building: buildingPresets,
  object: objectPresets,
  vehicle: vehiclePresets
}

// UV mapping utilities
export function calculateUVCoordinates(
  geometry: SurfaceGeometry,
  projectorPosition: Vector3,
  _projectorRotation: Vector3
): UVMapping[] {
  // Implementation for calculating UV coordinates based on projector position
  // This would include perspective correction and distortion calculations
  return geometry.uvMapping.map(mapping => ({
    ...mapping,
    transform: {
      ...mapping.transform,
      // Apply perspective correction based on projector position
      offset: [
        mapping.transform.offset[0] + (projectorPosition.x * 0.01),
        mapping.transform.offset[1] + (projectorPosition.y * 0.01)
      ]
    }
  }))
}

export function optimizeProjectorPlacement(
  surface: SurfaceGeometry,
  _desiredCoverage: number = 0.95
): Vector3[] {
  // Algorithm to suggest optimal projector positions
  const positions: Vector3[] = []

  switch (surface.type) {
    case 'box':
      // For box geometry, calculate positions based on throw distance
      positions.push(
        new Vector3(0, surface.dimensions.height / 2, surface.dimensions.depth * 2)
      )
      break
    case 'sphere': {
      // For spheres, use multiple projectors around the surface
      const radius = surface.dimensions.radius || 3
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2
        positions.push(new Vector3(
          Math.cos(angle) * radius * 2,
          radius,
          Math.sin(angle) * radius * 2
        ))
      }
      break
    }
    case 'cylinder': {
      // For cylinders, position projectors around the circumference
      const height = surface.dimensions.height
      positions.push(
        new Vector3(0, height / 2, surface.dimensions.radius! * 3)
      )
      break
    }
  }

  return positions
}

export function calculateSurfaceArea(geometry: SurfaceGeometry): number {
  switch (geometry.type) {
    case 'box': {
      const { width, height, depth } = geometry.dimensions
      return 2 * (width * height + width * depth + height * depth)
    }
    case 'sphere': {
      const radius = geometry.dimensions.radius || 1
      return 4 * Math.PI * radius * radius
    }
    case 'cylinder': {
      const r = geometry.dimensions.radius || 1
      const h = geometry.dimensions.height
      return 2 * Math.PI * r * (r + h)
    }
    default:
      return geometry.dimensions.width * geometry.dimensions.height
  }
}