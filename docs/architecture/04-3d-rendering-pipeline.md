# 3D Rendering Pipeline Architecture

## Three.js Integration Pipeline

```mermaid
graph TB
    subgraph "React Three Fiber Layer"
        CANVAS[Canvas Component]
        SCENE[MainScene]
        CONTROLS[ScrollControls]
        SUSPENSE[Suspense Boundary]
    end

    subgraph "Three.js Core Engine"
        RENDERER[WebGL Renderer]
        SCENE_GRAPH[Scene Graph]
        CAMERA[Camera System]
        LIGHTS[Lighting System]
    end

    subgraph "Geometry & Materials"
        SACRED[Sacred Geometry]
        MESHES[Mesh Objects]
        MATERIALS[Shader Materials]
        TEXTURES[Texture System]
    end

    subgraph "Animation Pipeline"
        FRAME_LOOP[useFrame Hook]
        SPRING[React Spring]
        FLOAT[Float Components]
        PARTICLES[Particle Systems]
    end

    subgraph "Shader Pipeline"
        VERTEX[Vertex Shaders]
        FRAGMENT[Fragment Shaders]
        UNIFORMS[Uniform Variables]
        PROJECTION[Projection Mapping]
    end

    subgraph "Post-Processing"
        COMPOSER[EffectComposer]
        PASSES[Render Passes]
        BLOOM[Bloom Effect]
        DOF[Depth of Field]
    end

    subgraph "Performance Optimization"
        FRUSTUM[Frustum Culling]
        LOD[Level of Detail]
        INSTANCING[Geometry Instancing]
        POOLING[Object Pooling]
    end

    CANVAS --> RENDERER
    SCENE --> SCENE_GRAPH
    CONTROLS --> CAMERA

    RENDERER --> SCENE_GRAPH
    SCENE_GRAPH --> MESHES
    MESHES --> MATERIALS
    MATERIALS --> SHADERS[Shader System]

    FRAME_LOOP --> SPRING
    SPRING --> FLOAT
    FLOAT --> PARTICLES

    SHADERS --> VERTEX
    SHADERS --> FRAGMENT
    VERTEX --> UNIFORMS
    FRAGMENT --> PROJECTION

    RENDERER --> COMPOSER
    COMPOSER --> PASSES
    PASSES --> BLOOM
    PASSES --> DOF

    RENDERER --> FRUSTUM
    SCENE_GRAPH --> LOD
    MESHES --> INSTANCING
    MESHES --> POOLING

    style CANVAS fill:#e1f5fe
    style RENDERER fill:#f3e5f5
    style SHADERS fill:#e8f5e8
    style COMPOSER fill:#fff3e0
    style FRUSTUM fill:#fce4ec
```

## Rendering Architecture Layers

### 1. React Three Fiber Integration
```mermaid
graph TD
    subgraph "R3F Components"
        CANVAS[Canvas - WebGL Context]
        CANVAS --> SCENE[Scene Root]
        SCENE --> MESHES[Mesh Components]
        SCENE --> LIGHTS[Light Components]
        SCENE --> CAMERAS[Camera Components]
        SCENE --> CONTROLS[Control Components]
    end

    subgraph "Three.js Objects"
        SCENE --> THREE_SCENE[THREE.Scene]
        MESHES --> THREE_MESH[THREE.Mesh]
        LIGHTS --> THREE_LIGHTS[THREE.Light]
        CAMERAS --> THREE_CAMERA[THREE.Camera]
        CONTROLS --> THREE_CONTROLS[THREE.Controls]
    end

    subgraph "WebGL Context"
        THREE_SCENE --> WEBGL[WebGL Renderer]
        THREE_MESH --> WEBGL
        THREE_LIGHTS --> WEBGL
        THREE_CAMERA --> WEBGL
    end
```

