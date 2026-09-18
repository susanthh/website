<template>
  <span class="typewriter"
    ><span class="typewriter__text">{{ visible }}{{ toType }}</span
    ><span
      v-if="cursorVisible"
      class="typewriter__cursor"
      :class="{ 'typewriter__cursor--solid': done && solidWhenDone }"
      >&#9608;</span
    ></span
  >
</template>

<script setup lang="ts">
/**
 * Types out `text` character by character, then blinks a block cursor
 * forever. Replays whenever `text` changes.
 */
import { computed, onBeforeUnmount, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    text: string;
    /** ms per character */
    speed?: number;
    /** random +/- jitter per keystroke, ms */
    jitter?: number;
    /** pause before typing starts, ms */
    startDelay?: number;
    /** keep the cursor solid (no blink) once typing finishes */
    solidWhenDone?: boolean;
  }>(),
  { speed: 70, jitter: 35, startDelay: 400, solidWhenDone: false },
);

const charCount = ref(0);
const done = ref(false);
const cursorVisible = ref(true);

const visible = computed(() => props.text.slice(0, charCount.value));
const toType = computed(() =>
  charCount.value > 0 && charCount.value < props.text.length ? "\u00A0" : "",
);

let timer: ReturnType<typeof setTimeout> | undefined;
let blinkTimer: ReturnType<typeof setInterval> | undefined;

const scheduleBlink = () => {
  if (blinkTimer) clearInterval(blinkTimer);
  blinkTimer = setInterval(() => {
    cursorVisible.value = !cursorVisible.value;
  }, 530);
};

const typeNext = () => {
  if (charCount.value >= props.text.length) {
    done.value = true;
    scheduleBlink();
    return;
  }
  charCount.value += 1;
  const wait = props.speed + (Math.random() * 2 - 1) * props.jitter;
  timer = setTimeout(typeNext, wait);
};

const start = () => {
  clearTimeout(timer);
  if (blinkTimer) clearInterval(blinkTimer);
  charCount.value = 0;
  done.value = false;
  cursorVisible.value = true;
  timer = setTimeout(typeNext, props.startDelay);
};

watch(() => props.text, start, { immediate: true });

onBeforeUnmount(() => {
  clearTimeout(timer);
  if (blinkTimer) clearInterval(blinkTimer);
});
</script>

<style scoped>
.typewriter {
  display: inline;
}

.typewriter__text {
  white-space: pre-wrap;
}

.typewriter__cursor {
  display: inline-block;
  margin-left: 0.1em;
  color: var(--green);
  text-shadow: 0 0 10px var(--green-glow);
  animation: tw-blink 1.06s steps(1) infinite;
}

.typewriter__cursor--solid {
  animation: none;
}

@keyframes tw-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
