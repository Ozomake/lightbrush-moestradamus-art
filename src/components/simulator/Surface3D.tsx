import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, CanvasTexture } from 'three'
import { Text } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import {
  type SurfaceType,
  type SurfacePreset,
  surfacePresets,
  buildingPresets,
  objectPresets,
  vehiclePresets
} from '../../utils/surfaceMapping'
import { type ProjectionConfig } from '../../utils/projectionMath'

interface Surface3DProps {
  surface: SurfaceType
  preset: SurfacePreset
  projectionConfig: ProjectionConfig | null
  selectedContent: string | null
  isSimulating: boolean
}

interface ControlsProps {
  selectedSurface: SurfaceType
  selectedPreset: SurfacePreset
  onSurfaceChange: (surface: SurfaceType, preset: SurfacePreset) => void
}

const Surface3D: React.FC<Surface3DProps> & { Controls: React.FC<ControlsProps> } = ({
  preset,
  projectionConfig,
  selectedContent,
  isSimulating
}) => {
  const meshRef = useRef<Mesh>(null)

  // Spring animation for scale
  const { scale } = useSpring({
    scale: 1,
    from: { scale: 0 },
    config: { tension: 200, friction: 20 }
  })

  // Create projection texture
  const projectionTexture = useMemo(() => {
    if (!selectedContent || !isSimulating) return null

    // For demo purposes, create a canvas texture with pattern
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!

    // Create a colorful pattern
    const gradient = ctx.createLinearGradient(0, 0, 512, 512)
    gradient.addColorStop(0, '#ff006e')
    gradient.addColorStop(0.5, '#8338ec')
    gradient.addColorStop(1, '#3a86ff')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)

    // Add some animated elements
    ctx.fillStyle = 'white'
    ctx.font = '48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('LIGHTBRUSH', 256, 256)

    return new CanvasTexture(canvas)
  }, [selectedContent, isSimulating])

  // Animation for projection simulation
  useFrame((state) => {
    if (meshRef.current && isSimulating && projectionTexture) {
      // Animate projection intensity
      const intensity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.3
      if (meshRef.current.material && 'opacity' in meshRef.current.material) {
        meshRef.current.material.opacity = intensity
      }
    }
  })

  // Render appropriate geometry based on preset
  const renderGeometry = () => {
    const { geometry } = preset
    // const { geometry, materialProperties } = preset

    switch (geometry.type) {
      case 'box':
        return (
          <boxGeometry
            args={[
              geometry.dimensions.width,
              geometry.dimensions.height,
              geometry.dimensions.depth
            ]}
          />
        )
      case 'sphere':
        return (
          <sphereGeometry
            args={[
              geometry.dimensions.radius || 3,
              32,
              32
            ]}
          />
        )
      case 'cylinder':
        return (
          <cylinderGeometry
            args={[
              geometry.dimensions.radius || 2,
              geometry.dimensions.radius || 2,
              geometry.dimensions.height,
              32
            ]}
          />
        )
      default:
        return (
          <boxGeometry
            args={[
              geometry.dimensions.width,
              geometry.dimensions.height,
              geometry.dimensions.depth
            ]}
          />
        )
    }
  }

  const renderMaterial = () => {
    const { materialProperties } = preset

    if (isSimulating && projectionTexture) {
      return (
        <meshStandardMaterial
          map={projectionTexture}
          transparent
          opacity={0.8}
          roughness={materialProperties.roughness}
          metalness={materialProperties.reflectivity}
        />
      )
    }

    return (
      <meshStandardMaterial
        color={materialProperties.color}
        roughness={materialProperties.roughness}
        metalness={materialProperties.reflectivity}
        transparent
        opacity={0.9}
      />
    )
  }

  return (
    <group>
      {/* Main surface */}
      <animated.mesh
        ref={meshRef}
        position={[
          preset.geometry.position.x,
          preset.geometry.position.y,
          preset.geometry.position.z
        ]}
        scale={scale}
      >
        {renderGeometry()}
        {renderMaterial()}
      </animated.mesh>

      {/* Ground plane for reference */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#1a1a1a" transparent opacity={0.3} />
      </mesh>

      {/* Labels */}
      <Text
        position={[preset.geometry.position.x, preset.geometry.position.y + preset.geometry.dimensions.height / 2 + 2, preset.geometry.position.z]}
        fontSize={1}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {preset.name}
      </Text>

      {/* Projection preview lines */}
      {projectionConfig && isSimulating && (
        <group>
          {/* Projection frustum visualization */}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array([
                  // Projector position to surface corners
                  projectionConfig.projectorPosition.x, projectionConfig.projectorPosition.y, projectionConfig.projectorPosition.z,
                  preset.geometry.position.x - preset.geometry.dimensions.width/2, preset.geometry.position.y + preset.geometry.dimensions.height/2, preset.geometry.position.z,
                  projectionConfig.projectorPosition.x, projectionConfig.projectorPosition.y, projectionConfig.projectorPosition.z,
                  preset.geometry.position.x + preset.geometry.dimensions.width/2, preset.geometry.position.y + preset.geometry.dimensions.height/2, preset.geometry.position.z,
                  projectionConfig.projectorPosition.x, projectionConfig.projectorPosition.y, projectionConfig.projectorPosition.z,
                  preset.geometry.position.x - preset.geometry.dimensions.width/2, preset.geometry.position.y - preset.geometry.dimensions.height/2, preset.geometry.position.z,
                  projectionConfig.projectorPosition.x, projectionConfig.projectorPosition.y, projectionConfig.projectorPosition.z,
                  preset.geometry.position.x + preset.geometry.dimensions.width/2, preset.geometry.position.y - preset.geometry.dimensions.height/2, preset.geometry.position.z,
                ]), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#00ff88" transparent opacity={0.5} />
          </line>
        </group>
      )}
    </group>
  )
}

