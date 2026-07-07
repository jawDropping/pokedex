<script setup lang="ts">
import { ref, watch, onMounted } from "vue"
import { useRouter } from "vue-router"
import PokemonDetails from '@/components/PokemonDetails.vue'
import { fetchPokemonById, type Pokemon } from '@/api/pokemon.ts'

const props = defineProps<{
  id: string
}>()

const router = useRouter();

const pokemon = ref<Pokemon | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

async function loadPokemon(id: string) {
  isLoading.value = true;
  error.value = null;
  pokemon.value = null;

  try {
    pokemon.value = await fetchPokemonById(id);
  } catch (err) {
    error.value = "Failed to load Pokémon details.";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => loadPokemon(props.id));


watch(() => props.id, (newId) => loadPokemon(newId));

function close() {
  
  if (window.history.state?.back) {
    router.back();
  } else {
    router.push({ name: 'home' });
  }
}

</script>

<template>
  <p v-if="isLoading">Loading...</p>
  <p v-else-if="error">{{ error }}</p>
  <PokemonDetails
    v-else-if="pokemon"
    :pokemon="pokemon"
    @close="close"
  />
</template>