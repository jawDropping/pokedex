<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { Pokemon } from "@/api/pokemon";

type CardPokemon = Pokemon & {
  types?: { slot: number; type: { name: string } }[];
  isLegendary?: boolean;
};

const props = defineProps<{
  pokemon: CardPokemon;
}>();

const emit = defineEmits<{
  (e: "view-details", pokemon: CardPokemon): void;
}>();

function handleViewClick() {
  emit("view-details", props.pokemon);
}

const primaryType = computed(() => {
  return props.pokemon.types?.[0]?.type?.name || "normal";
});

const typeIconUrl = computed(() => {
  return `https://cdn.jsdelivr.net/gh/duiker101/pokemon-type-svg-icons@master/icons/${primaryType.value}.svg`;
});

const heightMeters = computed(() => (props.pokemon.height / 10).toFixed(1));
const weightKg = computed(() => (props.pokemon.weight / 10).toFixed(1));


const animatedSpriteUrl = computed(() => {
  const versions = (props.pokemon.sprites as any)?.versions;
  const animated = versions?.["generation-v"]?.["black-white"]?.animated?.front_default;
  return animated || props.pokemon.sprites.front_default;
});

const backGifSrc = ref("");
const backGifFallbackAttempted = ref(false);

watch(
  animatedSpriteUrl,
  (url) => {
    backGifFallbackAttempted.value = false;
    backGifSrc.value = url;
  },
  { immediate: true },
);

function handleBackGifError() {
  if (backGifFallbackAttempted.value) {
    return;
  }
  backGifFallbackAttempted.value = true;

  const rawFallback = backGifSrc.value.replace(
    "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master",
    "https://raw.githubusercontent.com/PokeAPI/sprites/master",
  );

  backGifSrc.value =
    rawFallback !== backGifSrc.value ? rawFallback : props.pokemon.sprites.front_default;
}
</script>

<template>
  <div 
    class="card-flip" 
    :class="[
      { 'is-legendary': pokemon.isLegendary }, 
      `type-${primaryType}`
    ]"
  >
    <!-- Ground shadow — lifts and softens as the card turns -->
    <div class="card-shadow"></div>

    <div class="card-inner">
      
      <div class="card card-front">
        <div v-if="pokemon.isLegendary" class="legendary-shimmer"></div>
        <div class="card-glow"></div>
        
        <div class="card-header">
          <div class="header-left">
            <span class="id-badge">#{{ String(pokemon.id || 0).padStart(3, '0') }}</span>
            
            <span v-if="pokemon.isLegendary" class="legendary-tag">
              <span class="sparkle">✦</span> Legendary <span class="sparkle">✦</span>
            </span>

            <div v-else class="element-badge-wrapper">
              <img :src="typeIconUrl" :alt="primaryType" class="type-icon-img" loading="lazy" />
              <span class="element-badge-text">{{ primaryType }}</span>
            </div>
          </div>
          <h3 class="pokemon-name">{{ pokemon.name }}</h3>
        </div>
        
        <div class="image-container">
          <img :src="pokemon.sprites.front_default" :alt="pokemon.name" class="pokemon-sprite" loading="lazy" />
        </div>
        
        <div class="card-footer">
          <span class="action-hint">Hover to flip</span>
        </div>
      </div>

      <div class="card card-back">
        <div v-if="pokemon.isLegendary" class="legendary-shimmer"></div>

        <div class="back-header back-stagger">
          <span class="back-id">#{{ String(pokemon.id || 0).padStart(3, '0') }}</span>
          <h3 class="back-name">{{ pokemon.name }}</h3>
          <div class="back-type-row">
            <span
              v-for="t in pokemon.types"
              :key="t.type.name"
              class="back-type-pill"
            >
              {{ t.type.name }}
            </span>
          </div>
        </div>

        <div class="back-gif-wrapper back-stagger">
          <div class="back-gif-glow"></div>
          <img :src="backGifSrc" :alt="`${pokemon.name} animation`" class="back-gif" loading="lazy" @error="handleBackGifError" />
        </div>

        <div class="overview-stats back-stagger">
          <div class="overview-stat">
            <span class="overview-value">{{ heightMeters }}<small>m</small></span>
            <span class="overview-label">Height</span>
          </div>
          <div class="overview-divider"></div>
          <div class="overview-stat">
            <span class="overview-value">{{ weightKg }}<small>kg</small></span>
            <span class="overview-label">Weight</span>
          </div>
        </div>

        <button class="discover-btn back-stagger" @click.stop="handleViewClick">
          <span>Catch</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="discover-icon">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </button>
      </div>

    </div>

    <!-- Light sheen — sweeps across independent of the 3D rotation -->
    <div class="sheen" aria-hidden="true"></div>
  </div>
