<script setup lang="ts">
import type { Pokemon } from "@/api/pokemon";
import { fetchPokemonById } from "@/api/pokemon";
import { computed, ref, onMounted, watch } from "vue";

const props = defineProps<{
  pokemon: Pokemon;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

// Internal, mutable copy of the pokemon being displayed — starts as the
// prop, but after next/prev it's replaced with freshly fetched data.
const currentPokemon = ref<Pokemon>(props.pokemon);

// If the parent ever passes a different pokemon prop (e.g. selecting a
// different card from the grid), sync it back in.
watch(
  () => props.pokemon,
  (newVal) => {
    currentPokemon.value = newVal;
  }
);

const MIN_ID = 1;
const MAX_ID = 1025; // adjust to match the last ID in your dataset/PokeAPI generation cutoff

const isFetchingAdjacent = ref(false);
const fetchError = ref<string | null>(null);

// Dynamic accent mapping based on primary type
const mainType = computed(() => currentPokemon.value.types[0]?.type.name || "normal");

// Game design logic: Determine if this layout gets the ultimate Tier-1 prestige skin
const legendaryIds = [144, 145, 146, 150, 249, 250, 382, 383, 384, 483, 484, 487, 716, 717, 718, 785, 786, 787, 788, 1007, 1008];
const isLegendary = computed(() => {
  return legendaryIds.includes(currentPokemon.value.id) || (currentPokemon.value as any).is_legendary === true;
});

const formatStatName = (name: string) => {
  const map: Record<string, string> = {
    hp: "HP",
    attack: "ATK",
    defense: "DEF",
    "special-attack": "SATK",
    "special-defense": "SDEF",
    speed: "SPD",
  };
  return map[name] || name;
};

const heightMeters = computed(() => (currentPokemon.value.height / 10).toFixed(1));
const weightKg = computed(() => (currentPokemon.value.weight / 10).toFixed(1));

// --- Field dossier: flavor text pulled from the species endpoint ---
const description = ref<string | null>(null);
const isDescLoading = ref(false);
const descError = ref(false);

async function loadDescription(p: Pokemon) {
  const speciesUrl = (p as any).species?.url;
  if (!speciesUrl) {
    description.value = null;
    return;
  }

  isDescLoading.value = true;
  descError.value = false;
  description.value = null;

  try {
    const res = await fetch(speciesUrl);
    if (!res.ok) throw new Error(`Species request failed: ${res.status}`);
    const data = await res.json();

    const entries: { flavor_text: string; language: { name: string } }[] =
      data.flavor_text_entries || [];
    const englishEntry = entries.find((e) => e.language?.name === "en");

    description.value = englishEntry
      ? englishEntry.flavor_text.replace(/[\n\f\r]+/g, " ").replace(/\s+/g, " ").trim()
      : null;
  } catch (err) {
    console.error("Failed to load species description", err);
    descError.value = true;
  } finally {
    isDescLoading.value = false;
  }
}

// --- Load-in animation: scan reveal + cascading stat count-up ---
const loaded = ref(false);
const displayedStats = ref<number[]>(currentPokemon.value.stats.map(() => 0));

function animateStats() {
  const duration = 800;
  const staggerPerStat = 90;
  const start = performance.now();
  const targets = currentPokemon.value.stats.map((s) => s.base_stat);
  const totalDuration = duration + (targets.length - 1) * staggerPerStat;

  function tick(now: number) {
    const elapsed = now - start;
    displayedStats.value = targets.map((t, i) => {
      const localElapsed = elapsed - i * staggerPerStat;
      if (localElapsed <= 0) return 0;
      const progress = Math.min(localElapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      return Math.round(t * eased);
    });
    if (elapsed < totalDuration) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

// --- Prev/Next navigation + swap animation ---
const slideDirection = ref<"next" | "prev" | null>(null);
const isEntering = ref(false);
const isSwapLocked = ref(false);

const canGoPrev = computed(() => currentPokemon.value.id > MIN_ID);
const canGoNext = computed(() => currentPokemon.value.id < MAX_ID);

async function goToId(targetId: number, direction: "next" | "prev") {
  if (isSwapLocked.value) return;
  if (targetId < MIN_ID || targetId > MAX_ID) return;

  isSwapLocked.value = true;
  fetchError.value = null;

  try {
    const fetched = await fetchPokemonById(targetId);
    currentPokemon.value = fetched;
    slideDirection.value = direction;
    playEntranceAnimation();
  } catch (err) {
    console.error("Failed to fetch pokemon", targetId, err);
    fetchError.value = `Couldn't load specimen #${targetId}.`;
    isSwapLocked.value = false;
  }
}

function goNext() {
  goToId(currentPokemon.value.id + 1, "next");
}

function goPrev() {
  goToId(currentPokemon.value.id - 1, "prev");
}

function playEntranceAnimation() {
  displayedStats.value = currentPokemon.value.stats.map(() => 0);
  loaded.value = false;
  isEntering.value = true;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      isEntering.value = false;
      loaded.value = true;
      animateStats();
      setTimeout(() => {
        isSwapLocked.value = false;
        slideDirection.value = null;
      }, 650);
    });
  });
}

