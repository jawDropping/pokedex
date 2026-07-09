<script setup lang="ts">
const model = defineModel<string>()
</script>

<template>
  <div class="search-area">
    <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>

    <input
      type="text"
      v-model="model"
      placeholder="Search the archive…"
      aria-label="Search Pokémon"
    />

    <span
      v-if="model"
      class="clear-btn"
      role="button"
      tabindex="0"
      aria-label="Clear search"
      @click="model = ''"
      @keydown.enter="model = ''"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </span>
  </div>
</template>

<style scoped>
.search-area {
  --ink: #201e1b;
  --ink-muted: #948d7e;
  --brass: #a68a5c;
  --hairline: rgba(32, 30, 27, 0.14);
  --mono: 'JetBrains Mono', ui-monospace, monospace;

  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 0.9rem;
  width: 15px;
  height: 15px;
  color: var(--ink-muted);
  pointer-events: none;
  transition: color 0.3s ease;
}

input {
  width: 100%;
  padding: 0.65rem 2.4rem 0.65rem 2.5rem;
  border: 1px solid var(--hairline);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
  font-family: var(--mono);
  font-size: 0.85rem;
  letter-spacing: 0.01em;
  color: var(--ink);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

input::placeholder {
  color: var(--ink-muted);
  font-weight: 500;
}

input:hover {
  border-color: rgba(32, 30, 27, 0.22);
}

input:focus {
  outline: none;
  border-color: var(--brass);
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 0 0 3px rgba(166, 138, 92, 0.14);
}

.search-area:focus-within .search-icon {
  color: var(--brass);
}

.clear-btn {
  position: absolute;
  right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  color: var(--ink-muted);
  cursor: pointer;
  transition: color 0.2s ease;
}

.clear-btn svg {
  width: 12px;
  height: 12px;
}

.clear-btn:hover {
  color: var(--ink);
}

@media (max-width: 600px) {
  input {
    font-size: 0.8rem;
  }
}
</style>