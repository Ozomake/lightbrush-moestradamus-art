import * as THREE from 'three'

export interface Pattern {
  id: string
  name: string
  type: 'geometric' | 'organic' | 'text' | 'image'
  complexity: number
  texture: THREE.Texture
}

export class PatternGenerator {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private size: number

  constructor(size: number = 512) {
    this.size = size
    this.canvas = document.createElement('canvas')
    this.canvas.width = size
    this.canvas.height = size
    this.ctx = this.canvas.getContext('2d')!
    this.ctx.imageSmoothingEnabled = true
  }

  private clearCanvas() {
    this.ctx.clearRect(0, 0, this.size, this.size)
  }

  private createTexture(): THREE.Texture {
    const texture = new THREE.CanvasTexture(this.canvas)
    texture.needsUpdate = true
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    return texture
  }

  public generateSquarePattern(color: string = '#ffffff', size: number = 0.6): THREE.Texture {
    this.clearCanvas()

    const squareSize = this.size * size
    const x = (this.size - squareSize) / 2
    const y = (this.size - squareSize) / 2

    this.ctx.fillStyle = color
    this.ctx.fillRect(x, y, squareSize, squareSize)

    // Add glow effect
    this.ctx.shadowColor = color
    this.ctx.shadowBlur = 20
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = 2
    this.ctx.strokeRect(x, y, squareSize, squareSize)

    return this.createTexture()
  }

  public generateCirclePattern(color: string = '#ffffff', size: number = 0.6): THREE.Texture {
    this.clearCanvas()

    const radius = (this.size * size) / 2
    const centerX = this.size / 2
    const centerY = this.size / 2

    // Create gradient
    const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
    gradient.addColorStop(0, color)
    gradient.addColorStop(0.8, color + '80') // Add transparency
    gradient.addColorStop(1, 'transparent')

    this.ctx.fillStyle = gradient
    this.ctx.beginPath()
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    this.ctx.fill()

    // Add outer glow ring
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = 3
    this.ctx.shadowColor = color
    this.ctx.shadowBlur = 15
    this.ctx.stroke()

    return this.createTexture()
  }

  public generateTrianglePattern(color: string = '#ffffff', size: number = 0.6): THREE.Texture {
    this.clearCanvas()

    const triangleSize = this.size * size
    const centerX = this.size / 2
    const centerY = this.size / 2
    const height = triangleSize * Math.sqrt(3) / 2

    this.ctx.fillStyle = color
    this.ctx.beginPath()
    this.ctx.moveTo(centerX, centerY - height / 2) // Top point
    this.ctx.lineTo(centerX - triangleSize / 2, centerY + height / 2) // Bottom left
    this.ctx.lineTo(centerX + triangleSize / 2, centerY + height / 2) // Bottom right
    this.ctx.closePath()
    this.ctx.fill()

    // Add glow effect
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = 3
    this.ctx.shadowColor = color
    this.ctx.shadowBlur = 15
    this.ctx.stroke()

    return this.createTexture()
  }

  public generateDiamondPattern(color: string = '#ffffff', size: number = 0.6): THREE.Texture {
    this.clearCanvas()

    const diamondSize = this.size * size
    const centerX = this.size / 2
    const centerY = this.size / 2
    const halfSize = diamondSize / 2

    this.ctx.fillStyle = color
    this.ctx.beginPath()
    this.ctx.moveTo(centerX, centerY - halfSize) // Top
    this.ctx.lineTo(centerX + halfSize, centerY) // Right
    this.ctx.lineTo(centerX, centerY + halfSize) // Bottom
    this.ctx.lineTo(centerX - halfSize, centerY) // Left
    this.ctx.closePath()
    this.ctx.fill()

    // Add glow effect
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = 3
    this.ctx.shadowColor = color
    this.ctx.shadowBlur = 15
    this.ctx.stroke()

    return this.createTexture()
  }

  public generateHexagonPattern(color: string = '#ffffff', size: number = 0.6): THREE.Texture {
    this.clearCanvas()

    const radius = (this.size * size) / 2
    const centerX = this.size / 2
    const centerY = this.size / 2

    this.ctx.fillStyle = color
    this.ctx.beginPath()

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      if (i === 0) {
        this.ctx.moveTo(x, y)
      } else {
        this.ctx.lineTo(x, y)
      }
    }

    this.ctx.closePath()
    this.ctx.fill()

    // Add glow effect
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = 3
    this.ctx.shadowColor = color
    this.ctx.shadowBlur = 15
    this.ctx.stroke()

