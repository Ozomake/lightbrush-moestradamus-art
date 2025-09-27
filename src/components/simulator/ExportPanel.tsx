import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { type ProjectionConfig, type ProjectorSettings } from '../../utils/projectionMath'
import { type SurfacePreset } from '../../utils/surfaceMapping'

interface ExportPanelProps {
  projectionConfig: ProjectionConfig | null
  projectorSettings: ProjectorSettings
  surfacePreset: SurfacePreset
  selectedContent: string | null
}

interface ExportFormat {
  id: string
  name: string
  description: string
  fileExtension: string
  icon: string
}

interface EquipmentRecommendation {
  category: 'projector' | 'media-player' | 'cables' | 'mounts' | 'software'
  item: string
  specification: string
  price: string
  priority: 'essential' | 'recommended' | 'optional'
}

const exportFormats: ExportFormat[] = [
  {
    id: 'json-config',
    name: 'Configuration File',
    description: 'Complete setup configuration in JSON format',
    fileExtension: '.json',
    icon: '⚙️'
  },
  {
    id: 'mad-mapper',
    name: 'MadMapper Project',
    description: 'Import into MadMapper software',
    fileExtension: '.madmapper',
    icon: '🎭'
  },
  {
    id: 'resolume',
    name: 'Resolume Arena',
    description: 'Compatible with Resolume Arena',
    fileExtension: '.rar',
    icon: '🎪'
  },
  {
    id: 'touch-designer',
    name: 'TouchDesigner',
    description: 'TouchDesigner toe file',
    fileExtension: '.toe',
    icon: '💎'
  },
  {
    id: 'pdf-report',
    name: 'Setup Report',
    description: 'Detailed PDF report with diagrams',
    fileExtension: '.pdf',
    icon: '📄'
  }
]