</template>

<style scoped>
.card-flip {
  perspective: 2200px;
  width: 240px;
  height: 320px;
  cursor: pointer;
  position: relative;
  z-index: 1;
}

.card-flip:hover {
  z-index: 10;
}

/* ==========================================================================
   GROUND SHADOW — the card "lifts" off the surface as it turns
   ========================================================================== */
.card-shadow {
  position: absolute;
  left: 8%;
  right: 8%;
  bottom: -14px;
  height: 24px;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(15, 23, 42, 0.22) 0%, transparent 72%);
  filter: blur(6px);
  opacity: 0.5;
  transform: scale(0.88) translateY(0);
  transition: opacity 0.95s cubic-bezier(0.22, 1, 0.36, 1),
              transform 0.95s cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
  z-index: 0;
}

.card-flip:hover .card-shadow {
  opacity: 0.85;
  transform: scale(1.04) translateY(6px);
}

/* ==========================================================================
   LIGHT SHEEN — a soft diagonal highlight that passes over the card as
   it rotates, independent of the 3D transform (sits flat above everything)
   ========================================================================== */
.sheen {
  position: absolute;
  inset: 0;
  border-radius: 22px;
  pointer-events: none;
  z-index: 20;
  overflow: hidden;
}

.sheen::after {
  content: '';
  position: absolute;
  top: -20%;
  bottom: -20%;
  left: -30%;
  width: 45%;
  background: linear-gradient(
    100deg,
    transparent 0%,
    rgba(255, 255, 255, 0.5) 48%,
    transparent 100%
  );
  transform: translateX(-40%) skewX(-14deg);
  opacity: 0;
  mix-blend-mode: overlay;
}

.card-flip:hover .sheen::after {
  animation: sheenPass 1.05s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes sheenPass {
  0%   { transform: translateX(-40%) skewX(-14deg); opacity: 0; }
  30%  { opacity: 0.9; }
  55%  { opacity: 0.35; }
  100% { transform: translateX(340%) skewX(-14deg); opacity: 0; }
}

/* ==========================================================================
   THE FLIP ITSELF — spring-weighted rotation, gentle lift, subtle depth
   ========================================================================== */
.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  will-change: transform;
  transition: transform 0.95s cubic-bezier(0.34, 1.35, 0.64, 1);
}

.card-flip:hover .card-inner {
  transform: translateY(-8px) rotateY(180deg);
}

/* --- STANDARD GLASS BASE --- */
.card {
  position: absolute;
  inset: 0;
  padding: 1.5rem;
  border-radius: 22px;
  backface-visibility: hidden;
  transform-style: preserve-3d;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: box-shadow 0.6s ease;
}

.card-flip:hover .card {
  box-shadow: 0 26px 46px rgba(0, 0, 0, 0.14);
}

.card-front {
  justify-content: space-between;
  align-items: center;
}

/* Subtle Z-depth layering on the front face — closer elements sit
   nearer the viewer, giving the card real dimensionality at rest */
.card-header {
  text-align: center;
  z-index: 5;
  width: 100%;
  transform: translateZ(18px);
}

.header-left {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.4rem;
}

.id-badge {
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 1px;
}

