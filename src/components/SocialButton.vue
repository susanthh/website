<template>
  <a class="btn social-btn" :href="social.url" target="_blank" rel="noopener noreferrer">
    <svg
      class="social-btn__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path :d="social.icon" />
    </svg>
    <span>{{ social.label }}</span>
  </a>
</template>

<script setup lang="ts">
import type { Social } from "../config";

defineProps<{ social: Social }>();
</script>

<style scoped>
.social-btn__icon {
  width: 1.1em;
  height: 1.1em;
}
</style>
