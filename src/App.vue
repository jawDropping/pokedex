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
.header {
    background-color: red;
  }
</style>
