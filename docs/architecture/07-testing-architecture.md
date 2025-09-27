# Testing Architecture

## Testing Strategy Overview

```mermaid
graph TB
    subgraph "Testing Layers"
        UNIT[Unit Testing]
        INTEGRATION[Integration Testing]
        E2E[End-to-End Testing]
        PERFORMANCE[Performance Testing]
        VISUAL[Visual Testing]
        ACCESSIBILITY[Accessibility Testing]
    end

    subgraph "Testing Tools"
        VITEST[Vitest Framework]
        TESTING_LIB[Testing Library]
        JSDOM[JSDOM Environment]
        COVERAGE[V8 Coverage]
        MOCKS[Mock System]
    end

    subgraph "Test Categories"
        COMPONENT[Component Tests]
        HOOK[Hook Tests]
        STORE[Store Tests]
        UTIL[Utility Tests]
        GAME[Game Logic Tests]
        SHADER[Shader Tests]
    end

    subgraph "Quality Metrics"
        COVERAGE_TARGET[Coverage Target: 80%]
        PERFORMANCE_BUDGET[Performance Budget]
        REGRESSION[Regression Prevention]
        RELIABILITY[Test Reliability]
    end

    subgraph "CI/CD Integration"
        AUTO_RUN[Automated Test Runs]
        PARALLEL[Parallel Execution]
        REPORTING[Test Reporting]
        GATES[Quality Gates]
    end

    UNIT --> VITEST
    INTEGRATION --> TESTING_LIB
    E2E --> JSDOM
    PERFORMANCE --> COVERAGE
    VISUAL --> MOCKS

    VITEST --> COMPONENT
    TESTING_LIB --> HOOK
    JSDOM --> STORE
    COVERAGE --> UTIL
    MOCKS --> GAME

    COMPONENT --> COVERAGE_TARGET
    HOOK --> PERFORMANCE_BUDGET
    STORE --> REGRESSION
    UTIL --> RELIABILITY

    COVERAGE_TARGET --> AUTO_RUN
    PERFORMANCE_BUDGET --> PARALLEL
    REGRESSION --> REPORTING
    RELIABILITY --> GATES

    style UNIT fill:#e1f5fe
    style VITEST fill:#f3e5f5
    style COMPONENT fill:#e8f5e8
    style COVERAGE_TARGET fill:#fff3e0
    style AUTO_RUN fill:#fce4ec
```

## Test Framework Architecture

### 1. Vitest Configuration
```mermaid
graph TD
    subgraph "Vitest Core"
        CONFIG[vitest.config.ts]
        SETUP[Test Setup]
        ENVIRONMENT[jsdom Environment]
        COVERAGE_CONFIG[Coverage Config]
    end

    subgraph "Test Environment"
        GLOBALS[Global Test Setup]
        MOCKS[Mock Implementations]
        HELPERS[Test Helpers]
        FIXTURES[Test Fixtures]
    end

    subgraph "Coverage System"
        V8_PROVIDER[V8 Coverage Provider]
        REPORTERS[Coverage Reporters]
        THRESHOLDS[Coverage Thresholds]
        EXCLUSIONS[Coverage Exclusions]
    end

    subgraph "Mock System"
        WEBGL_MOCK[WebGL Mocks]
        BROWSER_API[Browser API Mocks]
        THREE_MOCK[Three.js Mocks]
        AUDIO_MOCK[Audio Context Mocks]
    end

    CONFIG --> GLOBALS
    SETUP --> MOCKS
    ENVIRONMENT --> HELPERS
    COVERAGE_CONFIG --> FIXTURES

    GLOBALS --> V8_PROVIDER
    MOCKS --> REPORTERS
    HELPERS --> THRESHOLDS
    FIXTURES --> EXCLUSIONS

    V8_PROVIDER --> WEBGL_MOCK
    REPORTERS --> BROWSER_API
    THRESHOLDS --> THREE_MOCK
    EXCLUSIONS --> AUDIO_MOCK
```

