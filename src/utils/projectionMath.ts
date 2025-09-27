import { Vector3, Matrix4, PerspectiveCamera, Frustum, Euler } from 'three'
import type { SurfaceGeometry } from './surfaceMapping'

export interface ProjectorSettings {
  position: Vector3
  rotation: Vector3
  fov: number
  throw_ratio: number
  brightness: number
  resolution: {
    width: number
    height: number
  }
  lens_shift: {
    horizontal: number
    vertical: number
  }
}

export interface ProjectionConfig {
  projectorPosition: Vector3
  projectionMatrix: Matrix4
  viewMatrix: Matrix4
  keystoneCorrection: KeystoneCorrection
  distortionMap: DistortionPoint[]
  coverageArea: number
  recommendedSettings: ProjectorRecommendations
  luminanceMap: LuminanceData
}

export interface KeystoneCorrection {
  topLeft: Vector2
  topRight: Vector2
  bottomLeft: Vector2
  bottomRight: Vector2
  verticalKeystone: number
  horizontalKeystone: number
}

export interface Vector2 {
  x: number
  y: number
}

export interface DistortionPoint {
  screenCoord: Vector2
  worldCoord: Vector3
  distortionFactor: number
}

export interface ProjectorRecommendations {
  minimumBrightness: number
  optimalDistance: number
  suggestedLensShift: Vector2
  edgeBlendingRequired: boolean
  multiProjectorSetup: boolean
}

export interface LuminanceData {
  centerBrightness: number
  edgeBrightness: number
  uniformity: number
  hotspots: Vector2[]
}

/**
 * Calculate comprehensive projection configuration
 */
export function calculateProjection(
  projectorSettings: ProjectorSettings,
  surfaceGeometry: SurfaceGeometry
): ProjectionConfig {
  const projectionMatrix = calculateProjectionMatrix(projectorSettings)
  const viewMatrix = calculateViewMatrix(projectorSettings)
  const keystoneCorrection = calculateKeystoneCorrection(projectorSettings, surfaceGeometry)
  const distortionMap = calculateDistortionMap(projectorSettings, surfaceGeometry)
  const coverageArea = calculateCoverageArea(projectorSettings, surfaceGeometry)
  const recommendedSettings = calculateRecommendations(projectorSettings, surfaceGeometry)
  const luminanceMap = calculateLuminanceMap(projectorSettings, surfaceGeometry)

  return {
    projectorPosition: projectorSettings.position,
    projectionMatrix,
    viewMatrix,
    keystoneCorrection,
    distortionMap,
    coverageArea,
    recommendedSettings,
    luminanceMap
  }
}

/**
 * Calculate projection matrix based on projector settings
 */
export function calculateProjectionMatrix(settings: ProjectorSettings): Matrix4 {
  const camera = new PerspectiveCamera(
    settings.fov,
    settings.resolution.width / settings.resolution.height,
    0.1,
    1000
  )

  // Apply lens shift
  camera.setViewOffset(
    settings.resolution.width,
    settings.resolution.height,
    settings.lens_shift.horizontal * settings.resolution.width,
    settings.lens_shift.vertical * settings.resolution.height,
    settings.resolution.width,
    settings.resolution.height
  )

  camera.updateProjectionMatrix()
  return camera.projectionMatrix
}

/**
 * Calculate view matrix based on projector position and rotation
 */
export function calculateViewMatrix(settings: ProjectorSettings): Matrix4 {
  const matrix = new Matrix4()
  matrix.makeRotationFromEuler(new Euler(
    settings.rotation.x * Math.PI / 180,
    settings.rotation.y * Math.PI / 180,
    settings.rotation.z * Math.PI / 180,
    'XYZ'
  ))

  const translationMatrix = new Matrix4()
  translationMatrix.makeTranslation(
    -settings.position.x,
    -settings.position.y,
    -settings.position.z
  )

  matrix.multiply(translationMatrix)
  return matrix
}

/**
 * Calculate keystone correction parameters
 */
