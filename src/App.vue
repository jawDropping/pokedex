<script setup lang="ts">
import { ref, provide } from "vue"
import Header from '@/components/Header.vue'

const search = ref("")
provide('search', search)
</script>

<template>
  <div class="app-shell">
    <div class="ambient-backdrop" aria-hidden="true">
      <div class="backdrop-texture"></div>
      <div class="backdrop-glow glow-brass"></div>
      <div class="backdrop-glow glow-dusk"></div>
      <div class="backdrop-vignette"></div>
    </div>

    <div class="header">
      <Header v-model:search="search" />
    </div>

    <div class="componentContainer">
      <RouterView v-slot="{ Component }">
        <KeepAlive include="HomeView">
          <component :is="Component" />
        </KeepAlive>
      </RouterView>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  --paper: #f6f3ee;
  --paper-deep: #efe9df;
  --ink: #201e1b;
  --ink-muted: #948d7e;
  --hairline: rgba(32, 30, 27, 0.09);
  --brass: #a68a5c;
  --brass-deep: #8a6d42;
  --mono: 'JetBrains Mono', ui-monospace, monospace;
  --display: 'Fraunces', ui-serif, Georgia, serif;

  position: relative;
  min-height: 100vh;
  background: var(--paper);
  isolation: isolate;
}

.ambient-backdrop {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  background: var(--paper);
}

.backdrop-texture {
  position: absolute;
  inset: 0;
  opacity: 0.5;
  background-image: radial-gradient(rgba(32, 30, 27, 0.035) 1px, transparent 1px);
  background-size: 26px 26px;
}

.backdrop-glow {
  position: absolute;
  width: 60vw;
  height: 60vw;
  max-width: 900px;
  max-height: 900px;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.35;
  animation: driftGlow 34s ease-in-out infinite;
  will-change: transform;
}

.glow-brass {
  top: -18%;
  right: -12%;
  background: radial-gradient(circle, rgba(166, 138, 92, 0.4) 0%, transparent 70%);
}

.glow-dusk {
  bottom: -20%;
  left: -10%;
  background: radial-gradient(circle, rgba(151, 137, 173, 0.22) 0%, transparent 70%);
  animation-delay: -17s;
}

.backdrop-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(120% 100% at 50% 0%, transparent 55%, rgba(32, 30, 27, 0.035) 100%);
}

.header {
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 100;
}

.componentContainer {
  width: 100vw;
  position: relative;
  z-index: 1;
}

@keyframes driftGlow {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-3%, 4%) scale(1.08); }
}

@media (prefers-reduced-motion: reduce) {
  .backdrop-glow { animation: none; }
}
</style>