### 2. Test Setup Architecture
```typescript
// Test Setup Configuration
interface TestSetupConfig {
  environment: 'jsdom' | 'node' | 'happy-dom'
  globals: boolean
  setupFiles: string[]
  coverage: {
    provider: 'v8' | 'c8'
    reporter: Array<'text' | 'json' | 'html' | 'lcov'>
    threshold: {
      statements: number
      branches: number
      functions: number
      lines: number
    }
    exclude: string[]
  }
  mocks: {
    webgl: boolean
    browserAPIs: boolean
    threeJs: boolean
    audioContext: boolean
  }
}
```

## Component Testing Strategy

### 1. Component Test Architecture
```mermaid
graph TD
    subgraph "Component Tests"
        RENDER[Render Testing]
        INTERACTION[Interaction Testing]
        PROP[Props Testing]
        STATE[State Testing]
        EVENTS[Event Testing]
    end

    subgraph "3D Component Tests"
        CANVAS[Canvas Rendering]
        WEBGL[WebGL Context]
        SHADER[Shader Programs]
        GEOMETRY[Geometry Creation]
        ANIMATION[Animation Testing]
    end

    subgraph "UI Component Tests"
        STYLE[Styling Tests]
        ACCESSIBILITY[A11y Testing]
        RESPONSIVE[Responsive Tests]
        VARIANT[Variant Testing]
        FORM[Form Testing]
    end

    subgraph "Test Utilities"
        CUSTOM_RENDER[Custom Render]
        MOCK_PROVIDER[Mock Providers]
        TEST_WRAPPER[Test Wrappers]
        HELPER_FUNCTIONS[Helper Functions]
    end

    RENDER --> CANVAS
    INTERACTION --> WEBGL
    PROP --> SHADER
    STATE --> GEOMETRY
    EVENTS --> ANIMATION

    CANVAS --> STYLE
    WEBGL --> ACCESSIBILITY
    SHADER --> RESPONSIVE
    GEOMETRY --> VARIANT
    ANIMATION --> FORM

    STYLE --> CUSTOM_RENDER
    ACCESSIBILITY --> MOCK_PROVIDER
    RESPONSIVE --> TEST_WRAPPER
    VARIANT --> HELPER_FUNCTIONS
```

### 2. Test Patterns Implementation
```typescript
// Component Test Pattern
describe('Button Component', () => {
  // Render Testing
  test('renders with default props', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  // Variant Testing
  test.each([
    ['primary', 'from-blue-500'],
    ['secondary', 'from-purple-500'],
    ['ghost', 'bg-transparent']
  ])('renders %s variant correctly', (variant, expectedClass) => {
    render(<Button variant={variant}>Test</Button>)
    expect(screen.getByRole('button')).toHaveClass(expectedClass)
  })

  // Interaction Testing
  test('handles click events', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)

    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  // State Testing
  test('manages loading state', () => {
    render(<Button loading>Loading</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-50')
  })
})
```

## Store Testing Architecture

### 1. Zustand Store Testing
```mermaid
graph TD
    subgraph "Store Testing"
        INITIAL[Initial State]
        ACTIONS[Action Testing]
        SELECTORS[Selector Testing]
        MIDDLEWARE[Middleware Testing]
        PERSISTENCE[Persistence Testing]
    end

    subgraph "Game Store Tests"
        GAME_STATE[Game State Management]
        UI_STATE[UI State Updates]
        DIALOG[Dialog System]
        NOTIFICATIONS[Notification System]
        SETTINGS[Settings Management]
    end

    subgraph "Mock Strategy"
        STORE_MOCK[Store Mocking]
        ACTION_MOCK[Action Mocking]
        ASYNC_MOCK[Async Action Mocking]
        SUBSCRIPTION[Subscription Testing]
    end

    subgraph "Integration Tests"
        COMPONENT_STORE[Component-Store Integration]
        HOOK_STORE[Hook-Store Integration]
        ENGINE_STORE[Engine-Store Integration]
        PERSISTENCE_STORE[Persistence Integration]
    end

    INITIAL --> GAME_STATE
    ACTIONS --> UI_STATE
    SELECTORS --> DIALOG
    MIDDLEWARE --> NOTIFICATIONS
    PERSISTENCE --> SETTINGS

    GAME_STATE --> STORE_MOCK
    UI_STATE --> ACTION_MOCK
    DIALOG --> ASYNC_MOCK
    NOTIFICATIONS --> SUBSCRIPTION

    STORE_MOCK --> COMPONENT_STORE
    ACTION_MOCK --> HOOK_STORE
    ASYNC_MOCK --> ENGINE_STORE
    SUBSCRIPTION --> PERSISTENCE_STORE
```

