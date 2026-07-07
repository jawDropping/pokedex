<script setup lang="ts">
import { ref, provide } from "vue"
import Header from '@/components/Header.vue'

const search = ref("")
provide('search', search)
</script>

<template>
  <div class="header">
    <Header v-model:search="search" />
  </div>
  <div class="componentContainer">
    <RouterView v-slot="{ Component }">
    <KeepAlive include="HomeView">
      <component :is="Component" />
    </KeepAlive>
  </RouterView>
  </div>
  
</template>

<style scoped>
.header {
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 100;
}
.componentContainer{
  width: 100vw;
}
</style>