<script setup>
import { computed, ref } from 'vue'

const score = ref(0)
const rounds = ref(0)
const message = ref('Click the logo that matches the prompt!')

const logos = [
  {
    id: 'slack',
    label: 'Slack',
    svg: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="26" y="4" width="12" height="26" rx="6" fill="#36C5F0"/><rect x="34" y="26" width="26" height="12" rx="6" fill="#2EB67D"/><rect x="26" y="34" width="12" height="26" rx="6" fill="#ECB22E"/><rect x="4" y="26" width="26" height="12" rx="6" fill="#E01E5A"/></svg>',
  },
  {
    id: 'vlogo',
    label: 'Vendict',
    svg: '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="vendict-gradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#4f46e5"/><stop offset="100%" stop-color="#22d3ee"/></linearGradient></defs><path d="M10 10h14l8 28 8-28h14L37 54H27L10 10z" fill="url(#vendict-gradient)"/></svg>',
  },
]

const promptLogo = computed(() => (rounds.value % 2 === 0 ? 'Slack' : 'Vendict'))

function pickLogo(logoLabel) {
  const expectedLogo = promptLogo.value
  rounds.value += 1

  if (logoLabel === expectedLogo) {
    score.value += 1
    message.value = `Nice! ${logoLabel} was correct.`
  } else {
    score.value = Math.max(0, score.value - 1)
    message.value = `Oops, that was ${logoLabel}. Try again.`
  }
}

function resetGame() {
  score.value = 0
  rounds.value = 0
  message.value = 'Click the logo that matches the prompt!'
}
</script>

<template>
  <section>
    <h2>Logo Match</h2>
    <p>Pick the logo requested below to gain points.</p>

    <div class="minesweeper-toolbar">
      <span><strong>Find:</strong> {{ promptLogo }}</span>
      <span><strong>Score:</strong> {{ score }}</span>
      <button type="button" class="btn accent" @click="resetGame">Reset</button>
    </div>

    <div class="logo-grid">
      <button
        v-for="logo in logos"
        :key="logo.id"
        type="button"
        class="logo-card"
        @click="pickLogo(logo.label)"
      >
        <span class="logo-mark" v-html="logo.svg"></span>
        <span class="logo-name">{{ logo.label }}</span>
      </button>
    </div>

    <p class="status">{{ message }}</p>
  </section>
</template>