watch(
  () => currentPokemon.value.id,
  () => loadDescription(currentPokemon.value),
  { immediate: true }
);

onMounted(() => {
  requestAnimationFrame(() => {
    loaded.value = true;
    animateStats();
  });
});
</script>

<template>
  <div 
    class="hero-container" 
    :class="[
      `theme-${mainType}`, 
      { 'is-legendary-tier': isLegendary }
    ]"
  >
    <div v-if="isLegendary" class="foil-overlay"></div>

    <nav class="nav-overlay">
      <button class="back-btn" @click="emit('close')">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span class="btn-text">Exit scan</span>
      </button>
      <div class="right-nav">
        <span v-if="isLegendary" class="tier-tag">Legendary specimen</span>
        <span class="id-watermark">#{{ String(currentPokemon.id).padStart(3, '0') }}</span>
      </div>
    </nav>

    <main class="landing-grid">

      <section class="art-column">
        <div class="grid-texture"></div>
        <div class="ambient-glow"></div>

        <div
          class="stage"
          :class="{
            'is-entering': isEntering,
            'slide-next': slideDirection === 'next',
            'slide-prev': slideDirection === 'prev'
          }"
        >
          <div class="stage-frame">
            <span class="frame-tick tick-tl"></span>
            <span class="frame-tick tick-tr"></span>
            <span class="frame-tick tick-bl"></span>
            <span class="frame-tick tick-br"></span>
          </div>

          <span class="scan-label" :class="{ 'is-visible': loaded }">Analyzing specimen</span>

          <div class="artwork-wrapper">
            <h1 class="giant-bg-text">{{ currentPokemon.name }}</h1>
            <img 
              :src="(currentPokemon.sprites as any).other?.['official-artwork']?.front_default || currentPokemon.sprites.front_default" 
              :alt="currentPokemon.name" 
              class="detail-sprite"
              :class="{ 'is-revealed': loaded }"
              loading="lazy"
            />
          </div>

          <div class="scan-sweep" :class="{ 'is-active': loaded }"></div>
        </div>
      </section>

      <section class="info-column">
        <button
          class="page-nav nav-prev"
          @click="goPrev"
          :disabled="isSwapLocked || !canGoPrev"
          aria-label="Previous Pokémon"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="nav-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <button
          class="page-nav nav-next"
          @click="goNext"
          :disabled="isSwapLocked || !canGoNext"
          aria-label="Next Pokémon"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="nav-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        <svg class="info-seal" viewBox="0 0 600 600" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
          <path d="M300,40 C420,30 520,110 540,220 C560,330 500,420 400,470 C300,520 180,500 110,420 
                   C40,340 50,220 120,140 C180,70 240,50 300,40 Z" />
        </svg>
        <svg class="info-ring" viewBox="0 0 400 400" aria-hidden="true">
          <circle cx="200" cy="200" r="176" />
          <circle cx="200" cy="200" r="124" />
        </svg>
        <span class="info-monogram" aria-hidden="true">{{ String(currentPokemon.id).padStart(3, '0') }}</span>

        <div
          class="scroll-content"
          :class="{
            'is-entering': isEntering,
            'slide-next': slideDirection === 'next',
            'slide-prev': slideDirection === 'prev'
          }"
        >
          <span class="frame-tick corner-tick tick-tl"></span>
          <span class="frame-tick corner-tick tick-br"></span>

          <header class="hero-header" :class="{ 'is-revealed': loaded }">
            <span class="eyebrow">Specimen no. {{ String(currentPokemon.id).padStart(3, '0') }}</span>
            <h2 class="pokemon-name">{{ currentPokemon.name }}</h2>
            <div class="type-badges">
              <span
                v-for="t in currentPokemon.types"
                :key="t.type.name"
                class="type-badge"
              >
                {{ t.type.name }}
              </span>
            </div>
          </header>

          <div class="detail-meta" :class="{ 'is-revealed': loaded }">
            <div class="meta-item">
              <span class="meta-value">{{ heightMeters }}<small>m</small></span>
              <span class="meta-label">Height</span>
            </div>
            <div class="divider"></div>
            <div class="meta-item">
              <span class="meta-value">{{ weightKg }}<small>kg</small></span>
              <span class="meta-label">Weight</span>
            </div>
          </div>

          <hr class="section-divider" />

          <div class="info-group dossier-group" :class="{ 'is-revealed': loaded }">
            <h3>Field dossier</h3>
            <div class="dossier-body">
              <span class="dossier-mark">&#8220;</span>
              <p v-if="isDescLoading" class="dossier-text is-loading">
                Retrieving field notes&hellip;
              </p>
              <p v-else-if="descError" class="dossier-text is-empty">
                Field notes unavailable for this specimen.
              </p>
              <p v-else-if="description" class="dossier-text">
                {{ description }}
              </p>
              <p v-else class="dossier-text is-empty">
                No field notes recorded for this specimen.
              </p>
            </div>
          </div>

          <hr class="section-divider" />

          <div class="info-group" :class="{ 'is-revealed': loaded }">
            <h3>Intrinsic perks</h3>
            <div class="pill-row">
              <span v-for="a in currentPokemon.abilities" :key="a.ability.name" class="pill">
                {{ a.ability.name.replace('-', ' ') }}
              </span>
            </div>
          </div>

          <hr class="section-divider" />

          <div class="info-group" :class="{ 'is-revealed': loaded }">
            <h3>Combat analysis</h3>
            <div class="stats-list">
              <div
                v-for="(s, i) in currentPokemon.stats"
                :key="s.stat.name"
                class="stat-row"
                :class="{ 'is-revealed': loaded }"
                :style="{ transitionDelay: (i * 90) + 'ms' }"
              >
                <span class="stat-name">{{ formatStatName(s.stat.name) }}</span>
                <span class="stat-value">{{ displayedStats[i] }}</span>
                <div class="stat-bar-track">
                  <div
                    class="stat-bar-fill"
                    :style="{ width: Math.min(displayedStats[i] ?? 150, 150) / 150 * 100 + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;1,9..144,800&family=JetBrains+Mono:wght@500;600;700&display=swap');