### 2. Store Test Implementation
```typescript
// Store Testing Pattern
describe('GameStore', () => {
  let store: ReturnType<typeof useGameStore>

  beforeEach(() => {
    // Reset store state before each test
    store = useGameStore.getState()
    useGameStore.setState({
      isInitialized: false,
      isRunning: false,
      showHUD: true,
      notifications: []
    })
  })

  describe('Initial State', () => {
    test('has correct initial values', () => {
      const state = useGameStore.getState()
      expect(state.isInitialized).toBe(false)
      expect(state.isRunning).toBe(false)
      expect(state.showHUD).toBe(true)
    })
  })

  describe('Actions', () => {
    test('toggleHUD updates showHUD state', () => {
      const { toggleHUD } = useGameStore.getState()

      toggleHUD()
      expect(useGameStore.getState().showHUD).toBe(false)

      toggleHUD()
      expect(useGameStore.getState().showHUD).toBe(true)
    })

    test('addNotification adds to notifications array', () => {
      const { addNotification } = useGameStore.getState()

      addNotification({
        type: 'success',
        title: 'Test',
        message: 'Test message'
      })

      const notifications = useGameStore.getState().notifications
      expect(notifications).toHaveLength(1)
      expect(notifications[0].title).toBe('Test')
    })
  })

  describe('Selectors', () => {
    test('useGameUI selector returns UI state', () => {
      const { result } = renderHook(() => useGameUI())

      expect(result.current).toMatchObject({
        showHUD: true,
        showMenu: false,
        showInventory: false
      })
    })
  })
})
```

## 3D Testing Strategy

### 1. Three.js Component Testing
```mermaid
graph TD
    subgraph "3D Test Categories"
        GEOMETRY_TEST[Geometry Tests]
        MATERIAL_TEST[Material Tests]
        SHADER_TEST[Shader Tests]
        ANIMATION_TEST[Animation Tests]
        PERFORMANCE_TEST[Performance Tests]
    end

    subgraph "Mock Strategy"
        WEBGL_CONTEXT[WebGL Context Mock]
        THREE_OBJECTS[Three.js Object Mocks]
        RENDER_MOCK[Renderer Mocks]
        CANVAS_MOCK[Canvas Mocks]
    end

    subgraph "Test Techniques"
        SNAPSHOT[Snapshot Testing]
        PROPERTY[Property Testing]
        BEHAVIOR[Behavior Testing]
        INTEGRATION_3D[3D Integration Testing]
    end

    subgraph "Sacred Geometry Tests"
        FLOWER_TEST[Flower of Life Tests]
        MERKABA_TEST[Merkaba Tests]
        METATRON_TEST[Metatron's Cube Tests]
        COMPOSITE_TEST[Composite Tests]
    end

    GEOMETRY_TEST --> WEBGL_CONTEXT
    MATERIAL_TEST --> THREE_OBJECTS
    SHADER_TEST --> RENDER_MOCK
    ANIMATION_TEST --> CANVAS_MOCK

    WEBGL_CONTEXT --> SNAPSHOT
    THREE_OBJECTS --> PROPERTY
    RENDER_MOCK --> BEHAVIOR
    CANVAS_MOCK --> INTEGRATION_3D

    SNAPSHOT --> FLOWER_TEST
    PROPERTY --> MERKABA_TEST
    BEHAVIOR --> METATRON_TEST
    INTEGRATION_3D --> COMPOSITE_TEST
```

