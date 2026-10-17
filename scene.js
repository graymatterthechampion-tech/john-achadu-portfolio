const PARTICLE_COUNT_DESKTOP = 26000;
const PARTICLE_COUNT_MOBILE = 12000;
const PARTICLE_COUNT_LOW_END = 6000;
const LOW_END_MEMORY_GB = 2;
const LOW_END_CORES = 2;
const QUALITY_WARMUP_FRAMES = 60;
const QUALITY_SAMPLE_FRAMES = 120;
const SLOW_FRAME_MS = 34;
const MAX_SAMPLE_GAP_MS = 250;
const REDUCED_PARTICLE_SHARE = 0.5;
const MOBILE_BREAKPOINT_PX = 768;
const MAX_PIXEL_RATIO_DESKTOP = 2;
const MAX_PIXEL_RATIO_MOBILE = 1.5;
const OPACITY_DESKTOP = 0.75;
const OPACITY_MOBILE = 0.6;
const POINT_SIZE = 3.6;
const MORPH_EASING = 0.07;
const POINTER_EASING = 0.05;
const TRANSITION_START = 0.7;
const IDLE_SPIN_SPEED = 0.04;
const NARROW_ASPECT = 0.9;
const MIN_SHAPE_SCALE = 0.55;
const INK_COLOR = "#1F1F23";
const ACCENT_COLOR = "#0A6B58";
const SHAPE_COUNT = 6;
const METEOR_SLOTS = 3;
const METEOR_TAIL_POINTS = 96;
const METEOR_DURATION_S = 1.2;
const METEOR_TRAVEL = 4.5;
const METEOR_TAIL_LENGTH = 1.6;
const METEOR_MIN_GAP_S = 2.5;
const METEOR_MAX_GAP_S = 6;
const METEOR_HEAD_SIZE = 7;
const METEOR_TAIL_SIZE = 1.5;
const CAMERA_FOV = 50;
const MOUNTAIN_OCTAVES = 5;
const MOUNTAIN_HEIGHT = 2.8;
const CAMERA_DISTANCE = 8.9;
const MOUNTAIN_NEAR_Z = 2.5;
const MOUNTAIN_FAR_Z = -20;
const MOUNTAIN_BASE = -4.8;
const MOUNTAIN_FAR_GROWTH = 2;
const MOUNTAIN_COVER_MARGIN = 1.2;
const MOUNTAIN_MIN_COVER = 0.8;
const MOUNTAIN_MAX_COVER = 2.6;
const MOUNTAIN_DEPTH_BIAS = 1.8;
const MOUNTAIN_FOREGROUND_FLOOR = 0.2;
const MOUNTAIN_FOREGROUND_RISE = 0.25;
const MOUNTAIN_FLOOR_KEEP = 0.15;
const MOUNTAIN_NOISE_SCALE = 0.28;
const HEIGHTMAP_URL = "assets/chappal-waddi-heightmap.png";
const HEIGHTMAP_TIMEOUT_MS = 4000;
const TERRAIN_HALF_WIDTH = 36;
const TERRAIN_SUMMIT_X = 6;
const TERRAIN_RELIEF = 4.7;
const STIPPLE_FLOOR = 0.015;
const STIPPLE_SLOPE_START = 0.05;
const STIPPLE_SLOPE_FULL = 0.3;
const SUNLIT_THRESHOLD = 0.93;
const SUN_DIRECTION = { x: -0.6, y: 0.6, z: 0.55 };
const SKY_DUST_SHARE = 0.006;
const SKY_DUST_NEAR_Z = -16;
const SKY_DUST_FAR_Z = -20;
const MOBILE_POINT_SCALE = 1.4;
const TERRAIN_TILT = 0.14;
const TERRAIN_TILT_PIVOT_Z = -6;
const FOG_NEAR = 18;
const FOG_FAR = 32;
const PULSE_PERIOD_S = 7;
const PULSE_REACH = 36;
const PULSE_WIDTH = 1.8;
const PULSE_COLOR = "#14A889";
const TAU = Math.PI * 2;