/* Base Structure Foundation */
.hero-container {
  --ink: #14161f;
  --ink-muted: #6b7080;
  --paper: #f4f5f7;
  --hairline: rgba(20, 22, 31, 0.12);
  --accent: #5b6472;
  --mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
  --display: 'Fraunces', ui-serif, Georgia, serif;

  position: relative;
  min-height: 100vh;
  width: 100%;
  background: var(--paper);
  color: var(--ink);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow-x: hidden;
  display: flex;
}

/* ==========================================
   LEGENDARY TIER — full prestige token flip
   ========================================== */
.hero-container.is-legendary-tier {
  --ink: #f3efe6;
  --ink-muted: #a39e93;
  --paper: #0f0d0b;
  --hairline: rgba(212, 175, 55, 0.2);
  --accent: #d4af37;
}

/* Holographic rainbow shimmer for legendary creatures */
.foil-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.08;
  background: linear-gradient(
    125deg,
    #ff0000 0%, #ff7f00 10%, #ffff00 20%, #00ff00 30%, 
    #00ffff 40%, #0000ff 50%, #4b0082 60%, #9400d3 70%, #ff0000 100%
  );
  background-size: 400% 400%;
  animation: shimmer-foil 12s linear infinite;
}

/* Per-type accent tokens */
.theme-fire { --accent: #dc3d2e; }
.theme-water { --accent: #2f7de0; }
.theme-grass { --accent: #2f9e52; }
.theme-electric { --accent: #d9a91a; }
.theme-psychic { --accent: #d1408f; }
.theme-ice { --accent: #2bb7c9; }
.theme-dragon { --accent: #5b53d6; }
.theme-dark { --accent: #3f4451; }
.theme-bug { --accent: #7ca82a; }

/* Navigation Layer */
.nav-overlay {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 90px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 3rem;
  z-index: 10;
}

.back-btn {
  position: fixed;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-family: var(--mono);
  font-weight: 600;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.is-legendary-tier .back-btn {
  border-color: var(--accent);
  background: rgba(212, 175, 55, 0.05);
}

.back-btn:hover {
  background: #ffffff;
  color: #14161f;
  transform: translateX(-4px);
}

.is-legendary-tier .back-btn:hover {
  background: var(--accent);
  color: #0a0806;
}

.back-btn .icon { width: 1.1rem; height: 1.1rem; }
.right-nav { display: flex; align-items: center; gap: 1.5rem; margin-left: auto; color: var(--ink); }

.tier-tag {
  font-family: var(--mono);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--accent);
  border: 1px solid var(--accent);
  padding: 0.35rem 0.75rem;
  background: rgba(212, 175, 55, 0.08);
}

.id-watermark {
  font-family: var(--mono);
  font-size: 2.2rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.14);
  letter-spacing: -1px;
}

/* Two Column Split Grid Layout — straight, undecorated edge between panes */
.landing-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  width: 100%;
  min-height: 100vh;
}

/* Left Pane: Specimen scan stage */
.art-column {
  position: relative;
  background: linear-gradient(160deg, color-mix(in srgb, var(--accent) 38%, #0b0d14) 0%, #0b0d14 100%);
  display: flex;
  align-items: flex-start; /* CRITICAL: Allows the sticky child to slide down the column */
  justify-content: center;
  padding-top: 90px;       /* Pushes the starting point down so it clears the nav overlay */
  height: 100%;
}

.is-legendary-tier .art-column {
  background: radial-gradient(circle at 30% 45%, #1a1510 0%, #0a0806 70%);
}

.grid-texture {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 34px 34px;
  pointer-events: none;
}

.ambient-glow {
  position: fixed;
  width: 480px;
  height: 480px;
  z-index: 1;
  background: radial-gradient(circle, color-mix(in srgb, var(--accent) 30%, transparent) 0%, transparent 70%);
  pointer-events: none;
}

.stage {
  position: fixed;
  top: calc(50vh - (min(68%, 460px) / 2) + 45px); 
  z-index: 2;
  width: min(68%, 460px);
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0;
  transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1),
              opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}

/* --- Directional swap animation: snap to offset instantly, then release --- */
.stage.is-entering.slide-next,
.scroll-content.is-entering.slide-next {
  transition: none;
  transform: translateX(36px);
  opacity: 0;
}
.stage.is-entering.slide-prev,
.scroll-content.is-entering.slide-prev {
  transition: none;
  transform: translateX(-36px);
  opacity: 0;
}

.stage-frame {
  position: absolute;
  inset: -20px;
  pointer-events: none;
}

.frame-tick {
  position: absolute;
  width: 22px;
  height: 22px;
  border-color: var(--accent);
  opacity: 0.7;
  transition: border-color 0.4s ease;
}
.tick-tl { top: 0; left: 0; border-top: 2px solid; border-left: 2px solid; }
.tick-tr { top: 0; right: 0; border-top: 2px solid; border-right: 2px solid; }
.tick-bl { bottom: 0; left: 0; border-bottom: 2px solid; border-left: 2px solid; }
.tick-br { bottom: 0; right: 0; border-bottom: 2px solid; border-right: 2px solid; }

.is-legendary-tier .frame-tick {
  opacity: 1;
  filter: drop-shadow(0 0 6px rgba(212, 175, 55, 0.5));
}

.scan-label {
  position: absolute;
  top: -2.4rem;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--mono);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--accent);
  opacity: 0;
  white-space: nowrap;
}
.scan-label.is-visible {
  animation: scanLabelFlicker 1.5s ease forwards;
}

.artwork-wrapper {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.giant-bg-text {
  position: absolute;
  font-family: var(--display);
  font-weight: 800;
  font-style: italic;
  font-size: 11vw;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.035);
  pointer-events: none;
  letter-spacing: -0.02em;
  z-index: -1;
}

.is-legendary-tier .giant-bg-text {
  color: rgba(212, 175, 55, 0.03);
}

.detail-sprite {
  width: 78%;
  max-width: 420px;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 30px 50px rgba(0, 0, 0, 0.5));
  clip-path: inset(100% 0 0 0);
  opacity: 0;
  transition: clip-path 1.1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
}

.detail-sprite.is-revealed {
  clip-path: inset(0 0 0 0);
  opacity: 1;
  animation: float-animation 2s ease-in-out infinite;
  animation-delay: 1.1s;
}

.scan-sweep {
  position: absolute;
  left: 4%;
  right: 4%;
  height: 3px;
  top: 0;
  z-index: 3;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  box-shadow: 0 0 16px 2px var(--accent);
  opacity: 0;
  pointer-events: none;
}
.scan-sweep.is-active {
  animation: sweepDown 1.1s cubic-bezier(0.65, 0, 0.35, 1) 1;
}

/* ==========================================
   Right Pane: Specimen record — layered,
   near-transparent decoration, straight edge
   ========================================== */
.info-column {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: var(--paper);
  display: flex;
  align-items: center;
  padding: 6rem 5rem 4rem 5rem;
  transition: background 0.3s ease;
}

/* --- Left/Right page navigation buttons --- */
.page-nav {
  position: absolute;
  top:380px;
  transform: translateY(-50%);
  z-index: 5;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--accent) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
  color: var(--accent);
  cursor: pointer;
  transition: background 0.3s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
              opacity 0.3s ease;
}

.page-nav:hover:not(:disabled) {
  background: var(--accent);
  color: var(--paper);
  border-color: var(--accent);
}

.page-nav:active:not(:disabled) {
  transform: translateY(-50%) scale(0.9);
}

.page-nav:disabled {
  opacity: 0.35;
  cursor: default;
}

.nav-prev:hover:not(:disabled) { transform: translateY(-50%) translateX(-2px); }
.nav-next:hover:not(:disabled) { transform: translateY(-50%) translateX(2px); }

.nav-prev { left: 1.75rem; }
.nav-next { right: 1.75rem; }

.nav-icon { width: 1.3rem; height: 1.3rem; }

/* The sophisticated organic seal — one continuous blot shape, barely visible */
.info-seal {
  position: absolute;
  top: -8%;
  right: -14%;
  width: 640px;
  height: 640px;
  z-index: 0;
  pointer-events: none;
}
.info-seal path {
  fill: var(--accent);
  opacity: 0.05;
}
.is-legendary-tier .info-seal path {
  opacity: 0.07;
}

/* Concentric scan-rings echoing the art-column motif, nested inside the seal */
.info-ring {
  position: absolute;
  top: -4%;
  right: -9%;
  width: 460px;
  height: 460px;
  z-index: 0;
  pointer-events: none;
}
.info-ring circle {
  fill: none;
  stroke: var(--accent);
  stroke-width: 0.75;
  opacity: 0.1;
}

/* Giant faint specimen number, mirrors giant-bg-text from the art side */
.info-monogram {
  position: absolute;
  bottom: -4%;
  left: -2%;
  font-family: var(--mono);
  font-weight: 700;
  font-size: 11rem;
  line-height: 1;
  color: var(--ink);
  opacity: 0.028;
  letter-spacing: -0.04em;
  z-index: 0;
  pointer-events: none;
  user-select: none;
}

.scroll-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1),
              opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Faint corner ticks bracketing the record, echoing the stage-frame on the left */
.corner-tick {
  width: 16px;
  height: 16px;
  opacity: 0.35;
  border-color: var(--accent) !important;
}
.corner-tick.tick-tl { top: -1.75rem; left: -1.5rem; }
.corner-tick.tick-br { bottom: -1.75rem; right: -1.5rem; }

.hero-header { margin-bottom: 2.25rem; }

/* --- Elegant onload cascade for info-column text --- */
.hero-header,
.detail-meta,
.info-group {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-header.is-revealed,
.detail-meta.is-revealed,
.info-group.is-revealed {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger children within the header for a finer cascade */
.hero-header > * {
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.hero-header.is-revealed > * {
  opacity: 1;
  transform: translateY(0);
}
.hero-header.is-revealed > .eyebrow      { transition-delay: 0.05s; }
.hero-header.is-revealed > .pokemon-name { transition-delay: 0.15s; }
.hero-header.is-revealed > .type-badges  { transition-delay: 0.25s; }

/* Sequence the sections below the header */
.detail-meta.is-revealed        { transition-delay: 0.35s; }
.dossier-group.is-revealed      { transition-delay: 0.45s; }
.info-group.is-revealed:not(.dossier-group) { transition-delay: 0.55s; }

.eyebrow {
  display: inline-block;
  font-family: var(--mono);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 0.7rem;
}

.pokemon-name {
  font-family: var(--display);
  font-weight: 700;
  font-style: italic;
  font-size: 3.8rem;
  text-transform: capitalize;
  color: var(--ink);
  letter-spacing: -0.015em;
  margin: 0 0 1rem 0;
  line-height: 1.02;
}

.is-legendary-tier .pokemon-name {
  text-shadow: 0 0 40px rgba(212, 175, 55, 0.2);
}

.type-badges { display: flex; gap: 0.5rem; }
.type-badge {
  padding: 0.4rem 1.1rem;
  border-radius: 100px;
  font-family: var(--mono);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 2.5rem;
  margin: 2.25rem 0;
  padding: 1.1rem 1.4rem;
  background: color-mix(in srgb, var(--accent) 4%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 12%, transparent);
  border-radius: 12px;
  width: fit-content;
}
.divider { width: 1px; height: 40px; background: var(--hairline); }
.meta-item { display: flex; flex-direction: column; }
.meta-value {
  font-family: var(--mono);
  font-size: 2rem;
  font-weight: 700;
  color: var(--ink);
}
.meta-value small { font-size: 0.95rem; font-weight: 500; color: var(--ink-muted); margin-left: 2px; }
.meta-label {
  font-family: var(--mono);
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--ink-muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-top: 0.15rem;
}

.section-divider {
  border: 0;
  border-top: 1px dashed var(--hairline);
  margin: 2.25rem 0;
}

h3 {
  font-family: var(--mono);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--ink-muted);
  font-weight: 700;
  margin: 0 0 1.25rem 0;
}

.is-legendary-tier h3 { color: var(--accent); }

/* Field dossier — description block with a refined pull-quote treatment */
.dossier-group { margin-bottom: 0; }

.dossier-body {
  position: relative;
  padding: 0.25rem 0 0.25rem 1.6rem;
}

.dossier-mark {
  position: absolute;
  left: -0.35rem;
  top: -1.3rem;
  font-family: var(--display);
  font-size: 3.4rem;
  font-weight: 700;
  color: var(--accent);
  opacity: 0.25;
  pointer-events: none;
}

.dossier-text {
  margin: 0;
  font-family: var(--display);
  font-weight: 500;
  font-size: 1.05rem;
  font-style: italic;
  line-height: 1.7;
  color: var(--ink-muted);
}

.dossier-text::first-letter {
  text-transform: uppercase;
}

.dossier-text.is-loading,
.dossier-text.is-empty {
  font-family: var(--mono);
  font-size: 0.85rem;
  font-style: normal;
  color: var(--ink-muted);
}

.dossier-text.is-loading {
  animation: dossierPulse 1.6s ease-in-out infinite;
}

.pill-row { display: flex; flex-wrap: wrap; gap: 0.6rem; }
.pill {
  background: var(--paper);
  border: 1px solid var(--hairline);
  padding: 0.55rem 1.3rem;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
  color: var(--ink);
  transition: border-color 0.25s ease, transform 0.25s ease;
}
.pill:hover {
  border-color: var(--accent);
  transform: translateY(-1px);
}

/* Stats Matrix Layout */
.stats-list { display: flex; flex-direction: column; gap: 1.1rem; }

.stat-row {
  display: grid;
  grid-template-columns: 55px 40px 1fr;
  align-items: center;
  gap: 1rem;
  opacity: 0;
  transform: translateX(-10px);
  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.stat-row.is-revealed {
  opacity: 1;
  transform: translateX(0);
}

.stat-name {
  font-family: var(--mono);
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--ink-muted);
  letter-spacing: 0.05em;
}
.stat-value {
  font-family: var(--mono);
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.stat-bar-track {
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  border-radius: 3px;
  height: 6px;
  width: 100%;
  overflow: hidden;
}

.stat-bar-fill {
  background: var(--accent);
  height: 100%;
  border-radius: 3px;
}

@keyframes float-animation {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-15px) scale(1.02); }
}

@keyframes shimmer-foil {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes scanLabelFlicker {
  0% { opacity: 0; }
  15% { opacity: 1; }
  75% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes sweepDown {
  0% { top: 0; opacity: 1; }
  95% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

@keyframes dossierPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* Respect reduced-motion preferences */
@media (prefers-reduced-motion: reduce) {
  .detail-sprite,
  .stat-row,
  .scan-label,
  .scan-sweep,
  .dossier-text.is-loading,
  .hero-header,
  .hero-header > *,
  .detail-meta,
  .info-group,
  .stage,
  .scroll-content {
    animation: none !important;
    transition: none !important;
    opacity: 1 !important;
    clip-path: inset(0 0 0 0) !important;
    transform: none !important;
  }
}

/* Responsive Grid Adaptation */
@media (max-width: 1024px) {
  .landing-grid { grid-template-columns: 1fr; }
  .art-column { min-height: 50vh; padding-top: 7rem; }
  .info-column { padding: 4rem 2rem; }
  .corner-tick { display: none; }
  .giant-bg-text { font-size: 18vw; }
  .info-monogram { font-size: 7rem; }
  .nav-overlay { padding: 0 1.5rem; }
  .pokemon-name { font-size: 2.6rem; }
  .stage { width: min(70%, 320px); margin-top: 0; position: relative; top: -50px;}
  .back-btn{position: relative;}
  .quote-mark { font-size: 3.5rem; top: -1.3rem; }
  .page-nav { width: 40px; height: 40px; top: 10px }
  .nav-prev { left: 0.75rem; }
  .nav-next { right: 0.75rem; }
}
</style>