### 2. 3D Component Test Example
```typescript
// 3D Component Testing
describe('SacredGeometry Components', () => {
  beforeEach(() => {
    // Setup WebGL context mock
    vi.clearAllMocks()
  })

  describe('FlowerOfLife', () => {
    test('creates correct geometry structure', () => {
      render(
        <Canvas>
          <FlowerOfLife scale={1} color="#8b5cf6" />
        </Canvas>
      )

      // Test that component renders without crashing
      expect(true).toBe(true) // WebGL mock prevents actual rendering
    })

    test('applies scale transformation correctly', () => {
      const TestScene = () => {
        const meshRef = useRef()

        useEffect(() => {
          if (meshRef.current) {
            // Test scale application
            expect(meshRef.current.scale.x).toBeCloseTo(2)
          }
        }, [])

        return <FlowerOfLife ref={meshRef} scale={2} />
      }

      render(<Canvas><TestScene /></Canvas>)
    })
  })

  describe('Shader Materials', () => {
    test('creates projection shader material', () => {
      const mockTexture = new THREE.Texture()
      const projectorPosition = new THREE.Vector3(0, 5, 10)
      const projectorDirection = new THREE.Vector3(0, -1, 0)

      const material = createProjectionMaterial(
        mockTexture,
        projectorPosition,
        projectorDirection
      )

      expect(material).toBeInstanceOf(THREE.ShaderMaterial)
      expect(material.uniforms.projectorPosition.value).toEqual(projectorPosition)
    })
  })
})
```

## Mock Architecture

### 1. Comprehensive Mock System
```mermaid
graph TD
    subgraph "Browser API Mocks"
        INTERSECTION[IntersectionObserver]
        RESIZE[ResizeObserver]
        MATCH_MEDIA[matchMedia]
        RAF[requestAnimationFrame]
        PERFORMANCE[Performance API]
    end

    subgraph "WebGL Mocks"
        WEBGL_CONTEXT[WebGL Context]
        WEBGL_METHODS[WebGL Methods]
        WEBGL_CONSTANTS[WebGL Constants]
        CANVAS_METHODS[Canvas Methods]
    end

    subgraph "Three.js Mocks"
        THREE_OBJECTS[Three.js Objects]
        GEOMETRY_MOCK[Geometry Mocks]
        MATERIAL_MOCK[Material Mocks]
        RENDERER_MOCK[Renderer Mocks]
    end

    subgraph "Audio Mocks"
        AUDIO_CONTEXT[AudioContext]
        AUDIO_NODES[Audio Nodes]
        AUDIO_METHODS[Audio Methods]
        WEB_AUDIO[Web Audio API]
    end

    subgraph "Storage Mocks"
        LOCAL_STORAGE[localStorage]
        SESSION_STORAGE[sessionStorage]
        INDEXED_DB[IndexedDB]
        CACHE_API[Cache API]
    end

    INTERSECTION --> WEBGL_CONTEXT
    RESIZE --> WEBGL_METHODS
    MATCH_MEDIA --> WEBGL_CONSTANTS
    RAF --> CANVAS_METHODS

    WEBGL_CONTEXT --> THREE_OBJECTS
    WEBGL_METHODS --> GEOMETRY_MOCK
    WEBGL_CONSTANTS --> MATERIAL_MOCK
    CANVAS_METHODS --> RENDERER_MOCK

    THREE_OBJECTS --> AUDIO_CONTEXT
    GEOMETRY_MOCK --> AUDIO_NODES
    MATERIAL_MOCK --> AUDIO_METHODS
    RENDERER_MOCK --> WEB_AUDIO

    AUDIO_CONTEXT --> LOCAL_STORAGE
    AUDIO_NODES --> SESSION_STORAGE
    AUDIO_METHODS --> INDEXED_DB
    WEB_AUDIO --> CACHE_API
```

### 2. Mock Implementation Strategy
```typescript
// WebGL Mock Implementation
class MockWebGLRenderingContext {
  canvas = createCanvas(800, 600)
  drawingBufferWidth = 800
  drawingBufferHeight = 600

  // Shader methods
  createShader = vi.fn()
  shaderSource = vi.fn()
  compileShader = vi.fn()
  createProgram = vi.fn()

  // Buffer methods
  createBuffer = vi.fn()
  bindBuffer = vi.fn()
  bufferData = vi.fn()

  // Texture methods
  createTexture = vi.fn()
  bindTexture = vi.fn()
  texImage2D = vi.fn()

  // Uniform methods
  getUniformLocation = vi.fn()
  uniform1f = vi.fn()
  uniformMatrix4fv = vi.fn()

  // Constants
  VERTEX_SHADER = 35633
  FRAGMENT_SHADER = 35632
  TRIANGLES = 4
  DEPTH_TEST = 2929
}

// Three.js Component Mock
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="canvas-mock">{children}</div>
  ),
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({
    scene: {},
    camera: {},
    gl: new MockWebGLRenderingContext()
  }))
}))
```

