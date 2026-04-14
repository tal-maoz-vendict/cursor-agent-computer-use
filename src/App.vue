<template>
  <main class="app-shell">
    <header class="app-header">
      <h1>Demo App</h1>
      <nav class="tabs" aria-label="Main tabs">
        <RouterLink to="/" class="tab" active-class="tab-active">Playground</RouterLink>
        <RouterLink to="/vendict-minesweeper" class="tab" active-class="tab-active">
          Vendict Minesweeper
        </RouterLink>
        <RouterLink to="/logo-match" class="tab" active-class="tab-active">
          Logo Match
        </RouterLink>
        <RouterLink to="/vendor-assessment" class="tab" active-class="tab-active">
          Vendor assessment
        </RouterLink>
      </nav>
    </header>

    <section class="view-card">
      <RouterView />
    </section>
  </main>
</template>
