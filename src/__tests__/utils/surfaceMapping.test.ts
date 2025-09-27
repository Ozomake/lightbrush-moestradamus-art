import { describe, it, expect, beforeEach } from 'vitest'
import { Vector3 } from 'three'
import {
  calculateUVCoordinates,
  optimizeProjectorPlacement,
  calculateSurfaceArea,
  buildingPresets,
  objectPresets,
  vehiclePresets,
  surfacePresets,
  type SurfaceGeometry,
  // UVMapping type import removed as it's not used in this test file
} from '../../utils/surfaceMapping'

describe('SurfaceMapping Utils', () => {
  let mockBoxGeometry: SurfaceGeometry
  let mockSphereGeometry: SurfaceGeometry
  let mockCylinderGeometry: SurfaceGeometry

  beforeEach(() => {
    mockBoxGeometry = {
      type: 'box',
      dimensions: { width: 10, height: 6, depth: 1 },
      position: new Vector3(0, 0, 0),
      uvMapping: [
        {
          face: 'front',
          coordinates: { u: [0, 1], v: [0, 1] },
          transform: { offset: [0, 0], scale: [1, 1], rotation: 0 }
        }
      ]
    }

    mockSphereGeometry = {
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
    }

    mockCylinderGeometry = {
      type: 'cylinder',
      dimensions: { width: 4, height: 8, depth: 4, radius: 2 },
      position: new Vector3(0, 4, 0),
      uvMapping: [
        {
          face: 'surface',
          coordinates: { u: [0, 1], v: [0, 1] },
          transform: { offset: [0, 0], scale: [1, 1], rotation: 0 }
        }
      ]
    }
  })

  describe('calculateUVCoordinates', () => {
    it('should return UV mapping for box geometry', () => {
      const projectorPosition = new Vector3(0, 5, 10)
      const projectorRotation = new Vector3(-15, 0, 0)

      const uvMapping = calculateUVCoordinates(mockBoxGeometry, projectorPosition, projectorRotation)

      expect(Array.isArray(uvMapping)).toBe(true)
      expect(uvMapping.length).toBe(1)
      expect(uvMapping[0]).toHaveProperty('face')
      expect(uvMapping[0]).toHaveProperty('coordinates')
      expect(uvMapping[0]).toHaveProperty('transform')
    })

    it('should apply perspective correction based on projector position', () => {
      const position1 = new Vector3(0, 5, 10)
      const position2 = new Vector3(10, 5, 10)
      const rotation = new Vector3(-15, 0, 0)

      const uv1 = calculateUVCoordinates(mockBoxGeometry, position1, rotation)
      const uv2 = calculateUVCoordinates(mockBoxGeometry, position2, rotation)

      expect(uv1[0].transform.offset).not.toEqual(uv2[0].transform.offset)
    })

    it('should preserve original mapping structure', () => {
      const projectorPosition = new Vector3(0, 5, 10)
      const projectorRotation = new Vector3(-15, 0, 0)

      const uvMapping = calculateUVCoordinates(mockBoxGeometry, projectorPosition, projectorRotation)

      expect(uvMapping[0].face).toBe('front')
      expect(uvMapping[0].coordinates).toEqual({ u: [0, 1], v: [0, 1] })
      expect(uvMapping[0].transform).toHaveProperty('scale')
      expect(uvMapping[0].transform).toHaveProperty('rotation')
    })

    it('should handle multiple UV mappings', () => {
      const multiMappingGeometry = {
        ...mockBoxGeometry,
        uvMapping: [
          {
            face: 'front',
            coordinates: { u: [0, 1] as [number, number], v: [0, 1] as [number, number] },
            transform: { offset: [0, 0] as [number, number], scale: [1, 1] as [number, number], rotation: 0 }
          },
          {
            face: 'side',
            coordinates: { u: [0, 1] as [number, number], v: [0, 1] as [number, number] },
            transform: { offset: [0, 0] as [number, number], scale: [1, 1] as [number, number], rotation: 0 }
          }
        ]
      }

      const projectorPosition = new Vector3(0, 5, 10)
      const projectorRotation = new Vector3(-15, 0, 0)

      const uvMapping = calculateUVCoordinates(multiMappingGeometry, projectorPosition, projectorRotation)

      expect(uvMapping.length).toBe(2)
      expect(uvMapping[0].face).toBe('front')
      expect(uvMapping[1].face).toBe('side')
    })
  })

  describe('optimizeProjectorPlacement', () => {
    it('should return optimal positions for box geometry', () => {
      const positions = optimizeProjectorPlacement(mockBoxGeometry)

      expect(Array.isArray(positions)).toBe(true)
      expect(positions.length).toBeGreaterThan(0)
      expect(positions[0]).toBeInstanceOf(Vector3)
    })

    it('should position projector at appropriate distance for box', () => {
      const positions = optimizeProjectorPlacement(mockBoxGeometry)

      expect(positions[0].z).toBe(mockBoxGeometry.dimensions.depth * 2)
      expect(positions[0].y).toBe(mockBoxGeometry.dimensions.height / 2)
      expect(positions[0].x).toBe(0)
    })

    it('should return multiple positions for sphere geometry', () => {
      const positions = optimizeProjectorPlacement(mockSphereGeometry)

      expect(positions.length).toBe(4)
      positions.forEach(position => {
        expect(position).toBeInstanceOf(Vector3)
      })
    })

    it('should position projectors around sphere circumference', () => {
      const positions = optimizeProjectorPlacement(mockSphereGeometry)
      const radius = mockSphereGeometry.dimensions.radius || 3

      positions.forEach(position => {
        // Check that projectors are positioned at appropriate distance
        const distance2D = Math.sqrt(position.x ** 2 + position.z ** 2)
        expect(distance2D).toBeCloseTo(radius * 2, 1)
        expect(position.y).toBe(radius)
      })
    })

    it('should handle cylinder geometry', () => {
      const positions = optimizeProjectorPlacement(mockCylinderGeometry)

      expect(positions.length).toBeGreaterThan(0)
      expect(positions[0].z).toBe(mockCylinderGeometry.dimensions.radius! * 3)
      expect(positions[0].y).toBe(mockCylinderGeometry.dimensions.height / 2)
    })

    it('should handle custom coverage requirements', () => {
      const positions90 = optimizeProjectorPlacement(mockBoxGeometry, 0.9)
      const positions95 = optimizeProjectorPlacement(mockBoxGeometry, 0.95)

      expect(positions90.length).toBeGreaterThanOrEqual(1)
      expect(positions95.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('calculateSurfaceArea', () => {
    it('should calculate area for box geometry', () => {
      const area = calculateSurfaceArea(mockBoxGeometry)
      const { width, height, depth } = mockBoxGeometry.dimensions
      const expectedArea = 2 * (width * height + width * depth + height * depth)

      expect(area).toBe(expectedArea)
    })

    it('should calculate area for sphere geometry', () => {
      const area = calculateSurfaceArea(mockSphereGeometry)
      const radius = mockSphereGeometry.dimensions.radius || 1
      const expectedArea = 4 * Math.PI * radius * radius

      expect(area).toBeCloseTo(expectedArea, 5)
    })

    it('should calculate area for cylinder geometry', () => {
      const area = calculateSurfaceArea(mockCylinderGeometry)
      const r = mockCylinderGeometry.dimensions.radius || 1
      const h = mockCylinderGeometry.dimensions.height
      const expectedArea = 2 * Math.PI * r * (r + h)

      expect(area).toBeCloseTo(expectedArea, 5)
    })

    it('should handle custom geometry with fallback calculation', () => {
      const customGeometry = {
        ...mockBoxGeometry,
        type: 'custom' as const
      }

      const area = calculateSurfaceArea(customGeometry)
      const expectedArea = customGeometry.dimensions.width * customGeometry.dimensions.height

      expect(area).toBe(expectedArea)
    })

    it('should handle zero dimensions gracefully', () => {
      const zeroGeometry = {
        ...mockBoxGeometry,
        dimensions: { width: 0, height: 0, depth: 0 }
      }

      const area = calculateSurfaceArea(zeroGeometry)

      expect(area).toBe(0)
    })

    it('should handle missing radius for sphere', () => {
      const sphereWithoutRadius = {
        ...mockSphereGeometry,
        dimensions: { width: 6, height: 6, depth: 6 }
      }

      const area = calculateSurfaceArea(sphereWithoutRadius)
      const expectedArea = 4 * Math.PI * 1 * 1 // default radius = 1

      expect(area).toBeCloseTo(expectedArea, 5)
    })
  })

  describe('Surface Presets', () => {
    describe('buildingPresets', () => {
      it('should contain all expected building presets', () => {
        expect(buildingPresets).toHaveProperty('modern')
        expect(buildingPresets).toHaveProperty('historic')
        expect(buildingPresets).toHaveProperty('skyscraper')
      })

      it('should have valid structure for each preset', () => {
        Object.values(buildingPresets).forEach(preset => {
          expect(preset).toHaveProperty('id')
          expect(preset).toHaveProperty('name')
          expect(preset).toHaveProperty('description')
          expect(preset).toHaveProperty('geometry')
          expect(preset).toHaveProperty('materialProperties')
          expect(preset).toHaveProperty('recommendedProjectors')
          expect(preset).toHaveProperty('difficulty')
        })
      })

      it('should have valid geometry for each preset', () => {
        Object.values(buildingPresets).forEach(preset => {
          expect(preset.geometry).toHaveProperty('type')
          expect(preset.geometry).toHaveProperty('dimensions')
          expect(preset.geometry).toHaveProperty('position')
          expect(preset.geometry).toHaveProperty('uvMapping')
          expect(Array.isArray(preset.geometry.uvMapping)).toBe(true)
        })
      })

      it('should have valid material properties', () => {
        Object.values(buildingPresets).forEach(preset => {
          expect(preset.materialProperties.reflectivity).toBeGreaterThanOrEqual(0)
          expect(preset.materialProperties.reflectivity).toBeLessThanOrEqual(1)
          expect(preset.materialProperties.roughness).toBeGreaterThanOrEqual(0)
          expect(preset.materialProperties.roughness).toBeLessThanOrEqual(1)
          expect(preset.materialProperties.ambient).toBeGreaterThanOrEqual(0)
          expect(preset.materialProperties.ambient).toBeLessThanOrEqual(1)
        })
      })

      it('should have reasonable projector recommendations', () => {
        Object.values(buildingPresets).forEach(preset => {
          expect(preset.recommendedProjectors).toBeGreaterThan(0)
          expect(preset.recommendedProjectors).toBeLessThanOrEqual(10)
        })
      })

      it('should have valid difficulty levels', () => {
        const validDifficulties = ['beginner', 'intermediate', 'advanced']
        Object.values(buildingPresets).forEach(preset => {
          expect(validDifficulties).toContain(preset.difficulty)
        })
      })
    })

    describe('objectPresets', () => {
      it('should contain all expected object presets', () => {
        expect(objectPresets).toHaveProperty('sphere')
        expect(objectPresets).toHaveProperty('cube')
        expect(objectPresets).toHaveProperty('sculpture')
      })

      it('should have sphere preset with radius', () => {
        const sphere = objectPresets.sphere
        expect(sphere.geometry.type).toBe('sphere')
        expect(sphere.geometry.dimensions).toHaveProperty('radius')
        expect(sphere.geometry.dimensions.radius).toBeGreaterThan(0)
      })

      it('should have cube preset with equal dimensions', () => {
        const cube = objectPresets.cube
        expect(cube.geometry.type).toBe('box')
        expect(cube.geometry.dimensions.width).toBe(cube.geometry.dimensions.height)
        expect(cube.geometry.dimensions.height).toBe(cube.geometry.dimensions.depth)
      })

      it('should have appropriate projector counts for complexity', () => {
        expect(objectPresets.cube.recommendedProjectors).toBeLessThan(objectPresets.sphere.recommendedProjectors)
        expect(objectPresets.sphere.recommendedProjectors).toBeGreaterThanOrEqual(objectPresets.sculpture.recommendedProjectors)
      })
    })

    describe('vehiclePresets', () => {
      it('should contain all expected vehicle presets', () => {
        expect(vehiclePresets).toHaveProperty('car')
        expect(vehiclePresets).toHaveProperty('truck')
        expect(vehiclePresets).toHaveProperty('airplane')
      })

      it('should have car with appropriate reflectivity', () => {
        const car = vehiclePresets.car
        expect(car.materialProperties.reflectivity).toBeGreaterThan(0.5) // Cars are reflective
        expect(car.materialProperties.roughness).toBeLessThan(0.5) // Cars are smooth
      })

      it('should have truck with beginner difficulty', () => {
        const truck = vehiclePresets.truck
        expect(truck.difficulty).toBe('beginner')
        expect(truck.recommendedProjectors).toBe(1)
      })

      it('should have airplane as most complex vehicle', () => {
        const airplane = vehiclePresets.airplane
        expect(airplane.difficulty).toBe('advanced')
        expect(airplane.recommendedProjectors).toBeGreaterThanOrEqual(4)
      })

      it('should have realistic vehicle dimensions', () => {
        const car = vehiclePresets.car
        const truck = vehiclePresets.truck
        const airplane = vehiclePresets.airplane

        // Car should be smaller than truck
        expect(car.geometry.dimensions.width).toBeLessThan(truck.geometry.dimensions.width)

        // Airplane should be largest
        expect(airplane.geometry.dimensions.width).toBeGreaterThan(truck.geometry.dimensions.width)
      })
    })

    describe('surfacePresets combined object', () => {
      it('should contain all preset categories', () => {
        expect(surfacePresets).toHaveProperty('building')
        expect(surfacePresets).toHaveProperty('object')
        expect(surfacePresets).toHaveProperty('vehicle')
      })

      it('should reference the individual preset objects', () => {
        expect(surfacePresets.building).toBe(buildingPresets)
        expect(surfacePresets.object).toBe(objectPresets)
        expect(surfacePresets.vehicle).toBe(vehiclePresets)
      })

      it('should provide access to all presets', () => {
        const allPresets = [
          ...Object.values(surfacePresets.building),
          ...Object.values(surfacePresets.object),
          ...Object.values(surfacePresets.vehicle)
        ]

        expect(allPresets.length).toBeGreaterThan(5)
        allPresets.forEach(preset => {
          expect(preset).toHaveProperty('id')
          expect(preset).toHaveProperty('name')
        })
      })
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle null/undefined projector positions', () => {
      const projectorPosition = new Vector3(0, 0, 0)
      const projectorRotation = new Vector3(0, 0, 0)

      expect(() => {
        calculateUVCoordinates(mockBoxGeometry, projectorPosition, projectorRotation)
      }).not.toThrow()
    })

    it('should handle extreme projector positions', () => {
      const extremePosition = new Vector3(1000000, 1000000, 1000000)
      const rotation = new Vector3(0, 0, 0)

      expect(() => {
        calculateUVCoordinates(mockBoxGeometry, extremePosition, rotation)
      }).not.toThrow()
    })

    it('should handle negative dimensions', () => {
      const negativeGeometry = {
        ...mockBoxGeometry,
        dimensions: { width: -5, height: -3, depth: -1 }
      }

      expect(() => {
        calculateSurfaceArea(negativeGeometry)
      }).not.toThrow()
    })

    it('should handle very small surfaces', () => {
      const tinyGeometry = {
        ...mockBoxGeometry,
        dimensions: { width: 0.001, height: 0.001, depth: 0.001 }
      }

      const area = calculateSurfaceArea(tinyGeometry)
      expect(area).toBeGreaterThan(0)
    })

    it('should handle very large surfaces', () => {
      const hugeGeometry = {
        ...mockBoxGeometry,
        dimensions: { width: 10000, height: 10000, depth: 10000 }
      }

      const area = calculateSurfaceArea(hugeGeometry)
      expect(area).toBeGreaterThan(0)
      expect(Number.isFinite(area)).toBe(true)
    })
  })
})