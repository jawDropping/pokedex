<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

interface TypeRelations {
  double_damage_to: { name: string }[];
  half_damage_to: { name: string }[];
  no_damage_to: { name: string }[];
}

const ALL_TYPES = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy",
];

const TYPE_COLORS: Record<string, string> = {
  normal: "#a8a878", fire: "#ef4444", water: "#3b82f6", electric: "#eab308",
  grass: "#22c55e", ice: "#22d3ee", fighting: "#b91c1c", poison: "#a855f7",
  ground: "#ca8a04", flying: "#818cf8", psychic: "#ec4899", bug: "#84cc16",
  rock: "#a8a29e", ghost: "#6366f1", dragon: "#4f46e5", dark: "#57534e",
  steel: "#94a3b8", fairy: "#f472b6",
};

const ANSWER_OPTIONS = [
  { multiplier: 0, label: "No effect", sub: "0×" },
  { multiplier: 0.5, label: "Not very effective", sub: "½×" },
  { multiplier: 1, label: "Normal damage", sub: "1×" },
  { multiplier: 2, label: "Super effective", sub: "2×" },
];

const QUIZ_LENGTH = 10;
const SECONDS_PER_QUESTION = 8;

const typeDataCache = ref<Record<string, TypeRelations>>({});
const isLoading = ref(true);
const loadError = ref(false);

const phase = ref<"loading" | "playing" | "finished">("loading");
const questionIndex = ref(0);
const score = ref(0);
const streak = ref(0);
const bestStreak = ref(0);

const attackType = ref("");
const defendType = ref("");
const correctMultiplier = ref(1);
const shuffledOptions = ref<typeof ANSWER_OPTIONS>([]);
const selectedMultiplier = ref<number | null>(null);
const isCorrect = ref<boolean | null>(null);

const timeLeft = ref(SECONDS_PER_QUESTION);
let timerHandle: ReturnType<typeof setInterval> | null = null;

async function loadAllTypeData() {
  try {
    const results = await Promise.all(
      ALL_TYPES.map(async (name) => {
        const res = await fetch(`https://pokeapi.co/api/v2/type/${name}`);
        if (!res.ok) throw new Error(`Failed to load type: ${name}`);
        const data = await res.json();
        return [name, data.damage_relations as TypeRelations] as const;
      })
    );
    typeDataCache.value = Object.fromEntries(results);
  } catch (err) {
    console.error("Failed to load type data", err);
    loadError.value = true;
  } finally {
    isLoading.value = false;
  }
}

function computeMultiplier(attacker: string, defender: string): number {
  const relations = typeDataCache.value[attacker];
  if (!relations) return 1;
  if (relations.no_damage_to.some((t) => t.name === defender)) return 0;
  if (relations.half_damage_to.some((t) => t.name === defender)) return 0.5;
  if (relations.double_damage_to.some((t) => t.name === defender)) return 2;
  return 1;
}
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = temp;
  }
  return copy;
}

function generateQuestion() {
  const a = pickRandom(ALL_TYPES);
  let d = pickRandom(ALL_TYPES);
  while (d === a) {
    d = pickRandom(ALL_TYPES);
  }

  attackType.value = a;
  defendType.value = d;
  correctMultiplier.value = computeMultiplier(a, d);
  shuffledOptions.value = shuffle(ANSWER_OPTIONS);
  selectedMultiplier.value = null;
  isCorrect.value = null;

  startTimer();
}

function startTimer() {
  stopTimer();
  timeLeft.value = SECONDS_PER_QUESTION;
  timerHandle = setInterval(() => {
    timeLeft.value -= 1;
    if (timeLeft.value <= 0) {
      stopTimer();
      handleAnswer(null);
    }
  }, 1000);
}

function stopTimer() {
  if (timerHandle) {
    clearInterval(timerHandle);
    timerHandle = null;
  }
}

function handleAnswer(multiplier: number | null) {
  if (selectedMultiplier.value !== null) return;
  stopTimer();

  selectedMultiplier.value = multiplier ?? -1;
  isCorrect.value = multiplier === correctMultiplier.value;

  if (isCorrect.value) {
    const timeBonus = Math.max(0, timeLeft.value);
    score.value += 100 + timeBonus * 5;
    streak.value += 1;
    bestStreak.value = Math.max(bestStreak.value, streak.value);
  } else {
    streak.value = 0;
  }

  setTimeout(() => {
    if (questionIndex.value + 1 >= QUIZ_LENGTH) {
      phase.value = "finished";
    } else {
      questionIndex.value += 1;
      generateQuestion();
    }
  }, 1400);
}