const ExportPanel: React.FC<ExportPanelProps> = ({
  projectionConfig,
  projectorSettings,
  surfacePreset,
  selectedContent
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'equipment' | 'share'>('export')
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['json-config'])
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  // Generate equipment recommendations based on setup
  const generateEquipmentRecommendations = useCallback((): EquipmentRecommendation[] => {
    const recommendations: EquipmentRecommendation[] = []

    if (!projectionConfig) return recommendations

    // Projector recommendations
    const brightness = projectionConfig.recommendedSettings.minimumBrightness
    if (brightness < 3000) {
      recommendations.push({
        category: 'projector',
        item: 'Entry-level Projector',
        specification: `${Math.ceil(brightness / 100) * 100}+ lumens, 1080p`,
        price: '$800-1,500',
        priority: 'essential'
      })
    } else if (brightness < 6000) {
      recommendations.push({
        category: 'projector',
        item: 'Professional Projector',
        specification: `${Math.ceil(brightness / 500) * 500}+ lumens, 4K, laser`,
        price: '$3,000-8,000',
        priority: 'essential'
      })
    } else {
      recommendations.push({
        category: 'projector',
        item: 'High-end Venue Projector',
        specification: `${Math.ceil(brightness / 1000) * 1000}+ lumens, 4K, laser, lens shift`,
        price: '$8,000-25,000',
        priority: 'essential'
      })
    }

    // Media player
    recommendations.push({
      category: 'media-player',
      item: 'Media Server',
      specification: selectedContent ? 'High-performance media server' : 'Basic media player',
      price: selectedContent ? '$2,000-5,000' : '$200-800',
      priority: 'essential'
    })

    // Multi-projector setup
    if (projectionConfig.recommendedSettings.multiProjectorSetup) {
      recommendations.push({
        category: 'software',
        item: 'Edge Blending Software',
        specification: 'Professional projection mapping software',
        price: '$500-2,000/license',
        priority: 'essential'
      })
    }

    // Cables and mounts
    const distance = projectionConfig.recommendedSettings.optimalDistance
    recommendations.push({
      category: 'cables',
      item: 'HDMI/SDI Cables',
      specification: `${Math.ceil(distance)}m professional grade cables`,
      price: '$50-200',
      priority: 'essential'
    })

    recommendations.push({
      category: 'mounts',
      item: 'Projector Mount',
      specification: 'Heavy-duty ceiling/truss mount',
      price: '$100-500',
      priority: 'recommended'
    })

    return recommendations
  }, [projectionConfig, selectedContent])

  const handleFormatToggle = useCallback((formatId: string) => {
    setSelectedFormats(prev =>
      prev.includes(formatId)
        ? prev.filter(id => id !== formatId)
        : [...prev, formatId]
    )
  }, [])

  const handleExport = useCallback(async () => {
    if (!projectionConfig) return

    setIsExporting(true)
    setExportProgress(0)

    try {
      // Simulate export process
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setExportProgress(i)
      }

      // Generate export data
      const exportData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        surface: {
          type: surfacePreset.id,
          name: surfacePreset.name,
          geometry: surfacePreset.geometry,
          material: surfacePreset.materialProperties
        },
        projector: {
          position: projectorSettings.position,
          rotation: projectorSettings.rotation,
          optics: {
            fov: projectorSettings.fov,
            throwRatio: projectorSettings.throw_ratio,
            brightness: projectorSettings.brightness,
            resolution: projectorSettings.resolution,
            lensShift: projectorSettings.lens_shift
          }
        },
        projection: {
          config: projectionConfig,
          content: selectedContent
        },
        recommendations: generateEquipmentRecommendations()
      }

      // Create downloadable files
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `lightbrush-projection-setup-${Date.now()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }, [projectionConfig, projectorSettings, surfacePreset, selectedContent, generateEquipmentRecommendations])

  const handleShare = useCallback((platform: string) => {
    const setupDescription = `Check out my projection mapping setup: ${surfacePreset.name} with ${projectorSettings.brightness} lumen projector`
    const hashtags = '#projectionmapping #lightbrush #visualart'

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(setupDescription + ' ' + hashtags)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      reddit: `https://reddit.com/submit?title=${encodeURIComponent(setupDescription)}&url=${encodeURIComponent(window.location.href)}`
    }

    if (urls[platform as keyof typeof urls]) {
      window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400')
    }
  }, [surfacePreset.name, projectorSettings.brightness])

  const copyShareLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      // Show success message (you could add a toast notification here)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }, [])

  const tabs = [
    { id: 'export', label: 'Export Files', icon: '📁' },
    { id: 'equipment', label: 'Equipment List', icon: '🛠️' },
    { id: 'share', label: 'Share Setup', icon: '🔗' }
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Export & Share</h3>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-white/5 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-3 py-2 rounded-md text-xs transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <div>{tab.icon}</div>
            <div className="mt-1">{tab.label}</div>
          </button>
        ))}
      </div>

      {/* Export Files Tab */}
      {activeTab === 'export' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {!projectionConfig ? (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-yellow-300 text-sm">
                Configure your projection setup first to export files.
              </p>
            </div>
          ) : (
            <>
              {/* Format Selection */}
              <div className="space-y-3">
                <h4 className="font-medium text-white/80">Export Formats</h4>
                <div className="space-y-2">
                  {exportFormats.map((format) => (
                    <label
                      key={format.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedFormats.includes(format.id)
                          ? 'bg-purple-600/20 border border-purple-600/40'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedFormats.includes(format.id)}
                        onChange={() => handleFormatToggle(format.id)}
                        className="rounded"
                      />
                      <div className="text-lg">{format.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{format.name}</div>
                        <div className="text-xs text-white/60">{format.description}</div>
                      </div>
                      <div className="text-xs text-white/50 font-mono">
                        {format.fileExtension}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Export Button */}
              <div className="space-y-3">
                <button
                  onClick={handleExport}
                  disabled={selectedFormats.length === 0 || isExporting}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? 'Exporting...' : `Export ${selectedFormats.length} Format(s)`}
                </button>

                {/* Progress Bar */}
                {isExporting && (
                  <div className="space-y-2">
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${exportProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-white/60 text-center">
                      Generating files... {exportProgress}%
                    </p>
                  </div>
                )}
              </div>

              {/* Setup Summary */}
              <div className="bg-white/5 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-white/80">Setup Summary</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-white/60">Surface:</span>
                    <div>{surfacePreset.name}</div>
                  </div>
                  <div>
                    <span className="text-white/60">Brightness:</span>
                    <div>{projectorSettings.brightness} lumens</div>
                  </div>
                  <div>
                    <span className="text-white/60">Distance:</span>
                    <div>{projectionConfig.recommendedSettings.optimalDistance.toFixed(1)}m</div>
                  </div>
                  <div>
                    <span className="text-white/60">Coverage:</span>
                    <div>{(projectionConfig.coverageArea * 100).toFixed(0)}%</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Equipment List Tab */}
      {activeTab === 'equipment' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h4 className="font-medium text-white/80">Equipment Recommendations</h4>

          {projectionConfig ? (
            <div className="space-y-4">
{(() => {
                const equipmentGroups = generateEquipmentRecommendations()
                  .reduce((groups, item) => {
                    const category = item.category
                    if (!groups[category]) groups[category] = []
                    groups[category].push(item)
                    return groups
                  }, {} as Record<string, EquipmentRecommendation[]>)

                const categoryIcons = {
                  projector: '📽️',
                  'media-player': '💻',
                  cables: '🔌',
                  mounts: '🔧',
                  software: '💿'
                }

                return Object.entries(equipmentGroups).map(([category, items]) => (
                  <div key={category} className="bg-white/5 rounded-lg p-4">
                    <h5 className="font-medium text-sm mb-3 capitalize flex items-center gap-2">
                      {categoryIcons[category as keyof typeof categoryIcons]}
                      {category.replace('-', ' ')}
                    </h5>
                    <div className="space-y-3">
                      {items.map((item, index) => (
                        <div key={index} className="border-l-4 border-purple-500 pl-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium text-sm">{item.item}</div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              item.priority === 'essential'
                                ? 'bg-red-500/20 text-red-300'
                                : item.priority === 'recommended'
                                ? 'bg-yellow-500/20 text-yellow-300'
                                : 'bg-green-500/20 text-green-300'
                            }`}>
                              {item.priority}
                            </span>
                          </div>
                          <div className="text-xs text-white/60 mb-1">{item.specification}</div>
                          <div className="text-xs text-white/80 font-mono">{item.price}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              })()}

              {/* Total Estimated Cost */}
              <div className="bg-blue-500/10 rounded-lg p-4">
                <h5 className="font-medium text-blue-300 mb-2">Estimated Total Cost</h5>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-white/60">Essential:</span>
                    <div className="font-mono">$3,000-15,000</div>
                  </div>
                  <div>
                    <span className="text-white/60">Recommended:</span>
                    <div className="font-mono">+$500-2,000</div>
                  </div>
                  <div>
                    <span className="text-white/60">Total Range:</span>
                    <div className="font-mono font-bold">$3,500-17,000</div>
                  </div>
                </div>
                <p className="text-xs text-white/60 mt-2">
                  Prices are estimates and may vary by region and vendor.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-yellow-300 text-sm">
                Configure your projection setup to see equipment recommendations.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Share Setup Tab */}
      {activeTab === 'share' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h4 className="font-medium text-white/80">Share Your Setup</h4>

          {/* Social Media Sharing */}
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-white/70">Social Media</h5>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'twitter', name: 'Twitter', icon: '🐦', color: 'bg-blue-500' },
                { id: 'facebook', name: 'Facebook', icon: '👥', color: 'bg-blue-700' },
                { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'bg-blue-600' },
                { id: 'reddit', name: 'Reddit', icon: '🔴', color: 'bg-orange-600' }
              ].map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => handleShare(platform.id)}
                  className={`flex items-center gap-2 px-4 py-3 ${platform.color} hover:opacity-80 rounded-lg transition-opacity`}
                >
                  <span>{platform.icon}</span>
                  <span className="text-sm">{platform.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Direct Link Sharing */}
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-white/70">Direct Link</h5>
            <div className="flex gap-2">
              <input
                type="text"
                value={window.location.href}
                readOnly
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-mono"
              />
              <button
                onClick={copyShareLink}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-colors"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Embed Code */}
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-white/70">Embed Code</h5>
            <textarea
              value={`<iframe src="${window.location.href}" width="800" height="600" frameborder="0"></iframe>`}
              readOnly
              rows={3}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-mono resize-none"
            />
          </div>

          {/* QR Code */}
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <h5 className="text-sm font-medium text-white/70 mb-3">QR Code</h5>
            <div className="w-32 h-32 bg-white rounded-lg mx-auto flex items-center justify-center">
              <span className="text-black text-xs">QR Code</span>
            </div>
            <p className="text-xs text-white/60 mt-2">
              Scan to view this setup on mobile
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}


export default ExportPanel