export function calculateKeystoneCorrection(
  settings: ProjectorSettings,
  surface: SurfaceGeometry
): KeystoneCorrection {
  // Calculate angle between projector and surface normal
  const projectorToSurface = new Vector3()
    .subVectors(surface.position, settings.position)
    .normalize()

  const surfaceNormal = new Vector3(0, 0, 1) // Assuming front-facing surface
  const angle = Math.acos(projectorToSurface.dot(surfaceNormal))

  // Calculate keystone distortion based on angle
  const horizontalKeystone = Math.sin(angle) * (settings.rotation.y * Math.PI / 180)
  const verticalKeystone = Math.sin(angle) * (settings.rotation.x * Math.PI / 180)

  // Calculate corner adjustments
  const cornerAdjustment = Math.abs(horizontalKeystone) * 0.1

  return {
    topLeft: { x: -cornerAdjustment, y: cornerAdjustment },
    topRight: { x: cornerAdjustment, y: cornerAdjustment },
    bottomLeft: { x: -cornerAdjustment, y: -cornerAdjustment },
    bottomRight: { x: cornerAdjustment, y: -cornerAdjustment },
    verticalKeystone: verticalKeystone * 180 / Math.PI,
    horizontalKeystone: horizontalKeystone * 180 / Math.PI
  }
}

/**
 * Calculate distortion map for perspective correction
 */
export function calculateDistortionMap(
  settings: ProjectorSettings,
  surface: SurfaceGeometry
): DistortionPoint[] {
  const distortionPoints: DistortionPoint[] = []
  const gridSize = 10 // 10x10 grid

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const screenCoord: Vector2 = {
        x: x / (gridSize - 1),
        y: y / (gridSize - 1)
      }

      // Convert screen coordinate to world coordinate
      const worldCoord = screenToWorldCoordinate(screenCoord, settings, surface)

      // Calculate distortion factor based on distance from projector center
      const distance = worldCoord.distanceTo(settings.position)
      const optimalDistance = calculateOptimalDistance(settings, surface)
      const distortionFactor = Math.abs(distance - optimalDistance) / optimalDistance

      distortionPoints.push({
        screenCoord,
        worldCoord,
        distortionFactor
      })
    }
  }

  return distortionPoints
}

/**
 * Convert screen coordinate to world coordinate
 */
function screenToWorldCoordinate(
  screenCoord: Vector2,
  settings: ProjectorSettings,
  surface: SurfaceGeometry
): Vector3 {
  // Simplified ray casting from projector through screen coordinate to surface
  const rayDirection = new Vector3(
    (screenCoord.x - 0.5) * 2,
    (screenCoord.y - 0.5) * 2,
    -1
  ).normalize()

  // Apply projector rotation
  rayDirection.applyEuler(new Euler(
    settings.rotation.x * Math.PI / 180,
    settings.rotation.y * Math.PI / 180,
    settings.rotation.z * Math.PI / 180,
    'XYZ'
  ))

  // Calculate intersection with surface plane
  const t = (surface.position.z - settings.position.z) / rayDirection.z

  return new Vector3(
    settings.position.x + rayDirection.x * t,
    settings.position.y + rayDirection.y * t,
    surface.position.z
  )
}

/**
 * Calculate coverage area percentage
 */
export function calculateCoverageArea(
  settings: ProjectorSettings,
  surface: SurfaceGeometry
): number {
  // Create frustum from projector settings
  const camera = new PerspectiveCamera(
    settings.fov,
    settings.resolution.width / settings.resolution.height,
    0.1,
    1000
  )

  camera.position.copy(settings.position)
  camera.rotation.set(
    settings.rotation.x * Math.PI / 180,
    settings.rotation.y * Math.PI / 180,
    settings.rotation.z * Math.PI / 180
  )

  camera.updateMatrixWorld()
  camera.updateProjectionMatrix()

  const frustum = new Frustum()
  frustum.setFromProjectionMatrix(
    new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
  )

  // Calculate surface area within frustum
  // This is a simplified calculation
  const surfaceArea = surface.dimensions.width * surface.dimensions.height
  const projectedArea = calculateProjectedArea(settings, surface)

  return Math.min(projectedArea / surfaceArea, 1.0)
}

/**
 * Calculate projected area on surface
 */
function calculateProjectedArea(
  settings: ProjectorSettings,
  surface: SurfaceGeometry
): number {
  const distance = settings.position.distanceTo(surface.position)
  const throwRatio = settings.throw_ratio

  // Calculate projection size at surface distance
  const projectionWidth = distance / throwRatio
  const projectionHeight = projectionWidth / (settings.resolution.width / settings.resolution.height)

  return projectionWidth * projectionHeight
}

/**
 * Calculate optimal projector distance
 */
function calculateOptimalDistance(
  settings: ProjectorSettings,
  surface: SurfaceGeometry
): number {
  // Optimal distance is based on throw ratio and desired projection size
  const desiredWidth = surface.dimensions.width * 0.9 // Cover 90% of surface
  return desiredWidth * settings.throw_ratio
}