function startQuiz() {
  questionIndex.value = 0;
  score.value = 0;
  streak.value = 0;
  bestStreak.value = 0;
  phase.value = "playing";
  generateQuestion();
}

const progressPercent = computed(
  () => ((questionIndex.value) / QUIZ_LENGTH) * 100
);
const timerPercent = computed(
  () => (timeLeft.value / SECONDS_PER_QUESTION) * 100
);

const scoreRank = computed(() => {
  if (score.value >= 1300) return "Type master";
  if (score.value >= 900) return "Gym leader";
  if (score.value >= 500) return "Trainer";
  return "Rookie";
});

onMounted(async () => {
  await loadAllTypeData();
  if (!loadError.value) phase.value = "playing";
  if (phase.value === "playing") generateQuestion();
});
</script>

<template>
  <div class="quiz-shell">

    <div v-if="isLoading" class="state-panel">
      <div class="spinner"></div>
      <p class="state-text">Loading type matchup data&hellip;</p>
    </div>

    <div v-else-if="loadError" class="state-panel">
      <p class="state-text is-error">Couldn't load type data. Check your connection and try again.</p>
      <button class="primary-btn" @click="loadAllTypeData">Retry</button>
    </div>

    <div v-else-if="phase === 'playing'" class="quiz-panel">
      <header class="quiz-topbar">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <div class="topbar-meta">
          <span class="q-count">Question {{ questionIndex + 1 }} / {{ QUIZ_LENGTH }}</span>
          <span class="score-count">{{ score }} pts</span>
        </div>
      </header>

      <div class="timer-track">
        <div
          class="timer-fill"
          :class="{ 'is-urgent': timeLeft <= 3 }"
          :style="{ width: timerPercent + '%' }"
        ></div>
      </div>

      <div class="matchup-stage">
        <div class="type-chip" :style="{ '--chip-color': TYPE_COLORS[attackType] }">
          <span class="chip-label">Attacking</span>
          <span class="chip-name">{{ attackType }}</span>
        </div>

        <svg class="matchup-arrow" viewBox="0 0 60 24" fill="none">
          <path d="M2 12h50M42 4l10 8-10 8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>

        <div class="type-chip" :style="{ '--chip-color': TYPE_COLORS[defendType] }">
          <span class="chip-label">Defending</span>
          <span class="chip-name">{{ defendType }}</span>
        </div>
      </div>

      <p class="quiz-question">
        A <strong>{{ attackType }}</strong>-type move hits a <strong>{{ defendType }}</strong>-type Pokémon. How effective is it?
      </p>

      <div class="options-grid">
        <button
          v-for="opt in shuffledOptions"
          :key="opt.multiplier"
          class="option-btn"
          :class="{
            'is-selected': selectedMultiplier === opt.multiplier,
            'is-correct': selectedMultiplier !== null && opt.multiplier === correctMultiplier,
            'is-wrong': selectedMultiplier !== null && selectedMultiplier === opt.multiplier && opt.multiplier !== correctMultiplier,
            'is-disabled': selectedMultiplier !== null && selectedMultiplier !== opt.multiplier && opt.multiplier !== correctMultiplier
          }"
          :disabled="selectedMultiplier !== null"
          @click="handleAnswer(opt.multiplier)"
        >
          <span class="option-sub">{{ opt.sub }}</span>
          <span class="option-label">{{ opt.label }}</span>
        </button>
      </div>

      <div class="streak-row" v-if="streak > 0">
        <span class="streak-flame">&#9679;</span>
        <span>{{ streak }} in a row</span>
      </div>
    </div>

    <div v-else-if="phase === 'finished'" class="results-panel">
      <span class="results-eyebrow">Quiz complete</span>
      <h2 class="results-score">{{ score }}<small>pts</small></h2>
      <p class="results-rank">{{ scoreRank }}</p>
      <p class="results-sub">Best streak: {{ bestStreak }} correct in a row</p>
      <button class="primary-btn" @click="startQuiz">Play again</button>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600;700&display=swap');

