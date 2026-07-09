<script setup lang="ts">
import type { Pokemon } from "@/api/pokemon";
import PokemonCard from "@/components/Card.vue";

defineProps<{
  pokemons: Pokemon[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  (e: "load-more"): void;
  (e: "view-details", pokemon: Pokemon): void;
}>();
</script>

<template>
  <div class="pokemon-grid">
    <PokemonCard
      v-for="pokemon in pokemons"
      :key="pokemon.id"
      :pokemon="pokemon"
      @view-details="emit('view-details', $event)"
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
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  grid-auto-rows: 340px;
  gap: 2.25rem 1.75rem;
  justify-content: center;
  justify-items: center;
  width: 100%;
  margin: 2.5rem auto 3rem;
}

.load-more-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
}

.load-more-btn {
  padding: 0.7rem 2.1rem;
  border: 1px solid rgba(32, 30, 27, 0.16);
  border-radius: 999px;
  background: transparent;
  color: #201e1b;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.load-more-btn:hover:not(:disabled) {
  background: #201e1b;
  color: #f6f3ee;
  border-color: #201e1b;
  transform: translateY(-1px);
}

.load-more-btn:active:not(:disabled) {
  transform: translateY(0);
}

.load-more-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.no-more-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  color: #948d7e;
}

.error {
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  color: #b3543f;
  font-weight: 600;
  margin: 2rem 0;
  font-size: 0.85rem;
}
</style>