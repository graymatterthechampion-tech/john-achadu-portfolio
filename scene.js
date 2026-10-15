const PARTICLE_COUNT_DESKTOP = 9000;
const PARTICLE_COUNT_MOBILE = 4000;
const MOBILE_BREAKPOINT_PX = 768;
const MAX_PIXEL_RATIO_DESKTOP = 2;
const MAX_PIXEL_RATIO_MOBILE = 1.5;
const OPACITY_DESKTOP = 0.55;
const OPACITY_MOBILE = 0.35;
const POINT_SIZE = 3.2;
const MORPH_EASING = 0.07;
const POINTER_EASING = 0.05;
const TRANSITION_START = 0.55;
const IDLE_SPIN_SPEED = 0.04;
const NARROW_ASPECT = 0.9;
const MIN_SHAPE_SCALE = 0.55;
const SIGNAL_COLOR = "#5CF2C0";
const VOLT_COLOR = "#8B7CFF";
const SHAPE_COUNT = 6;
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

  varying float vMix;

  void main() {
    vec3 p = position;
    p = mix(p, aShape1, clamp(uProgress, 0.0, 1.0));
    p = mix(p, aShape2, clamp(uProgress - 1.0, 0.0, 1.0));
    p = mix(p, aShape3, clamp(uProgress - 2.0, 0.0, 1.0));
    p = mix(p, aShape4, clamp(uProgress - 3.0, 0.0, 1.0));
    p = mix(p, aShape5, clamp(uProgress - 4.0, 0.0, 1.0));

    float drift = uTime * 0.6 + aMix * 6.2831;
    p += vec3(sin(drift), cos(drift * 0.8), sin(drift * 1.3)) * 0.015;

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * aScale * uPixelRatio * (6.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    vMix = aMix;
  }
`;

const fragmentShader = `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;

  varying float vMix;

  void main() {
    float distanceFromCenter = length(gl_PointCoord - 0.5);
    if (distanceFromCenter > 0.5) {
      discard;
    }
    float alpha = smoothstep(0.5, 0.1, distanceFromCenter) * uOpacity;
    gl_FragColor = vec4(mix(uColorA, uColorB, vMix), alpha);
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

function waveField(count) {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const x = (Math.random() - 0.5) * 9;
    const z = (Math.random() - 0.5) * 5;
    const y = Math.sin(x * 0.9) * 0.35 + Math.cos(z * 1.4 + x * 0.3) * 0.25 - 1.2;
    setPoint(out, i, x, y, z);
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

function buildShapes(count) {
  return [
    waveField(count),
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
  const count = mobile ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, mobile ? MAX_PIXEL_RATIO_MOBILE : MAX_PIXEL_RATIO_DESKTOP);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, context: gl, alpha: true, antialias: false });
  } catch {
    return;
  }
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 6);

  const shapes = buildShapes(count);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(shapes[0], 3));
  for (let s = 1; s < SHAPE_COUNT; s += 1) {
    geometry.setAttribute(`aShape${s}`, new THREE.BufferAttribute(shapes[s], 3));
  }
  geometry.setAttribute("aMix", new THREE.BufferAttribute(buildColorMix(count), 1));
  geometry.setAttribute("aScale", new THREE.BufferAttribute(buildScales(count), 1));

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uSize: { value: POINT_SIZE },
      uOpacity: { value: mobile ? OPACITY_MOBILE : OPACITY_DESKTOP },
      uColorA: { value: new THREE.Color(SIGNAL_COLOR) },
      uColorB: { value: new THREE.Color(VOLT_COLOR) },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  const sections = Array.from(document.querySelectorAll("main > section"));
  const pointer = { targetX: 0, targetY: 0, x: 0, y: 0 };
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  let targetProgress = computeTargetProgress(sections);
  let currentProgress = targetProgress;
  let frameId = 0;
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
    const shapeScale = Math.min(Math.max(camera.aspect / NARROW_ASPECT, MIN_SHAPE_SCALE), 1);
    points.scale.setScalar(shapeScale);
    targetProgress = computeTargetProgress(sections);
  };

  const onScroll = () => {
    targetProgress = computeTargetProgress(sections);
  };

  const onPointerMove = (event) => {
    pointer.targetX = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.targetY = (event.clientY / window.innerHeight) * 2 - 1;
  };

  const renderFrame = () => {
    const elapsed = (performance.now() - startTime) / 1000;
    currentProgress += (targetProgress - currentProgress) * MORPH_EASING;
    pointer.x += (pointer.targetX - pointer.x) * POINTER_EASING;
    pointer.y += (pointer.targetY - pointer.y) * POINTER_EASING;

    material.uniforms.uProgress.value = currentProgress;
    material.uniforms.uTime.value = elapsed;
    points.rotation.y = elapsed * IDLE_SPIN_SPEED + pointer.x * 0.25;
    points.rotation.x = pointer.y * 0.15;

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