### 2. Shader System Architecture
```mermaid
graph TB
    subgraph "Shader Programs"
        PROJECTION[Projection Mapping Shaders]
        MULTI_PROJ[Multi-Projector Shaders]
        DEPTH[Depth-Aware Shaders]
        SACRED_GEOM[Sacred Geometry Shaders]
    end

    subgraph "Vertex Processing"
        VERTEX_IN[Vertex Input]
        TRANSFORM[Model-View-Projection]
        PROJECTOR_SPACE[Projector Space Transform]
        VERTEX_OUT[Vertex Output]
    end

    subgraph "Fragment Processing"
        RASTERIZATION[Rasterization]
        TEXTURE_SAMPLE[Texture Sampling]
        LIGHTING[Lighting Calculations]
        FRAGMENT_OUT[Fragment Output]
    end

    subgraph "Uniform Data"
        MATRICES[Transformation Matrices]
        LIGHTS_DATA[Light Parameters]
        MATERIAL_PROPS[Material Properties]
        PROJECTOR_DATA[Projector Configuration]
    end

    PROJECTION --> VERTEX_IN
    MULTI_PROJ --> VERTEX_IN
    DEPTH --> VERTEX_IN

    VERTEX_IN --> TRANSFORM
    TRANSFORM --> PROJECTOR_SPACE
    PROJECTOR_SPACE --> VERTEX_OUT

    VERTEX_OUT --> RASTERIZATION
    RASTERIZATION --> TEXTURE_SAMPLE
    TEXTURE_SAMPLE --> LIGHTING
    LIGHTING --> FRAGMENT_OUT

    MATRICES --> TRANSFORM
    LIGHTS_DATA --> LIGHTING
    MATERIAL_PROPS --> LIGHTING
    PROJECTOR_DATA --> PROJECTOR_SPACE
```

### 3. Projection Mapping Pipeline
```mermaid
graph LR
    subgraph "Input"
        CONTENT[Media Content]
        SURFACE[3D Surface]
        PROJECTOR[Projector Config]
    end

    subgraph "Processing"
        VERTEX_SHADER[Vertex Transform]
        PROJECTOR_SPACE[Projector Space Calculation]
        FRAGMENT_SHADER[Fragment Processing]
    end

    subgraph "Effects"
        KEYSTONE[Keystone Correction]
        EDGE_BLEND[Edge Blending]
        MULTI_PROJ[Multi-Projector Blend]
        DEPTH_TEST[Depth Testing]
    end

    subgraph "Output"
        PROJECTED[Projected Result]
        BLENDED[Blended Output]
        FINAL[Final Render]
    end

    CONTENT --> VERTEX_SHADER
    SURFACE --> VERTEX_SHADER
    PROJECTOR --> PROJECTOR_SPACE

    VERTEX_SHADER --> PROJECTOR_SPACE
    PROJECTOR_SPACE --> FRAGMENT_SHADER

    FRAGMENT_SHADER --> KEYSTONE
    KEYSTONE --> EDGE_BLEND
    EDGE_BLEND --> MULTI_PROJ
    MULTI_PROJ --> DEPTH_TEST

    DEPTH_TEST --> PROJECTED
    PROJECTED --> BLENDED
    BLENDED --> FINAL
```

## Sacred Geometry Rendering