const vertexShader = `
  attribute vec3 aShape1;
  attribute vec3 aShape2;
  attribute vec3 aShape3;
  attribute vec3 aShape4;
  attribute vec3 aShape5;
  attribute float aMix;
  attribute float aScale;

  uniform float uProgress;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform vec2 uPulseOrigin;
  uniform float uPulsePeriod;
  uniform float uPulseReach;
  uniform float uPulseWidth;

  varying float vMix;
  varying float vFog;
  varying float vPulse;

  void main() {
    vec3 p = position;
    float heroHold = 1.0 - clamp(uProgress, 0.0, 1.0);
    float cycle = fract(uTime / uPulsePeriod);
    float ringDistance = distance(position.xz, uPulseOrigin);
    float ring = exp(-pow((ringDistance - cycle * uPulseReach) / uPulseWidth, 2.0));
    float pulse = ring * (1.0 - cycle) * heroHold;
    p.y += sin(uTime * 0.4) * 0.1;
    p.y += pulse * 0.15;
    p.y += sin(position.x * 0.25 + uTime * 0.3) * cos(position.z * 0.2 + uTime * 0.23) * 0.04 * heroHold;
    p = mix(p, aShape1, clamp(uProgress, 0.0, 1.0));
    p = mix(p, aShape2, clamp(uProgress - 1.0, 0.0, 1.0));
    p = mix(p, aShape3, clamp(uProgress - 2.0, 0.0, 1.0));
    p = mix(p, aShape4, clamp(uProgress - 3.0, 0.0, 1.0));
    p = mix(p, aShape5, clamp(uProgress - 4.0, 0.0, 1.0));

    float drift = uTime * 0.6 + aMix * 6.2831;
    p += vec3(sin(drift), cos(drift * 0.8), sin(drift * 1.3)) * 0.015;

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    float depth = max(-mvPosition.z, 1.0);
    gl_PointSize = uSize * aScale * uPixelRatio * pow(6.0 / depth, 0.5) * (1.0 + pulse * 0.8);
    gl_Position = projectionMatrix * mvPosition;
    vMix = aMix;
    vFog = 1.0 - smoothstep(uFogNear, uFogFar, depth);
    vPulse = pulse;
  }
`;

const fragmentShader = `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uPulseColor;
  uniform float uOpacity;

  varying float vMix;
  varying float vFog;
  varying float vPulse;

  void main() {
    float distanceFromCenter = length(gl_PointCoord - 0.5);
    if (distanceFromCenter > 0.5) {
      discard;
    }
    float glow = clamp(vPulse, 0.0, 1.0);
    float alpha = smoothstep(0.5, 0.1, distanceFromCenter) * uOpacity * vFog * (1.0 + glow * 1.5);
    vec3 baseColor = mix(uColorA, uColorB, vMix);
    gl_FragColor = vec4(mix(baseColor, uPulseColor, glow), alpha);
    #include <colorspace_fragment>
  }
`;
const meteorVertexShader = `
attribute float aAlpha;
attribute float aSize;

uniform float uPixelRatio;

varying float vAlpha;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * uPixelRatio * (6.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
  vAlpha = aAlpha;
}
`;

const meteorFragmentShader = `
uniform vec3 uColor;

varying float vAlpha;

void main() {
float distanceFromCenter = length(gl_PointCoord - 0.5);
if(distanceFromCenter > 0.5) {
  discard;
}
  float alpha = smoothstep(0.5, 0.0, distanceFromCenter) * vAlpha;
  gl_FragColor = vec4(uColor, alpha);
  #include <colorspace_fragment>
}
`;

function smoothstep(edge0, edge1, value) {
  const t = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

function jitter(amount) {
  return (Math.random() - 0.5) * amount;
}

function setPoint(out, index, x, y, z) {
  out[index * 3] = x;
  out[index * 3 + 1] = y;
  out[index * 3 + 2] = z;
}

function hash2(ix, iz) {
  const s = Math.sin(ix * 127.1 + iz * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function smoothNoise(x, z) {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx);
  const uz = fz * fz * (3 - 2 * fz);
  const a = hash2(ix, iz);
  const b = hash2(ix + 1, iz);
  const c = hash2(ix, iz + 1);
  const d = hash2(ix + 1, iz + 1);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}

function ridgedHeight(x, z) {
  let height = 0;
  let amplitude = 1;
  let frequency = 0.45;
  let total = 0;
  for (let octave = 0; octave < MOUNTAIN_OCTAVES; octave += 1) {
    const n = smoothNoise(x * frequency, z * frequency);
    const ridge = 1 - Math.abs(n * 2 - 1);
    height += ridge * ridge * amplitude;
    total += amplitude;
    amplitude *= 0.5;
    frequency *= 2.1;
  }
  return height / total;
}

async function loadHeightmap(url) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), HEIGHTMAP_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      return null;
    }
    const bitmap = await createImageBitmap(await response.blob());
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      return null;
    }
    context.drawImage(bitmap, 0, 0);
    const pixels = context.getImageData(0, 0, bitmap.width, bitmap.height).data;
    const heights = new Float32Array(bitmap.width * bitmap.height);
    for (let i = 0; i < heights.length; i += 1) {
      heights[i] = pixels[i * 4] / 255;
    }
    return { width: bitmap.width, height: bitmap.height, heights };
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

