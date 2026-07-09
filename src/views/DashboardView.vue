<script setup lang="ts">
import Header from '../components/Header.vue';
import Grid from '../components/PokemonGrid.vue';
import { useRoute, useRouter } from 'vue-router';
import {
  fetchPokemons,
  fetchAllPokemonNames,
  fetchPokemonDetailsByUrls,
  type Pokemon
} from '../api/pokemon.ts';
import { ref, computed, onMounted, watch } from "vue";

const router = useRouter();

const pageSize = 60;
const offset = ref(0);
const hasMore = ref(true);
const isLoading = ref(false);
const error = ref<string | null>(null);

const pokemons = ref<Pokemon[]>([]);
const search = ref("");

const allNames = ref<{ name: string; url: string }[]>([]);
const searchResults = ref<Pokemon[]>([]);
const isSearching = ref(false);
const MAX_SEARCH_RESULTS = 30;

// Programmatically navigate to the specific route
function openDetails(pokemon: Pokemon) {
  router.push({ name: 'pokemon-details', params: { id: pokemon.id } });
}

async function loadMore() {
  if (isLoading.value || !hasMore.value) return;

  isLoading.value = true;
  error.value = null;

  try {
    const result = await fetchPokemons(pageSize, offset.value);
    pokemons.value.push(...result.pokemons);
    hasMore.value = result.hasMore;
    offset.value += pageSize;
  } catch (err) {
    error.value = "Failed to load pokemons.";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}

let searchDebounceTimer: ReturnType<typeof setTimeout>;
watch(search, (term) => {
  clearTimeout(searchDebounceTimer);

  if (!term) {
    searchResults.value = [];
    return;
  }

  searchDebounceTimer = setTimeout(async () => {
    isSearching.value = true;
    error.value = null;

    try {
      const matches = allNames.value
        .filter((p) => p.name.includes(term.toLowerCase()))
        .slice(0, MAX_SEARCH_RESULTS);

      searchResults.value = await fetchPokemonDetailsByUrls(matches.map((m) => m.url));
    } catch (err) {
      error.value = "Failed to search pokemons.";
      console.error(err);
    } finally {
      isSearching.value = false;
    }
  }, 300);
});

onMounted(async () => {
  if (pokemons.value.length === 0) {
    loadMore();
  }
  allNames.value = await fetchAllPokemonNames();
});

const displayedPokemons = computed(() => {
  return search.value ? searchResults.value : pokemons.value;
});
</script>

<template>
  <div class="header">
    <Header v-model:search="search" />
  </div>
  <main>
    <Grid
      :pokemons="displayedPokemons"
      :is-loading="search ? isSearching : isLoading"
      :has-more="search ? false : hasMore"
      :error="error"
      @load-more="loadMore"
      @view-details="openDetails"
    />
  </main>
</template>

<style scoped>
main {
  padding: 0 1.5rem 0 1.5rem;
  width: 100vw;
  margin-top: 10px;
}
.header{
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 100;
}
</style>