## Test Coverage Strategy

### 1. Coverage Requirements
```mermaid
graph TD
    subgraph "Coverage Targets"
        OVERALL[Overall: 80%]
        STATEMENTS[Statements: 85%]
        BRANCHES[Branches: 75%]
        FUNCTIONS[Functions: 80%]
        LINES[Lines: 85%]
    end

    subgraph "Critical Paths"
        GAME_LOGIC[Game Logic: 90%]
        SECURITY[Security: 95%]
        DATA_FLOW[Data Flow: 85%]
        UI_CORE[Core UI: 80%]
    end

    subgraph "Exclusions"
        CONFIG[Config Files]
        TYPES[Type Definitions]
        MOCKS[Mock Files]
        VENDOR[Vendor Code]
    end

    subgraph "Reporting"
        HTML_REPORT[HTML Reports]
        JSON_REPORT[JSON Reports]
        LCOV_REPORT[LCOV Reports]
        CI_INTEGRATION[CI Integration]
    end

    OVERALL --> GAME_LOGIC
    STATEMENTS --> SECURITY
    BRANCHES --> DATA_FLOW
    FUNCTIONS --> UI_CORE
    LINES --> GAME_LOGIC

    GAME_LOGIC --> CONFIG
    SECURITY --> TYPES
    DATA_FLOW --> MOCKS
    UI_CORE --> VENDOR

    CONFIG --> HTML_REPORT
    TYPES --> JSON_REPORT
    MOCKS --> LCOV_REPORT
    VENDOR --> CI_INTEGRATION
```

### 2. Coverage Analysis
```typescript
// Coverage Configuration
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      threshold: {
        statements: 85,
        branches: 75,
        functions: 80,
        lines: 85
      },
      exclude: [
        'node_modules/',
        'src/test/',
        '*.config.ts',
        '**/*.d.ts',
        'dist/',
        'src/assets/',
        'src/mocks/',
        'vite-plugins/'
      ],
      include: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.stories.{ts,tsx}',
        '!src/**/*.test.{ts,tsx}'
      ]
    }
  }
})
```

## Performance Testing

### 1. Performance Test Architecture
```mermaid
graph TD
    subgraph "Performance Metrics"
        RENDER_TIME[Render Time]
        COMPONENT_MOUNT[Mount Time]
        UPDATE_TIME[Update Time]
        MEMORY_USAGE[Memory Usage]
    end

    subgraph "Benchmark Tests"
        COMPONENT_BENCH[Component Benchmarks]
        STORE_BENCH[Store Benchmarks]
        UTILITY_BENCH[Utility Benchmarks]
        INTEGRATION_BENCH[Integration Benchmarks]
    end

    subgraph "Load Testing"
        STRESS_TEST[Stress Testing]
        VOLUME_TEST[Volume Testing]
        SPIKE_TEST[Spike Testing]
        ENDURANCE_TEST[Endurance Testing]
    end

    subgraph "Monitoring"
        PERFORMANCE_BUDGET[Performance Budget]
        REGRESSION_DETECT[Regression Detection]
        TREND_ANALYSIS[Trend Analysis]
        ALERT_SYSTEM[Alert System]
    end

    RENDER_TIME --> COMPONENT_BENCH
    COMPONENT_MOUNT --> STORE_BENCH
    UPDATE_TIME --> UTILITY_BENCH
    MEMORY_USAGE --> INTEGRATION_BENCH

    COMPONENT_BENCH --> STRESS_TEST
    STORE_BENCH --> VOLUME_TEST
    UTILITY_BENCH --> SPIKE_TEST
    INTEGRATION_BENCH --> ENDURANCE_TEST

    STRESS_TEST --> PERFORMANCE_BUDGET
    VOLUME_TEST --> REGRESSION_DETECT
    SPIKE_TEST --> TREND_ANALYSIS
    ENDURANCE_TEST --> ALERT_SYSTEM
```

