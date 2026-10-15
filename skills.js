const MIN_VIEWPORT_PX = 1024;
const SAMPLE_STEP = 2;
const LABEL_FONT_SIZE = 17;
const LABEL_FONT = `600 ${LABEL_FONT_SIZE}px "JetBrains Mono", monospace`;
const SCATTER_RADIUS = 70;
const REVEAL_RADIUS = 130;
const ASSEMBLE_SPEED = 2.6;
const PARTICLE_LAG = 0.35;
const DRIFT_AMPLITUDE = 7;
const DOT_SIZE = 1.7;
const FONT_WAIT_MS = 1500;
const SCATTERED_RGB = [139, 124, 255];
const ASSEMBLED_RGB = [92, 242, 192];

function clamp01(value) {
  return Math.min(Math.max(value, 0), 1);
}

function smoothstep01(value) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function canRunParticles() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  return !reducedMotion && finePointer && window.innerWidth >= MIN_VIEWPORT_PX;
}

function waitForFonts() {
  if (!document.fonts || !document.fonts.ready) {
    return Promise.resolve();
  }
  const timeout = new Promise((resolve) => {
    window.setTimeout(resolve, FONT_WAIT_MS);
  });
  return Promise.race([document.fonts.ready, timeout]);
}

function sampleLabel(label) {
  const probe = document.createElement("canvas");
  const probeContext = probe.getContext("2d", { willReadFrequently: true });
  if (!probeContext) {
    return [];
  }
  probeContext.font = LABEL_FONT;
  const width = Math.ceil(probeContext.measureText(label).width) + 4;
  const height = Math.ceil(LABEL_FONT_SIZE * 1.6);
  probe.width = width;
  probe.height = height;
  probeContext.font = LABEL_FONT;
  probeContext.textBaseline = "middle";
  probeContext.fillStyle = "#ffffff";
  probeContext.fillText(label, 2, height / 2);

  const pixels = probeContext.getImageData(0, 0, width, height).data;
  const points = [];
  for (let y = 0; y < height; y += SAMPLE_STEP) {
    for (let x = 0; x < width; x += SAMPLE_STEP) {
      const alpha = pixels[(y * width + x) * 4 + 3];
      if (alpha > 128) {
        points.push({ x: x - width / 2, y: y - height / 2 });
      }
    }
  }
  return points;
}

function readRotationRadians(chip) {
  const raw = chip.style.getPropertyValue("--rot").trim();
  const degrees = Number.parseFloat(raw);
  return Number.isFinite(degrees) ? (degrees * Math.PI) / 180 : 0;
}

function buildWords(chips, canvasRect) {
  const words = [];
  for (const chip of chips) {
    const label = chip.textContent.replace(/\s+/g, " ").trim();
    if (label.length === 0) {
      continue;
    }
    const chipRect = chip.getBoundingClientRect();
    const centerX = chipRect.left + chipRect.width / 2 - canvasRect.left;
    const centerY = chipRect.top + chipRect.height / 2 - canvasRect.top;
    const rotation = readRotationRadians(chip);
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    const particles = sampleLabel(label).map((point) => {
      const angle = Math.random() * Math.PI * 2;
      const radius = SCATTER_RADIUS * Math.sqrt(Math.random());
      return {
        targetX: centerX + point.x * cos - point.y * sin,
        targetY: centerY + point.x * sin + point.y * cos,
        homeX: centerX + Math.cos(angle) * radius,
        homeY: centerY + Math.sin(angle) * radius,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 0.9,
        lag: Math.random() * PARTICLE_LAG,
      };
    });

    words.push({ centerX, centerY, progress: 0, particles });
  }
  return words;
}

function mixChannel(from, to, amount) {
  return Math.round(from + (to - from) * amount);
}

