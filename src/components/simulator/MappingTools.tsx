import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Vector3 } from 'three'
import {
  type ProjectorSettings,
  type KeystoneCorrection,
  type Vector2
} from '../../utils/projectionMath'
import { type SurfaceGeometry } from '../../utils/surfaceMapping'

interface MappingToolsProps {
  mode: 'keystone' | 'edge-blend' | 'multi-projector'
  projectorSettings: ProjectorSettings
  surfaceGeometry: SurfaceGeometry
  onSettingsChange: (settings: ProjectorSettings) => void
}

interface EdgeBlendSettings {
  enabled: boolean
  topBlend: number
  bottomBlend: number
  leftBlend: number
  rightBlend: number
  gamma: number
}

interface MultiProjectorSetup {
  projectors: Array<{
    id: string
    position: Vector3
    rotation: Vector3
    enabled: boolean
    brightness: number
  }>
  overlap: number
  synchronization: 'master-slave' | 'independent'
}

const MappingTools: React.FC<MappingToolsProps> = ({
  mode,
  projectorSettings,
  surfaceGeometry,
  // onSettingsChange
}) => {
  const [keystoneValues, setKeystoneValues] = useState<KeystoneCorrection>({
    topLeft: { x: 0, y: 0 },
    topRight: { x: 0, y: 0 },
    bottomLeft: { x: 0, y: 0 },
    bottomRight: { x: 0, y: 0 },
    verticalKeystone: 0,
    horizontalKeystone: 0
  })

  const [edgeBlendSettings, setEdgeBlendSettings] = useState<EdgeBlendSettings>({
    enabled: false,
    topBlend: 10,
    bottomBlend: 10,
    leftBlend: 10,
    rightBlend: 10,
    gamma: 2.2
  })

  const [multiProjectorSetup, setMultiProjectorSetup] = useState<MultiProjectorSetup>({
    projectors: [
      {
        id: 'projector-1',
        position: new Vector3(0, 5, 10),
        rotation: new Vector3(-15, 0, 0),
        enabled: true,
        brightness: 100
      }
    ],
    overlap: 15,
    synchronization: 'independent'
  })

  const [activeCorner, setActiveCorner] = useState<string | null>(null)

  // Auto-calculate keystone based on projector position
  useEffect(() => {
    // const distance = Math.sqrt(
    //   Math.pow(projectorSettings.position.x, 2) +
    //   Math.pow(projectorSettings.position.y - surfaceGeometry.dimensions.height / 2, 2) +
    //   Math.pow(projectorSettings.position.z, 2)
    // )

    const angle = Math.atan2(
      projectorSettings.position.y - surfaceGeometry.dimensions.height / 2,
      projectorSettings.position.z
    )

    const horizontalKeystone = (projectorSettings.rotation.y * Math.PI / 180) * 50
    const verticalKeystone = angle * 180 / Math.PI * 0.5

    setKeystoneValues(prev => ({
      ...prev,
      horizontalKeystone,
      verticalKeystone
    }))
  }, [projectorSettings.position, projectorSettings.rotation, surfaceGeometry])

  const handleKeystoneChange = useCallback((property: keyof KeystoneCorrection, value: any) => {
    setKeystoneValues(prev => ({
      ...prev,
      [property]: value
    }))
  }, [])

  const handleCornerAdjustment = useCallback((corner: keyof KeystoneCorrection, axis: 'x' | 'y', value: number) => {
    if (typeof keystoneValues[corner] === 'object' && keystoneValues[corner] !== null) {
      setKeystoneValues(prev => ({
        ...prev,
        [corner]: {
          ...(prev[corner] as Vector2),
          [axis]: value
        }
      }))
    }
  }, [keystoneValues])

  const handleEdgeBlendChange = useCallback((property: keyof EdgeBlendSettings, value: any) => {
    setEdgeBlendSettings(prev => ({
      ...prev,
      [property]: value
    }))
  }, [])

  const addProjector = useCallback(() => {
    const newProjector = {
      id: `projector-${multiProjectorSetup.projectors.length + 1}`,
      position: new Vector3(
        multiProjectorSetup.projectors.length * 5,
        5,
        10
      ),
      rotation: new Vector3(-15, multiProjectorSetup.projectors.length * 10, 0),
      enabled: true,
      brightness: 100
    }

    setMultiProjectorSetup(prev => ({
      ...prev,
      projectors: [...prev.projectors, newProjector]
    }))
  }, [multiProjectorSetup.projectors])

  const removeProjector = useCallback((id: string) => {
    setMultiProjectorSetup(prev => ({
      ...prev,
      projectors: prev.projectors.filter(p => p.id !== id)
    }))
  }, [])

  const updateProjector = useCallback((id: string, updates: Partial<typeof multiProjectorSetup.projectors[0]>) => {
    setMultiProjectorSetup(prev => ({
      ...prev,
      projectors: prev.projectors.map(p =>
        p.id === id ? { ...p, ...updates } : p
      )
    }))
  }, [])

  const resetMapping = useCallback(() => {
    setKeystoneValues({
      topLeft: { x: 0, y: 0 },
      topRight: { x: 0, y: 0 },
      bottomLeft: { x: 0, y: 0 },
      bottomRight: { x: 0, y: 0 },
      verticalKeystone: 0,
      horizontalKeystone: 0
    })
    setEdgeBlendSettings({
      enabled: false,
      topBlend: 10,
      bottomBlend: 10,
      leftBlend: 10,
      rightBlend: 10,
      gamma: 2.2
    })
  }, [])

  const applyAutoMapping = useCallback(() => {
    // Auto-calculate optimal mapping settings
    const distance = Math.sqrt(
      Math.pow(projectorSettings.position.x, 2) +
      Math.pow(projectorSettings.position.y, 2) +
      Math.pow(projectorSettings.position.z, 2)
    )

    const surfaceArea = surfaceGeometry.dimensions.width * surfaceGeometry.dimensions.height
    const needsEdgeBlend = surfaceArea > 50 || distance > 15

    if (needsEdgeBlend) {
      setEdgeBlendSettings(prev => ({
        ...prev,
        enabled: true,
        topBlend: Math.min(20, distance * 0.5),
        bottomBlend: Math.min(20, distance * 0.5),
        leftBlend: Math.min(15, distance * 0.3),
        rightBlend: Math.min(15, distance * 0.3)
      }))
    }
  }, [projectorSettings, surfaceGeometry])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Mapping Tools</h3>
        <div className="flex gap-2">
          <button
            onClick={applyAutoMapping}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            Auto Map
          </button>
          <button
            onClick={resetMapping}
            className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 rounded transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Keystone Correction */}
      {mode === 'keystone' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h4 className="font-medium text-white/80">Keystone Correction</h4>

          {/* Visual Keystone Grid */}
          <div className="bg-white/5 rounded-lg p-4">
            <div className="relative w-full h-32 bg-gradient-to-b from-white/10 to-white/5 rounded border border-white/20 overflow-hidden">
              {/* Grid Lines */}
              <svg className="absolute inset-0 w-full h-full">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Keystone visualization */}
                <polygon
                  points={`
                    ${50 + keystoneValues.topLeft.x * 100},${20 + keystoneValues.topLeft.y * 100}
                    ${150 + keystoneValues.topRight.x * 100},${20 + keystoneValues.topRight.y * 100}
                    ${150 + keystoneValues.bottomRight.x * 100},${108 + keystoneValues.bottomRight.y * 100}
                    ${50 + keystoneValues.bottomLeft.x * 100},${108 + keystoneValues.bottomLeft.y * 100}
                  `}
                  fill="rgba(138, 43, 226, 0.3)"
                  stroke="rgba(138, 43, 226, 0.8)"
                  strokeWidth="2"
                />

                {/* Corner handles */}
                {[
                  { name: 'topLeft', x: 50 + keystoneValues.topLeft.x * 100, y: 20 + keystoneValues.topLeft.y * 100 },
                  { name: 'topRight', x: 150 + keystoneValues.topRight.x * 100, y: 20 + keystoneValues.topRight.y * 100 },
                  { name: 'bottomLeft', x: 50 + keystoneValues.bottomLeft.x * 100, y: 108 + keystoneValues.bottomLeft.y * 100 },
                  { name: 'bottomRight', x: 150 + keystoneValues.bottomRight.x * 100, y: 108 + keystoneValues.bottomRight.y * 100 }
                ].map((corner) => (
                  <circle
                    key={corner.name}
                    cx={corner.x}
                    cy={corner.y}
                    r="4"
                    fill={activeCorner === corner.name ? "#8A2BE2" : "#fff"}
                    stroke="#8A2BE2"
                    strokeWidth="2"
                    className="cursor-pointer"
                    onClick={() => setActiveCorner(activeCorner === corner.name ? null : corner.name)}
                  />
                ))}
              </svg>
            </div>

            <p className="text-xs text-white/60 mt-2">
              Click corner handles to adjust individual corners
            </p>
          </div>

          {/* Corner Adjustment Controls */}
          <AnimatePresence>
            {activeCorner && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white/5 rounded-lg p-4 space-y-3"
              >
                <h5 className="font-medium text-sm capitalize">{activeCorner.replace(/([A-Z])/g, ' $1').trim()} Corner</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/70 mb-1">Horizontal</label>
                    <input
                      type="range"
                      min="-0.2"
                      max="0.2"
                      step="0.01"
                      value={(keystoneValues[activeCorner as keyof KeystoneCorrection] as Vector2)?.x || 0}
                      onChange={(e) => handleCornerAdjustment(activeCorner as keyof KeystoneCorrection, 'x', parseFloat(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none slider"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/70 mb-1">Vertical</label>
                    <input
                      type="range"
                      min="-0.2"
                      max="0.2"
                      step="0.01"
                      value={(keystoneValues[activeCorner as keyof KeystoneCorrection] as Vector2)?.y || 0}
                      onChange={(e) => handleCornerAdjustment(activeCorner as keyof KeystoneCorrection, 'y', parseFloat(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none slider"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Global Keystone Controls */}
          <div className="space-y-3">
            <h5 className="font-medium text-sm">Global Adjustments</h5>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-white/70">Horizontal Keystone</label>
                  <span className="text-xs font-mono">{keystoneValues.horizontalKeystone.toFixed(1)}°</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="0.1"
                  value={keystoneValues.horizontalKeystone}
                  onChange={(e) => handleKeystoneChange('horizontalKeystone', parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none slider"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-white/70">Vertical Keystone</label>
                  <span className="text-xs font-mono">{keystoneValues.verticalKeystone.toFixed(1)}°</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="0.1"
                  value={keystoneValues.verticalKeystone}
                  onChange={(e) => handleKeystoneChange('verticalKeystone', parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none slider"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Edge Blending */}
      {mode === 'edge-blend' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-white/80">Edge Blending</h4>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={edgeBlendSettings.enabled}
                onChange={(e) => handleEdgeBlendChange('enabled', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Enable</span>
            </label>
          </div>

          {edgeBlendSettings.enabled && (
            <div className="space-y-4">
              {/* Visual Blend Preview */}
              <div className="bg-white/5 rounded-lg p-4">
                <div className="relative w-full h-32 bg-gradient-to-b from-purple-500/30 to-purple-500/10 rounded border border-white/20">
                  {/* Blend zones visualization */}
                  <div
                    className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent"
                    style={{ height: `${edgeBlendSettings.topBlend}%` }}
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent"
                    style={{ height: `${edgeBlendSettings.bottomBlend}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-black/60 to-transparent"
                    style={{ width: `${edgeBlendSettings.leftBlend}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 right-0 bg-gradient-to-l from-black/60 to-transparent"
                    style={{ width: `${edgeBlendSettings.rightBlend}%` }}
                  />

                  <div className="absolute inset-0 flex items-center justify-center text-white/70 text-sm">
                    Blend Preview
                  </div>
                </div>
              </div>

              {/* Blend Controls */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'topBlend', label: 'Top' },
                  { key: 'bottomBlend', label: 'Bottom' },
                  { key: 'leftBlend', label: 'Left' },
                  { key: 'rightBlend', label: 'Right' }
                ].map(({ key, label }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-white/70">{label} Blend</label>
                      <span className="text-xs font-mono">
                        {edgeBlendSettings[key as keyof EdgeBlendSettings]}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={edgeBlendSettings[key as keyof EdgeBlendSettings] as number}
                      onChange={(e) => handleEdgeBlendChange(key as keyof EdgeBlendSettings, parseInt(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none slider"
                    />
                  </div>
                ))}
              </div>

              {/* Gamma Correction */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-white/70">Gamma Correction</label>
                  <span className="text-xs font-mono">{edgeBlendSettings.gamma}</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="3.0"
                  step="0.1"
                  value={edgeBlendSettings.gamma}
                  onChange={(e) => handleEdgeBlendChange('gamma', parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none slider"
                />
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Multi-Projector Setup */}
      {mode === 'multi-projector' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-white/80">Multi-Projector Setup</h4>
            <button
              onClick={addProjector}
              className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 rounded transition-colors"
            >
              + Add Projector
            </button>
          </div>

          {/* Projector List */}
          <div className="space-y-3">
            {multiProjectorSetup.projectors.map((projector, index) => (
              <div key={projector.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={projector.enabled}
                      onChange={(e) => updateProjector(projector.id, { enabled: e.target.checked })}
                      className="rounded"
                    />
                    <span className="font-medium text-sm">Projector {index + 1}</span>
                  </div>
                  {multiProjectorSetup.projectors.length > 1 && (
                    <button
                      onClick={() => removeProjector(projector.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {projector.enabled && (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-white/60">Position X</label>
                      <input
                        type="range"
                        min="-20"
                        max="20"
                        step="0.1"
                        value={projector.position.x}
                        onChange={(e) => updateProjector(projector.id, {
                          position: new Vector3(parseFloat(e.target.value), projector.position.y, projector.position.z)
                        })}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none slider"
                      />
                    </div>
                    <div>
                      <label className="text-white/60">Brightness</label>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        step="5"
                        value={projector.brightness}
                        onChange={(e) => updateProjector(projector.id, { brightness: parseInt(e.target.value) })}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none slider"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Global Multi-Projector Settings */}
          <div className="bg-white/5 rounded-lg p-4 space-y-3">
            <h5 className="font-medium text-sm">Global Settings</h5>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-white/70">Overlap Zone</label>
                <span className="text-xs font-mono">{multiProjectorSetup.overlap}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={multiProjectorSetup.overlap}
                onChange={(e) => setMultiProjectorSetup(prev => ({ ...prev, overlap: parseInt(e.target.value) }))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none slider"
              />
            </div>

            <div>
              <label className="block text-xs text-white/70 mb-1">Synchronization</label>
              <select
                value={multiProjectorSetup.synchronization}
                onChange={(e) => setMultiProjectorSetup(prev => ({ ...prev, synchronization: e.target.value as any }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-sm"
              >
                <option value="independent">Independent</option>
                <option value="master-slave">Master-Slave</option>
              </select>
            </div>
          </div>

          {/* Setup Summary */}
          <div className="bg-blue-500/10 rounded-lg p-4">
            <h5 className="font-medium text-sm text-blue-300 mb-2">Setup Summary</h5>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-white/60">Active Projectors:</span>
                <div>{multiProjectorSetup.projectors.filter(p => p.enabled).length}</div>
              </div>
              <div>
                <span className="text-white/60">Total Coverage:</span>
                <div>{multiProjectorSetup.projectors.filter(p => p.enabled).length * 100 - (multiProjectorSetup.projectors.filter(p => p.enabled).length - 1) * multiProjectorSetup.overlap}%</div>
              </div>
              <div>
                <span className="text-white/60">Sync Mode:</span>
                <div className="capitalize">{multiProjectorSetup.synchronization.replace('-', ' ')}</div>
              </div>
              <div>
                <span className="text-white/60">Overlap:</span>
                <div>{multiProjectorSetup.overlap}%</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default MappingTools