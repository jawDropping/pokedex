<script setup lang="ts">
import { ref, onMounted } from "vue";
import { fetchPokemons, type Pokemon} from "@/api/pokemon";
import PokemonCard from "@/components/Card.vue";

const pokemons = ref<Pokemon[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

async function loadPokemons() {
  isLoading.value = true;
  error.value = null;

  try {
    const data = await fetchPokemons();
    pokemons.value = data;
  } catch (err) {
    error.value = "Failed to load pokemons.";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}
onMounted(loadPokemons);


</script>

<template>
  <<div class="pokemon-grid">
    <PokemonCard
      v-for="pokemon in pokemons"
      :key="pokemon.id"
      :pokemon="pokemon"
    />
  </div>
</template>
<style scoped>
  .pokemon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  width: 90%;
  justify-self: center;
}

.card {
  padding: 1rem;
  border: 1px solid #ffffff76;
  border-radius: 3px;
  text-align: left;
  background-color: #ffffff;
}
p{
  font-size: 12px;
  
}
</style>
