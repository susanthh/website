<template>
  <a class="skip-link" href="#main">skip to content</a>
  <DotGridBackground />
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import DotGridBackground from "./components/DotGridBackground.vue";
</script>

<style scoped>
.skip-link {
  position: fixed;
  top: -100px;
  left: 1rem;
  z-index: 10000;
  padding: 0.5rem 1rem;
  background: var(--bg);
  border: 1px solid var(--green);
}

.skip-link:focus {
  top: 1rem;
}
</style>
