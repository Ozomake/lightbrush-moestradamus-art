import { expect, afterEach, vi, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import { createCanvas } from 'canvas'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn().mockReturnValue([]),
  root: null,
  rootMargin: '',
  thresholds: [],
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock HTMLCanvasElement and WebGL context
class MockWebGLRenderingContext {
  canvas = createCanvas(800, 600)
  drawingBufferWidth = 800
  drawingBufferHeight = 600

  // Add common WebGL methods
  createShader = vi.fn()
  shaderSource = vi.fn()
  compileShader = vi.fn()
  createProgram = vi.fn()
  attachShader = vi.fn()
  linkProgram = vi.fn()
  useProgram = vi.fn()
  getShaderParameter = vi.fn().mockReturnValue(true)
  getProgramParameter = vi.fn().mockReturnValue(true)
  getShaderInfoLog = vi.fn().mockReturnValue('')
  getProgramInfoLog = vi.fn().mockReturnValue('')
  createBuffer = vi.fn()
  bindBuffer = vi.fn()
  bufferData = vi.fn()
  createTexture = vi.fn()
  bindTexture = vi.fn()
  texImage2D = vi.fn()
  texParameteri = vi.fn()
  enableVertexAttribArray = vi.fn()
  vertexAttribPointer = vi.fn()
  uniform1f = vi.fn()
  uniform1i = vi.fn()
  uniform2f = vi.fn()
  uniform3f = vi.fn()
  uniform4f = vi.fn()
  uniformMatrix4fv = vi.fn()
  getUniformLocation = vi.fn()
  getAttribLocation = vi.fn()
  viewport = vi.fn()
  clear = vi.fn()
  drawArrays = vi.fn()
  enable = vi.fn()
  disable = vi.fn()
  blendFunc = vi.fn()
  clearColor = vi.fn()
  clearDepth = vi.fn()
  depthFunc = vi.fn()
  depthMask = vi.fn()
  cullFace = vi.fn()
  frontFace = vi.fn()

  // Constants
  VERTEX_SHADER = 35633
  FRAGMENT_SHADER = 35632
  COMPILE_STATUS = 35713
  LINK_STATUS = 35714
  ARRAY_BUFFER = 34962
  STATIC_DRAW = 35044
  TEXTURE_2D = 3553
  RGBA = 6408
  UNSIGNED_BYTE = 5121
  TRIANGLES = 4
  DEPTH_TEST = 2929
  BLEND = 3042
  SRC_ALPHA = 770
  ONE_MINUS_SRC_ALPHA = 771
  BACK = 1029
  CCW = 2305
  LESS = 513
  COLOR_BUFFER_BIT = 16384
  DEPTH_BUFFER_BIT = 256
}

// Mock WebGL context
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  writable: true,
  value: vi.fn().mockImplementation((contextType: string) => {
    if (contextType === 'webgl' || contextType === 'webgl2' || contextType === 'experimental-webgl') {
      return new MockWebGLRenderingContext()
    }
    if (contextType === '2d') {
      return {
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        getImageData: vi.fn(),
        putImageData: vi.fn(),
        createImageData: vi.fn(),
        setTransform: vi.fn(),
        drawImage: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        canvas: createCanvas(800, 600),
      }
    }
    return null
  }),
})

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn().mockImplementation((cb) => setTimeout(cb, 16))
global.cancelAnimationFrame = vi.fn()

// Mock performance API
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: vi.fn().mockReturnValue(Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn().mockReturnValue([]),
    getEntriesByType: vi.fn().mockReturnValue([]),
  },
})

// Mock URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: vi.fn().mockReturnValue('blob:mock-url'),
})

Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: vi.fn(),
})

// Mock Three.js specific globals
Object.defineProperty(window, 'OffscreenCanvas', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    getContext: vi.fn().mockReturnValue(new MockWebGLRenderingContext()),
    width: 800,
    height: 600,
  })),
})

// Mock AudioContext for audio-related tests
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    createGain: vi.fn().mockReturnValue({
      connect: vi.fn(),
      disconnect: vi.fn(),
      gain: { value: 1 },
    }),
    createOscillator: vi.fn().mockReturnValue({
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: { value: 440 },
    }),
    destination: {},
    currentTime: 0,
    state: 'running',
    resume: vi.fn().mockResolvedValue(undefined),
    suspend: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
  })),
})

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  },
})

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  writable: true,
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  },
})