<template>
  <canvas ref="canvasRef" class="dot-grid" aria-hidden="true"></canvas>
</template>

<script setup lang="ts">
/**
 * Full-viewport grid of dots.
 *
 * Every dot is anchored to its own grid cell (its "domain") and constantly
 * strains toward the cursor — the closer the cursor, the brighter and bigger
 * it gets, and the harder the pull — but it can never leave its cell: the
 * displacement is clamped to just under half a cell, so neighboring dots
 * never cross into each other. Motion is springy, so dots chase the cursor
 * and wobble home when it leaves. The closest dots also connect to the
 * cursor with glowing lines.
 *
 * Tweak the knobs in the `config` object below.
 */
import { onBeforeUnmount, onMounted, ref } from "vue";

const config = {
  gap: 40, // px between dots (and size of each dot's domain cell)
  baseRadius: 1.25, // resting dot radius
  maxRadius: 3.2, // dot radius right under the cursor
  radiusRange: 150, // px — brighter/stronger influence near cursor
  glowRange: 320, // px — faint reach before hard falloff
  cellMargin: 4, // px kept between a displaced dot and its cell edge
  stiffness: 0.12, // spring pull toward the target offset
  damping: 0.82, // velocity damping (< 1 = springy wobble)
  shimmer: 0.28, // resting alpha
  shimmerSpeed: 0.00055,
  color: "34, 255, 85", // rgb
  ghostAlpha: 0.1, // motion-blur ghost left behind moving dots
  fpsCap: 60,
} as const;

interface Dot {
  hx: number; // home x
  hy: number; // home y
  ox: number; // current offset x from home
  oy: number; // current offset y
  vx: number; // offset velocity x
  vy: number; // offset velocity y
  _pull: number; // cached pull strength this frame (0 = none)
  _base: number; // per-dot resting brightness multiplier (0.55–1)
  _px: number; // cached drawn x last frame
  _py: number; // cached drawn y last frame
  _pr: number; // cached drawn radius last frame
}

const config_ = config;
const canvasRef = ref<HTMLCanvasElement | null>(null);

let ctx: CanvasRenderingContext2D | null = null;
let raf = 0;
let lastFrame = 0;
let width = 0;
let height = 0;
let dots: Dot[] = [];
let maxOffset = 0;
let cellGap: number = config_.gap;
let resizeObserver: ResizeObserver | null = null;

// Pointer state, lerped for smooth trailing motion
const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false };

const onPointerMove = (e: PointerEvent) => {
  const rect = canvasRef.value?.getBoundingClientRect();
  if (!rect) return;
  pointer.tx = e.clientX - rect.left;
  pointer.ty = e.clientY - rect.top;
  if (!pointer.active) {
    pointer.x = pointer.tx;
    pointer.y = pointer.ty;
    pointer.active = true;
  }
};

const onPointerLeave = () => {
  pointer.active = false;
  pointer.tx = -9999;
  pointer.ty = -9999;
};

const buildDots = () => {
  dots = [];
  for (let x = 0; x <= width; x += cellGap) {
    for (let y = 0; y <= height; y += cellGap) {
      dots.push({
        hx: x,
        hy: y,
        ox: 0,
        oy: 0,
        vx: 0,
        vy: 0,
        _pull: 0,
        _base: 0.55 + Math.random() * 0.45,
        _px: x,
        _py: y,
        _pr: config_.baseRadius,
      });
    }
  }
};

const resize = () => {
  const canvas = canvasRef.value;
  if (!canvas || !ctx) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  // ignore transient zero-size viewports (hidden iframe/webview during load)
  if (!w || !h) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = w;
  height = h;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cellGap = width <= 640 ? 32 : config_.gap;
  maxOffset = Math.max(4, cellGap * 0.22 - config_.cellMargin);
  buildDots();
  ctx.fillStyle = "rgb(5, 8, 5)";
  ctx.fillRect(0, 0, width, height);
};