### 1. Mathematical Form Generation
```mermaid
graph TD
    subgraph "Geometry Generation"
        FLOWER[Flower of Life]
        MERKABA[Merkaba]
        METATRON[Metatron's Cube]
        COMPOSITE[Sacred Geometry Composite]
    end

    subgraph "Mathematical Calculations"
        POSITIONS[Vertex Positions]
        INDICES[Index Arrays]
        NORMALS[Normal Vectors]
        UVS[UV Coordinates]
    end

    subgraph "Buffer Geometry"
        VERTEX_BUFFER[Vertex Buffer]
        INDEX_BUFFER[Index Buffer]
        ATTRIBUTE_BUFFER[Attribute Buffers]
        GEOMETRY[THREE.BufferGeometry]
    end

    subgraph "Material System"
        SHADER_MAT[Shader Material]
        UNIFORMS_GEOM[Geometry Uniforms]
        TEXTURES_GEOM[Procedural Textures]
        DISTORTION[Distortion Effects]
    end

    FLOWER --> POSITIONS
    MERKABA --> POSITIONS
    METATRON --> POSITIONS
    COMPOSITE --> POSITIONS

    POSITIONS --> VERTEX_BUFFER
    INDICES --> INDEX_BUFFER
    NORMALS --> ATTRIBUTE_BUFFER
    UVS --> ATTRIBUTE_BUFFER

    VERTEX_BUFFER --> GEOMETRY
    INDEX_BUFFER --> GEOMETRY
    ATTRIBUTE_BUFFER --> GEOMETRY

    GEOMETRY --> SHADER_MAT
    SHADER_MAT --> UNIFORMS_GEOM
    UNIFORMS_GEOM --> TEXTURES_GEOM
    TEXTURES_GEOM --> DISTORTION
```

### 2. Sacred Geometry Animation Pipeline
```mermaid
sequenceDiagram
    participant Frame as useFrame
    participant Component as Geometry Component
    participant Uniforms as Shader Uniforms
    participant GPU as GPU Rendering

    Frame->>Component: Animation Tick
    Component->>Component: Calculate Rotation
    Component->>Component: Update Position
    Component->>Uniforms: Update Time Uniform
    Component->>Uniforms: Update Transform Matrices
    Uniforms->>GPU: Upload to Shader
    GPU->>GPU: Vertex Processing
    GPU->>GPU: Fragment Processing
    GPU->>Frame: Rendered Frame
```

## Performance Optimization Pipeline

### 1. Rendering Optimization
```mermaid
graph TB
    subgraph "Culling System"
        FRUSTUM_CULL[Frustum Culling]
        OCCLUSION[Occlusion Culling]
        DISTANCE[Distance Culling]
    end

    subgraph "Level of Detail"
        LOD_SYSTEM[LOD System]
        HIGH_DETAIL[High Detail Meshes]
        MED_DETAIL[Medium Detail Meshes]
        LOW_DETAIL[Low Detail Meshes]
    end

    subgraph "Instancing"
        INSTANCE_MGR[Instance Manager]
        GEOMETRY_INST[Geometry Instancing]
        MATRIX_INST[Matrix Instancing]
        BATCH_RENDER[Batch Rendering]
    end

    subgraph "Memory Management"
        OBJECT_POOL[Object Pooling]
        TEXTURE_CACHE[Texture Caching]
        GEOMETRY_CACHE[Geometry Caching]
        DISPOSAL[Resource Disposal]
    end

    FRUSTUM_CULL --> LOD_SYSTEM
    OCCLUSION --> LOD_SYSTEM
    DISTANCE --> LOD_SYSTEM

    LOD_SYSTEM --> HIGH_DETAIL
    LOD_SYSTEM --> MED_DETAIL
    LOD_SYSTEM --> LOW_DETAIL

    HIGH_DETAIL --> INSTANCE_MGR
    MED_DETAIL --> INSTANCE_MGR
    LOW_DETAIL --> INSTANCE_MGR

    INSTANCE_MGR --> GEOMETRY_INST
    GEOMETRY_INST --> MATRIX_INST
    MATRIX_INST --> BATCH_RENDER

    BATCH_RENDER --> OBJECT_POOL
    OBJECT_POOL --> TEXTURE_CACHE
    TEXTURE_CACHE --> GEOMETRY_CACHE
    GEOMETRY_CACHE --> DISPOSAL
```

