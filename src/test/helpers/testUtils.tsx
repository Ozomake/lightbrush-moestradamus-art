import type { ReactElement, ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { vi } from 'vitest'

// Mock Three.js components for testing
export const MockThreeJsComponent = ({ children }: { children?: ReactNode }) => (
  <div data-testid="mock-threejs">{children}</div>
)

// Custom render function for components that need React Router
export const renderWithRouter = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper = ({ children }: { children?: ReactNode }) => (
    <BrowserRouter>{children}</BrowserRouter>
  )
  return render(ui, { wrapper: Wrapper, ...options })
}

// Custom render function for Three.js components
export const renderWithThreeJs = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper = ({ children }: { children?: ReactNode }) => (
    <Canvas data-testid="canvas-wrapper">
      {children}
    </Canvas>
  )
  return render(ui, { wrapper: Wrapper, ...options })
}

// Custom render function for components that need both Router and Three.js
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper = ({ children }: { children?: ReactNode }) => (
    <BrowserRouter>
      <Canvas data-testid="canvas-wrapper">
        {children}
      </Canvas>
    </BrowserRouter>
  )
  return render(ui, { wrapper: Wrapper, ...options })
}

// Mock store creator for Zustand stores
export const createMockStore = <T extends object>(initialState: T) => ({
  getState: vi.fn().mockReturnValue(initialState),
  setState: vi.fn(),
  subscribe: vi.fn(),
  destroy: vi.fn(),
})

// Mock Three.js objects
export const mockVector3 = (x = 0, y = 0, z = 0): any => ({
  x,
  y,
  z,
  set: vi.fn(),
  copy: vi.fn(),
  add: vi.fn(),
  sub: vi.fn(),
  multiply: vi.fn(),
  divide: vi.fn(),
  normalize: vi.fn(),
  length: vi.fn().mockReturnValue(Math.sqrt(x * x + y * y + z * z)),
  lengthSq: vi.fn().mockReturnValue(x * x + y * y + z * z),
  dot: vi.fn(),
  cross: vi.fn(),
  clone: vi.fn().mockReturnValue(mockVector3(x, y, z)),
})

export const mockEuler = (x = 0, y = 0, z = 0, order = 'XYZ'): any => ({
  x,
  y,
  z,
  order,
  set: vi.fn(),
  copy: vi.fn(),
  setFromQuaternion: vi.fn(),
  setFromRotationMatrix: vi.fn(),
  clone: vi.fn().mockReturnValue(mockEuler(x, y, z, order)),
})

export const mockQuaternion = (x = 0, y = 0, z = 0, w = 1): any => ({
  x,
  y,
  z,
  w,
  set: vi.fn(),
  copy: vi.fn(),
  setFromEuler: vi.fn(),
  setFromAxisAngle: vi.fn(),
  normalize: vi.fn(),
  clone: vi.fn().mockReturnValue(mockQuaternion(x, y, z, w)),
})

export const mockMatrix4 = (): any => ({
  elements: new Array(16).fill(0),
  set: vi.fn(),
  copy: vi.fn(),
  multiply: vi.fn(),
  multiplyMatrices: vi.fn(),
  makeTranslation: vi.fn(),
  makeRotationFromEuler: vi.fn(),
  makeScale: vi.fn(),
  decompose: vi.fn(),
  clone: vi.fn().mockReturnValue(mockMatrix4()),
})

export const mockTexture = (): any => ({
  image: null,
  mapping: 300,
  wrapS: 1001,
  wrapT: 1001,
  magFilter: 1006,
  minFilter: 1008,
  format: 1023,
  type: 1009,
  anisotropy: 1,
  encoding: 3000,
  version: 0,
  needsUpdate: false,
  dispose: vi.fn(),
  clone: vi.fn().mockReturnValue(mockTexture()),
})

export const mockGeometry = (): any => ({
  attributes: {},
  index: null,
  boundingBox: null,
  boundingSphere: null,
  dispose: vi.fn(),
  computeBoundingBox: vi.fn(),
  computeBoundingSphere: vi.fn(),
  clone: vi.fn().mockReturnValue(mockGeometry()),
})

export const mockMaterial = (): any => ({
  type: 'Material',
  transparent: false,
  opacity: 1,
  visible: true,
  dispose: vi.fn(),
  clone: vi.fn().mockReturnValue(mockMaterial()),
})

export const mockMesh = (): any => ({
  geometry: mockGeometry(),
  material: mockMaterial(),
  position: mockVector3(),
  rotation: mockEuler(),
  scale: mockVector3(1, 1, 1),
  matrix: mockMatrix4(),
  matrixWorld: mockMatrix4(),
  visible: true,
  add: vi.fn(),
  remove: vi.fn(),
  dispose: vi.fn(),
  clone: vi.fn().mockReturnValue(mockMesh()),
})

export const mockScene = (): any => ({
  ...mockMesh(),
  type: 'Scene',
  background: null,
  environment: null,
  fog: null,
  children: [],
})

export const mockCamera = (): any => ({
  ...mockMesh(),
  type: 'Camera',
  aspect: 1,
  fov: 50,
  near: 0.1,
  far: 2000,
  zoom: 1,
  updateProjectionMatrix: vi.fn(),
  updateMatrixWorld: vi.fn(),
})

export const mockRenderer = (): any => ({
  domElement: document.createElement('canvas'),
  setSize: vi.fn(),
  setPixelRatio: vi.fn(),
  render: vi.fn(),
  dispose: vi.fn(),
  getContext: vi.fn().mockReturnValue({}),
  info: {
    memory: { geometries: 0, textures: 0 },
    render: { frame: 0, calls: 0, triangles: 0, points: 0, lines: 0 },
  },
})

// Helper to wait for async operations
export const waitForAsync = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms))

// Helper to trigger a re-render
export const triggerRerender = async () => {
  await waitForAsync(0)
}

// Helper to create mock events
export const createMockEvent = (type: string, properties = {}) => ({
  type,
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
  target: null,
  currentTarget: null,
  ...properties,
})

// Helper to create mock file objects
export const createMockFile = (name: string, content: string, type = 'text/plain') => {
  const file = new File([content], name, { type })
  return file
}

// Helper for testing async hooks
export const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0))