function sampleHeightmap(map, u, v) {
  const x = Math.min(Math.max(u, 0), 1) * (map.width - 1);
  const y = Math.min(Math.max(v, 0), 1) * (map.height - 1);
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(x0 + 1, map.width - 1);
  const y1 = Math.min(y0 + 1, map.height - 1);
  const fx = x - x0;
  const fy = y - y0;
  const top = map.heights[y0 * map.width + x0] * (1 - fx) + map.heights[y0 * map.width + x1] * fx;
  const bottom = map.heights[y1 * map.width + x0] * (1 - fx) + map.heights[y1 * map.width + x1] * fx;
  return top * (1 - fy) + bottom * fy;
}

function terrainSummitX(aspect) {
  return aspect > 1 ? TERRAIN_SUMMIT_X : 0;
}

function terrainHeight(x, z, heightmap, summitX) {
  if (heightmap === null) {
    return ridgedHeight(x * MOUNTAIN_NOISE_SCALE + 3.7, z * MOUNTAIN_NOISE_SCALE + 1.3);
  }
  const u = (x - summitX + TERRAIN_HALF_WIDTH) / (2 * TERRAIN_HALF_WIDTH);
  const v = (z - MOUNTAIN_FAR_Z) / (MOUNTAIN_NEAR_Z - MOUNTAIN_FAR_Z);
  return sampleHeightmap(heightmap, u, v);
}

function foregroundFactor(depthT) {
  return MOUNTAIN_FOREGROUND_FLOOR + (1 - MOUNTAIN_FOREGROUND_FLOOR) * smoothstep(0, MOUNTAIN_FOREGROUND_RISE, depthT);
}

function tiltTerrain(y, z) {
  const dz = z - TERRAIN_TILT_PIVOT_Z;
  return {
    y: y * Math.cos(TERRAIN_TILT) - dz * Math.sin(TERRAIN_TILT),
    z: TERRAIN_TILT_PIVOT_Z + dz * Math.cos(TERRAIN_TILT) + y * Math.sin(TERRAIN_TILT),
  };
}

function terrainNormal(x, z, heightmap, summitX) {
  const stepX = (2 * TERRAIN_HALF_WIDTH) / (heightmap.width - 1);
  const stepZ = (MOUNTAIN_NEAR_Z - MOUNTAIN_FAR_Z) / (heightmap.height - 1);
  const slopeX = ((terrainHeight(x + stepX, z, heightmap, summitX) - terrainHeight(x - stepX, z, heightmap, summitX)) * TERRAIN_RELIEF) / (2 * stepX);
  const slopeZ = ((terrainHeight(x, z + stepZ, heightmap, summitX) - terrainHeight(x, z - stepZ, heightmap, summitX)) * TERRAIN_RELIEF) / (2 * stepZ);
  const length = Math.hypot(slopeX, 1, slopeZ);
  return { x: -slopeX / length, y: 1 / length, z: -slopeZ / length };
}

function sunlight(normal) {
  const length = Math.hypot(SUN_DIRECTION.x, SUN_DIRECTION.y, SUN_DIRECTION.z);
  return (normal.x * SUN_DIRECTION.x + normal.y * SUN_DIRECTION.y + normal.z * SUN_DIRECTION.z) / length;
}