### 2. Frame Rate Optimization
```mermaid
graph LR
    subgraph "Performance Monitoring"
        FPS[FPS Counter]
        FRAME_TIME[Frame Time]
        GPU_USAGE[GPU Usage]
        MEMORY[Memory Usage]
    end

    subgraph "Adaptive Quality"
        QUALITY_MGR[Quality Manager]
        AUTO_LOD[Automatic LOD]
        PARTICLE_REDUCTION[Particle Reduction]
        EFFECT_SCALING[Effect Scaling]
    end

    subgraph "Optimization Actions"
        REDUCE_QUALITY[Reduce Quality]
        SKIP_FRAMES[Skip Animations]
        LOWER_RESOLUTION[Lower Resolution]
        DISABLE_EFFECTS[Disable Effects]
    end

    FPS --> QUALITY_MGR
    FRAME_TIME --> QUALITY_MGR
    GPU_USAGE --> QUALITY_MGR
    MEMORY --> QUALITY_MGR

    QUALITY_MGR --> AUTO_LOD
    QUALITY_MGR --> PARTICLE_REDUCTION
    QUALITY_MGR --> EFFECT_SCALING

    AUTO_LOD --> REDUCE_QUALITY
    PARTICLE_REDUCTION --> SKIP_FRAMES
    EFFECT_SCALING --> LOWER_RESOLUTION
    EFFECT_SCALING --> DISABLE_EFFECTS
```

## Post-Processing Pipeline

### 1. Effect Composition
```mermaid
graph TB
    subgraph "Render Targets"
        SCENE_RT[Scene Render Target]
        DEPTH_RT[Depth Render Target]
        NORMAL_RT[Normal Render Target]
    end

    subgraph "Post-Processing Passes"
        BLOOM_PASS[Bloom Pass]
        DOF_PASS[Depth of Field Pass]
        SSAO_PASS[SSAO Pass]
        TONE_MAP[Tone Mapping Pass]
        FXAA_PASS[FXAA Pass]
    end

    subgraph "Final Composition"
        COMPOSER[Effect Composer]
        FINAL_PASS[Final Pass]
        SCREEN[Screen Output]
    end

    SCENE_RT --> BLOOM_PASS
    DEPTH_RT --> DOF_PASS
    NORMAL_RT --> SSAO_PASS

    BLOOM_PASS --> COMPOSER
    DOF_PASS --> COMPOSER
    SSAO_PASS --> COMPOSER

    COMPOSER --> TONE_MAP
    TONE_MAP --> FXAA_PASS
    FXAA_PASS --> FINAL_PASS
    FINAL_PASS --> SCREEN
```

### 2. Shader Effect Pipeline
```mermaid
sequenceDiagram
    participant Renderer as WebGL Renderer
    participant RT1 as Render Target 1
    participant Pass1 as Bloom Pass
    participant RT2 as Render Target 2
    participant Pass2 as DOF Pass
    participant Screen as Final Output

    Renderer->>RT1: Render Scene
    RT1->>Pass1: Input Texture
    Pass1->>RT2: Processed Output
    RT2->>Pass2: Input Texture
    Pass2->>Screen: Final Render
```

## Asset Loading Pipeline

### 1. Texture Loading
```mermaid
graph TD
    subgraph "Asset Sources"
        IMAGES[Image Files]
        VIDEOS[Video Files]
        PROCEDURAL[Procedural Textures]
        CANVAS[Canvas Textures]
    end

    subgraph "Loading System"
        LOADER[THREE.TextureLoader]
        VIDEO_LOADER[Video Texture Loader]
        CANVAS_LOADER[Canvas Texture Loader]
        CACHE[Texture Cache]
    end

    subgraph "Processing"
        COMPRESSION[Texture Compression]
        MIPMAPS[Mipmap Generation]
        FORMAT[Format Conversion]
        OPTIMIZATION[Size Optimization]
    end

    subgraph "GPU Upload"
        UPLOAD[GPU Upload]
        BINDING[Texture Binding]
        USAGE[Shader Usage]
    end

    IMAGES --> LOADER
    VIDEOS --> VIDEO_LOADER
    PROCEDURAL --> CANVAS_LOADER
    CANVAS --> CANVAS_LOADER

    LOADER --> CACHE
    VIDEO_LOADER --> CACHE
    CANVAS_LOADER --> CACHE

    CACHE --> COMPRESSION
    COMPRESSION --> MIPMAPS
    MIPMAPS --> FORMAT
    FORMAT --> OPTIMIZATION

    OPTIMIZATION --> UPLOAD
    UPLOAD --> BINDING
    BINDING --> USAGE
```

