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
        <figure v-if="pfpUrl && !pfpFailed" class="about__pfp">
          <img :src="pfpUrl" alt="Randomly chosen profile picture" @error="pfpFailed = true" />
          <figcaption aria-hidden="true">@endgamewilham</figcaption>
        </figure>
      </div>
    </section>

    <footer class="footer">
      <span>&copy; {{ year }} &mdash; @endgamewilham</span>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import TypewriterText from "../components/TypewriterText.vue";
import SocialButton from "../components/SocialButton.vue";
import { about, intro, socials, tagline, githubUrl } from "../config";

/**
 * Every image dropped into src/assets/pfps gets picked up at build time;
 * one is chosen at random per page load and shown in the about section.
 */
const pfpModules = import.meta.glob<{ default: string }>(
  "../assets/pfps/*.{png,jpg,jpeg,gif,webp,avif,svg}",
  { eager: true },
);
const pfpEntries = Object.entries(pfpModules);
const pickedPfp = pfpEntries[Math.floor(Math.random() * pfpEntries.length)];
const pfpUrl = pickedPfp?.[1].default ?? "";
const pfpFailed = ref(false);

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

  .hero__body {
    padding: 1.4rem 1.1rem 1.6rem;
  }

  .about {
    flex-direction: column;
  }

  .about__pfp {
    align-self: center;
    width: 160px;
  }
}
</style>