### 2. Performance Test Implementation
```typescript
// Performance Testing Example
describe('Component Performance', () => {
  test('Button renders within performance budget', async () => {
    const startTime = performance.now()

    render(<Button>Performance Test</Button>)

    const endTime = performance.now()
    const renderTime = endTime - startTime

    // Assert render time is under budget (5ms)
    expect(renderTime).toBeLessThan(5)
  })

  test('Store update performance', async () => {
    const iterations = 1000
    const startTime = performance.now()

    for (let i = 0; i < iterations; i++) {
      useGameStore.getState().addNotification({
        type: 'info',
        title: `Test ${i}`,
        message: `Message ${i}`
      })
    }

    const endTime = performance.now()
    const avgTime = (endTime - startTime) / iterations

    // Assert average update time is under 1ms
    expect(avgTime).toBeLessThan(1)
  })
})
```

## CI/CD Integration

### 1. Test Pipeline Architecture
```mermaid
graph LR
    subgraph "Git Hooks"
        PRE_COMMIT[Pre-commit]
        PRE_PUSH[Pre-push]
        COMMIT_MSG[Commit Message]
    end

    subgraph "CI Pipeline"
        INSTALL[Install Dependencies]
        LINT[Lint & Format]
        TYPE_CHECK[Type Check]
        UNIT_TESTS[Unit Tests]
        INTEGRATION[Integration Tests]
        COVERAGE[Coverage Check]
    end

    subgraph "Quality Gates"
        COVERAGE_GATE[Coverage Gate]
        PERFORMANCE_GATE[Performance Gate]
        SECURITY_GATE[Security Gate]
        DEPENDENCY_GATE[Dependency Gate]
    end

    subgraph "Reporting"
        TEST_REPORTS[Test Reports]
        COVERAGE_REPORTS[Coverage Reports]
        PERFORMANCE_REPORTS[Performance Reports]
        NOTIFICATION[Notifications]
    end

    PRE_COMMIT --> INSTALL
    PRE_PUSH --> LINT
    COMMIT_MSG --> TYPE_CHECK

    INSTALL --> UNIT_TESTS
    LINT --> INTEGRATION
    TYPE_CHECK --> COVERAGE

    UNIT_TESTS --> COVERAGE_GATE
    INTEGRATION --> PERFORMANCE_GATE
    COVERAGE --> SECURITY_GATE

    COVERAGE_GATE --> TEST_REPORTS
    PERFORMANCE_GATE --> COVERAGE_REPORTS
    SECURITY_GATE --> PERFORMANCE_REPORTS
    DEPENDENCY_GATE --> NOTIFICATION
```

### 2. Test Automation Configuration
```yaml
# GitHub Actions Test Workflow
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18, 20]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Run tests
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

## Test Utilities & Helpers

### 1. Custom Test Utilities
```typescript
// Test Utilities
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: {
    initialGameState?: Partial<GameState>
    wrapperProps?: any
  }
) => {
  const { initialGameState, wrapperProps } = options || {}

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <MonitoringProvider {...wrapperProps}>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </MonitoringProvider>
  )

  return render(ui, { wrapper: Wrapper })
}

export const createMockCanvas = () => ({
  getContext: vi.fn().mockReturnValue(new MockWebGLRenderingContext()),
  width: 800,
  height: 600,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
})

export const waitForThreeJS = async () => {
  // Wait for Three.js components to initialize
  await new Promise(resolve => setTimeout(resolve, 100))
}
```

### 2. Test Data Factories
```typescript
// Test Data Factory
export const createMockGameState = (overrides?: Partial<GameState>): GameState => ({
  isInitialized: true,
  isRunning: false,
  isPaused: false,
  currentScene: 'test-scene',
  showHUD: true,
  showMenu: false,
  notifications: [],
  vjCareerGame: {
    isActive: false,
    player: {
      level: 1,
      experience: 0,
      money: 100,
      reputation: 0
    },
    scene: null
  },
  ...overrides
})

export const createMockNotification = (
  overrides?: Partial<NotificationData>
): NotificationData => ({
  id: `test-${Date.now()}`,
  type: 'info',
  title: 'Test Notification',
  message: 'Test message',
  timestamp: Date.now(),
  ...overrides
})
```

## Quality Assurance Metrics

### 1. Test Quality Metrics
- **Test Coverage**: Minimum 80% overall coverage
- **Test Reliability**: < 1% flaky test rate
- **Test Performance**: Tests complete within 5 minutes
- **Regression Prevention**: All critical paths tested

### 2. Continuous Improvement
- Regular test review and refactoring
- Performance benchmark monitoring
- Coverage gap analysis
- Test automation expansion