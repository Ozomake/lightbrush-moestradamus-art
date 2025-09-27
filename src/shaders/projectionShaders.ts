import * as THREE from 'three'

// Realistic projection mapping shaders for Three.js
// These shaders simulate real-world projection mapping effects

export const projectionVertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec4 vProjectorPosition;

uniform mat4 projectorMatrix;
uniform mat4 projectorWorldMatrix;

void main() {
  vUv = uv;
  vPosition = position;
  vNormal = normalize(normalMatrix * normal);

  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;

  // Transform to projector space
  vProjectorPosition = projectorMatrix * projectorWorldMatrix * worldPosition;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const projectionFragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec4 vProjectorPosition;

uniform sampler2D projectionTexture;
uniform sampler2D surfaceTexture;
uniform vec3 projectorPosition;
uniform vec3 projectorDirection;
uniform float projectorFOV;
uniform float projectorBrightness;
uniform float ambientIntensity;
uniform float surfaceReflectivity;
uniform float surfaceRoughness;
uniform bool enableKeystone;
uniform vec4 keystoneCorrection; // top, bottom, left, right adjustments
uniform bool enableEdgeBlend;
uniform vec4 edgeBlendZones; // top, bottom, left, right percentages
uniform float edgeBlendGamma;
uniform vec3 surfaceColor;

// Utility functions
float remap(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

vec2 applyKeystone(vec2 uv, vec4 keystone) {
  // Apply keystone correction
  vec2 corrected = uv;

  // Horizontal keystone
  float horizontalFactor = mix(keystone.z, keystone.w, uv.x);
  corrected.y = mix(corrected.y * horizontalFactor, corrected.y / horizontalFactor, uv.y);

  // Vertical keystone
  float verticalFactor = mix(keystone.x, keystone.y, uv.y);
  corrected.x = mix(corrected.x * verticalFactor, corrected.x / verticalFactor, uv.x);

  return corrected;
}

float calculateEdgeBlend(vec2 uv, vec4 blendZones) {
  float blend = 1.0;

  // Top edge
  if (uv.y > (1.0 - blendZones.x)) {
    float dist = (uv.y - (1.0 - blendZones.x)) / blendZones.x;
    blend *= 1.0 - smoothstep(0.0, 1.0, dist);
  }

  // Bottom edge
  if (uv.y < blendZones.y) {
    float dist = (blendZones.y - uv.y) / blendZones.y;
    blend *= 1.0 - smoothstep(0.0, 1.0, dist);
  }

  // Left edge
  if (uv.x < blendZones.z) {
    float dist = (blendZones.z - uv.x) / blendZones.z;
    blend *= 1.0 - smoothstep(0.0, 1.0, dist);
  }

  // Right edge
  if (uv.x > (1.0 - blendZones.w)) {
    float dist = (uv.x - (1.0 - blendZones.w)) / blendZones.w;
    blend *= 1.0 - smoothstep(0.0, 1.0, dist);
  }

  return pow(blend, edgeBlendGamma);
}

float calculateProjectorIntensity(vec3 worldPos, vec3 projPos, vec3 projDir, float projFOV) {
  vec3 toProjector = normalize(projPos - worldPos);
  float distance = length(projPos - worldPos);

  // Angle from projector direction
  float angle = acos(dot(toProjector, -projDir));
  float maxAngle = projFOV * 0.5 * 3.14159 / 180.0;

  // Intensity falloff based on angle
  float angleFalloff = 1.0 - smoothstep(0.0, maxAngle, angle);

  // Distance falloff (inverse square law)
  float distanceFalloff = 1.0 / (1.0 + distance * distance * 0.01);

  // Surface angle (Lambert's cosine law)
  float surfaceAngle = max(0.0, dot(vNormal, toProjector));

  return angleFalloff * distanceFalloff * surfaceAngle;
}

vec3 calculateProjectedColor(vec2 projectorUV) {
  // Sample the projection texture
  vec4 projectedColor = texture2D(projectionTexture, projectorUV);

  // Apply brightness adjustment
  projectedColor.rgb *= projectorBrightness;

  return projectedColor.rgb;
}

vec3 calculateSurfaceShading(vec3 normal, vec3 lightDir, vec3 viewDir, vec3 baseColor) {
  // Lambertian diffuse
  float NdotL = max(0.0, dot(normal, lightDir));
  vec3 diffuse = baseColor * NdotL;

  // Blinn-Phong specular
  vec3 halfDir = normalize(lightDir + viewDir);
  float NdotH = max(0.0, dot(normal, halfDir));
  float shininess = (1.0 - surfaceRoughness) * 128.0;
  float specular = pow(NdotH, shininess) * surfaceReflectivity;

  return diffuse + vec3(specular);
}

void main() {
  // Get projector space coordinates
  vec3 projCoords = vProjectorPosition.xyz / vProjectorPosition.w;
  projCoords = projCoords * 0.5 + 0.5; // Convert from [-1,1] to [0,1]

  // Check if fragment is within projector frustum
  if (projCoords.x < 0.0 || projCoords.x > 1.0 ||
      projCoords.y < 0.0 || projCoords.y > 1.0 ||
      projCoords.z < 0.0 || projCoords.z > 1.0) {
    // Outside projection - show surface color only
    vec3 ambient = surfaceColor * ambientIntensity;
    gl_FragColor = vec4(ambient, 1.0);
    return;
  }

  vec2 projectorUV = projCoords.xy;

  // Apply keystone correction
  if (enableKeystone) {
    projectorUV = applyKeystone(projectorUV, keystoneCorrection);
  }

  // Calculate projector intensity
  float intensity = calculateProjectorIntensity(
    vWorldPosition,
    projectorPosition,
    projectorDirection,
    projectorFOV
  );

  // Apply edge blending
  float edgeBlend = 1.0;
  if (enableEdgeBlend) {
    edgeBlend = calculateEdgeBlend(projectorUV, edgeBlendZones);
  }

  // Get projected color
  vec3 projectedColor = calculateProjectedColor(projectorUV);

  // Calculate surface properties
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
  vec3 lightDir = normalize(projectorPosition - vWorldPosition);

  // Surface shading
  vec3 surfaceShading = calculateSurfaceShading(
    vNormal,
    lightDir,
    viewDir,
    surfaceColor
  );

  // Ambient contribution
  vec3 ambient = surfaceColor * ambientIntensity;

  // Combine projected color with surface properties
  vec3 finalColor = ambient +
                   projectedColor * intensity * edgeBlend * (1.0 - surfaceReflectivity) +
                   surfaceShading * intensity * edgeBlend;

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export const multiProjectorVertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec4 vProjectorPositions[4]; // Support up to 4 projectors

uniform mat4 projectorMatrices[4];
uniform mat4 projectorWorldMatrices[4];
uniform int activeProjectors;

void main() {
  vUv = uv;
  vPosition = position;
  vNormal = normalize(normalMatrix * normal);

  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;

  // Transform to each projector space
  for (int i = 0; i < 4; i++) {
    if (i < activeProjectors) {
      vProjectorPositions[i] = projectorMatrices[i] * projectorWorldMatrices[i] * worldPosition;
    }
  }

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const multiProjectorFragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec4 vProjectorPositions[4];

uniform sampler2D projectionTextures[4];
uniform vec3 projectorPositions[4];
uniform vec3 projectorDirections[4];
uniform float projectorFOVs[4];
uniform float projectorBrightness[4];
uniform bool projectorEnabled[4];
uniform int activeProjectors;
uniform float ambientIntensity;
uniform float surfaceReflectivity;
uniform float surfaceRoughness;
uniform vec3 surfaceColor;
uniform float overlapBlendFactor;

// Edge blend zones for each projector
uniform vec4 edgeBlendZones[4];
uniform bool enableEdgeBlend[4];
uniform float edgeBlendGamma;

float calculateProjectorIntensity(vec3 worldPos, vec3 projPos, vec3 projDir, float projFOV) {
  vec3 toProjector = normalize(projPos - worldPos);
  float distance = length(projPos - worldPos);

  float angle = acos(dot(toProjector, -projDir));
  float maxAngle = projFOV * 0.5 * 3.14159 / 180.0;

  float angleFalloff = 1.0 - smoothstep(0.0, maxAngle, angle);
  float distanceFalloff = 1.0 / (1.0 + distance * distance * 0.01);
  float surfaceAngle = max(0.0, dot(vNormal, toProjector));

  return angleFalloff * distanceFalloff * surfaceAngle;
}

float calculateEdgeBlend(vec2 uv, vec4 blendZones) {
  float blend = 1.0;

  if (uv.y > (1.0 - blendZones.x)) {
    float dist = (uv.y - (1.0 - blendZones.x)) / blendZones.x;
    blend *= 1.0 - smoothstep(0.0, 1.0, dist);
  }

  if (uv.y < blendZones.y) {
    float dist = (blendZones.y - uv.y) / blendZones.y;
    blend *= 1.0 - smoothstep(0.0, 1.0, dist);
  }

  if (uv.x < blendZones.z) {
    float dist = (blendZones.z - uv.x) / blendZones.z;
    blend *= 1.0 - smoothstep(0.0, 1.0, dist);
  }

  if (uv.x > (1.0 - blendZones.w)) {
    float dist = (uv.x - (1.0 - blendZones.w)) / blendZones.w;
    blend *= 1.0 - smoothstep(0.0, 1.0, dist);
  }

  return pow(blend, edgeBlendGamma);
}

void main() {
  vec3 totalProjectedColor = vec3(0.0);
  float totalIntensity = 0.0;

  // Process each active projector
  for (int i = 0; i < 4; i++) {
    if (i >= activeProjectors || !projectorEnabled[i]) continue;

    // Get projector space coordinates
    vec3 projCoords = vProjectorPositions[i].xyz / vProjectorPositions[i].w;
    projCoords = projCoords * 0.5 + 0.5;

    // Check if within frustum
    if (projCoords.x < 0.0 || projCoords.x > 1.0 ||
        projCoords.y < 0.0 || projCoords.y > 1.0 ||
        projCoords.z < 0.0 || projCoords.z > 1.0) {
      continue;
    }

    vec2 projectorUV = projCoords.xy;

    // Calculate intensity for this projector
    float intensity = calculateProjectorIntensity(
      vWorldPosition,
      projectorPositions[i],
      projectorDirections[i],
      projectorFOVs[i]
    );

    // Apply edge blending
    float edgeBlend = 1.0;
    if (enableEdgeBlend[i]) {
      edgeBlend = calculateEdgeBlend(projectorUV, edgeBlendZones[i]);
    }

    // Sample projection texture
    vec4 projectedColor = texture2D(projectionTextures[i], projectorUV);
    projectedColor.rgb *= projectorBrightness[i];

    // Weight by intensity and edge blend
    float weight = intensity * edgeBlend;
    totalProjectedColor += projectedColor.rgb * weight;
    totalIntensity += weight;
  }

  // Normalize if we have contributions from multiple projectors
  if (totalIntensity > 0.0) {
    totalProjectedColor /= max(totalIntensity, overlapBlendFactor);
  }

  // Surface ambient
  vec3 ambient = surfaceColor * ambientIntensity;

  // Final color
  vec3 finalColor = ambient + totalProjectedColor * (1.0 - surfaceReflectivity);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

// Depth-based projection shader for improved realism
export const depthAwareVertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec4 vProjectorPosition;
varying float vDepth;

uniform mat4 projectorMatrix;
uniform mat4 projectorWorldMatrix;

void main() {
  vUv = uv;
  vPosition = position;
  vNormal = normalize(normalMatrix * normal);

  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;

  vProjectorPosition = projectorMatrix * projectorWorldMatrix * worldPosition;

  // Calculate depth from projector
  vec3 projectorPos = (projectorWorldMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  vDepth = length(worldPosition.xyz - projectorPos);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const depthAwareFragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec4 vProjectorPosition;
varying float vDepth;

uniform sampler2D projectionTexture;
uniform sampler2D depthTexture;
uniform vec3 projectorPosition;
uniform vec3 projectorDirection;
uniform float projectorFOV;
uniform float projectorBrightness;
uniform float nearPlane;
uniform float farPlane;
uniform float ambientIntensity;
uniform float surfaceReflectivity;
uniform vec3 surfaceColor;
uniform bool enableDepthTest;

float linearizeDepth(float depth, float near, float far) {
  return (2.0 * near) / (far + near - depth * (far - near));
}

void main() {
  vec3 projCoords = vProjectorPosition.xyz / vProjectorPosition.w;
  projCoords = projCoords * 0.5 + 0.5;

  if (projCoords.x < 0.0 || projCoords.x > 1.0 ||
      projCoords.y < 0.0 || projCoords.y > 1.0 ||
      projCoords.z < 0.0 || projCoords.z > 1.0) {
    vec3 ambient = surfaceColor * ambientIntensity;
    gl_FragColor = vec4(ambient, 1.0);
    return;
  }

  vec2 projectorUV = projCoords.xy;

  // Depth testing for occlusion
  float projectedDepth = 0.0;
  if (enableDepthTest) {
    float sampledDepth = texture2D(depthTexture, projectorUV).r;
    projectedDepth = linearizeDepth(sampledDepth, nearPlane, farPlane);

    // If current fragment is behind what's in the depth buffer, it's occluded
    if (vDepth > projectedDepth + 0.1) {
      vec3 ambient = surfaceColor * ambientIntensity;
      gl_FragColor = vec4(ambient, 1.0);
      return;
    }
  }

  // Standard projection calculation
  vec3 toProjector = normalize(projectorPosition - vWorldPosition);
  float distance = length(projectorPosition - vWorldPosition);

  float angle = acos(dot(toProjector, -projectorDirection));
  float maxAngle = projectorFOV * 0.5 * 3.14159 / 180.0;

  float angleFalloff = 1.0 - smoothstep(0.0, maxAngle, angle);
  float distanceFalloff = 1.0 / (1.0 + distance * distance * 0.01);
  float surfaceAngle = max(0.0, dot(vNormal, toProjector));

  float intensity = angleFalloff * distanceFalloff * surfaceAngle;

  vec4 projectedColor = texture2D(projectionTexture, projectorUV);
  projectedColor.rgb *= projectorBrightness;

  vec3 ambient = surfaceColor * ambientIntensity;
  vec3 finalColor = ambient + projectedColor.rgb * intensity * (1.0 - surfaceReflectivity);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

// Utility function to create shader materials
export function createProjectionMaterial(
  projectionTexture: THREE.Texture,
  projectorPosition: THREE.Vector3,
  projectorDirection: THREE.Vector3,
  options: {
    fov?: number
    brightness?: number
    surfaceColor?: THREE.Color
    surfaceReflectivity?: number
    surfaceRoughness?: number
    ambientIntensity?: number
    enableKeystone?: boolean
    keystoneCorrection?: [number, number, number, number]
    enableEdgeBlend?: boolean
    edgeBlendZones?: [number, number, number, number]
    edgeBlendGamma?: number
  } = {}
) {
  const {
    fov = 45,
    brightness = 1.0,
    surfaceColor = new THREE.Color(0x808080),
    surfaceReflectivity = 0.1,
    surfaceRoughness = 0.5,
    ambientIntensity = 0.2,
    enableKeystone = false,
    keystoneCorrection = [0, 0, 0, 0],
    enableEdgeBlend = false,
    edgeBlendZones = [0.1, 0.1, 0.1, 0.1],
    edgeBlendGamma = 2.2
  } = options

  return new THREE.ShaderMaterial({
    vertexShader: projectionVertexShader,
    fragmentShader: projectionFragmentShader,
    uniforms: {
      projectionTexture: { value: projectionTexture },
      surfaceTexture: { value: null },
      projectorPosition: { value: projectorPosition },
      projectorDirection: { value: projectorDirection },
      projectorFOV: { value: fov },
      projectorBrightness: { value: brightness },
      ambientIntensity: { value: ambientIntensity },
      surfaceReflectivity: { value: surfaceReflectivity },
      surfaceRoughness: { value: surfaceRoughness },
      surfaceColor: { value: surfaceColor },
      enableKeystone: { value: enableKeystone },
      keystoneCorrection: { value: new THREE.Vector4(...keystoneCorrection) },
      enableEdgeBlend: { value: enableEdgeBlend },
      edgeBlendZones: { value: new THREE.Vector4(...edgeBlendZones) },
      edgeBlendGamma: { value: edgeBlendGamma },
      projectorMatrix: { value: new THREE.Matrix4() },
      projectorWorldMatrix: { value: new THREE.Matrix4() }
    },
    transparent: true,
    side: THREE.DoubleSide
  })
}

export default {
  projectionVertexShader,
  projectionFragmentShader,
  multiProjectorVertexShader,
  multiProjectorFragmentShader,
  depthAwareVertexShader,
  depthAwareFragmentShader,
  createProjectionMaterial
}