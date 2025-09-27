import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ContentItem {
  id: string
  name: string
  type: 'image' | 'video' | 'pattern' | 'animation'
  thumbnail: string
  description: string
  category: 'architectural' | 'artistic' | 'geometric' | 'nature' | 'custom'
  dimensions: { width: number; height: number }
  duration?: number // for videos/animations
  tags: string[]
}

interface ContentLibraryProps {
  selectedContent: string | null
  onContentSelect: (contentId: string) => void
}

// Sample content library
const contentLibrary: ContentItem[] = [
  // Architectural
  {
    id: 'arch-blueprint',
    name: 'Building Blueprint',
    type: 'image',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwNDA4MCIvPjxnIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIj48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIvPjxsaW5lIHgxPSIzMCIgeTE9IjEwIiB4Mj0iMzAiIHkyPSI5MCIvPjxsaW5lIHgxPSI3MCIgeTE9IjEwIiB4Mj0iNzAiIHkyPSI5MCIvPjwvZz48L3N2Zz4=',
    description: 'Technical building blueprint with structural details',
    category: 'architectural',
    dimensions: { width: 1920, height: 1080 },
    tags: ['blueprint', 'technical', 'architecture']
  },
  {
    id: 'arch-facade',
    name: 'Facade Animation',
    type: 'animation',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZjAwNmUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMzYTg2ZmYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+QU5JTTWVYPC90ZXh0Pjwvc3ZnPg==',
    description: 'Animated facade lighting sequence',
    category: 'architectural',
    dimensions: { width: 1920, height: 1080 },
    duration: 30,
    tags: ['animation', 'facade', 'lighting']
  },

  // Artistic
  {
    id: 'art-abstract',
    name: 'Abstract Flow',
    type: 'animation',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9InJnIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjOGYzOGVjIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZmYwMDZlIi8+PC9yYWRpYWxHcmFkaWVudD48L2RlZnM+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIGZpbGw9InVybCgjcmcpIi8+PC9zdmc+',
    description: 'Flowing abstract art with vibrant colors',
    category: 'artistic',
    dimensions: { width: 1920, height: 1080 },
    duration: 60,
    tags: ['abstract', 'colorful', 'flowing']
  },
  {
    id: 'art-mandala',
    name: 'Mandala Pattern',
    type: 'pattern',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTAsNSBMNjAsNDUgTDk1LDUwIEw2MCw1NSBMNTV0pPUw0mM5NSBMNTUsNDUgTDUwLDkgTDQ1LDQ1IEwxMCwzNSBMNDAsNTUgWjIwIiBmaWxsPSJub25lIiBzdHJva2U9IiM4ZjM4ZWMiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==',
    description: 'Intricate mandala pattern for meditation spaces',
    category: 'artistic',
    dimensions: { width: 2048, height: 2048 },
    tags: ['mandala', 'pattern', 'meditation']
  },

  // Geometric
  {
    id: 'geo-tessellation',
    name: 'Tessellation',
    type: 'pattern',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0dGVybiBpZD0icCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIj48cG9seWdvbiBwb2ludHM9IjEwLDAgMjAsNiAxMCwyMCAwLDYiIGZpbGw9IiMzYTg2ZmYiLz48L3BhdHRlcm4+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjcCkiLz48L3N2Zz4=',
    description: 'Geometric tessellation pattern',
    category: 'geometric',
    dimensions: { width: 1920, height: 1080 },
    tags: ['tessellation', 'geometric', 'pattern']
  },
  {
    id: 'geo-fractals',
    name: 'Fractal Animation',
    type: 'animation',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZiIgd2lkdGg9IjMwIiBoZWlnaHQ9IjMwIj48Y2lyY2xlIGN4PSIxNSIgY3k9IjE1IiByPSI1IiBmaWxsPSIjZmYwMDZlIi8+PGNpcmNsZSBjeD0iNSIgY3k9IjUiIHI9IjIiIGZpbGw9IiM4ZjM4ZWMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ1cmwoI2YpIi8+PC9zdmc+',
    description: 'Animated fractal patterns',
    category: 'geometric',
    dimensions: { width: 1920, height: 1080 },
    duration: 45,
    tags: ['fractal', 'animation', 'mathematical']
  },

  // Nature
  {
    id: 'nature-forest',
    name: 'Forest Scene',
    type: 'video',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InNreSIgeTE9IjAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzg3Q0VFQiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzUwQkZCMiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ1cmwoI3NreSIvPjxwb2x5Z29uIHBvaW50cz0iMjAsODAgNDAsMjAgNjAsODAiIGZpbGw9IiMyMjhCMjIiLz48cG9seWdvbiBwb2ludHM9IjUwLDkwIDcwLDMwIDkwLDkwIiBmaWxsPSIjMjI4QjIyIi8+PC9zdmc+',
    description: 'Serene forest environment video',
    category: 'nature',
    dimensions: { width: 1920, height: 1080 },
    duration: 120,
    tags: ['forest', 'nature', 'calm']
  },
  {
    id: 'nature-ocean',
    name: 'Ocean Waves',
    type: 'video',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9Im9jZWFuIiB5MT0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNDY5OEUzIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDA0MDgwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjb2NlYW4pIi8+PHBhdGggZD0iTTAsMDYwIFE1MCw0NiAxMDAsNjAgVDE5MCw1NSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PC9zdmc+',
    description: 'Calming ocean waves with movement',
    category: 'nature',
    dimensions: { width: 1920, height: 1080 },
    duration: 180,
    tags: ['ocean', 'waves', 'relaxing']
  }
]

