<template>
  <section class="questionnaire-view">
    <article class="questionnaire-card" aria-label="Vendict questionnaire detected layout">
      <p class="questionnaire-banner">
        Import the questionnaire to Vendict to see stats and enable autocomplete
      </p>

      <h2 class="questionnaire-title">Questionnaire detected</h2>
      <p class="questionnaire-source">Whistic</p>
      <p class="questionnaire-description">
        Your questionnaire was uploaded to Vendict and answers are being generated.
      </p>

      <div class="questionnaire-field">
        <span>Select Libraries</span>
        <span aria-hidden="true">▾</span>
      </div>
      <div class="questionnaire-field">
        <span>Select AI Preset</span>
        <span aria-hidden="true">▾</span>
      </div>

      <div class="questionnaire-spinner" aria-label="Loading"></div>

      <button type="button" class="questionnaire-btn questionnaire-btn-primary">Open In Vendict</button>
      <p class="questionnaire-helper">Open and answer in Vendict</p>

      <button type="button" class="questionnaire-btn questionnaire-btn-secondary">
        Autocomplete Here
      </button>
      <p class="questionnaire-helper">Use Vendict AI</p>
    </article>
  </section>
</template>
