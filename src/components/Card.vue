<script setup lang="ts">
import { computed } from "vue";
import type { Pokemon } from "@/api/pokemon";

// Intersect Pokemon interface to safely define types without compilation errors
type CardPokemon = Pokemon & {
  types?: { slot: number; type: { name: string } }[];
  isLegendary?: boolean;
};

const props = defineProps<{
  pokemon: CardPokemon;
}>();

// 1. Safely grab the primary element type name
const primaryType = computed(() => {
  return props.pokemon.types?.[0]?.type?.name || "normal";
});

// 2. Compute dynamic URL path for the elemental SVG icon badge
const typeIconUrl = computed(() => {
  return `https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${primaryType.value}.svg`;
});
</script>

<template>
  <div 
    class="card-flip" 
    :class="[
      { 'is-legendary': pokemon.isLegendary }, 
      `type-${primaryType}`
    ]"
  >
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
              <img :src="typeIconUrl" :alt="primaryType" class="type-icon-img" />
              <span class="element-badge-text">{{ primaryType }}</span>
            </div>
          </div>
          <h3 class="pokemon-name">{{ pokemon.name }}</h3>
        </div>
        
        <div class="image-container">
          <img :src="pokemon.sprites.front_default" :alt="pokemon.name" class="pokemon-sprite" />
        </div>
        
        <div class="card-footer">
          <span class="action-hint">Hover to flip</span>
        </div>
      </div>

      <div class="card card-back">
        <div class="back-content">
          <h4>Abilities</h4>
          <div class="abilities-grid">
            <span v-for="ability in pokemon.abilities" :key="ability.ability.name" class="ability-pill">
              {{ ability.ability.name }}
            </span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* --- CORE CANVAS & PHYSICS --- */
.card-flip {
  perspective: 1500px;
  width: 240px;
  height: 320px;
  cursor: pointer;
  position: relative;
  z-index: 1;
}

.card-flip:hover {
  z-index: 10;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.7s cubic-bezier(0.15, 0.85, 0.35, 1);
  transform-style: preserve-3d;
}

.card-flip:hover .card-inner {
  transform: rotateY(180deg) scale(1.06);
}

/* --- STANDARD GLASS BASE --- */
.card {
  position: absolute;
  inset: 0;
  padding: 1.5rem;
  border-radius: 22px;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.15, 0.85, 0.35, 1);
}

.card-front {
  justify-content: space-between;
  align-items: center;
}

.card-header {
  text-align: center;
  z-index: 5;
  width: 100%;
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
}

.pokemon-sprite {
  width: 130px;
  height: 130px;
  object-fit: contain;
  transition: transform 0.4s cubic-bezier(0.15, 0.85, 0.35, 1);
}

.card-flip:hover .pokemon-sprite {
  transform: translateY(-8px) scale(1.05);
}

.card-footer {
  z-index: 5;
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

/* Standard Back Design */
.card-back {
  transform: rotateY(180deg);
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  justify-content: center;
}

.back-content h4 {
  margin: 0 0 1rem 0;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #64748b;
  text-align: center;
}

.abilities-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ability-pill {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.6rem 1rem;
  border-radius: 12px;
  font-size: 0.85rem;
  color: #e2e8f0;
  text-transform: capitalize;
  text-align: center;
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

.is-legendary .card-back h4 {
  color: #f472b6;
  text-shadow: 0 0 10px rgba(244, 114, 182, 0.4);
}

.is-legendary .ability-pill {
  background: rgba(168, 85, 247, 0.12);
  border: 1px solid rgba(168, 85, 247, 0.3);
  color: #f8fafc;
  box-shadow: inset 0 0 10px rgba(168, 85, 247, 0.1);
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
</style>