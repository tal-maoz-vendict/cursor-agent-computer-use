<script setup>
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <header>
    <div class="wrapper">
      <h1>Demo App</h1>
    </div>
  </header>

  <main>
    <HelloWorld msg="You did it!" />
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

.wrapper {
  display: flex;
  place-items: center;
  flex-wrap: wrap;
  justify-content: center;
}

main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}
</style>
