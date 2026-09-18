<template>
  <main id="main" class="page">
    <!-- hero -->
    <section class="hero">
      <div class="hero__window" aria-label="Introduction">
        <div class="hero__body">
          <h1 class="hero__headline">
            <TypewriterText text="Hello, mate" :speed="80" :jitter="40" :start-delay="500" />
          </h1>

          <Transition name="reveal" :duration="700">
            <div v-if="revealed" class="hero__rest">
              <p class="hero__tagline">{{ tagline }}</p>
              <p class="hero__intro">{{ intro }}</p>

              <div class="hero__actions">
                <a class="btn btn--primary" :href="githubUrl" target="_blank" rel="noopener noreferrer">
                  <span aria-hidden="true">&gt;</span> view projects
                </a>
                <SocialButton v-for="social in socials" :key="social.label" :social="social" />
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </section>

    <!-- about -->
    <section class="section" aria-labelledby="about-title">
      <h2 id="about-title" class="section__title">about</h2>
      <div class="card about">
        <div class="about__text">
          <p v-for="(paragraph, i) in about" :key="i">{{ paragraph }}</p>
        </div>
        <figure v-if="currentPfp" class="about__pfp">
          <button
            class="about__pfp-image-btn"
            type="button"
            @click="nextPfp"
            :aria-label="pfps.length > 1 ? 'Next profile picture' : 'Profile picture'"
          >
            <img
              :src="currentPfp.url"
              :alt="`Profile picture ${currentIndex + 1} of ${pfps.length}`"
              @error="removeCurrentPfp"
            />
          </button>
          <figcaption aria-hidden="true">~/pfps/{{ currentPfp.name }}</figcaption>
          <div v-if="pfps.length > 1" class="pfp-controls">
            <button class="pfp-nav" type="button" @click="prevPfp" aria-label="Previous profile picture">
              prev
            </button>
            <div class="pfp-dots" role="tablist" aria-label="Profile pictures">
              <button
                v-for="(_, i) in pfps"
                :key="i"
                class="pfp-dot"
                :class="{ 'pfp-dot--active': i === currentIndex }"
                type="button"
                role="tab"
                :aria-selected="i === currentIndex"
                :aria-label="`View profile picture ${i + 1}`"
                @click="goToPfp(i)"
              />
            </div>
            <button class="pfp-nav" type="button" @click="nextPfp" aria-label="Next profile picture">next</button>
          </div>
        </figure>
      </div>
    </section>

    <footer class="footer">
      <span>&copy; {{ year }} &mdash; @endgamewilham</span>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import TypewriterText from "../components/TypewriterText.vue";
import SocialButton from "../components/SocialButton.vue";
import { about, intro, socials, tagline, githubUrl } from "../config";

/** Every image dropped into src/assets/pfps is loaded into a clickable mini gallery. */
const pfpModules = import.meta.glob<{ default: string }>(
  "../assets/pfps/*.{png,jpg,jpeg,gif,webp,avif,svg}",
  { eager: true },
);
const pfps = ref(
  Object.entries(pfpModules)
    .map(([path, mod]) => ({
      url: mod.default,
      name: path.split("/").pop() ?? "image",
    }))
    .sort((a, b) => a.name.localeCompare(b.name)),
);
const currentIndex = ref(0);
const currentPfp = computed(() => pfps.value[currentIndex.value] ?? null);

const nextPfp = () => {
  if (pfps.value.length < 2) return;
  currentIndex.value = (currentIndex.value + 1) % pfps.value.length;
};

const prevPfp = () => {
  if (pfps.value.length < 2) return;
  currentIndex.value = (currentIndex.value - 1 + pfps.value.length) % pfps.value.length;
};

const goToPfp = (index: number) => {
  if (index < 0 || index >= pfps.value.length) return;
  currentIndex.value = index;
};

const removeCurrentPfp = () => {
  if (!pfps.value.length) return;
  pfps.value.splice(currentIndex.value, 1);
  if (currentIndex.value >= pfps.value.length) {
    currentIndex.value = 0;
  }
};

/** Reveal the rest of the hero once the typewriter has had time to finish. */
const revealed = ref(false);
const ESTIMATED_TYPE_MS = "Hello, mate".length * 100 + 1100;