### 2. Geometry Loading
```mermaid
graph TD
    subgraph "Geometry Sources"
        PROCEDURAL_GEOM[Procedural Generation]
        IMPORTED[Imported Models]
        PRIMITIVES[Primitive Shapes]
        CUSTOM[Custom Geometries]
    end

    subgraph "Processing Pipeline"
        VERTEX_CALC[Vertex Calculation]
        NORMAL_CALC[Normal Calculation]
        UV_MAPPING[UV Mapping]
        BUFFER_CREATION[Buffer Creation]
    end

    subgraph "Optimization"
        SIMPLIFICATION[Mesh Simplification]
        COMPRESSION_GEOM[Geometry Compression]
        BATCHING[Geometry Batching]
        INSTANCING_PREP[Instancing Preparation]
    end

    PROCEDURAL_GEOM --> VERTEX_CALC
    IMPORTED --> VERTEX_CALC
    PRIMITIVES --> VERTEX_CALC
    CUSTOM --> VERTEX_CALC

    VERTEX_CALC --> NORMAL_CALC
    NORMAL_CALC --> UV_MAPPING
    UV_MAPPING --> BUFFER_CREATION

    BUFFER_CREATION --> SIMPLIFICATION
    SIMPLIFICATION --> COMPRESSION_GEOM
    COMPRESSION_GEOM --> BATCHING
    BATCHING --> INSTANCING_PREP
```

## Integration with React Components

### 1. Component-Three.js Bridge
```mermaid
graph LR
    subgraph "React Components"
        MESH_COMP[Mesh Component]
        GEOMETRY_COMP[Geometry Component]
        MATERIAL_COMP[Material Component]
        LIGHT_COMP[Light Component]
    end

    subgraph "R3F Bridge"
        USE_THREE[useThree Hook]
        USE_FRAME[useFrame Hook]
        USE_LOADER[useLoader Hook]
        CONTEXT[R3F Context]
    end

    subgraph "Three.js Objects"
        THREE_MESH_OBJ[THREE.Mesh]
        THREE_GEOM[THREE.Geometry]
        THREE_MAT[THREE.Material]
        THREE_LIGHT[THREE.Light]
    end

    MESH_COMP --> USE_THREE
    GEOMETRY_COMP --> USE_THREE
    MATERIAL_COMP --> USE_THREE
    LIGHT_COMP --> USE_THREE

    USE_THREE --> CONTEXT
    USE_FRAME --> CONTEXT
    USE_LOADER --> CONTEXT

    CONTEXT --> THREE_MESH_OBJ
    CONTEXT --> THREE_GEOM
    CONTEXT --> THREE_MAT
    CONTEXT --> THREE_LIGHT
```

### 2. State Synchronization
```mermaid
sequenceDiagram
    participant React as React Component
    participant Store as Zustand Store
    participant R3F as React Three Fiber
    participant Three as Three.js Object

    React->>Store: Update State
    Store->>React: State Change
    React->>R3F: Props Update
    R3F->>Three: Object Update
    Three->>Three: Render Frame
```

## Performance Metrics

### 1. Rendering Performance
- **Target Frame Rate**: 60 FPS
- **Frame Time Budget**: 16.67ms
- **GPU Memory Usage**: < 500MB
- **Draw Calls**: < 200 per frame
- **Vertices**: < 100K per frame

### 2. Asset Performance
- **Texture Memory**: < 200MB
- **Geometry Memory**: < 50MB
- **Load Time**: < 3 seconds
- **Cache Hit Rate**: > 80%

### 3. Shader Performance
- **Vertex Shader Complexity**: < 100 instructions
- **Fragment Shader Complexity**: < 200 instructions
- **Uniform Updates**: < 50 per frame
- **Texture Samples**: < 8 per fragment