function terrainStipple(count, aspect, heightmap) {
  const positions = new Float32Array(count * 3);
  const mix = new Float32Array(count);
  const halfTan = Math.tan((CAMERA_FOV * Math.PI) / 360);
  const cover = Math.min(Math.max(aspect * MOUNTAIN_COVER_MARGIN, MOUNTAIN_MIN_COVER), MOUNTAIN_MAX_COVER);
  const summitX = terrainSummitX(aspect);
  const skyCount = Math.floor(count * SKY_DUST_SHARE);
  const groundCount = count - skyCount;
  const maxAttempts = groundCount * 40;
  let placed = 0;
  let attempts = 0;
  while (placed < groundCount) {
    attempts += 1;
    const depthT = Math.pow(Math.random(), MOUNTAIN_DEPTH_BIAS);
    const z = MOUNTAIN_NEAR_Z + (MOUNTAIN_FAR_Z - MOUNTAIN_NEAR_Z) * depthT;
    const halfWidth = halfTan * (CAMERA_DISTANCE - z) * cover;
    const x = (Math.random() * 2 - 1) * halfWidth;
    const normal = terrainNormal(x, z, heightmap, summitX);
    const steepness = 1 - normal.y;
    const keepChance = STIPPLE_FLOOR + (1 - STIPPLE_FLOOR) * smoothstep(STIPPLE_SLOPE_START, STIPPLE_SLOPE_FULL, steepness);
    if (attempts < maxAttempts && Math.random() > keepChance) {
      continue;
    }
    const y = MOUNTAIN_BASE + terrainHeight(x, z, heightmap, summitX) * TERRAIN_RELIEF * foregroundFactor(depthT);
    const tilted = tiltTerrain(y, z);
    setPoint(positions, placed, x, tilted.y, tilted.z);
    const sunlit = sunlight(normal) > SUNLIT_THRESHOLD && steepness > STIPPLE_SLOPE_START;
    mix[placed] = sunlit ? 0.7 + Math.random() * 0.3 : Math.random() * 0.3;
    placed += 1;
  }
  for (let i = 0; i < skyCount; i += 1) {
    const z = SKY_DUST_NEAR_Z + (SKY_DUST_FAR_Z - SKY_DUST_NEAR_Z) * Math.random();
    const halfHeight = halfTan * (CAMERA_DISTANCE - z);
    const halfWidth = halfHeight * cover;
    setPoint(positions, placed, (Math.random() * 2 - 1) * halfWidth, halfHeight * (0.15 + 0.85 * Math.random()), z);
    mix[placed] = Math.random() * 0.3;
    placed += 1;
  }
  return { positions, mix };
}

function terrainSummit(heightmap, aspect) {
  let highest = 0;
  for (let i = 1; i < heightmap.heights.length; i += 1) {
    if (heightmap.heights[i] > heightmap.heights[highest]) {
      highest = i;
    }
  }
  const u = (highest % heightmap.width) / (heightmap.width - 1);
  const v = Math.floor(highest / heightmap.width) / (heightmap.height - 1);
  const x = u * 2 * TERRAIN_HALF_WIDTH - TERRAIN_HALF_WIDTH + terrainSummitX(aspect);
  const z = MOUNTAIN_FAR_Z + v * (MOUNTAIN_NEAR_Z - MOUNTAIN_FAR_Z);
  const depthT = (z - MOUNTAIN_NEAR_Z) / (MOUNTAIN_FAR_Z - MOUNTAIN_NEAR_Z);
  const y = MOUNTAIN_BASE + TERRAIN_RELIEF * foregroundFactor(depthT);
  return { x, z: tiltTerrain(y, z).z };
}

function mountainRange(count, aspect) {
  const out = new Float32Array(count * 3);
  const halfTan = Math.tan((CAMERA_FOV * Math.PI) / 360);
  const cover = Math.min(Math.max(aspect * MOUNTAIN_COVER_MARGIN, MOUNTAIN_MIN_COVER), MOUNTAIN_MAX_COVER);
  let placed = 0;
  let attempts = 0;
  const maxAttempts = count * 30;
  while (placed < count) {
    attempts += 1;
    const depthT = Math.pow(Math.random(), MOUNTAIN_DEPTH_BIAS);
    const z = MOUNTAIN_NEAR_Z + (MOUNTAIN_FAR_Z - MOUNTAIN_NEAR_Z) * depthT;
    const halfWidth = halfTan * (CAMERA_DISTANCE - z) * cover;
    const x = (Math.random() * 2 - 1) * halfWidth;
    const h = terrainHeight(x, z, null, 0);
    const keepChance = MOUNTAIN_FLOOR_KEEP + h * h * h * h * 6;
    if (attempts < maxAttempts && Math.random() > keepChance) {
      continue;
    }
    const foreground = foregroundFactor(depthT);
    const y = MOUNTAIN_BASE + h * MOUNTAIN_HEIGHT * (1 + depthT * MOUNTAIN_FAR_GROWTH) * foreground;
    setPoint(out, placed, x, y, z);
    placed += 1;
  }
  return out;
}


function fibonacciSphere(count, radius) {
  const out = new Float32Array(count * 3);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const lastIndex = Math.max(count - 1, 1);
  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / lastIndex) * 2;
    const ringRadius = Math.sqrt(Math.max(1 - y * y, 0));
    const theta = goldenAngle * i;
    setPoint(out, i, Math.cos(theta) * ringRadius * radius, y * radius, Math.sin(theta) * ringRadius * radius);
  }
  return out;
}

