<script setup lang="ts">
import type { Pokemon } from "@/api/pokemon";
import { computed } from "vue";

const props = defineProps<{
  pokemon: Pokemon;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

// Dynamic background color mapping based on primary type
const mainType = computed(() => props.pokemon.types[0]?.type.name || "normal");

// Game design logic: Determine if this layout gets the ultimate Tier-1 prestige skin
// (You can map specific IDs, or pass an explicit prop if your API has `.is_legendary`)
const legendaryIds = [144, 145, 146, 150, 249, 250, 382, 383, 384, 483, 484, 487, 716, 717, 718, 785, 786, 787, 788, 1007, 1008];
const isLegendary = computed(() => {
  return legendaryIds.includes(props.pokemon.id) || (props.pokemon as any).is_legendary === true;
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
        <span class="btn-text">Exit Sanctuary</span>
      </button>
      <div class="right-nav">
        <span v-if="isLegendary" class="tier-tag">Legendary Archive</span>
        <span class="id-watermark">#{{ String(pokemon.id).padStart(3, '0') }}</span>
      </div>
    </nav>

    <main class="landing-grid">
      
      <section class="art-column">
        <div class="ambient-glow"></div>
        <div class="diagonal-bg"></div>
        
        <div v-if="isLegendary" class="ui-frame-elements">
          <div class="corner-tl"></div>
          <div class="corner-br"></div>
          <div class="crosshairs"></div>
        </div>

        <div class="artwork-wrapper">
          <h1 class="giant-bg-text">{{ pokemon.name }}</h1>
          <img 
            :src="(pokemon.sprites as any).other?.['official-artwork']?.front_default || pokemon.sprites.front_default" 
            :alt="pokemon.name" 
            class="detail-sprite" 
          />
        </div>
      </section>

      <section class="info-column">
        <div class="scroll-content">
          <header class="hero-header">
            <div class="type-badges">
              <span
                v-for="t in pokemon.types"
                :key="t.type.name"
                class="type-badge"
                :class="`type-${t.type.name}`"
              >
                {{ t.type.name }}
              </span>
            </div>
            <h2 class="pokemon-name">{{ pokemon.name }}</h2>
          </header>

          <div class="detail-meta">
            <div class="meta-item">
              <span class="meta-value">{{ pokemon.height / 10 }}<small>m</small></span>
              <span class="meta-label">Height</span>
            </div>
            <div class="divider"></div>
            <div class="meta-item">
              <span class="meta-value">{{ pokemon.weight / 10 }}<small>kg</small></span>
              <span class="meta-label">Weight</span>
            </div>
          </div>

          <hr class="section-divider" />

          <div class="info-group">
            <h3>Intrinsic Perks</h3>
            <div class="pill-row">
              <span v-for="a in pokemon.abilities" :key="a.ability.name" class="pill">
                {{ a.ability.name.replace('-', ' ') }}
              </span>
            </div>
          </div>

          <div class="info-group">
            <h3>Battle Metrics</h3>
            <div class="stats-list">
              <div v-for="s in pokemon.stats" :key="s.stat.name" class="stat-row">
                <span class="stat-name">{{ formatStatName(s.stat.name) }}</span>
                <span class="stat-value">{{ s.base_stat }}</span>
                <div class="stat-bar-track">
                  <div
                    class="stat-bar-fill"
                    :style="{ width: Math.min(s.base_stat, 150) / 150 * 100 + '%' }"
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
/* Base Structure Foundation */
.hero-container {
  --primary-theme: #2563eb;
  --bg-gradient: linear-gradient(135deg, #1e293b, #0f172a);
  --ui-surface: #ffffff;
  --ui-text: #0f172a;
  --ui-text-muted: #64748b;
  --ui-border: #e2e8f0;
  --stat-track: #f1f5f9;
  
  position: relative;
  min-height: 100vh;
  width: 100%;
  background: var(--ui-surface);
  color: var(--ui-text);
  font-family: system-ui, -apple-system, sans-serif;
  overflow-x: hidden;
  display: flex;
}

/* ==========================================
   LEGENDARY SKIN OVERRIDES (The Prestige Theme)
   ========================================== */
.hero-container.is-legendary-tier {
  --primary-theme: #d4af37; /* Royal Imperial Gold Accent */
  --bg-gradient: radial-gradient(circle at 30% 50%, #1a1510, #0a0806); /* Dark Onyx Void */
  --ui-surface: #0f0d0b;
  --ui-text: #f3efe6;
  --ui-text-muted: #a39e93;
  --ui-border: rgba(212, 175, 55, 0.2);
  --stat-track: #1f1b16;
}

/* Holographic dynamic rainbow shimmer for Legendary creatures */
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

/* UI Corner Frames */
.ui-frame-elements {
  position: absolute;
  inset: 4rem;
  pointer-events: none;
  z-index: 3;
}
.corner-tl {
  position: absolute;
  top: 0; left: 0; width: 24px; height: 24px;
  border-top: 2px solid var(--primary-theme); border-left: 2px solid var(--primary-theme);
}
.corner-br {
  position: absolute;
  bottom: 0; right: 0; width: 24px; height: 24px;
  border-bottom: 2px solid var(--primary-theme); border-right: 2px solid var(--primary-theme);
}

/* Standard Base Mapping Rules */
.theme-fire:not(.is-legendary-tier) { --primary-theme: #ff4d4d; --bg-gradient: linear-gradient(135deg, #ff4d4d, #f59e0b); }
.theme-water:not(.is-legendary-tier) { --primary-theme: #3b82f6; --bg-gradient: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.theme-grass:not(.is-legendary-tier) { --primary-theme: #10b981; --bg-gradient: linear-gradient(135deg, #10b981, #047857); }
.theme-electric:not(.is-legendary-tier) { --primary-theme: #eab308; --bg-gradient: linear-gradient(135deg, #facc15, #ca8a04); }

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
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px; /* Angled corners instead of pill badges */
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.is-legendary-tier .back-btn {
  border-color: var(--primary-theme);
  background: rgba(212, 175, 55, 0.03);
}

.back-btn:hover {
  background: #ffffff;
  color: #0f172a;
  transform: translateX(-4px);
}

.is-legendary-tier .back-btn:hover {
  background: var(--primary-theme);
  color: #0a0806;
}

.back-btn .icon { width: 1.1rem; height: 1.1rem; }
.right-nav { display: flex; align-items: center; gap: 1.5rem; }

.tier-tag {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--primary-theme);
  border: 1px solid var(--primary-theme);
  padding: 0.35rem 0.75rem;
  background: rgba(212, 175, 55, 0.1);
}

.id-watermark {
  font-size: 2.5rem;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.12);
  letter-spacing: -1px;
}

/* Two Column Split Grid Layout */
.landing-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  width: 100%;
  min-height: 100vh;
}

/* Left Pane: Visual Showcase */
.art-column {
  position: relative;
  background: var(--bg-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.diagonal-bg {
  position: absolute;
  right: -10%; top: -10%; width: 50%; height: 120%;
  background: rgba(255, 255, 255, 0.02);
  transform: rotate(12deg);
}

.ambient-glow {
  position: absolute;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(var(--primary-theme), 0.15) 0%, rgba(0,0,0,0) 70%);
  z-index: 1;
}

.artwork-wrapper {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.giant-bg-text {
  position: absolute;
  font-size: 11vw;
  font-weight: 900;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.03);
  pointer-events: none;
  letter-spacing: -0.05em;
  z-index: -1;
}

.is-legendary-tier .giant-bg-text {
  color: rgba(212, 175, 55, 0.02);
}

.detail-sprite {
  width: 75%;
  max-width: 500px;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 30px 50px rgba(0,0,0,0.5));
  animation: float-animation 5s ease-in-out infinite;
}

/* Right Pane: Interface details */
.info-column {
  background: var(--ui-surface);
  display: flex;
  align-items: center;
  padding: 6rem 5rem 4rem 5rem;
  transition: background 0.3s ease;
}

.scroll-content { width: 100%; max-width: 520px; margin: 0 auto; }
.hero-header { margin-bottom: 2rem; }

.pokemon-name {
  font-size: 4rem;
  font-weight: 900;
  text-transform: capitalize;
  color: var(--ui-text);
  letter-spacing: -0.04em;
  margin-top: 0.5rem;
}

.is-legendary-tier .pokemon-name {
  text-shadow: 0 0 40px rgba(212, 175, 55, 0.2);
}

.type-badges { display: flex; gap: 0.5rem; }
.type-badge {
  padding: 0.4rem 1.2rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: #f1f5f9;
  color: #475569;
}

.is-legendary-tier .type-badge {
  background: #1f1b16;
  color: var(--primary-theme);
  border: 1px solid var(--ui-border);
}

/* Physical Specs Layout */
.detail-meta { display: flex; align-items: center; gap: 2.5rem; margin: 2rem 0; }
.divider { width: 1px; height: 40px; background: var(--ui-border); }
.meta-item { display: flex; flex-direction: column; }
.meta-value { font-size: 2.2rem; font-weight: 800; color: var(--ui-text); }
.meta-value small { font-size: 1rem; font-weight: 500; color: var(--ui-text-muted); margin-left: 2px; }
.meta-label { font-size: 0.8rem; font-weight: 700; color: var(--ui-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

.section-divider { border: 0; height: 1px; background: var(--ui-border); margin: 2.5rem 0; }
.info-group { margin-bottom: 2.5rem; }

h3 {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--ui-text-muted);
  font-weight: 800;
  margin-bottom: 1.25rem;
}

.is-legendary-tier h3 {
  color: var(--primary-theme);
}

.pill-row { display: flex; flex-wrap: wrap; gap: 0.6rem; }
.pill {
  background: var(--ui-surface);
  border: 1px solid var(--ui-border);
  padding: 0.6rem 1.4rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
  color: var(--ui-text);
}

/* Stats Matrix Layout */
.stats-list { display: flex; flex-direction: column; gap: 1.2rem; }
.stat-row { display: grid; grid-template-columns: 55px 45px 1fr; align-items: center; gap: 1rem; }
.stat-name { font-size: 0.75rem; font-weight: 800; color: var(--ui-text-muted); letter-spacing: 0.05em; }
.stat-value { font-weight: 800; font-size: 0.9rem; color: var(--ui-text); }

.stat-bar-track {
  background: var(--stat-track);
  border-radius: 2px;
  height: 6px;
  width: 100%;
}

.stat-bar-fill {
  background: var(--primary-theme);
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Keyframe Animations */
@keyframes float-animation {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-15px) scale(1.02); }
}

@keyframes shimmer-foil {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Responsive Grid Adaptation */
@media (max-width: 1024px) {
  .landing-grid { grid-template-columns: 1fr; }
  .art-column { min-height: 50vh; padding-top: 7rem; }
  .ui-frame-elements { inset: 2rem; }
  .info-column { padding: 4rem 2rem; }
  .giant-bg-text { font-size: 18vw; }
  .nav-overlay { padding: 0 1.5rem; }
  .pokemon-name { font-size: 3rem; }
}
</style>