const frame = (t: number) => {
  raf = requestAnimationFrame(frame);
  if (!ctx) return;
  if (t - lastFrame < 1000 / config_.fpsCap) return;
  lastFrame = t;

  // ease the cursor toward its target for a fluid feel
  pointer.x += (pointer.tx - pointer.x) * 0.2;
  pointer.y += (pointer.ty - pointer.y) * 0.2;

  ctx.fillStyle = "rgb(5, 8, 5)";
  ctx.fillRect(0, 0, width, height);

  const { glowRange, radiusRange, maxRadius, baseRadius, stiffness, damping } = config_;
  const phase = t * config_.shimmerSpeed;
  const { x: cx, y: cy, active } = pointer;

  ctx.fillStyle = `rgb(${config_.color})`;

  for (const dot of dots) {
    // --- spring the offset toward its target --------------------------
    let tx = 0;
    let ty = 0;
    let pull = 0;

    if (active) {
      const dx = cx - dot.hx;
      const dy = cy - dot.hy;
      const dist = Math.hypot(dx, dy);
      if (dist < glowRange) {
        const moveProximity = Math.max(0, 1 - dist / radiusRange);
        pull = Math.pow(moveProximity, 2) * 0.7;
        if (dist > 0.001) {
          // strain toward the cursor, capped at the cell boundary
          const reach = maxOffset * pull;
          tx = (dx / dist) * reach;
          ty = (dy / dist) * reach;
        }
      }
    }

    dot.vx = (dot.vx + (tx - dot.ox) * stiffness) * damping;
    dot.vy = (dot.vy + (ty - dot.oy) * stiffness) * damping;
    dot.ox += dot.vx;
    dot.oy += dot.vy;

    // hard clamp: the dot must stay inside its own cell (its domain)
    const off = Math.hypot(dot.ox, dot.oy);
    if (off > maxOffset) {
      const s = maxOffset / off;
      dot.ox *= s;
      dot.oy *= s;
      dot.vx *= s;
      dot.vy *= s;
    }

    // --- draw ----------------------------------------------------------
    const px = dot.hx + dot.ox;
    const py = dot.hy + dot.oy;

    let alpha =
      config_.shimmer * dot._base +
      config_.shimmer * 0.7 * Math.sin(phase + dot.hx * 0.008 + dot.hy * 0.011);
    let radius = baseRadius;

    if (active) {
      const distToCursor = Math.hypot(cx - dot.hx, cy - dot.hy);
      const glowProximity = Math.max(0, 1 - distToCursor / glowRange);
      if (glowProximity > 0) {
        alpha = Math.min(1, alpha + Math.pow(glowProximity, 2.2) * 1.35);
      }
      if (pull > 0) {
        radius = baseRadius + (maxRadius - baseRadius) * pull;
      }
    }
    dot._pull = pull;

    // motion ghost: a dim smudge trailing a dot that's on the move
    if (Math.abs(dot.vx) > 0.08 || Math.abs(dot.vy) > 0.08) {
      ctx.globalAlpha = config_.ghostAlpha;
      ctx.beginPath();
      ctx.arc(dot._px, dot._py, dot._pr, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = Math.max(0.04, alpha);
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();

    dot._px = px;
    dot._py = py;
    dot._pr = radius;
  }

  ctx.globalAlpha = 1;
};

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  ctx = canvas.getContext("2d");
  if (!ctx) return;

  resize();
  window.addEventListener("resize", resize);
  // webviews/hidden tabs can report a 0x0 viewport on mount; re-run resize
  // whenever the document element actually gets laid out
  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(document.documentElement);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerleave", onPointerLeave);
  raf = requestAnimationFrame(frame);

  // console/debug hook: inspect pointer + dot physics from devtools
  if (import.meta.env.DEV || import.meta.env.VITE_DOT_DEBUG) {
    (window as unknown as Record<string, unknown>).__dotGrid = {
      pointer,
      config,
      get dots() {
        return dots;
      },
    };
  }
});

onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  resizeObserver?.disconnect();
  resizeObserver = null;
  window.removeEventListener("resize", resize);
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerleave", onPointerLeave);
});
</script>

<style scoped>
.dot-grid {
  position: fixed;
  inset: 0;
  z-index: -1;
  display: block;
}
</style>