function latticeCube(count, size) {
  const out = new Float32Array(count * 3);
  const half = size / 2;
  const gridStep = size / 4;
  for (let i = 0; i < count; i += 1) {
    const face = Math.floor(Math.random() * 6);
    const axis = face % 3;
    const side = face < 3 ? half : -half;
    let u = (Math.random() - 0.5) * size;
    let v = (Math.random() - 0.5) * size;
    if (i % 2 === 0) {
      u = Math.round(u / gridStep) * gridStep;
    } else {
      v = Math.round(v / gridStep) * gridStep;
    }
    if (axis === 0) {
      setPoint(out, i, side, u, v);
    } else if (axis === 1) {
      setPoint(out, i, u, side, v);
    } else {
      setPoint(out, i, u, v, side);
    }
  }
  return out;
}

function randomPointInSphere(radius) {
  const theta = Math.random() * TAU;
  const phi = Math.acos(2 * Math.random() - 1);
  const r = radius * Math.cbrt(Math.random());
  return {
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.sin(phi) * Math.sin(theta),
    z: r * Math.cos(phi),
  };
}

function distanceBetween(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function networkGraph(count, nodeCount, radius) {
  const out = new Float32Array(count * 3);
  const nodes = [];
  for (let n = 0; n < nodeCount; n += 1) {
    nodes.push(randomPointInSphere(radius));
  }

  const edges = [];
  for (let n = 0; n < nodeCount; n += 1) {
    const neighbours = nodes
      .map((node, index) => ({ index, distance: distanceBetween(nodes[n], node) }))
      .filter((entry) => entry.index !== n)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 2);
    for (const neighbour of neighbours) {
      edges.push([nodes[n], nodes[neighbour.index]]);
    }
  }

  for (let i = 0; i < count; i += 1) {
    if (i % 10 < 6 || edges.length === 0) {
      const node = nodes[i % nodeCount];
      const spread = 0.12;
      setPoint(
        out,
        i,
        node.x + (Math.random() + Math.random() + Math.random() - 1.5) * spread,
        node.y + (Math.random() + Math.random() + Math.random() - 1.5) * spread,
        node.z + (Math.random() + Math.random() + Math.random() - 1.5) * spread,
      );
    } else {
      const [start, end] = edges[i % edges.length];
      const t = Math.random();
      setPoint(
        out,
        i,
        start.x + (end.x - start.x) * t + jitter(0.02),
        start.y + (end.y - start.y) * t + jitter(0.02),
        start.z + (end.z - start.z) * t + jitter(0.02),
      );
    }
  }
  return out;
}

function doubleHelix(count, radius, height, turns) {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const t = Math.random();
    const angle = t * turns * TAU;
    const y = (t - 0.5) * height;
    if (i % 8 === 0) {
      const across = Math.random() * 2 - 1;
      setPoint(out, i, Math.cos(angle) * radius * across, y, Math.sin(angle) * radius * across);
    } else {
      const strandAngle = angle + (i % 2) * Math.PI;
      setPoint(
        out,
        i,
        Math.cos(strandAngle) * radius + jitter(0.06),
        y + jitter(0.06),
        Math.sin(strandAngle) * radius + jitter(0.06),
      );
    }
  }
  return out;
}

function envelopeShape(count, width, height) {
  const out = new Float32Array(count * 3);
  const left = -width / 2;
  const right = width / 2;
  const top = height / 2;
  const bottom = -height / 2;
  const flapTip = { x: 0, y: -height * 0.12 };
  const segments = [
    [{ x: left, y: top }, { x: right, y: top }],
    [{ x: right, y: top }, { x: right, y: bottom }],
    [{ x: right, y: bottom }, { x: left, y: bottom }],
    [{ x: left, y: bottom }, { x: left, y: top }],
    [{ x: left, y: top }, flapTip],
    [{ x: right, y: top }, flapTip],
  ];
  const lengths = segments.map(([a, b]) => Math.hypot(b.x - a.x, b.y - a.y));
  const totalLength = lengths.reduce((sum, length) => sum + length, 0);

  for (let i = 0; i < count; i += 1) {
    if (i % 10 < 7) {
      let pick = Math.random() * totalLength;
      let segmentIndex = 0;
      while (segmentIndex < segments.length - 1 && pick > lengths[segmentIndex]) {
        pick -= lengths[segmentIndex];
        segmentIndex += 1;
      }
      const [a, b] = segments[segmentIndex];
      const t = Math.random();
      setPoint(out, i, a.x + (b.x - a.x) * t + jitter(0.03), a.y + (b.y - a.y) * t + jitter(0.03), jitter(0.08));
    } else {
      setPoint(out, i, left + Math.random() * width, bottom + Math.random() * height, jitter(0.15));
    }
  }
  return out;
}

