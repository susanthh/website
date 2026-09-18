<template>
  <main id="main" class="notfound">
    <div class="notfound__window">
      <div class="notfound__body">
        <p class="notfound__code">404</p>
        <h1 class="notfound__title">Page not found</h1>
        <p class="notfound__hint">
          The page you're looking for was moved, renamed, deleted,
          or never existed.
        </p>
        <RouterLink class="btn btn--primary notfound__home" to="/">
          <span aria-hidden="true">&gt;</span> back to the home page
        </RouterLink>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<style scoped>
.notfound {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
}

.notfound__window {
  width: min(680px, 100%);
  border: 1px solid var(--line);
  background: rgba(10, 18, 10, 0.82);
  box-shadow: 0 0 40px var(--green-glow-soft), 0 24px 60px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
}

.notfound__body {
  padding: 3rem 2rem;
  text-align: center;
}

.notfound__code {
  margin: 0 0 0.6rem;
  font-size: clamp(3.5rem, 10vw, 5.5rem);
  font-weight: 800;
  line-height: 1;
  color: var(--green);
  text-shadow: 0 0 24px var(--green-glow-soft);
  letter-spacing: 0.04em;
}

.notfound__title {
  margin: 0 0 1rem;
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  font-weight: 700;
  color: var(--text);
}

.notfound__hint {
  margin: 0 auto 2rem;
  color: var(--text-dim);
  max-width: 46ch;
}
</style>
