<script setup lang="ts">
import type { Pokemon } from "@/api/pokemon";
defineProps<{pokemon: Pokemon;}>();
</script>

<template>
  <div class="card">
    <img :src="pokemon.sprites.front_default" :alt="pokemon.name" />
    <h3>{{ pokemon.name }}</h3>
    <p v-for="ability in pokemon.abilities" :key="ability.ability.name">
      {{ ability.ability.name }}
    </p>
  </div>
</template>

<style scoped>
.card {
  padding: 1rem;
  border-radius: 3px;
  text-align: left;
  background-color: #f2f1f1;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

h3 {
  text-transform: capitalize;
}

p {
  font-size: 12px;
  text-transform: capitalize;
}
</style>