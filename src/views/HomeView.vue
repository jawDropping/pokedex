<script setup lang="ts">
import Grid from '@/components/PokemonGrid.vue'
import {
  fetchPokemons,
  fetchAllPokemonNames,
  fetchPokemonDetailsByUrls,
  type Pokemon
} from '@/api/pokemon.ts';
import { ref, computed, onMounted, watch, inject, type Ref } from "vue"
import { useRouter, useRoute } from "vue-router"

defineOptions({ name: 'HomeView' })

const router = useRouter();
const route = useRoute();

const search = inject<Ref<string>>('search')!;

const pageSize = 60;
const offset = ref(0);
const hasMore = ref(true);
const isLoading = ref(false);
const error = ref<string | null>(null);

const pokemons = ref<Pokemon[]>([])

const allNames = ref<{ name: string; url: string }[]>([]);
const searchResults = ref<Pokemon[]>([]);
const isSearching = ref(false);
const MAX_SEARCH_RESULTS = 30;

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
  if (term && route.name !== 'home') {
    router.push({ name: 'home' });
  }

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
  loadMore();
  allNames.value = await fetchAllPokemonNames();
})

const displayedPokemons = computed(() => {
  return search.value ? searchResults.value : pokemons.value;
})

const archiveStatus = computed(() => {
  if (search.value) {
    if (isSearching.value) return 'Searching the archive…';
    const n = searchResults.value.length;
    if (n === 0) return `No specimens match “${search.value}”`;
    return `${n} match${n === 1 ? '' : 'es'} for “${search.value}”`;
  }
  return `${pokemons.value.length} specimen${pokemons.value.length === 1 ? '' : 's'} catalogued`;
})
</script>

<template>
  <main>
    <section class="archive-hero">
      <span class="hero-eyebrow">Field Archive · Vol. I</span>
      <h1 class="hero-title">Every specimen, <br /><em>catalogued in full.</em></h1>
      <div class="hero-meta">
        <span class="hero-status">{{ archiveStatus }}</span>
        <span class="meta-dot">·</span>
        <span class="hero-live"><span class="pulse"></span>Live index</span>
      </div>
    </section>

    <div class="hero-hairline"></div>

    <div class="grid-wrap">
      <Grid
        :pokemons="displayedPokemons"
        :is-loading="search ? isSearching : isLoading"
        :has-more="search ? false : hasMore"
        :error="error"
        @load-more="loadMore"
        @view-details="openDetails"
      />
    </div>
  </main>
</template>

<style scoped>
main {
  --paper: #f6f3ee;
  --ink: #201e1b;
  --ink-muted: #948d7e;
  --hairline: rgba(32, 30, 27, 0.1);
  --brass: #a68a5c;
  --mono: 'JetBrains Mono', ui-monospace, monospace;
  --display: 'Fraunces', ui-serif, Georgia, serif;

  display: block;
  width: 100vw;
  padding: 0 clamp(1.25rem, 4vw, 3rem) 4rem;
}

.archive-hero {
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(2.5rem, 6vw, 4.5rem) 0 2rem;
  animation: riseIn 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.hero-eyebrow {
  display: inline-block;
  font-family: var(--mono);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--brass);
  margin-bottom: 0.9rem;
}

.hero-title {
  font-family: var(--display);
  font-weight: 700;
  font-size: clamp(2.1rem, 4.4vw, 3.6rem);
  line-height: 1.08;
  letter-spacing: -0.01em;
  color: var(--ink);
  margin: 0 0 1.4rem 0;
}

.hero-title em {
  font-style: italic;
  font-weight: 500;
  color: var(--ink-muted);
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-family: var(--mono);
  font-size: 0.78rem;
  color: var(--ink-muted);
}

.meta-dot {
  opacity: 0.5;
}

.hero-live {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.68rem;
  font-weight: 600;
}

.pulse {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--brass);
  box-shadow: 0 0 6px rgba(166, 138, 92, 0.5);
  animation: pulse-soft 3s ease-in-out infinite;
}

.hero-hairline {
  max-width: 1200px;
  margin: 0 auto;
  border-top: 1px dashed var(--hairline);
}

.grid-wrap {
  max-width: 1200px;
  margin: 0 auto;
  animation: riseIn 1s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: 0.08s;
}

@keyframes riseIn {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse-soft {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}

@media (prefers-reduced-motion: reduce) {
  .archive-hero, .grid-wrap, .pulse {
    animation: none !important;
  }
}

@media (max-width: 640px) {
  .hero-title br { display: none; }
}
</style>