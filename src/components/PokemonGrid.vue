<script setup lang="ts">
import { ref, onMounted } from "vue";

interface Pokemon {
  id: number;
  name: string;
  sprites: {front_default: string;};
  abilities: {ability: {name: string;};}[];
}

const pokemons = ref<Pokemon[]>([])

async function getPokemons() {

  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1000");
  const data = await response.json()
  const pokemonDetails = await Promise.all(
    
    data.results.map(
      async (pokemon: { url: string }) => {
        const res = await fetch(pokemon.url);
        return res.json();
      }
    )
  );

  pokemons.value = pokemonDetails;
}

onMounted(getPokemons);
</script>

<template>
  <div class="pokemon-grid">
    <div
      v-for="pokemon in pokemons"
      :key="pokemon.id"
      class="card"
    >
      <img
        :src="pokemon.sprites.front_default"
        :alt="pokemon.name"
      />

      <h3>{{ pokemon.name }}</h3>
  
        <p v-for="ability in pokemon.abilities" :key="ability.ability.name">
          {{ ability.ability.name }}
        </p>
  
    </div>
  </div>
</template>
<style scoped>
  .pokemon-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 1rem;
  justify-content: center;
  
}

.card {
  padding: 1rem;
  border: 1px solid #ffffff76;
  border-radius: 3px;
  text-align: left;
  background-color: #ffffff;

}

.pokemon-grid{
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}
p{
  font-size: 12px;
  
}
</style>