const year = new Date().getFullYear();

onMounted(() => {
  window.setTimeout(() => {
    revealed.value = true;
  }, ESTIMATED_TYPE_MS);
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* --- hero ------------------------------------------------------------ */

.hero {
  max-width: 880px;
  width: 100%;
  margin: 0 auto;
  padding: clamp(2rem, 8vh, 5rem) 1.5rem 1rem;
}

.hero__window {
  border: 1px solid var(--line);
  background: rgba(10, 18, 10, 0.82);
  box-shadow: 0 0 40px var(--green-glow-soft), 0 24px 60px rgba(0, 0, 0, 0.6);
  min-height: clamp(340px, 48vh, 480px);
  display: flex;
  flex-direction: column;
}

.hero__body {
  padding: 2rem 1.6rem 2.2rem;
  font-size: clamp(1rem, 2.2vw, 1.15rem);
  flex: 1;
}

.hero__headline {
  margin: 0 0 1.4rem;
  font-size: clamp(1.9rem, 5vw, 2.8rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.15;
  color: var(--green);
  text-shadow: 0 0 14px var(--green-glow-soft);
}

.hero__tagline {
  margin: 0 0 1rem;
  color: var(--text-dim);
  font-size: 0.95em;
}

.hero__intro {
  margin: 0 0 1.8rem;
  max-width: 62ch;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

/* reveal animation for the content under the typewriter */
.reveal-enter-active {
  transition: opacity 0.7s ease, transform 0.7s ease;
}

.reveal-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

/* --- about + socials -------------------------------------------------- */

.about {
  display: flex;
  align-items: flex-start;
  gap: 1.75rem;
}

.about__text {
  flex: 1 1 auto;
  min-width: 0;
}

.about__text p {
  margin: 0 0 1rem;
}

.about__text p:last-child {
  margin-bottom: 0;
}

.about__pfp {
  flex: 0 0 auto;
  width: clamp(140px, 22vw, 200px);
  margin: 0;
  padding: 0.45rem;
  border: 1px solid var(--line);
  background: var(--bg);
  box-shadow: 0 0 18px var(--green-glow-soft), 0 12px 30px rgba(0, 0, 0, 0.55);
}

.about__pfp-image-btn {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.about__pfp img {
  display: block;
  width: 100%;
  height: auto;
}

.about__pfp figcaption {
  margin-top: 0.45rem;
  font-size: 0.72rem;
  color: var(--text-dim);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pfp-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.45rem;
  margin-top: 0.55rem;
}

.pfp-nav {
  border: 1px solid var(--line);
  background: var(--bg-input);
  color: var(--green);
  font-family: var(--font);
  font-size: 0.7rem;
  line-height: 1;
  padding: 0.35rem 0.45rem;
  cursor: pointer;
}

.pfp-nav:hover {
  background: var(--green-glow-soft);
  border-color: var(--green);
}

.pfp-dots {
  display: flex;
  align-items: center;
  gap: 0.32rem;
  min-width: 0;
}

.pfp-dot {
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--bg-input);
  padding: 0;
  cursor: pointer;
}

.pfp-dot--active {
  background: var(--green);
  border-color: var(--green);
  box-shadow: 0 0 8px var(--green-glow);
}

/* --- footer ------------------------------------------------------------ */

.footer {
  margin-top: auto;
  padding: 2.5rem 1.5rem 1.6rem;
  text-align: center;
  color: var(--text-dim);
  font-size: 0.85rem;
}

@media (max-width: 640px) {
  .hero {
    padding-top: 1.5rem;
  }

  .hero__window {
    min-height: auto;
  }

  .hero__body {
    padding: 1.4rem 1.1rem 1.6rem;
  }

  .about {
    flex-direction: column;
  }

  .about__pfp {
    align-self: center;
    width: min(220px, 100%);
  }

  .hero__actions .btn,
  .hero__actions :deep(.btn) {
    width: 100%;
    justify-content: center;
  }

  .pfp-nav {
    font-size: 0.66rem;
    padding: 0.35rem 0.4rem;
  }
}

@media (max-width: 420px) {
  .hero__headline {
    font-size: 1.7rem;
  }

  .footer {
    padding-top: 2rem;
    font-size: 0.78rem;
  }
}
</style>