    return this.createTexture()
  }

  public generateSpiralPattern(color: string = '#ffffff', size: number = 0.6): THREE.Texture {
    this.clearCanvas()

    const centerX = this.size / 2
    const centerY = this.size / 2
    const maxRadius = (this.size * size) / 2

    this.ctx.strokeStyle = color
    this.ctx.lineWidth = 8
    this.ctx.shadowColor = color
    this.ctx.shadowBlur = 10

    this.ctx.beginPath()

    for (let angle = 0; angle < Math.PI * 8; angle += 0.1) {
      const radius = (angle / (Math.PI * 8)) * maxRadius
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      if (angle === 0) {
        this.ctx.moveTo(x, y)
      } else {
        this.ctx.lineTo(x, y)
      }
    }

    this.ctx.stroke()

    return this.createTexture()
  }

  public generateConcentricCirclesPattern(color: string = '#ffffff', size: number = 0.8): THREE.Texture {
    this.clearCanvas()

    const centerX = this.size / 2
    const centerY = this.size / 2
    const maxRadius = (this.size * size) / 2
    const ringCount = 5

    this.ctx.strokeStyle = color
    this.ctx.lineWidth = 4
    this.ctx.shadowColor = color
    this.ctx.shadowBlur = 8

    for (let i = 1; i <= ringCount; i++) {
      const radius = (maxRadius / ringCount) * i
      this.ctx.beginPath()
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      this.ctx.stroke()
    }

    return this.createTexture()
  }

  public generateGridPattern(color: string = '#ffffff', size: number = 0.8): THREE.Texture {
    this.clearCanvas()

    const gridSize = 32
    const lineWidth = 2

    this.ctx.strokeStyle = color
    this.ctx.lineWidth = lineWidth
    this.ctx.shadowColor = color
    this.ctx.shadowBlur = 5

    // Vertical lines
    for (let x = 0; x <= this.size; x += gridSize) {
      this.ctx.beginPath()
      this.ctx.moveTo(x, 0)
      this.ctx.lineTo(x, this.size)
      this.ctx.stroke()
    }

    // Horizontal lines
    for (let y = 0; y <= this.size; y += gridSize) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, y)
      this.ctx.lineTo(this.size, y)
      this.ctx.stroke()
    }

    return this.createTexture()
  }

  public generateStarPattern(color: string = '#ffffff', size: number = 0.6): THREE.Texture {
    this.clearCanvas()

    const centerX = this.size / 2
    const centerY = this.size / 2
    const outerRadius = (this.size * size) / 2
    const innerRadius = outerRadius * 0.4
    const spikes = 5

    this.ctx.fillStyle = color
    this.ctx.shadowColor = color
    this.ctx.shadowBlur = 15

    this.ctx.beginPath()

    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i * Math.PI) / spikes
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const x = centerX + radius * Math.cos(angle - Math.PI / 2)
      const y = centerY + radius * Math.sin(angle - Math.PI / 2)

      if (i === 0) {
        this.ctx.moveTo(x, y)
      } else {
        this.ctx.lineTo(x, y)
      }
    }

    this.ctx.closePath()
    this.ctx.fill()

    return this.createTexture()
  }

  public generateWavePattern(color1: string = '#18dcff', color2: string = '#7d5fff', size: number = 0.8): THREE.Texture {
    this.clearCanvas()

    const amplitude = this.size * 0.2
    const frequency = 4
    const centerY = this.size / 2

    // Create gradient between colors
    const gradient = this.ctx.createLinearGradient(0, 0, this.size, this.size)
    gradient.addColorStop(0, color1)
    gradient.addColorStop(1, color2)

    this.ctx.strokeStyle = gradient
    this.ctx.lineWidth = 6
    this.ctx.shadowColor = color1
    this.ctx.shadowBlur = 15

    // Draw multiple wave lines
    for (let offset = -amplitude; offset <= amplitude; offset += amplitude / 3) {
      this.ctx.beginPath()

      for (let x = 0; x <= this.size; x += 2) {
        const y = centerY + offset + Math.sin((x / this.size) * Math.PI * frequency) * (amplitude / 3)

        if (x === 0) {
          this.ctx.moveTo(x, y)
        } else {
          this.ctx.lineTo(x, y)
        }
      }

      this.ctx.stroke()
    }

    return this.createTexture()
  }

  // Urban/Cyberpunk themed patterns for Level 2

  public generateNeonGridPattern(color1: string = '#00ff88', color2: string = '#ff006b', size: number = 0.9): THREE.Texture {
    this.clearCanvas()

    const gridSize = 32
    const lineWidth = 3

    // Create neon gradient
    const gradient = this.ctx.createLinearGradient(0, 0, this.size, this.size)
    gradient.addColorStop(0, color1)
    gradient.addColorStop(0.5, color2)
    gradient.addColorStop(1, color1)

    this.ctx.strokeStyle = gradient
    this.ctx.lineWidth = lineWidth
    this.ctx.shadowColor = color1
    this.ctx.shadowBlur = 15

    // Draw grid with neon effect
    for (let x = 0; x <= this.size; x += gridSize) {
      this.ctx.beginPath()
      this.ctx.moveTo(x, 0)
      this.ctx.lineTo(x, this.size)
      this.ctx.stroke()
    }

    for (let y = 0; y <= this.size; y += gridSize) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, y)
      this.ctx.lineTo(this.size, y)
      this.ctx.stroke()
    }

    // Add corner accent dots
    this.ctx.fillStyle = color2
    this.ctx.shadowColor = color2
    this.ctx.shadowBlur = 20

    for (let x = gridSize; x < this.size; x += gridSize) {
      for (let y = gridSize; y < this.size; y += gridSize) {
        this.ctx.beginPath()
        this.ctx.arc(x, y, 4, 0, Math.PI * 2)
        this.ctx.fill()
      }
    }

    return this.createTexture()
  }

  public generateSkullPattern(color1: string = '#ff4757', color2: string = '#3742fa', size: number = 0.7): THREE.Texture {
    this.clearCanvas()

    const centerX = this.size / 2
    const centerY = this.size / 2
    const skullSize = this.size * size * 0.8

    // Create gradient for cyberpunk effect
    const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, skullSize)
    gradient.addColorStop(0, color1)
    gradient.addColorStop(0.7, color2)
    gradient.addColorStop(1, 'transparent')

    // Skull outline (simplified)
    this.ctx.fillStyle = gradient
    this.ctx.shadowColor = color1
    this.ctx.shadowBlur = 25

    // Main skull shape
    this.ctx.beginPath()
    this.ctx.ellipse(centerX, centerY - skullSize * 0.1, skullSize * 0.4, skullSize * 0.35, 0, 0, Math.PI * 2)
    this.ctx.fill()

    // Jaw
    this.ctx.beginPath()
    this.ctx.ellipse(centerX, centerY + skullSize * 0.25, skullSize * 0.25, skullSize * 0.15, 0, 0, Math.PI * 2)
    this.ctx.fill()

    // Eye sockets
    this.ctx.fillStyle = '#000000'
    this.ctx.shadowColor = color2
    this.ctx.shadowBlur = 10

    this.ctx.beginPath()
    this.ctx.ellipse(centerX - skullSize * 0.15, centerY - skullSize * 0.1, skullSize * 0.08, skullSize * 0.12, 0, 0, Math.PI * 2)
    this.ctx.fill()

    this.ctx.beginPath()
    this.ctx.ellipse(centerX + skullSize * 0.15, centerY - skullSize * 0.1, skullSize * 0.08, skullSize * 0.12, 0, 0, Math.PI * 2)
    this.ctx.fill()

    // Glowing eyes
    this.ctx.fillStyle = color1
    this.ctx.shadowColor = color1
    this.ctx.shadowBlur = 15

    this.ctx.beginPath()
    this.ctx.arc(centerX - skullSize * 0.15, centerY - skullSize * 0.05, 3, 0, Math.PI * 2)
    this.ctx.fill()

    this.ctx.beginPath()
    this.ctx.arc(centerX + skullSize * 0.15, centerY - skullSize * 0.05, 3, 0, Math.PI * 2)
    this.ctx.fill()

    return this.createTexture()
  }

  public generateGlitchTextPattern(text: string = 'REBEL', color: string = '#ffa502', size: number = 0.8): THREE.Texture {
    this.clearCanvas()

    const fontSize = this.size * size * 0.15
    this.ctx.font = `bold ${fontSize}px monospace`
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'

    const centerX = this.size / 2
    const centerY = this.size / 2

    // Glitch effect with multiple offset copies
    const glitchOffsets = [
      { x: -3, y: -2, color: '#ff0000', alpha: 0.7 },
      { x: 2, y: 1, color: '#00ff00', alpha: 0.7 },
      { x: -1, y: 3, color: '#0000ff', alpha: 0.7 },
      { x: 0, y: 0, color: color, alpha: 1.0 }
    ]

    glitchOffsets.forEach(offset => {
      this.ctx.fillStyle = offset.color + Math.floor(offset.alpha * 255).toString(16)
      this.ctx.shadowColor = offset.color
      this.ctx.shadowBlur = 10

      this.ctx.fillText(text, centerX + offset.x, centerY + offset.y)
    })

    // Add scan lines for extra cyberpunk effect
    this.ctx.strokeStyle = color + '40' // Semi-transparent
    this.ctx.lineWidth = 1

    for (let y = 0; y < this.size; y += 4) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, y)
      this.ctx.lineTo(this.size, y)
      this.ctx.stroke()
    }

    return this.createTexture()
  }

  public generateCircuitPattern(color1: string = '#2ed573', color2: string = '#1e90ff', size: number = 0.9): THREE.Texture {
    this.clearCanvas()

    // Circuit board background
    this.ctx.fillStyle = '#0a0a0a'
    this.ctx.fillRect(0, 0, this.size, this.size)

    // Create circuit traces
    const gradient = this.ctx.createLinearGradient(0, 0, this.size, this.size)
    gradient.addColorStop(0, color1)
    gradient.addColorStop(1, color2)

    this.ctx.strokeStyle = gradient
    this.ctx.lineWidth = 2
    this.ctx.shadowColor = color1
    this.ctx.shadowBlur = 8

    // Main circuit paths
    const paths = [
      // Horizontal main traces
      { start: { x: 50, y: 100 }, end: { x: this.size - 50, y: 100 } },
      { start: { x: 50, y: 200 }, end: { x: this.size - 50, y: 200 } },
      { start: { x: 50, y: 300 }, end: { x: this.size - 50, y: 300 } },
      { start: { x: 50, y: 400 }, end: { x: this.size - 50, y: 400 } },

      // Vertical traces
      { start: { x: 150, y: 50 }, end: { x: 150, y: this.size - 50 } },
      { start: { x: 250, y: 50 }, end: { x: 250, y: this.size - 50 } },
      { start: { x: 350, y: 50 }, end: { x: 350, y: this.size - 50 } },
    ]

    paths.forEach(path => {
      this.ctx.beginPath()
      this.ctx.moveTo(path.start.x, path.start.y)
      this.ctx.lineTo(path.end.x, path.end.y)
      this.ctx.stroke()
    })

    // Add junction dots
    this.ctx.fillStyle = color2
    this.ctx.shadowColor = color2
    this.ctx.shadowBlur = 12

    const junctions = [
      { x: 150, y: 100 }, { x: 150, y: 200 }, { x: 150, y: 300 }, { x: 150, y: 400 },
      { x: 250, y: 100 }, { x: 250, y: 200 }, { x: 250, y: 300 }, { x: 250, y: 400 },
      { x: 350, y: 100 }, { x: 350, y: 200 }, { x: 350, y: 300 }, { x: 350, y: 400 }
    ]

    junctions.forEach(junction => {
      this.ctx.beginPath()
      this.ctx.arc(junction.x, junction.y, 4, 0, Math.PI * 2)
      this.ctx.fill()
    })

    // Add component rectangles
    this.ctx.strokeStyle = color1
    this.ctx.lineWidth = 2
    this.ctx.fillStyle = '#333333'

    const components = [
      { x: 80, y: 150, w: 40, h: 20 },
      { x: 280, y: 250, w: 60, h: 30 },
      { x: 180, y: 350, w: 50, h: 25 },
      { x: 380, y: 120, w: 35, h: 15 }
    ]

    components.forEach(comp => {
      this.ctx.fillRect(comp.x, comp.y, comp.w, comp.h)
      this.ctx.strokeRect(comp.x, comp.y, comp.w, comp.h)
    })

    return this.createTexture()
  }

  public generateUrbanCamoPattern(color1: string = '#5f27cd', color2: string = '#ff3838', size: number = 0.9): THREE.Texture {
    this.clearCanvas()

    // Dark urban background
    this.ctx.fillStyle = '#1a1a1a'
    this.ctx.fillRect(0, 0, this.size, this.size)

    const shapes = 30
    const colors = [color1, color2, '#2c2c54', '#40407a']

    for (let i = 0; i < shapes; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)]
      this.ctx.fillStyle = color + '80' // Semi-transparent

      const x = Math.random() * this.size
      const y = Math.random() * this.size
      const width = Math.random() * 80 + 40
      const height = Math.random() * 80 + 40
      const rotation = Math.random() * Math.PI * 2

      this.ctx.save()
      this.ctx.translate(x, y)
      this.ctx.rotate(rotation)

      if (Math.random() > 0.5) {
        // Rectangle
        this.ctx.fillRect(-width/2, -height/2, width, height)
      } else {
        // Irregular polygon
        this.ctx.beginPath()
        const sides = 5 + Math.floor(Math.random() * 3)
        for (let j = 0; j < sides; j++) {
          const angle = (j / sides) * Math.PI * 2
          const radius = width / 2 + Math.random() * 20 - 10
          const px = Math.cos(angle) * radius
          const py = Math.sin(angle) * radius

          if (j === 0) {
            this.ctx.moveTo(px, py)
          } else {
            this.ctx.lineTo(px, py)
          }
        }
        this.ctx.closePath()
        this.ctx.fill()
      }

      this.ctx.restore()
    }

    return this.createTexture()
  }

  public generateGraffitiPattern(color1: string = '#ff6b6b', color2: string = '#4ecdc4', size: number = 0.8): THREE.Texture {
    this.clearCanvas()

    // Dark wall background
    this.ctx.fillStyle = '#2c2c2c'
    this.ctx.fillRect(0, 0, this.size, this.size)

    const centerX = this.size / 2
    const centerY = this.size / 2

    // Spray paint effect base
    const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, this.size * size / 2)
    gradient.addColorStop(0, color1)
    gradient.addColorStop(0.6, color2)
    gradient.addColorStop(1, 'transparent')

    this.ctx.fillStyle = gradient
    this.ctx.beginPath()
    this.ctx.arc(centerX, centerY, this.size * size / 2, 0, Math.PI * 2)
    this.ctx.fill()

    // Add paint drips
    this.ctx.fillStyle = color1 + 'CC'
    const dripCount = 8
    for (let i = 0; i < dripCount; i++) {
      const x = centerX + (Math.random() - 0.5) * this.size * 0.8
      const startY = centerY + this.size * size / 3
      const dripLength = Math.random() * 80 + 40
      const dripWidth = Math.random() * 8 + 4

      this.ctx.beginPath()
      this.ctx.ellipse(x, startY, dripWidth/2, dripLength/2, 0, 0, Math.PI * 2)
      this.ctx.fill()
    }

    // Add texture spots for spray effect
    this.ctx.fillStyle = color2 + '60'
    for (let i = 0; i < 100; i++) {
      const x = centerX + (Math.random() - 0.5) * this.size * 0.9
      const y = centerY + (Math.random() - 0.5) * this.size * 0.9
      const radius = Math.random() * 3 + 1

      this.ctx.beginPath()
      this.ctx.arc(x, y, radius, 0, Math.PI * 2)
      this.ctx.fill()
    }

    return this.createTexture()
  }

  public getAllPatterns(): Pattern[] {
    const colors = ['#ffffff', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd']
    const patterns: Pattern[] = []

    const patternTypes = [
      { id: 'square', name: 'Square', generator: this.generateSquarePattern.bind(this), complexity: 1 },
      { id: 'circle', name: 'Circle', generator: this.generateCirclePattern.bind(this), complexity: 1 },
      { id: 'triangle', name: 'Triangle', generator: this.generateTrianglePattern.bind(this), complexity: 1 },
      { id: 'diamond', name: 'Diamond', generator: this.generateDiamondPattern.bind(this), complexity: 2 },
      { id: 'hexagon', name: 'Hexagon', generator: this.generateHexagonPattern.bind(this), complexity: 2 },
      { id: 'star', name: 'Star', generator: this.generateStarPattern.bind(this), complexity: 2 },
      { id: 'spiral', name: 'Spiral', generator: this.generateSpiralPattern.bind(this), complexity: 3 },
      { id: 'concentric', name: 'Concentric Circles', generator: this.generateConcentricCirclesPattern.bind(this), complexity: 3 },
      { id: 'grid', name: 'Grid', generator: this.generateGridPattern.bind(this), complexity: 2 },
      { id: 'wave', name: 'Wave', generator: this.generateWavePattern.bind(this), complexity: 3 }
    ]

    patternTypes.forEach(patternType => {
      colors.forEach((color, colorIndex) => {
        const pattern: Pattern = {
          id: `${patternType.id}_${colorIndex}`,
          name: `${patternType.name} (${color})`,
          type: patternType.id === 'spiral' || patternType.id === 'wave' ? 'organic' : 'geometric',
          complexity: patternType.complexity,
          texture: patternType.generator(color)
        }
        patterns.push(pattern)
      })
    })

    return patterns
  }

  public dispose() {
    this.canvas.remove()
  }
}

export default PatternGenerator