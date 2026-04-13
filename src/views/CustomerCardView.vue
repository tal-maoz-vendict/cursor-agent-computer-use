<template>
  <section class="customer-card-demo">
    <h2>Customer card</h2>
    <p>Static implementation from Figma. Buttons are presentational only.</p>

    <article class="customer-card" aria-label="ServiceNow customer card">
      <h3 class="customer-card-title">ServieNow</h3>

      <div class="customer-alert" role="status">
        Your questionnaire was uploaded to Vendict
      </div>

      <section class="customer-action">
        <button type="button" class="btn customer-btn-primary">Auto-Complete Here</button>
        <p class="customer-note">Fill this questionnaire with Vendict AI</p>
      </section>

      <section class="customer-action">
        <button type="button" class="btn customer-btn-outline">Open in Vendict</button>
        <p class="customer-note">Open and answer in Vendict</p>
      </section>

      <section class="customer-action">
        <button type="button" class="btn customer-btn-danger">
          <span>Clear The Questionnaire</span>
          <span class="info-icon" aria-hidden="true">i</span>
        </button>
      </section>
    </article>

    <aside class="customer-modal" aria-label="Clear questionnaire dialog preview">
      <div class="customer-modal-header">
        <span class="warning-icon" aria-hidden="true">!</span>
        <h4>Clear questionnaire</h4>
      </div>
      <p>Are you sure you want to clear all answers from this questionnaire?</p>
      <div class="customer-modal-actions">
        <button type="button" class="btn customer-btn-ghost">Cancel</button>
        <button type="button" class="btn customer-btn-delete">Delete</button>
      </div>
    </aside>
  </section>
</template>
