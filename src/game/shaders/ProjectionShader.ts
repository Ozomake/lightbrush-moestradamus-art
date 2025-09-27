import * as THREE from 'three'

export const projectionVertexShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec4 vProjectedCoord;

uniform mat4 projectorMatrix;
uniform mat4 projectorWorldMatrix;

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;

    // Calculate world position
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;

    // Calculate projected coordinates
    vProjectedCoord = projectorMatrix * inverse(projectorWorldMatrix) * worldPos;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const projectionFragmentShader = `
uniform sampler2D projectionTexture;
uniform sampler2D baseTexture;
uniform vec3 projectorPosition;
uniform vec3 projectorDirection;
uniform float projectionIntensity;
uniform float projectionFalloff;
uniform float time;
uniform vec3 baseColor;
uniform float roughness;
uniform float metalness;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec4 vProjectedCoord;

// Noise function for subtle variations
float noise(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
    // Base material color
    vec3 color = baseColor;

    // Sample base texture if available
    #ifdef USE_BASE_TEXTURE
        vec4 baseTexel = texture2D(baseTexture, vUv);
        color *= baseTexel.rgb;
    #endif

    // Calculate projection coordinates
    vec3 projCoords = vProjectedCoord.xyz / vProjectedCoord.w;
    projCoords = projCoords * 0.5 + 0.5; // Convert from [-1,1] to [0,1]

    // Check if point is within projection bounds
    if (projCoords.x >= 0.0 && projCoords.x <= 1.0 &&
        projCoords.y >= 0.0 && projCoords.y <= 1.0 &&
        projCoords.z >= 0.0 && projCoords.z <= 1.0) {

        // Sample projection texture
        vec4 projectionColor = texture2D(projectionTexture, projCoords.xy);

        // Calculate distance falloff
        float distance = length(vWorldPosition - projectorPosition);
        float falloff = 1.0 - smoothstep(0.0, projectionFalloff, distance);

        // Calculate angle-based intensity (surface facing projection)
        vec3 projectionRay = normalize(projectorPosition - vWorldPosition);
        float surfaceAlignment = max(0.0, dot(vNormal, projectionRay));

        // Add subtle animation
        float pulse = sin(time * 2.0) * 0.1 + 0.9;

        // Add noise for organic feel
        float noiseValue = noise(vUv * 10.0 + time * 0.5) * 0.1 + 0.9;

        // Combine factors
        float finalIntensity = projectionIntensity * falloff * surfaceAlignment * pulse * noiseValue * projectionColor.a;

        // Apply projection
        color = mix(color, color + projectionColor.rgb * finalIntensity, finalIntensity);

        // Add glow effect
        float glow = smoothstep(0.7, 1.0, finalIntensity) * 0.3;
        color += vec3(glow) * projectionColor.rgb;
    }

    // Add subtle rim lighting
    float rimPower = 2.0;
    float rimIntensity = 0.2;
    vec3 viewDir = normalize(-vPosition);
    float rim = 1.0 - max(0.0, dot(viewDir, vNormal));
    rim = pow(rim, rimPower);
    color += vec3(rim * rimIntensity);

    gl_FragColor = vec4(color, 1.0);
}
`

export const glowVertexShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const glowFragmentShader = `
uniform vec3 glowColor;
uniform float glowIntensity;
uniform float time;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    // Calculate fresnel effect for glow
    vec3 viewDirection = normalize(-vPosition);
    float fresnel = 1.0 - max(0.0, dot(viewDirection, vNormal));
    fresnel = pow(fresnel, 2.0);

    // Add pulsing animation
    float pulse = sin(time * 3.0) * 0.3 + 0.7;

    // Calculate final glow
    float glow = fresnel * glowIntensity * pulse;

    gl_FragColor = vec4(glowColor, glow);
}
`

export class ProjectionShaderMaterial extends THREE.ShaderMaterial {
    constructor(parameters: {
        projectionTexture?: THREE.Texture
        baseTexture?: THREE.Texture
        projectorPosition?: THREE.Vector3
        projectorDirection?: THREE.Vector3
        projectorMatrix?: THREE.Matrix4
        projectorWorldMatrix?: THREE.Matrix4
        projectionIntensity?: number
        projectionFalloff?: number
        baseColor?: THREE.Color
        roughness?: number
        metalness?: number
    } = {}) {
        const uniforms = {
            projectionTexture: { value: parameters.projectionTexture || null },
            baseTexture: { value: parameters.baseTexture || null },
            projectorPosition: { value: parameters.projectorPosition || new THREE.Vector3(0, 2, 5) },
            projectorDirection: { value: parameters.projectorDirection || new THREE.Vector3(0, 0, -1) },
            projectorMatrix: { value: parameters.projectorMatrix || new THREE.Matrix4() },
            projectorWorldMatrix: { value: parameters.projectorWorldMatrix || new THREE.Matrix4() },
            projectionIntensity: { value: parameters.projectionIntensity || 1.0 },
            projectionFalloff: { value: parameters.projectionFalloff || 10.0 },
            time: { value: 0 },
            baseColor: { value: parameters.baseColor || new THREE.Color(0x8B4513) },
            roughness: { value: parameters.roughness || 0.7 },
            metalness: { value: parameters.metalness || 0.1 }
        }

        super({
            uniforms,
            vertexShader: projectionVertexShader,
            fragmentShader: projectionFragmentShader,
            transparent: true,
            side: THREE.DoubleSide,
            defines: {
                USE_BASE_TEXTURE: parameters.baseTexture ? 1 : 0
            }
        })
    }

    public updateTime(time: number) {
        this.uniforms.time.value = time
    }

    public setProjectionTexture(texture: THREE.Texture | null) {
        this.uniforms.projectionTexture.value = texture
        this.needsUpdate = true
    }

    public setProjectorPosition(position: THREE.Vector3) {
        this.uniforms.projectorPosition.value.copy(position)
    }

    public setProjectorDirection(direction: THREE.Vector3) {
        this.uniforms.projectorDirection.value.copy(direction)
    }

    public setProjectorMatrix(matrix: THREE.Matrix4) {
        this.uniforms.projectorMatrix.value.copy(matrix)
    }

    public setProjectorWorldMatrix(matrix: THREE.Matrix4) {
        this.uniforms.projectorWorldMatrix.value.copy(matrix)
    }

    public setIntensity(intensity: number) {
        this.uniforms.projectionIntensity.value = intensity
    }

    public setFalloff(falloff: number) {
        this.uniforms.projectionFalloff.value = falloff
    }

    public setBaseColor(color: THREE.Color) {
        this.uniforms.baseColor.value.copy(color)
    }
}

export class GlowMaterial extends THREE.ShaderMaterial {
    constructor(parameters: {
        glowColor?: THREE.Color
        glowIntensity?: number
    } = {}) {
        const uniforms = {
            glowColor: { value: parameters.glowColor || new THREE.Color(0x00ff88) },
            glowIntensity: { value: parameters.glowIntensity || 1.0 },
            time: { value: 0 }
        }

        super({
            uniforms,
            vertexShader: glowVertexShader,
            fragmentShader: glowFragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
        })
    }

    public updateTime(time: number) {
        this.uniforms.time.value = time
    }

    public setGlowColor(color: THREE.Color) {
        this.uniforms.glowColor.value.copy(color)
    }

    public setIntensity(intensity: number) {
        this.uniforms.glowIntensity.value = intensity
    }
}

export default {
    ProjectionShaderMaterial,
    GlowMaterial,
    projectionVertexShader,
    projectionFragmentShader,
    glowVertexShader,
    glowFragmentShader
}