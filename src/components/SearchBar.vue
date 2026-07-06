<script setup lang="ts">
const model = defineModel<string>()
</script>

<template>
    <div class="search-area">
        <input type="text" v-model="model" placeholder="Search Pokémon..." />
        <button type="button">Search</button>
    </div>
</template>

<style scoped>
.search-area {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

input {
  flex: 1; /* Allows the input to stretch and fill available space */
  min-width: 0; /* Prevents input from overflowing on ultra-small screens */
  padding: 0.6rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #333;
  background-color: #f8fafc;
  transition: all 0.2s ease-in-out;
}

input:focus {
  outline: none;
  border-color: #2a75bb; /* Pokémon Blue focus ring */
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(42, 117, 187, 0.15);
}

input::placeholder {
  color: #94a3b8;
}

button {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  background: #ffcb05; /* Pokémon Yellow */
  color: #1d2c5e; /* Deep Blue for sharp contrast text */
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  white-space: nowrap; /* Keeps the button text on a single line */
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(255, 203, 5, 0.2);
}

button:hover {
  background: #e6b600;
  transform: translateY(-1px); /* Subtle lift on hover */
  box-shadow: 0 4px 6px rgba(255, 203, 5, 0.3);
}

button:active {
  transform: translateY(0); /* Pushes down when clicked */
}
</style>