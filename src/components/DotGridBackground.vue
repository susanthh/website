<template>
  <canvas ref="canvasRef" class="dot-grid" aria-hidden="true"></canvas>
</template>

<script setup lang="ts">
/**
 * Full-viewport grid of dots that reacts to the cursor.
 *
 * Each dot lives at a fixed home position on the grid. Near the cursor it
 * brightens toward a dim white, swells slightly, and eases toward the
 * cursor on a soft spring — drifting at most a few pixels, so the grid
 * never loses its shape.
 *
 * Tuning knobs live in the CONFIG block below.
 */
import { onBeforeUnmount, onMounted, ref } from "vue";

const CONFIG = {
  gap: 36, // px between dots
  baseRadius: 1.3, // resting dot radius (px)
  maxRadius: 2.6, // dot radius right under the cursor (px)
  reach: 220, // px — how far the cursor's influence extends
  maxDrift: 6, // px — furthest a dot may leave its home
  stiffness: 0.1, // spring pull toward the cursor
  damping: 0.9, // closer to 1 = calmer, less wobble
  baseAlpha: 0.22, // resting dot brightness
  glowAlpha: 0.7, // extra brightness at the cursor's center (kept dim)
  color: "34, 255, 85", // resting dot color, rgb
  hotColor: "205, 215, 208", // highlight color near the cursor: dim white, rgb
} as const;

interface Dot {
  hx: number; // home x
  hy: number; // home y
  ox: number; // current x offset from home
  oy: number; // current y offset from home
  vx: number; // offset velocity x
  vy: number; // offset velocity y
  bright: number; // per-dot resting brightness multiplier (0.7–1)
}

const canvasRef = ref<HTMLCanvasElement | null>(null);

let ctx: CanvasRenderingContext2D | null = null;
let raf = 0;
let width = 0;
let height = 0;
let dots: Dot[] = [];
let resizeObserver: ResizeObserver | null = null;

// Cursor position, eased each frame for smooth trailing motion.
const cursor = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false };

const onPointerMove = (e: PointerEvent) => {
  cursor.tx = e.clientX;
  cursor.ty = e.clientY;
  if (!cursor.active) {
    // snap on first appearance so dots don't sweep in from a stale spot
    cursor.x = cursor.tx;
    cursor.y = cursor.ty;
    cursor.active = true;
  }
};

const onPointerLeave = () => {
  cursor.active = false;
  cursor.tx = -9999;
  cursor.ty = -9999;
};

const buildDots = () => {
  dots = [];
  for (let x = CONFIG.gap / 2; x < width; x += CONFIG.gap) {
    for (let y = CONFIG.gap / 2; y < height; y += CONFIG.gap) {
      dots.push({
        hx: x,
        hy: y,
        ox: 0,
        oy: 0,
        vx: 0,
        vy: 0,
        bright: 0.7 + Math.random() * 0.3,
      });
    }
  }
};

const resize = () => {
  const canvas = canvasRef.value;
  if (!canvas || !ctx) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (!w || !h) return; // hidden webview/iframe during load
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = w;
  height = h;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  buildDots();
};

const frame = () => {
  raf = requestAnimationFrame(frame);
  if (!ctx) return;

  cursor.x += (cursor.tx - cursor.x) * 0.25;
  cursor.y += (cursor.ty - cursor.y) * 0.25;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = `rgb(${CONFIG.color})`;

  const { reach, maxDrift, stiffness, damping, baseAlpha, glowAlpha, color, hotColor } = CONFIG;
  const cx = cursor.x;
  const cy = cursor.y;

  for (const dot of dots) {
    // --- spring the dot toward the cursor ------------------------------
    let tx = 0;
    let ty = 0;
    let pull = 0; // 0 at rest, 1 right under the cursor

    if (cursor.active) {
      const dx = cx - dot.hx;
      const dy = cy - dot.hy;
      const dist = Math.hypot(dx, dy);
      if (dist < reach) {
        const t = 1 - dist / reach;
        pull = t * t; // smooth falloff
        if (dist > 0.001) {
          tx = (dx / dist) * pull * maxDrift;
          ty = (dy / dist) * pull * maxDrift;
        }
      }
    }

    dot.vx = (dot.vx + (tx - dot.ox) * stiffness) * damping;
    dot.vy = (dot.vy + (ty - dot.oy) * stiffness) * damping;
    dot.ox += dot.vx;
    dot.oy += dot.vy;

    // keep every dot near its home so the grid stays a grid
    const off = Math.hypot(dot.ox, dot.oy);
    if (off > maxDrift) {
      const s = maxDrift / off;
      dot.ox *= s;
      dot.oy *= s;
      dot.vx *= s;
      dot.vy *= s;
    }

    // --- draw -----------------------------------------------------------
    const alpha = Math.min(1, baseAlpha * dot.bright + glowAlpha * pull);
    const radius = CONFIG.baseRadius + (CONFIG.maxRadius - CONFIG.baseRadius) * pull;

    if (pull > 0.02) {
      // blend green -> dim white as the dot lights up
      const c1 = color.split(", ");
      const c2 = hotColor.split(", ");
      ctx.fillStyle = `rgb(${Math.round(+c1[0] + (+c2[0] - +c1[0]) * pull)}, ${Math.round(
        +c1[1] + (+c2[1] - +c1[1]) * pull,
      )}, ${Math.round(+c1[2] + (+c2[2] - +c1[2]) * pull)})`;
    }
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(dot.hx + dot.ox, dot.hy + dot.oy, radius, 0, Math.PI * 2);
    ctx.fill();
    if (pull > 0.02) {
      ctx.fillStyle = `rgb(${color})`;
    }
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
  // hidden tabs/webviews can report a 0x0 viewport on mount; re-run resize
  // whenever the document element actually gets laid out
  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(document.documentElement);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerleave", onPointerLeave);
  raf = requestAnimationFrame(frame);
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
/*
 * z-index -1 puts the canvas behind all page content, and #app is made a
 * stacking context (see #app in style.css) so it still paints ABOVE the
 * body's background instead of behind it.
 */
.dot-grid {
  position: fixed;
  inset: 0;
  z-index: -1;
  display: block;
  pointer-events: none;
}
</style>
