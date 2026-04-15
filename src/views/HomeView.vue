<template>
  <section class="vendor-home">
    <div class="vendor-header-row">
      <p class="vendor-back-link">← All Vendors</p>
      <h1 class="vendor-title">Turbines Technologies Inc.</h1>
      <p class="vendor-subtitle">A.D. Turbines</p>
    </div>

    <article class="vendor-card">
      <div class="vendor-card-main">
        <span class="vendor-logo" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="21" fill="#d9fffa" />
            <path
              d="M24 8a16 16 0 0 1 7 30.4l1.4-5.6-8.4-1.8-3.3 8a16 16 0 0 1 3.3-31Zm0 9.2-4.4 10.7 8.8 1.8L24 17.2Z"
              fill="#12b7aa"
            />
          </svg>
        </span>

        <div class="vendor-info">
          <div class="vendor-name-row">
            <h2>Turbines Technologies Inc.</h2>
            <span class="pill approved">Approved</span>
          </div>
          <p class="vendor-address">
            123 Tech Plaza, Suite 500, San Francisco, CA 94105
          </p>
          <p class="vendor-site">turbines4ever.com</p>
        </div>
      </div>

      <dl class="vendor-metrics">
        <div>
          <dt>Sling Score</dt>
          <dd>78/100</dd>
        </div>
        <div>
          <dt>RiskRecon Score</dt>
          <dd>B 4.2/10.0</dd>
        </div>
        <div>
          <dt>Criticality</dt>
          <dd><span class="pill tier">Tier 2</span></dd>
        </div>
        <div>
          <dt>Risk Score</dt>
          <dd>45</dd>
        </div>
      </dl>
    </article>

    <section class="score-grid">
      <article class="score-card">
        <p class="score-label">External Risk Score</p>
        <p class="score-value">72</p>
        <span class="pill medium">Medium Risk</span>
      </article>
      <article class="score-card">
        <p class="score-label">Vendor Risk Score</p>
        <p class="score-value">45</p>
        <span class="pill low">Low Risk</span>
      </article>
      <article class="score-card">
        <p class="score-label">SOC2 Report</p>
        <p class="score-value small">SOC2 2025</p>
        <span class="report-chip">View SOC2 2025 Report</span>
      </article>
    </section>

    <section class="details-grid">
      <article class="details-card">
        <h3>Expertise</h3>
        <p>
          Specialized in advanced turbine supply services and optimization programs for
          mission-critical infrastructure.
        </p>
        <p><strong>Industry:</strong> Financial Services</p>
        <p>
          <strong>Location:</strong> Al Barsha Business Square, GHAITH SAEED KHALAF AL GHAITH
          Office no 603 and 602, Dubai, Dubai AE
        </p>
      </article>
      <article class="details-card">
        <h3>About</h3>
        <p>
          Turbines Technologies supports enterprise scale operations with resilience-first
          delivery practices, strong compliance controls, and a long history of high uptime
          partnerships.
        </p>
      </article>
      <article class="details-card">
        <h3>Information &amp; Contact</h3>
        <p><strong>Website:</strong> www.turbines4ever.com</p>
        <p><strong>Tel:</strong> +971527401169</p>
        <p><strong>Company size:</strong> 51-200 employees</p>
      </article>
    </section>

    <section class="projects-section">
      <header class="projects-header">
        <h2>Projects</h2>
        <span class="create-project-chip">Create New Project</span>
      </header>

      <div class="project-list">
        <article class="project-card">
          <header class="project-card-head">
            <div>
              <h3>Turbines X</h3>
              <p>Tier 2 · Risk Score 88</p>
            </div>
            <div class="project-meta">
              <p>Due Date: 1 Aug 2026</p>
              <span class="edit-chip">Edit</span>
            </div>
          </header>
          <p><strong>Engagement:</strong> Caesarea water turbines</p>
          <p><strong>Domains:</strong> IT security, System Maintenance, API Integration, Firmware</p>
          <div class="lifecycle-row">
            <span>Contender · Mar 2 2026</span>
            <span>Pending · Mar 15 2026</span>
            <span>Winner · Apr 2 2026</span>
            <span>Onboarding · Apr 10 2026</span>
            <span>Off-boarding · Jun 1 2026</span>
          </div>
        </article>

        <article class="project-card">
          <header class="project-card-head">
            <div>
              <h3>Turbines ZZ</h3>
              <p>Tier 2 · Risk Score 88</p>
            </div>
            <div class="project-meta">
              <p>Due Date: 30 May 2026</p>
              <span class="edit-chip">Edit</span>
            </div>
          </header>
          <p><strong>Engagement:</strong> Caesarea water turbines</p>
          <p><strong>Domains:</strong> Firmware, Security, Fire Doors</p>
          <div class="lifecycle-row">
            <span>Contender · Mar 2 2026</span>
            <span>Winner · Apr 15 2026</span>
            <span>Off-boarding · Jun 1 2026</span>
          </div>
        </article>

        <article class="project-card">
          <header class="project-card-head">
            <div>
              <h3>Turbines ZZ</h3>
              <p>Tier 2 · Risk Score 88</p>
            </div>
            <div class="project-meta">
              <p>Due Date: 12 Apr 2026</p>
              <span class="edit-chip">Edit</span>
            </div>
          </header>
          <p><strong>Engagement:</strong> Caesarea water turbines</p>
          <p><strong>Domains:</strong> Firmware, Security, Fire Doors</p>
          <div class="lifecycle-row">
            <span>Under Review · Mar 2 2026</span>
            <span>Onboarding · Mar 10 2026</span>
            <span>Winner · Apr 15 2026</span>
            <span>Ongoing · Apr 18 2026</span>
          </div>
        </article>
      </div>
    </section>
  </section>
</template>