/**
 * Generate equipment recommendations
 */
export function calculateRecommendations(
  settings: ProjectorSettings,
  surface: SurfaceGeometry
): ProjectorRecommendations {
  const distance = settings.position.distanceTo(surface.position)
  const surfaceArea = surface.dimensions.width * surface.dimensions.height
  const optimalDistance = calculateOptimalDistance(settings, surface)

  // Calculate required brightness (lumens per square meter)
  const ambientLight = 50 // Assume 50 lux ambient light
  const requiredLumens = surfaceArea * ambientLight * 2 // Factor for projection efficiency

  return {
    minimumBrightness: Math.max(requiredLumens, 3000),
    optimalDistance: optimalDistance,
    suggestedLensShift: {
      x: Math.abs(settings.position.x - surface.position.x) / distance * 0.1,
      y: Math.abs(settings.position.y - surface.position.y) / distance * 0.1
    },
    edgeBlendingRequired: surfaceArea > 50, // Large surfaces need edge blending
    multiProjectorSetup: surfaceArea > 100 || surface.dimensions.width > 15
  }
}

/**
 * Calculate luminance distribution map
 */
export function calculateLuminanceMap(
  settings: ProjectorSettings,
  surface: SurfaceGeometry
): LuminanceData {
  const distance = settings.position.distanceTo(surface.position)
  const maxDistance = distance * 1.5

  // Center brightness (inverse square law)
  const centerBrightness = settings.brightness / (distance * distance) * 10000

  // Edge brightness (typically 70-80% of center)
  const edgeBrightness = centerBrightness * 0.75

  // Calculate uniformity
  const uniformity = edgeBrightness / centerBrightness

  // Identify potential hotspots
  const hotspots: Vector2[] = []
  if (distance < maxDistance * 0.5) {
    hotspots.push({ x: 0.5, y: 0.5 }) // Center hotspot when too close
  }

  return {
    centerBrightness,
    edgeBrightness,
    uniformity,
    hotspots
  }
}

/**
 * Calculate throw distance based on image width and throw ratio
 */
export function calculateThrowDistance(imageWidth: number, throwRatio: number): number {
  return imageWidth * throwRatio
}

/**
 * Calculate image size at given distance
 */
export function calculateImageSize(distance: number, throwRatio: number): { width: number; height: number } {
  const width = distance / throwRatio
  const height = width * 9 / 16 // Assume 16:9 aspect ratio

  return { width, height }
}

/**
 * Calculate lens shift requirements
 */
export function calculateLensShift(
  projectorPosition: Vector3,
  surfaceCenter: Vector3,
  projectionSize: { width: number; height: number }
): Vector2 {
  const offsetX = projectorPosition.x - surfaceCenter.x
  const offsetY = projectorPosition.y - surfaceCenter.y

  return {
    x: offsetX / projectionSize.width,
    y: offsetY / projectionSize.height
  }
}

/**
 * Validate projector setup
 */
export function validateProjectorSetup(
  settings: ProjectorSettings,
  surface: SurfaceGeometry
): { isValid: boolean; warnings: string[]; errors: string[] } {
  const warnings: string[] = []
  const errors: string[] = []

  const distance = settings.position.distanceTo(surface.position)
  const optimalDistance = calculateOptimalDistance(settings, surface)
  const projectedArea = calculateProjectedArea(settings, surface)
  const surfaceArea = surface.dimensions.width * surface.dimensions.height

  // Check distance
  if (distance < optimalDistance * 0.5) {
    errors.push('Projector too close to surface - image will be too small and bright')
  } else if (distance > optimalDistance * 2) {
    warnings.push('Projector quite far from surface - brightness may be insufficient')
  }

  // Check brightness
  const recommendedBrightness = calculateRecommendations(settings, surface).minimumBrightness
  if (settings.brightness < recommendedBrightness * 0.8) {
    errors.push(`Insufficient brightness. Recommended: ${recommendedBrightness} lumens`)
  }

  // Check coverage
  const coverage = projectedArea / surfaceArea
  if (coverage < 0.8) {
    warnings.push('Projection does not fully cover the surface')
  } else if (coverage > 1.2) {
    warnings.push('Projection extends beyond the surface')
  }

  // Check angles
  const angle = Math.abs(settings.rotation.x)
  if (angle > 30) {
    warnings.push('Steep projection angle may cause significant keystone distortion')
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors
  }
}