.quiz-shell {
  --ink: #14161f;
  --ink-muted: #6b7080;
  --paper: #f4f5f7;
  --hairline: rgba(20, 22, 31, 0.12);
  --accent: #5b6472;
  --mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;

  max-width: 480px;
  margin: 0 auto;
  padding: 2rem;
  background: var(--paper);
  color: var(--ink);
  border-radius: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.state-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1rem;
  text-align: center;
}

.spinner {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid var(--hairline);
  border-top-color: var(--ink);
  animation: spin 0.8s linear infinite;
}

.state-text {
  font-family: var(--mono);
  font-size: 0.85rem;
  color: var(--ink-muted);
}
.state-text.is-error { color: #b91c1c; }

.primary-btn {
  font-family: var(--mono);
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0.75rem 2rem;
  border-radius: 100px;
  border: none;
  background: var(--ink);
  color: var(--paper);
  cursor: pointer;
  transition: transform 0.2s ease;
}
.primary-btn:hover { transform: translateY(-2px); }
.primary-btn:active { transform: translateY(0); }

.quiz-topbar { margin-bottom: 0.75rem; }

.progress-track {
  height: 4px;
  background: var(--hairline);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.6rem;
}
.progress-fill {
  height: 100%;
  background: var(--ink);
  transition: width 0.4s ease;
}

.topbar-meta {
  display: flex;
  justify-content: space-between;
  font-family: var(--mono);
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--ink-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.timer-track {
  height: 3px;
  background: var(--hairline);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 2rem;
}
.timer-fill {
  height: 100%;
  background: var(--accent);
  transition: width 1s linear;
}
.timer-fill.is-urgent { background: #dc2626; }

.matchup-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.75rem;
}

.type-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 1rem 1.5rem;
  border-radius: 16px;
  background: color-mix(in srgb, var(--chip-color) 14%, transparent);
  border: 1.5px solid color-mix(in srgb, var(--chip-color) 45%, transparent);
  min-width: 110px;
}

.chip-label {
  font-family: var(--mono);
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--ink-muted);
}

.chip-name {
  font-weight: 700;
  font-size: 1.05rem;
  text-transform: capitalize;
  color: var(--chip-color);
}

.matchup-arrow {
  width: 32px;
  height: 14px;
  color: var(--ink-muted);
  flex-shrink: 0;
}

.quiz-question {
  text-align: center;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--ink);
  margin: 0 0 1.75rem 0;
}
.quiz-question strong { text-transform: capitalize; }

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.option-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 1rem 0.5rem;
  border-radius: 14px;
  border: 1.5px solid var(--hairline);
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.15s ease, background 0.2s ease;
}
.option-btn:hover:not(:disabled) {
  border-color: var(--ink);
  transform: translateY(-2px);
}
.option-btn:disabled { cursor: default; }

.option-sub {
  font-family: var(--mono);
  font-weight: 700;
  font-size: 1.1rem;
}
.option-label {
  font-size: 0.72rem;
  color: var(--ink-muted);
  font-weight: 600;
}

.option-btn.is-correct {
  border-color: #16a34a;
  background: rgba(34, 197, 94, 0.12);
}
.option-btn.is-correct .option-sub,
.option-btn.is-correct .option-label { color: #15803d; }

.option-btn.is-wrong {
  border-color: #dc2626;
  background: rgba(239, 68, 68, 0.1);
}
.option-btn.is-wrong .option-sub,
.option-btn.is-wrong .option-label { color: #b91c1c; }

.option-btn.is-disabled { opacity: 0.45; }

.streak-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-family: var(--mono);
  font-size: 0.75rem;
  font-weight: 700;
  color: #ea580c;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.streak-flame { font-size: 0.6rem; }

.results-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 1rem;
}

.results-eyebrow {
  font-family: var(--mono);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--ink-muted);
  margin-bottom: 0.5rem;
}

.results-score {
  font-family: var(--mono);
  font-size: 3.2rem;
  font-weight: 700;
  margin: 0;
}
.results-score small {
  font-size: 1rem;
  color: var(--ink-muted);
  margin-left: 4px;
}

.results-rank {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--accent);
  margin: 0.25rem 0 0.5rem;
}

.results-sub {
  font-size: 0.85rem;
  color: var(--ink-muted);
  margin: 0 0 1.75rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .spinner { animation: none; }
  .option-btn:hover { transform: none; }
}
</style>