const ContentLibrary: React.FC<ContentLibraryProps> = ({
  selectedContent,
  onContentSelect
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [uploadMode, setUploadMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const categories = [
    { id: 'all', label: 'All Content' },
    { id: 'architectural', label: 'Architectural' },
    { id: 'artistic', label: 'Artistic' },
    { id: 'geometric', label: 'Geometric' },
    { id: 'nature', label: 'Nature' },
    { id: 'custom', label: 'Custom' }
  ]

  // Filter content based on category and search
  const filteredContent = contentLibrary.filter(item => {
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory
    const searchMatch = searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return categoryMatch && searchMatch
  })

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const file = files[0]
      // In a real implementation, you would upload the file and add it to the library
      console.log('Uploading file:', file.name)
      setUploadMode(false)
    }
  }, [])

  const getTypeIcon = (type: ContentItem['type']) => {
    switch (type) {
      case 'image': return '🖼️'
      case 'video': return '🎥'
      case 'pattern': return '🎨'
      case 'animation': return '✨'
      default: return '📄'
    }
  }

  const getDifficultyColor = (tags: string[]) => {
    if (tags.includes('beginner') || tags.includes('simple')) return 'text-green-400'
    if (tags.includes('advanced') || tags.includes('complex')) return 'text-red-400'
    return 'text-yellow-400'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Content Library</h3>
        <button
          onClick={() => setUploadMode(!uploadMode)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm"
        >
          {uploadMode ? 'Cancel' : 'Upload Custom'}
        </button>
      </div>

      {/* Upload Section */}
      <AnimatePresence>
        {uploadMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/5 rounded-lg p-4 space-y-3"
          >
            <h4 className="font-medium">Upload Custom Content</h4>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-white/40 transition-colors"
            >
              <div className="space-y-2">
                <div className="text-2xl">📁</div>
                <p className="text-sm text-white/70">
                  Click to upload images, videos, or patterns
                </p>
                <p className="text-xs text-white/50">
                  Supports JPG, PNG, GIF, MP4, MOV (max 100MB)
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filter */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
          />
          <div className="absolute right-3 top-2.5 text-white/50">🔍</div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedCategory === category.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {filteredContent.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              layout
              className={`relative bg-white/5 rounded-lg overflow-hidden cursor-pointer transition-all hover:bg-white/10 ${
                selectedContent === item.id ? 'ring-2 ring-purple-400' : ''
              }`}
              onClick={() => onContentSelect(item.id)}
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-white/5 flex items-center justify-center relative">
                <img
                  src={item.thumbnail}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 rounded px-2 py-1">
                  <span className="text-xs">{getTypeIcon(item.type)}</span>
                  <span className="text-xs capitalize text-white/80">{item.type}</span>
                </div>
                {item.duration && (
                  <div className="absolute top-2 right-2 bg-black/60 rounded px-2 py-1">
                    <span className="text-xs text-white/80">{item.duration}s</span>
                  </div>
                )}
              </div>

              {/* Content Info */}
              <div className="p-3">
                <h4 className="font-medium text-sm mb-1">{item.name}</h4>
                <p className="text-xs text-white/60 mb-2 line-clamp-2">
                  {item.description}
                </p>

                {/* Metadata */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/50">
                      {item.dimensions.width}×{item.dimensions.height}
                    </span>
                    <span className={`capitalize ${getDifficultyColor(item.tags)}`}>
                      {item.category}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-white/60"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-white/60">
                        +{item.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Selected Indicator */}
              {selectedContent === item.id && (
                <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">✓</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Selected Content Details */}
      {selectedContent && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-lg p-4"
        >
          {(() => {
            const content = contentLibrary.find(item => item.id === selectedContent)
            if (!content) return null

            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Selected: {content.name}</h4>
                  <button
                    onClick={() => onContentSelect('')}
                    className="text-white/50 hover:text-white text-sm"
                  >
                    Deselect
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/60">Type:</span>
                    <div className="capitalize">{content.type}</div>
                  </div>
                  <div>
                    <span className="text-white/60">Resolution:</span>
                    <div>{content.dimensions.width}×{content.dimensions.height}</div>
                  </div>
                  {content.duration && (
                    <div>
                      <span className="text-white/60">Duration:</span>
                      <div>{content.duration} seconds</div>
                    </div>
                  )}
                  <div>
                    <span className="text-white/60">Category:</span>
                    <div className="capitalize">{content.category}</div>
                  </div>
                </div>

                <p className="text-sm text-white/70">{content.description}</p>

                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors">
                    Preview Full Size
                  </button>
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors">
                    Download
                  </button>
                </div>
              </div>
            )
          })()}
        </motion.div>
      )}

      {/* Empty State */}
      {filteredContent.length === 0 && (
        <div className="text-center py-8 text-white/60">
          <div className="text-4xl mb-2">🔍</div>
          <p>No content found matching your criteria.</p>
          <p className="text-sm mt-1">Try adjusting your search or category filter.</p>
        </div>
      )}
    </div>
  )
}

export default ContentLibrary