/* --- LIGHT NEUTRAL WRAPPER --- */
.element-badge-wrapper {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 4px 8px;
  border-radius: 8px;
  background: rgba(241, 245, 249, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.8);
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

.type-icon-img {
  width: 14px;
  height: 14px;
  object-fit: contain;
  transition: filter 0.3s ease;
}

.element-badge-text {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pokemon-name {
  margin: 0.2rem 0 0 0;
  font-size: 1.35rem;
  font-weight: 600;
  color: #1e293b;
  text-transform: capitalize;
}

.image-container {
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  transform: translateZ(34px);
}

.pokemon-sprite {
  width: 130px;
  height: 130px;
  object-fit: contain;
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.card-flip:hover .pokemon-sprite {
  transform: translateY(-8px) scale(1.05);
}

.card-footer {
  z-index: 5;
  transform: translateZ(12px);
}

.action-hint {
  font-size: 0.7rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.card-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140px;
  height: 140px;
  z-index: 2;
  pointer-events: none;
}

/* ==========================================================================
   ELEMENT-SPECIFIC VARIATIONS (Glows & Solid Icon Configurations)
   ========================================================================== */

/* Fire Type (Solid Red Icon) */
.type-fire .card-glow { background: radial-gradient(circle, rgba(239, 68, 68, 0.22) 0%, transparent 70%); }
.type-fire .element-badge-text { color: #dc2626; }
.type-fire .type-icon-img { filter: invert(25%) sepia(87%) saturate(5940%) hue-rotate(352deg) brightness(96%) contrast(89%); }

/* Water Type (Solid Blue Icon) */
.type-water .card-glow { background: radial-gradient(circle, rgba(59, 130, 246, 0.22) 0%, transparent 70%); }
.type-water .element-badge-text { color: #2563eb; }
.type-water .type-icon-img { filter: invert(34%) sepia(81%) saturate(3660%) hue-rotate(215deg) brightness(97%) contrast(96%); }

/* Grass Type (Solid Green Icon) */
.type-grass .card-glow { background: radial-gradient(circle, rgba(34, 197, 94, 0.22) 0%, transparent 70%); }
.type-grass .element-badge-text { color: #16a34a; }
.type-grass .type-icon-img { filter: invert(47%) sepia(74%) saturate(464%) hue-rotate(93deg) brightness(92%) contrast(85%); }

/* Electric Type (Solid Amber Icon) */
.type-electric .card-glow { background: radial-gradient(circle, rgba(234, 179, 8, 0.25) 0%, transparent 70%); }
.type-electric .element-badge-text { color: #b45309; }
.type-electric .type-icon-img { filter: invert(46%) sepia(61%) saturate(1472%) hue-rotate(14deg) brightness(93%) contrast(98%); }

/* Psychic Type (Solid Pink Icon) */
.type-psychic .card-glow { background: radial-gradient(circle, rgba(219, 39, 119, 0.22) 0%, transparent 70%); }
.type-psychic .element-badge-text { color: #db2777; }
.type-psychic .type-icon-img { filter: invert(27%) sepia(91%) saturate(3025%) hue-rotate(317deg) brightness(91%) contrast(91%); }

/* Ice Type (Solid Cyan Icon) */
.type-ice .card-glow { background: radial-gradient(circle, rgba(6, 182, 212, 0.22) 0%, transparent 70%); }
.type-ice .element-badge-text { color: #0891b2; }
.type-ice .type-icon-img { filter: invert(45%) sepia(85%) saturate(1142%) hue-rotate(152deg) brightness(92%) contrast(95%); }

/* Dragon Type (Solid Indigo Icon) */
.type-dragon .card-glow { background: radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, transparent 70%); }
.type-dragon .element-badge-text { color: #4f46e5; }
.type-dragon .type-icon-img { filter: invert(28%) sepia(75%) saturate(3477%) hue-rotate(234deg) brightness(95%) contrast(92%); }

/* Dark Type (Solid Slate Icon) */
.type-dark .card-glow { background: radial-gradient(circle, rgba(71, 85, 105, 0.25) 0%, transparent 70%); }
.type-dark .element-badge-text { color: #334155; }
.type-dark .type-icon-img { filter: invert(24%) sepia(18%) saturate(1160%) hue-rotate(176deg) brightness(91%) contrast(88%); }

/* Bug Type (Solid Lime Icon) */
.type-bug .card-glow { background: radial-gradient(circle, rgba(132, 204, 22, 0.2) 0%, transparent 70%); }
.type-bug .element-badge-text { color: #4d7c0f; }
.type-bug .type-icon-img { filter: invert(41%) sepia(45%) saturate(1312%) hue-rotate(48deg) brightness(93%) contrast(93%); }

/* Normal & Fallback Neutral Setup */
.card-glow { background: radial-gradient(circle, rgba(42, 117, 187, 0.12) 0%, transparent 70%); }
.element-badge-text { color: #64748b; }
.type-icon-img { filter: invert(49%) sepia(8%) saturate(614%) hue-rotate(177deg) brightness(94%) contrast(89%); }

/* --- Type accent tokens, drive the back panel's colors --- */
.card-flip { --type-accent: #64748b; }
.type-fire { --type-accent: #ef4444; }
.type-water { --type-accent: #3b82f6; }
.type-grass { --type-accent: #22c55e; }
.type-electric { --type-accent: #eab308; }
.type-psychic { --type-accent: #ec4899; }
.type-ice { --type-accent: #22d3ee; }
.type-dragon { --type-accent: #6366f1; }
.type-dark { --type-accent: #64748b; }
.type-bug { --type-accent: #a3e635; }

/* ==========================================================================
   CARD BACK — overview panel with animated sprite
   ========================================================================== */
.card-back {
  transform: rotateY(180deg);
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  justify-content: space-between;
  align-items: center;
  text-align: center;
}

/* Staggered cascade — back content fades and settles in AFTER the card
   has turned past its midpoint, instead of popping in all at once */
.back-stagger {
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.card-flip:hover .back-header.back-stagger { transition-delay: 0.3s; opacity: 1; transform: none; }
.card-flip:hover .back-gif-wrapper.back-stagger { transition-delay: 0.4s; opacity: 1; transform: none; }
.card-flip:hover .overview-stats.back-stagger { transition-delay: 0.55s; opacity: 1; transform: none; }
.card-flip:hover .discover-btn.back-stagger { transition-delay: 0.72s; opacity: 1; transform: none; }

.back-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  z-index: 2;
}

.back-id {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.3);
}

.back-name {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  color: #f8fafc;
  text-transform: capitalize;
}

.back-type-row {
  display: flex;
  gap: 0.4rem;
  margin-top: 0.15rem;
}

.back-type-pill {
  padding: 0.2rem 0.7rem;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--type-accent);
  background: color-mix(in srgb, var(--type-accent) 16%, transparent);
  border: 1px solid color-mix(in srgb, var(--type-accent) 35%, transparent);
}

.back-gif-wrapper {
  position: relative;
  width: 96px;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.back-gif-glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--type-accent) 30%, transparent) 0%, transparent 70%);
}

.back-gif {
  position: relative;
  width: 72px;
  height: 72px;
  object-fit: contain;
  image-rendering: pixelated;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.4));
}

.overview-stats {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  z-index: 2;
}

.overview-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.overview-value {
  font-size: 1.3rem;
  font-weight: 800;
  color: #f1f5f9;
}

.overview-value small {
  font-size: 0.75rem;
  font-weight: 500;
  color: #94a3b8;
  margin-left: 2px;
}

.overview-label {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #64748b;
  margin-top: 0.1rem;
}

.overview-divider {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
}

.discover-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.4rem;
  margin-top: 7px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: #f1f5f9;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: background 0.3s cubic-bezier(0.22, 1, 0.36, 1),
              border-color 0.3s cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1),
              transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
              opacity 0.5s ease, translate 0.5s ease;
  z-index: 2;
}

.discover-btn:hover {
  background: color-mix(in srgb, var(--type-accent) 20%, rgba(255, 255, 255, 0.06));
  border-color: color-mix(in srgb, var(--type-accent) 55%, transparent);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.discover-btn:active {
  transform: translateY(0);
}

.discover-icon {
  width: 15px;
  height: 15px;
  transition: transform 0.3s cubic-bezier(0.15, 0.85, 0.35, 1);
}

.discover-btn:hover .discover-icon {
  transform: translateX(3px);
}

/* Legendary variant — ties into your existing gold/purple/pink gradient theme */
.is-legendary .discover-btn {
  background: linear-gradient(90deg, #ffca05, #ff007f, #7000ff);
  background-size: 200% auto;
  border: none;
  color: #0f0c1b;
  box-shadow: 0 0 12px rgba(168, 85, 247, 0.3);
  animation: textFlow 4s linear infinite;
}

.is-legendary .discover-btn:hover {
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
  transform: translateY(-2px) scale(1.03);
}

/* ==========================================================================
   YOUR ORIGINAL LEGENDARY THEME (UNCHANGED ANIMATIONS & FILTERS)
   ========================================================================== */
.is-legendary .card-front {
  background: linear-gradient(150deg, #070a13 0%, #0f0c1b 50%, #1a0b2e 100%);
  border: 2px solid transparent;
  background-image: linear-gradient(#070a13, #1a0b2e), linear-gradient(135deg, #ffd700, #ff007f, #7000ff, #ffd700);
  background-origin: border-box;
  background-clip: padding-box, border-box;
}

.is-legendary .legendary-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    110deg,
    rgba(255, 215, 0, 0) 30%,
    rgba(255, 255, 255, 0.12) 45%,
    rgba(255, 215, 0, 0.2) 50%,
    rgba(255, 255, 255, 0.12) 55%,
    rgba(255, 215, 0, 0) 70% 
  );
  background-size: 200% 100%;
  animation: holoSweep 6s linear infinite;
  z-index: 3;
  pointer-events: none;
}

.is-legendary .card-glow {
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, rgba(147, 51, 234, 0.35) 0%, rgba(219, 39, 119, 0.1) 40%, transparent 70%) !important;
  animation: pulseGlow 4s ease-in-out infinite alternate;
}

.is-legendary .pokemon-name {
  color: #ffffff;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-shadow: 0 0 15px rgba(168, 85, 247, 0.6), 0 0 30px rgba(168, 85, 247, 0.2);
}

.is-legendary .legendary-tag {
  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  background: linear-gradient(90deg, #ffca05, #ff007f, #00f0ff);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: textFlow 3s linear infinite;
}

.is-legendary .sparkle {
  -webkit-text-fill-color: initial; 
  color: #ffd700;
  text-shadow: 0 0 8px #ffd700;
}

.is-legendary .id-badge {
  color: #475569;
}

.is-legendary .action-hint {
  color: #a855f7;
  font-weight: 700;
  text-shadow: 0 0 8px rgba(168, 85, 247, 0.4);
}

.is-legendary .card-back {
  background: linear-gradient(135deg, #0b031a 0%, #1c053a 100%);
  border: 2px solid rgba(168, 85, 247, 0.4);
  box-shadow: inset 0 0 30px rgba(168, 85, 247, 0.2);
}

.is-legendary .back-id {
  color: rgba(255, 215, 0, 0.4);
}

.is-legendary .back-name {
  text-shadow: 0 0 15px rgba(168, 85, 247, 0.5);
}

.is-legendary .back-type-pill {
  color: #ffd700;
  background: rgba(255, 215, 0, 0.08);
  border-color: rgba(255, 215, 0, 0.3);
}

.is-legendary .back-gif {
  filter: drop-shadow(0 4px 14px rgba(255, 215, 0, 0.35));
}

.is-legendary .overview-value {
  color: #ffd700;
}

.card-flip.is-legendary:hover .card {
  box-shadow: 0 25px 50px rgba(147, 51, 234, 0.35), 0 0 30px rgba(255, 215, 0, 0.1);
}

/* --- ANIMATION ENGINE KEYFRAMES --- */
@keyframes holoSweep {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes pulseGlow {
  0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.7; }
  100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
}

@keyframes textFlow {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

/* Respect reduced-motion preferences */
@media (prefers-reduced-motion: reduce) {
  .card-inner,
  .card-shadow,
  .pokemon-sprite,
  .sheen::after,
  .back-stagger {
    transition: none !important;
    animation: none !important;
  }
  .card-flip:hover .card-inner {
    transform: rotateY(180deg);
  }
  .back-stagger {
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>