function findHighestPoint(positions) {
  let highest = 0;
  const total = positions.length / 3;
  for (let i = 1; i < total; i += 1) {
    if (positions[i * 3 + 1] > positions[highest * 3 + 1]) {
      highest = i;
    }
  }
  return { x: positions[highest * 3], z: positions[highest * 3 + 2] };
}

function buildShapes(count, aspect, terrain) {
  return [
    terrain === null ? mountainRange(count, aspect) : terrain.positions,
    fibonacciSphere(count, 1.7),
    latticeCube(count, 2.4),
    networkGraph(count, 26, 1.9),
    doubleHelix(count, 0.9, 4.2, 2.5),
    envelopeShape(count, 3.6, 2.3),
  ];
}

function buildColorMix(count) {
  const out = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    out[i] = Math.random() < 0.7 ? Math.random() * 0.3 : 0.7 + Math.random() * 0.3;
  }
  return out;
}

function buildScales(count) {
  const out = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    out[i] = 0.6 + Math.random() * 0.8;
  }
  return out;
}

function computeTargetProgress(sections) {
  const focusLine = window.innerHeight * 0.5;
  let progress = 0;
  for (let i = 0; i < sections.length; i += 1) {
    const rect = sections[i].getBoundingClientRect();
    if (rect.top <= focusLine) {
      const local = rect.height > 0 ? (focusLine - rect.top) / rect.height : 1;
      progress = i + smoothstep(TRANSITION_START, 1, local);
    }
  }
  return Math.min(Math.max(progress, 0), SHAPE_COUNT - 1);
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isMobileViewport() {
  return window.innerWidth < MOBILE_BREAKPOINT_PX;
}

function isLowEndDevice() {
  const memory = navigator.deviceMemory;
  const cores = navigator.hardwareConcurrency;
  const lowMemory = typeof memory === "number" && memory <= LOW_END_MEMORY_GB;
  const fewCores = typeof cores === "number" && cores <= LOW_END_CORES;
  return lowMemory || fewCores;
}

function createFrameMonitor(onSlow) {
  let frames = 0;
  let sampled = 0;
  let totalMs = 0;
  let finished = false;
  return (frameMs) => {
    if (finished) {
      return;
    }
    frames += 1;
    if (frames <= QUALITY_WARMUP_FRAMES || frameMs > MAX_SAMPLE_GAP_MS) {
      return;
    }
    totalMs += frameMs;
    sampled += 1;
    if (sampled < QUALITY_SAMPLE_FRAMES) {
      return;
    }
    finished = true;
    if (totalMs / sampled > SLOW_FRAME_MS) {
      onSlow();
    }
  };
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function visibleSizeAtOrigin(aspect) {
  const height = 2 * Math.tan((CAMERA_FOV * Math.PI) / 360) * CAMERA_DISTANCE;
  return { width: height * aspect, height };
}

function createMeteorShower(THREE, pixelRatio) {
  const total = METEOR_SLOTS * METEOR_TAIL_POINTS;
  const positions = new Float32Array(total * 3);
  const alphas = new Float32Array(total);
  const sizes = new Float32Array(total);

  const geometry = new THREE.BufferGeometry();
  const positionAttribute = new THREE.BufferAttribute(positions, 3);
  const alphaAttribute = new THREE.BufferAttribute(alphas, 1);
  const sizeAttribute = new THREE.BufferAttribute(sizes, 1);
  positionAttribute.setUsage(THREE.DynamicDrawUsage);
  alphaAttribute.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute("position", positionAttribute);
  geometry.setAttribute("aAlpha", alphaAttribute);
  geometry.setAttribute("aSize", sizeAttribute);

  const material = new THREE.ShaderMaterial({
    vertexShader: meteorVertexShader,
    fragmentShader: meteorFragmentShader,
    uniforms: {
      uPixelRatio: { value: pixelRatio },
      uColor: { value: new THREE.Color(ACCENT_COLOR) },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  const object = new THREE.Points(geometry, material);
  object.frustumCulled = false;

  const meteors = [];
  for (let slot = 0; slot < METEOR_SLOTS; slot += 1) {
    meteors.push({ active: false, startTime: 0, startX: 0, startY: 0, startZ: 0, dirX: 0, dirY: 0 });
  }
  let nextLaunchAt = randomBetween(1, METEOR_MIN_GAP_S);

  for (let i = 0; i < total; i += 1) {
    const t = (i % METEOR_TAIL_POINTS) / (METEOR_TAIL_POINTS - 1);
    sizes[i] = METEOR_HEAD_SIZE + (METEOR_TAIL_SIZE - METEOR_HEAD_SIZE) * t;
  }

  const launch = (meteor, elapsed, aspect) => {
    const view = visibleSizeAtOrigin(aspect);
    const angle = randomBetween(0.5, 0.9);
    meteor.active = true;
    meteor.startTime = elapsed;
    const fromLeft = Math.random() < 0.5;
    meteor.startX = fromLeft
      ? randomBetween(-view.width / 2 - 0.5, -view.width / 6)
      : randomBetween(view.width / 6, view.width / 2 + 0.5);
    meteor.startY = randomBetween(view.height * 0.2, view.height / 2 + 0.3);
    meteor.startZ = randomBetween(-1.5, 0.5);
    meteor.dirX = fromLeft ? Math.cos(angle) : -Math.cos(angle);
    meteor.dirY = -Math.sin(angle);
  };

  const update = (elapsed, aspect, intensity) => {
    if (elapsed >= nextLaunchAt) {
      const idle = meteors.find((meteor) => !meteor.active);
      if (idle && intensity > 0.05) {
        launch(idle, elapsed, aspect);
      }
      nextLaunchAt = elapsed + randomBetween(METEOR_MIN_GAP_S, METEOR_MAX_GAP_S);
    }

    for (let slot = 0; slot < METEOR_SLOTS; slot += 1) {
      const meteor = meteors[slot];
      const life = meteor.active ? (elapsed - meteor.startTime) / METEOR_DURATION_S : 1;
      if (meteor.active && life >= 1) {
        meteor.active = false;
      }
      const envelope = meteor.active ? smoothstep(0, 0.15, life) * (1 - smoothstep(0.7, 1, life)) * intensity : 0;
      const headDistance = life * METEOR_TRAVEL;
      const tailLength = METEOR_TAIL_LENGTH * Math.min(life * 4, 1);

      for (let j = 0; j < METEOR_TAIL_POINTS; j += 1) {
        const index = slot * METEOR_TAIL_POINTS + j;
        const t = j / (METEOR_TAIL_POINTS - 1);
        const distance = headDistance - t * tailLength;
        positions[index * 3] = meteor.startX + meteor.dirX * distance;
        positions[index * 3 + 1] = meteor.startY + meteor.dirY * distance;
        positions[index * 3 + 2] = meteor.startZ;
        alphas[index] = (1 - t) * (1 - t) * envelope;
      }
    }

    positionAttribute.needsUpdate = true;
    alphaAttribute.needsUpdate = true;
  };

  return { object, update };
}


async function startScene() {
  const canvas = document.getElementById("scene");
  if (!(canvas instanceof HTMLCanvasElement)) {
    return;
  }
  if (prefersReducedMotion()) {
    return;
  }

  let gl = null;
  try {
    gl = canvas.getContext("webgl2", { alpha: true, antialias: false, powerPreference: "low-power" });
  } catch {
    gl = null;
  }
  if (gl === null) {
    return;
  }

  let THREE;
  try {
    THREE = await import("three");
  } catch {
    return;
  }

  const mobile = isMobileViewport();
  const lowEnd = isLowEndDevice();
  let count = mobile ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
  let maxPixelRatio = mobile ? MAX_PIXEL_RATIO_MOBILE : MAX_PIXEL_RATIO_DESKTOP;
  if (lowEnd) {
    count = PARTICLE_COUNT_LOW_END;
    maxPixelRatio = 1;
  }
  const pixelRatio = Math.min(window.devicePixelRatio || 1, maxPixelRatio);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, context: gl, alpha: true, antialias: false });
  } catch {
    return;
  }
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 100);
  camera.position.set(0, 0, CAMERA_DISTANCE);

  const viewportAspect = window.innerHeight > 0 ? window.innerWidth / window.innerHeight : 1; 
  const heightmap = await loadHeightmap(HEIGHTMAP_URL);
  const terrain = heightmap === null ? null : terrainStipple(count, viewportAspect, heightmap);
  const shapes = buildShapes(count, viewportAspect, terrain);
  const pulseOrigin = heightmap === null ? findHighestPoint(shapes[0]) : terrainSummit(heightmap, viewportAspect);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(shapes[0], 3));
  for (let s = 1; s < SHAPE_COUNT; s += 1) {
    geometry.setAttribute(`aShape${s}`, new THREE.BufferAttribute(shapes[s], 3));
  }
  geometry.setAttribute("aMix", new THREE.BufferAttribute(terrain === null ? buildColorMix(count) : terrain.mix, 1));
  geometry.setAttribute("aScale", new THREE.BufferAttribute(buildScales(count), 1));

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uSize: { value: mobile ? POINT_SIZE * MOBILE_POINT_SCALE : POINT_SIZE },
      uOpacity: { value: mobile ? OPACITY_MOBILE : OPACITY_DESKTOP },
      uFogNear: { value: FOG_NEAR },
      uFogFar: { value: FOG_FAR },
      uPulseOrigin: { value: new THREE.Vector2(pulseOrigin.x, pulseOrigin.z) },
      uPulsePeriod: { value: PULSE_PERIOD_S },
      uPulseReach: { value: PULSE_REACH },
      uPulseWidth: { value: PULSE_WIDTH },
      uPulseColor: { value: new THREE.Color(PULSE_COLOR) },
      uColorA: { value: new THREE.Color(INK_COLOR) },
      uColorB: { value: new THREE.Color(ACCENT_COLOR) },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  const meteorShower = createMeteorShower(THREE, pixelRatio);
  scene.add(meteorShower.object);

  const sections = Array.from(document.querySelectorAll("main > section"));
  const pointer = { targetX: 0, targetY: 0, x: 0, y: 0 };
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  let targetProgress = computeTargetProgress(sections);
  let currentProgress = targetProgress;
  let frameId = 0;
  let narrowScale = 1;
  let spinAngle = 0;
  let lastFrameTime = performance.now();
  let running = true;
  const startTime = performance.now();

  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width === 0 || height === 0) {
      return;
    }
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    narrowScale = Math.min(Math.max(camera.aspect / NARROW_ASPECT, MIN_SHAPE_SCALE), 1);
    targetProgress = computeTargetProgress(sections);
  };

  const onScroll = () => {
    targetProgress = computeTargetProgress(sections);
  };

  const reduceQuality = () => {
    renderer.setPixelRatio(1);
    material.uniforms.uPixelRatio.value = 1;
    geometry.setDrawRange(0, Math.floor(count * REDUCED_PARTICLE_SHARE));
    canvas.dataset.quality = "reduced";
  };
  const recordFrame = createFrameMonitor(reduceQuality);

  const onPointerMove = (event) => {
    pointer.targetX = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.targetY = (event.clientY / window.innerHeight) * 2 - 1;
  };

  const renderFrame = () => {
    const now = performance.now();
    recordFrame(now - lastFrameTime);
    const elapsed = (now - startTime) / 1000;
    const deltaSeconds = Math.min((now - lastFrameTime) / 1000, 0.1);
    lastFrameTime = now;
    currentProgress += (targetProgress - currentProgress) * MORPH_EASING;
    pointer.x += (pointer.targetX - pointer.x) * POINTER_EASING;
    pointer.y += (pointer.targetY - pointer.y) * POINTER_EASING;

    material.uniforms.uProgress.value = currentProgress;
    material.uniforms.uTime.value = elapsed;
    const heroRelease = smoothstep(0, 1, currentProgress);
    spinAngle += deltaSeconds * IDLE_SPIN_SPEED * heroRelease;
    const wrappedSpin = Math.atan2(Math.sin(spinAngle), Math.cos(spinAngle));
    points.rotation.y = (wrappedSpin + pointer.x * 0.25) * heroRelease;
    points.rotation.x = pointer.y * 0.15 * heroRelease;
    points.scale.setScalar(1 + (narrowScale - 1) * heroRelease);
    meteorShower.update(elapsed, camera.aspect, 1 - Math.min(currentProgress, 1));

    renderer.render(scene, camera);
  };

  const loop = () => {
    if (!running) {
      return;
    }
    renderFrame();
    frameId = window.requestAnimationFrame(loop);
  };

  const stop = () => {
    running = false;
    window.cancelAnimationFrame(frameId);
    window.removeEventListener("resize", resize);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("pointermove", onPointerMove);
    canvas.classList.remove("is-ready");
  };

  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    stop();
  });

  window.addEventListener("resize", resize);
  window.addEventListener("scroll", onScroll, { passive: true });
  if (finePointer) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
  }

  resize();
  loop();
  canvas.classList.add("is-ready");
}

startScene().catch(() => {
  const canvas = document.getElementById("scene");
  if (canvas) {
    canvas.classList.remove("is-ready");
  }
});
