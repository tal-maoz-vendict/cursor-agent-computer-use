<script setup>
import { computed, ref } from 'vue'

const clicks = ref(0)
const hue = ref(210)

const cheers = [
  'Hey Boaz — welcome to this tab.',
  'Small demo: HTML structure, scoped CSS, a pinch of JS.',
  'Every click nudges the vibe. Keep going!',
  'You found the easter egg: this message loops. ✨',
]

const line = computed(() => cheers[clicks.value % cheers.length])

function onPulse() {
  clicks.value += 1
  hue.value = (hue.value + 47) % 360
}
</script>

<template>
  <section class="boaz-demo" :style="{ '--accent-h': hue }">
    <header class="boaz-head">
      <span class="boaz-badge" aria-hidden="true">B</span>
      <div>
        <h2>Boaz demo</h2>
        <p class="boaz-lead">A tiny playground: layout, color, and one interactive control.</p>
      </div>
    </header>

    <div class="boaz-card" role="status" aria-live="polite">
      <p class="boaz-line">{{ line }}</p>
      <p class="boaz-meta">Clicks: {{ clicks }}</p>
    </div>

    <button type="button" class="boaz-btn" @click="onPulse">
      Pulse the card
    </button>
  </section>
</template>

<style scoped>
.boaz-demo {
  --accent-h: 210;
  --accent: hsl(var(--accent-h), 72%, 52%);
  --accent-soft: hsl(var(--accent-h), 85%, 96%);
}

.boaz-head {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.boaz-badge {
  flex-shrink: 0;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.85rem;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 1.25rem;
  color: white;
  background: linear-gradient(135deg, var(--accent), hsl(calc(var(--accent-h) + 40), 70%, 45%));
  box-shadow: 0 8px 22px hsla(var(--accent-h), 70%, 40%, 0.35);
  animation: boaz-float 4s ease-in-out infinite;
}

@keyframes boaz-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.boaz-lead {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 0.95rem;
}

.boaz-card {
  border-radius: 1rem;
  padding: 1.1rem 1.25rem;
  margin-bottom: 1rem;
  background: var(--accent-soft);
  border: 1px solid hsla(var(--accent-h), 60%, 78%, 0.7);
  transition:
    border-color 280ms ease,
    box-shadow 280ms ease,
    transform 200ms ease;
}

.boaz-card:hover {
  box-shadow: 0 10px 28px hsla(var(--accent-h), 55%, 45%, 0.12);
}

.boaz-line {
  margin: 0 0 0.5rem;
  font-size: 1.05rem;
  line-height: 1.55;
  color: #0f172a;
}

.boaz-meta {
  margin: 0;
  font-size: 0.88rem;
  color: #64748b;
}

.boaz-btn {
  border: none;
  border-radius: 999px;
  padding: 0.65rem 1.15rem;
  font-weight: 600;
  cursor: pointer;
  color: white;
  background: var(--accent);
  box-shadow: 0 4px 14px hsla(var(--accent-h), 65%, 40%, 0.35);
  transition:
    transform 160ms ease,
    filter 160ms ease;
}

.boaz-btn:hover {
  filter: brightness(1.05);
}

.boaz-btn:active {
  transform: scale(0.97);
}
</style>
