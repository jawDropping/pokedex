<script setup lang="ts">
import SearchArea from "./SearchBar.vue"

const search = defineModel<string>("search")
</script>

<template>
    <header class="header-container">
        <div class="header-content">
            <h1 class="logo">POKÉMON</h1>
            <div class="search-wrapper">
                <SearchArea v-model="search" />
            </div>
        </div>
    </header>
</template>

<style scoped>
.header-container {
    width: 100%;
    background: #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-bottom: 4px solid #ffcb05; /* Classic Pokemon Yellow Accent */
    position: sticky;
    top: 0;
    z-index: 100;
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1.5rem 2rem;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 1.5rem;
}

.logo {
    font-size: 2rem;
    font-weight: 900;
    letter-spacing: 2px;
    color: #1d2c5e; /* Deep Pokemon Blue */
    margin: 0;
    text-transform: uppercase;
}

.search-wrapper {
    flex: 1;
    max-width: 400px;
    width: 100%;
}

/* Responsive Breakpoint for Mobile Devices */
@media (max-width: 600px) {
    .header-content {
        flex-direction: column;
        text-align: center;
        padding: 1rem;
        gap: 1rem;
    }

    .search-wrapper {
        max-width: 100%;
    }
    
    .logo {
        font-size: 1.75rem;
    }
}
</style>