function startSkillParticles() {
  const cloud = document.querySelector(".skill-cloud");
  if (!cloud) {
    return;
  }
  const canvas = cloud.querySelector(".skill-particles");
  const chips = Array.from(cloud.querySelectorAll(".skill-chip"));
  if (!(canvas instanceof HTMLCanvasElement) || chips.length === 0) {
    return;
  }
  if (!canRunParticles()) {
    return;
  }
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  let words = [];
  let pointerX = Number.NaN;
  let pointerY = Number.NaN;
  let frameId = 0;
  let running = false;
  let lastTime = performance.now();
  let rebuildTimer = 0;

  const rebuild = () => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return;
    }
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    words = buildWords(chips, rect);
  };

  const drawFrame = (now) => {
    const deltaSeconds = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    const elapsed = now / 1000;
    const rect = canvas.getBoundingClientRect();
    const localPointerX = pointerX - rect.left;
    const localPointerY = pointerY - rect.top;
    const hasPointer = Number.isFinite(localPointerX) && Number.isFinite(localPointerY);

    context.clearRect(0, 0, rect.width, rect.height);

    for (const word of words) {
      const near = hasPointer && Math.hypot(localPointerX - word.centerX, localPointerY - word.centerY) < REVEAL_RADIUS;
      const step = ASSEMBLE_SPEED * deltaSeconds;
      word.progress = clamp01(word.progress + (near ? step : -step));

      const red = mixChannel(SCATTERED_RGB[0], ASSEMBLED_RGB[0], word.progress);
      const green = mixChannel(SCATTERED_RGB[1], ASSEMBLED_RGB[1], word.progress);
      const blue = mixChannel(SCATTERED_RGB[2], ASSEMBLED_RGB[2], word.progress);
      context.fillStyle = `rgb(${red}, ${green}, ${blue})`;

      for (const particle of word.particles) {
        const local = smoothstep01((word.progress - particle.lag) / (1 - PARTICLE_LAG));
        const drift = DRIFT_AMPLITUDE * (1 - local);
        const driftX = Math.sin(elapsed * particle.speed + particle.phase) * drift;
        const driftY = Math.cos(elapsed * particle.speed * 0.8 + particle.phase) * drift;
        const x = particle.homeX + (particle.targetX - particle.homeX) * local + driftX;
        const y = particle.homeY + (particle.targetY - particle.homeY) * local + driftY;
        context.globalAlpha = 0.45 + 0.55 * local;
        context.fillRect(x, y, DOT_SIZE, DOT_SIZE);
      }
    }
    context.globalAlpha = 1;
  };

  const loop = (now) => {
    if (!running) {
      return;
    }
    drawFrame(now);
    frameId = window.requestAnimationFrame(loop);
  };

  const setRunning = (shouldRun) => {
    if (shouldRun === running) {
      return;
    }
    running = shouldRun;
    if (running) {
      lastTime = performance.now();
      frameId = window.requestAnimationFrame(loop);
    } else {
      window.cancelAnimationFrame(frameId);
    }
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", () => {
    pointerX = Number.NaN;
    pointerY = Number.NaN;
  });

  window.addEventListener("resize", () => {
    window.clearTimeout(rebuildTimer);
    rebuildTimer = window.setTimeout(() => {
      if (!canRunParticles()) {
        setRunning(false);
        cloud.classList.remove("particles-on");
        return;
      }
      cloud.classList.add("particles-on");
      rebuild();
      setRunning(true);
    }, 200);
  });

  const visibility = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      setRunning(entry.isIntersecting && cloud.classList.contains("particles-on"));
    }
  });

  waitForFonts()
    .then(() => {
      cloud.classList.add("particles-on");
      rebuild();
      if (words.length === 0) {
        cloud.classList.remove("particles-on");
        return;
      }
      visibility.observe(cloud);
      setRunning(true);
    })
    .catch(() => {
      setRunning(false);
      cloud.classList.remove("particles-on");
    });
}

try {
  startSkillParticles();
} catch {
  const cloud = document.querySelector(".skill-cloud");
  if (cloud) {
    cloud.classList.remove("particles-on");
  }
}
