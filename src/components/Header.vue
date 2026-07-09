<script setup lang="ts">
import SearchArea from "./SearchBar.vue"

const search = defineModel<string>("search")
</script>

<template>
  <header class="header-container">
    <div class="header-matrix-bg"></div>
    
    <div class="header-content">
      <div class="brand-frame">
        <div class="system-meta">
          <span class="pulse-dot"></span>
          <span class="meta-label">VAULDEX.ARCHIVE // CJIGPIT</span>
        </div>
        <h1 class="logo">
          POKÉMON<span class="spec-tag">SYS.EXERCISE</span>
        </h1>
      </div>

      <div class="search-wrapper">
        <div class="corner-bracket tl"></div>
        <div class="corner-bracket tr"></div>
        <div class="search-inner">
          <SearchArea v-model="search" />
        </div>
        <div class="corner-bracket bl"></div>
        <div class="corner-bracket br"></div>
      </div>
    </div>
    
    <div class="border-base">
      <div class="active-scan-segment"></div>
    </div>
  </header>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=JetBrains+Mono:wght@500;700&display=swap');

.header-container {
  --bg-clean: #f8f9fa; /* Editorial off-white canvas */
  --ink-primary: #111318; /* High-contrast deep slate black */
  --ink-muted: #878e9c; /* Lab label gray */
  --tech-cyan: #2563eb; /* Tactical precision blue */
  --hairline: #e4e7ec; /* Ultra-fine mechanical grid line */
  
  --mono: 'JetBrains Mono', monospace;
  --display: 'Plus Jakarta Sans', sans-serif;

  width: 100%;
  background: rgba(218, 223, 228, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  position: sticky;
  top: 0;
  z-index: 100;
  overflow: hidden;
  border-bottom: 1px solid var(--hairline);
}
.header-matrix-bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  opacity: 0.6;
  background-image: radial-gradient(#e4e7ec 1px, transparent 0);
  background-size: 10px 10px;
  pointer-events: none;
}

.header-content {
  max-width: 1300px;
  margin: 0 auto;
  padding: 1.15rem 2.5rem;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 3rem;
}

.brand-frame {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.system-meta {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--mono);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: var(--ink-muted);
}

.pulse-dot {
  width: 5px;
  height: 5px;
  background-color: var(--tech-cyan);
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(37, 99, 235, 0.4);
  animation: pulse-glow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.logo {
  font-family: var(--display);
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--ink-primary);
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.spec-tag {
  font-family: var(--mono);
  font-size: 0.58rem;
  font-weight: 700;
  color: var(--tech-cyan);
  background: color-mix(in srgb, var(--tech-cyan) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--tech-cyan) 15%, transparent);
  padding: 0.05rem 0.35rem;
  letter-spacing: 0.05em;
}

/* Technical Bracket Search Element Wrapper */
.search-wrapper {
  flex: 1;
  max-width: 400px;
  position: relative;
  padding: 0.4rem 0.6rem;
}

.search-inner {
  width: 100%;
}

.corner-bracket {
  position: absolute;
  width: 5px;
  height: 5px;
  border-color: var(--ink-muted);
  opacity: 0.25;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}
.tl { top: 0; left: 0; border-top: 1px solid; border-left: 1px solid; }
.tr { top: 0; right: 0; border-top: 1px solid; border-right: 1px solid; }
.bl { bottom: 0; left: 0; border-bottom: 1px solid; border-left: 1px solid; }
.br { bottom: 0; right: 0; border-bottom: 1px solid; border-right: 1px solid; }

.search-wrapper:focus-within .corner-bracket {
  opacity: 1;
  border-color: var(--tech-cyan);
  width: 10px;
  height: 10px;
}


.border-base {
  width: 100%;
  height: 2px;
  background: transparent;
  position: relative;
}

.active-scan-segment {
  position: absolute;
  top: -1px;
  left: 45px;
  width: 80px;
  height: 2px;
  background: var(--tech-cyan);
}


@keyframes pulse-glow {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: .3; transform: scale(0.9); }
}


@media (max-width: 768px) {
  .header-content {
    padding: 1.15rem 1.5rem;
    gap: 1.5rem;
  }
  .logo { font-size: 1.35rem; }
}

@media (max-width: 600px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .search-wrapper {
    max-width: 100%;
    padding: 0.4rem 0;
  }
  
  .corner-bracket { display: none; } /* Hide brackets on compressed grids */
}
</style>