<script setup lang="ts">
import Header from './components/Header.vue'
import Grid from './components/PokemonGrid.vue'
</script>

<template>
   <div class = "header">
    <Header />
   </div>

  <main>
    <Grid />
  </main>
</template>

<style scoped>
main {
  padding: 0 1.5rem 0 1.5rem;
  width: 100vw;
}
</style>