// Controls component for surface selection
const Controls: React.FC<ControlsProps> = ({
  selectedSurface,
  selectedPreset,
  onSurfaceChange
}) => {
  const surfaceTypes: { id: SurfaceType; label: string; presets: Record<string, SurfacePreset> }[] = [
    { id: 'building', label: 'Buildings', presets: buildingPresets },
    { id: 'object', label: 'Objects', presets: objectPresets },
    { id: 'vehicle', label: 'Vehicles', presets: vehiclePresets }
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Surface Selection</h3>

      {/* Surface Type Selector */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-white/80">Surface Type</label>
        <div className="grid grid-cols-1 gap-2">
          {surfaceTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                const firstPreset = Object.values(type.presets)[0]
                onSurfaceChange(type.id, firstPreset)
              }}
              className={`p-3 rounded-lg text-left transition-colors ${
                selectedSurface === type.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <div className="font-medium">{type.label}</div>
              <div className="text-sm opacity-70">
                {Object.keys(type.presets).length} presets available
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Preset Selector */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-white/80">Preset</label>
        <div className="grid grid-cols-1 gap-2">
          {Object.values(surfacePresets[selectedSurface]).map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSurfaceChange(selectedSurface, preset)}
              className={`p-3 rounded-lg text-left transition-colors ${
                selectedPreset.id === preset.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{preset.name}</div>
                <span className={`px-2 py-1 text-xs rounded ${
                  preset.difficulty === 'beginner'
                    ? 'bg-green-500/20 text-green-300'
                    : preset.difficulty === 'intermediate'
                    ? 'bg-yellow-500/20 text-yellow-300'
                    : 'bg-red-500/20 text-red-300'
                }`}>
                  {preset.difficulty}
                </span>
              </div>
              <div className="text-sm opacity-70 mt-1">{preset.description}</div>
              <div className="text-xs opacity-50 mt-2">
                Recommended projectors: {preset.recommendedProjectors}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Preset Details */}
      <div className="bg-white/5 rounded-lg p-4">
        <h4 className="font-medium mb-2">Surface Properties</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-white/60">Dimensions:</span>
            <div>{selectedPreset.geometry.dimensions.width}×{selectedPreset.geometry.dimensions.height}×{selectedPreset.geometry.dimensions.depth}m</div>
          </div>
          <div>
            <span className="text-white/60">Reflectivity:</span>
            <div>{(selectedPreset.materialProperties.reflectivity * 100).toFixed(0)}%</div>
          </div>
          <div>
            <span className="text-white/60">Roughness:</span>
            <div>{(selectedPreset.materialProperties.roughness * 100).toFixed(0)}%</div>
          </div>
          <div>
            <span className="text-white/60">Difficulty:</span>
            <div className="capitalize">{selectedPreset.difficulty}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

Surface3D.Controls = Controls

export default Surface3D