<script setup>
import { computed, ref } from 'vue'

const buttonOffset = ref(0)
const mood = ref('happy')
const sparkleCount = ref(0)

const movementStyle = computed(() => ({
  transform: `translateX(${buttonOffset.value}px)`,
}))

function moveLeftButtonRight() {
  buttonOffset.value += 16
}

function moveRightButtonLeft() {
  buttonOffset.value -= 16
}

function randomizeMood() {
  const moods = ['happy', 'curious', 'sleepy', 'chaotic', 'confident', 'goofy']
  mood.value = moods[Math.floor(Math.random() * moods.length)]
}

function addSparkle() {
  sparkleCount.value += 1
}
</script>

<template>
  <section>
    <h2>Playground Controls</h2>
    <p>
      Click around and watch things move. The labels are intentionally swapped for fun.
    </p>

    <section class="button-row" :style="movementStyle">
      <button type="button" class="btn swap-btn" @click="moveRightButtonLeft">
        Left
      </button>
      <button type="button" class="btn swap-btn" @click="moveLeftButtonRight">
        Right
      </button>
    </section>

    <section class="extras">
      <button type="button" class="btn accent" @click="randomizeMood">
        Shuffle mood
      </button>
      <button type="button" class="btn" @click="addSparkle">
        Add sparkle ✨
      </button>
    </section>

    <p class="status">
      Mood: <strong>{{ mood }}</strong> | Sparkles collected:
      <strong>{{ sparkleCount }}</strong>
    </p>
  </section>
</template>
