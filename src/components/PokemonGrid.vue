<script setup lang="ts">
import type { Pokemon } from "@/api/pokemon";
import PokemonCard from "@/components/Card.vue";

defineProps<{
  pokemons: Pokemon[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
}>();

defineEmits<{
  (e: "load-more"): void;
}>();
</script>

<template>
  <div class="pokemon-grid">
    <PokemonCard
      v-for="pokemon in pokemons"
      :key="pokemon.id"
      :pokemon="pokemon"
    />
  </div>

  <p v-if="error" class="error">{{ error }}</p>

  <div class="load-more-wrapper">
    <button
      v-if="hasMore"
      class="load-more-btn"
      :disabled="isLoading"
      @click="$emit('load-more')"
    >
      {{ isLoading ? "Loading..." : "Load More" }}
    </button>
    <p v-else class="no-more-text">No more Pokémon to load.</p>
  </div>
</template>

<style scoped>
.pokemon-grid {
  display: grid;
  /* Fixed: Set minmax width to match the card's width (240px) */
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  
  /* Fixed: Changed auto-rows to match card height (320px) plus extra padding for rotation */
  grid-auto-rows: 340px;
  
  /* Generous gaps give space for the 3D rotation and scale(1.03) effect */
  gap: 2.5rem 2rem;
  
  justify-content: center;
  justify-items: center; /* Ensures cards stay centered inside their respective tracks */
  width: 100%;
  max-width: 1200px; /* Constrains layout on ultra-wide screens */
  margin: 2rem auto 4rem auto;
}

.load-more-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 4rem;
}

.load-more-btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  background-color: #1e293b; /* Matches modern card dark aesthetic */
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.load-more-btn:hover:not(:disabled) {
  background-color: #0f172a;
  transform: translateY(-1px);
}

.load-more-btn:active:not(:disabled) {
  transform: translateY(0);
}

.load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.no-more-text {
  color: #64748b;
  font-size: 0.95rem;
}

.error {
  text-align: center;
  color: #dc2626;
  font-weight: 600;
  margin: 2rem 0;
}
</style>