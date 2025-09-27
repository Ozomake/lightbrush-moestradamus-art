import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Vector3 } from 'three'
import {
  type ProjectorSettings,
  type ProjectionConfig,
  calculateThrowDistance,
  calculateImageSize,
  // calculateLensShift,
  validateProjectorSetup
} from '../../utils/projectionMath'

interface ProjectorControlsProps {
  settings: ProjectorSettings
  onChange: (settings: ProjectorSettings) => void
  projectionConfig: ProjectionConfig | null
}

interface ValidationResult {
  isValid: boolean
  warnings: string[]
  errors: string[]
}

const ProjectorControls: React.FC<ProjectorControlsProps> = ({
  settings,
  onChange,
  projectionConfig
}) => {
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [activeSection, setActiveSection] = useState<'position' | 'optics' | 'image' | 'analysis'>('position')

  // Validate settings when they change
  useEffect(() => {
    if (projectionConfig) {
      // For validation, we need surface geometry - using mock data here
      const mockSurface = {
        type: 'box' as const,
        dimensions: { width: 10, height: 6, depth: 1 },
        position: new Vector3(0, 3, 0),
        uvMapping: []
      }

      const validationResult = validateProjectorSetup(settings, mockSurface)
      setValidation(validationResult)
    }
  }, [settings, projectionConfig])

  const handlePositionChange = useCallback((axis: 'x' | 'y' | 'z', value: number) => {
    const newPosition = settings.position.clone()
    newPosition[axis] = value
    onChange({
      ...settings,
      position: newPosition
    })
  }, [settings, onChange])

  const handleRotationChange = useCallback((axis: 'x' | 'y' | 'z', value: number) => {
    const newRotation = settings.rotation.clone()
    newRotation[axis] = value
    onChange({
      ...settings,
      rotation: newRotation
    })
  }, [settings, onChange])

  const handleOpticsChange = useCallback((property: keyof ProjectorSettings, value: any) => {
    onChange({
      ...settings,
      [property]: value
    })
  }, [settings, onChange])

  const handleLensShiftChange = useCallback((axis: 'horizontal' | 'vertical', value: number) => {
    onChange({
      ...settings,
      lens_shift: {
        ...settings.lens_shift,
        [axis]: value
      }
    })
  }, [settings, onChange])

  const handleResolutionChange = useCallback((dimension: 'width' | 'height', value: number) => {
    onChange({
      ...settings,
      resolution: {
        ...settings.resolution,
        [dimension]: value
      }
    })
  }, [settings, onChange])

  const resetToOptimal = useCallback(() => {
    // Reset to optimal settings based on current surface
    onChange({
      position: new Vector3(0, 5, 10),
      rotation: new Vector3(-15, 0, 0),
      fov: 45,
      throw_ratio: 1.2,
      brightness: 4000,
      resolution: { width: 1920, height: 1080 },
      lens_shift: { horizontal: 0, vertical: 0 }
    })
  }, [onChange])

  const sections = [
    { id: 'position', label: 'Position', icon: '📍' },
    { id: 'optics', label: 'Optics', icon: '🔍' },
    { id: 'image', label: 'Image', icon: '🖼️' },
    { id: 'analysis', label: 'Analysis', icon: '📊' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Projector Controls</h3>
        <button
          onClick={resetToOptimal}
          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded transition-colors"
        >
          Reset to Optimal
        </button>
      </div>

      {/* Section Navigation */}
      <div className="flex gap-1 bg-white/5 rounded-lg p-1">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id as any)}
            className={`flex-1 px-3 py-2 rounded-md text-xs transition-colors ${
              activeSection === section.id
                ? 'bg-purple-600 text-white'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <div>{section.icon}</div>
            <div className="mt-1">{section.label}</div>
          </button>
        ))}
      </div>

      {/* Position Controls */}
      {activeSection === 'position' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4">
            {/* Position Controls */}
            <div className="space-y-3">
              <h4 className="font-medium text-white/80">Position (meters)</h4>
              {(['x', 'y', 'z'] as const).map((axis) => (
                <div key={axis} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-white/70 capitalize">{axis}-axis</label>
                    <span className="text-sm font-mono">
                      {settings.position[axis].toFixed(1)}m
                    </span>
                  </div>
                  <input
                    type="range"
                    min={axis === 'y' ? 0 : -20}
                    max={axis === 'y' ? 20 : 20}
                    step="0.1"
                    value={settings.position[axis]}
                    onChange={(e) => handlePositionChange(axis, parseFloat(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none slider"
                  />
                </div>
              ))}
            </div>

            {/* Rotation Controls */}
            <div className="space-y-3">
              <h4 className="font-medium text-white/80">Rotation (degrees)</h4>
              {(['x', 'y', 'z'] as const).map((axis) => (
                <div key={axis} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-white/70 capitalize">
                      {axis === 'x' ? 'Tilt' : axis === 'y' ? 'Pan' : 'Roll'}
                    </label>
                    <span className="text-sm font-mono">
                      {settings.rotation[axis].toFixed(1)}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    step="0.1"
                    value={settings.rotation[axis]}
                    onChange={(e) => handleRotationChange(axis, parseFloat(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none slider"
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Optics Controls */}
      {activeSection === 'optics' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="space-y-4">
            {/* FOV Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white/80">Field of View</label>
                <span className="text-sm font-mono">{settings.fov}°</span>
              </div>
              <input
                type="range"
                min="20"
                max="120"
                step="1"
                value={settings.fov}
                onChange={(e) => handleOpticsChange('fov', parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none slider"
              />
              <p className="text-xs text-white/50">Wider FOV = larger image, shorter throw distance</p>
            </div>

            {/* Throw Ratio */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white/80">Throw Ratio</label>
                <span className="text-sm font-mono">{settings.throw_ratio.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={settings.throw_ratio}
                onChange={(e) => handleOpticsChange('throw_ratio', parseFloat(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none slider"
              />
              <p className="text-xs text-white/50">Lower ratio = wider angle, shorter throw</p>
            </div>

            {/* Brightness */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white/80">Brightness</label>
                <span className="text-sm font-mono">{settings.brightness} lumens</span>
              </div>
              <input
                type="range"
                min="1000"
                max="10000"
                step="100"
                value={settings.brightness}
                onChange={(e) => handleOpticsChange('brightness', parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none slider"
              />
            </div>

            {/* Lens Shift */}
            <div className="space-y-3">
              <h4 className="font-medium text-white/80">Lens Shift</h4>
              {(['horizontal', 'vertical'] as const).map((axis) => (
                <div key={axis} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-white/70 capitalize">{axis}</label>
                    <span className="text-sm font-mono">
                      {(settings.lens_shift[axis] * 100).toFixed(0)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-0.5"
                    max="0.5"
                    step="0.01"
                    value={settings.lens_shift[axis]}
                    onChange={(e) => handleLensShiftChange(axis, parseFloat(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none slider"
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Image Controls */}
      {activeSection === 'image' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="space-y-4">
            {/* Resolution */}
            <div className="space-y-3">
              <h4 className="font-medium text-white/80">Resolution</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/70 mb-1">Width</label>
                  <select
                    value={settings.resolution.width}
                    onChange={(e) => handleResolutionChange('width', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm"
                  >
                    <option value={1920}>1920</option>
                    <option value={2560}>2560</option>
                    <option value={3840}>3840</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">Height</label>
                  <select
                    value={settings.resolution.height}
                    onChange={(e) => handleResolutionChange('height', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm"
                  >
                    <option value={1080}>1080</option>
                    <option value={1440}>1440</option>
                    <option value={2160}>2160</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-white/50">
                Aspect Ratio: {(settings.resolution.width / settings.resolution.height).toFixed(2)}:1
              </p>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <h4 className="font-medium text-white/80">Quick Presets</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '1080p', width: 1920, height: 1080 },
                  { label: '1440p', width: 2560, height: 1440 },
                  { label: '4K', width: 3840, height: 2160 },
                  { label: '1080p Ultra', width: 1920, height: 1200 }
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => onChange({
                      ...settings,
                      resolution: { width: preset.width, height: preset.height }
                    })}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      settings.resolution.width === preset.width && settings.resolution.height === preset.height
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Analysis */}
      {activeSection === 'analysis' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Calculated Values */}
          <div className="bg-white/5 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-white/80">Calculated Values</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-white/60">Throw Distance:</span>
                <div className="font-mono">
                  {calculateThrowDistance(10, settings.throw_ratio).toFixed(1)}m
                </div>
              </div>
              <div>
                <span className="text-white/60">Image Size:</span>
                <div className="font-mono">
                  {(() => {
                    const size = calculateImageSize(
                      Math.sqrt(
                        Math.pow(settings.position.x, 2) +
                        Math.pow(settings.position.y, 2) +
                        Math.pow(settings.position.z, 2)
                      ),
                      settings.throw_ratio
                    )
                    return `${size.width.toFixed(1)}×${size.height.toFixed(1)}m`
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Validation Results */}
          {validation && (
            <div className="space-y-2">
              <h4 className="font-medium text-white/80">Setup Validation</h4>

              {/* Status Indicator */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                validation.isValid
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-red-500/20 text-red-300'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  validation.isValid ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <span className="text-sm font-medium">
                  {validation.isValid ? 'Configuration Valid' : 'Issues Detected'}
                </span>
              </div>

              {/* Errors */}
              {validation.errors.length > 0 && (
                <div className="space-y-1">
                  <div className="text-sm font-medium text-red-300">Errors:</div>
                  {validation.errors.map((error, index) => (
                    <div key={index} className="text-xs text-red-200 bg-red-500/10 rounded px-2 py-1">
                      {error}
                    </div>
                  ))}
                </div>
              )}

              {/* Warnings */}
              {validation.warnings.length > 0 && (
                <div className="space-y-1">
                  <div className="text-sm font-medium text-yellow-300">Warnings:</div>
                  {validation.warnings.map((warning, index) => (
                    <div key={index} className="text-xs text-yellow-200 bg-yellow-500/10 rounded px-2 py-1">
                      {warning}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Projection Config Preview */}
          {projectionConfig && (
            <div className="bg-white/5 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-white/80">Projection Analysis</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-white/60">Coverage:</span>
                  <div className="font-mono">{(projectionConfig.coverageArea * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <span className="text-white/60">Uniformity:</span>
                  <div className="font-mono">{(projectionConfig.luminanceMap.uniformity * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <span className="text-white/60">Keystone H:</span>
                  <div className="font-mono">{projectionConfig.keystoneCorrection.horizontalKeystone.toFixed(1)}°</div>
                </div>
                <div>
                  <span className="text-white/60">Keystone V:</span>
                  <div className="font-mono">{projectionConfig.keystoneCorrection.verticalKeystone.toFixed(1)}°</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default ProjectorControls