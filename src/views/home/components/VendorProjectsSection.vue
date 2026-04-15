<script setup>
const projects = [
  {
    name: 'Turbines X',
    riskSummary: 'Tier 2 · Risk Score 88',
    dueDate: '1 Aug 2026',
    engagement: 'Caesarea water turbines',
    domains: 'IT security, System Maintenance, API Integration, Firmware',
    lifecycle: [
      'Contender · Mar 2 2026',
      'Pending · Mar 15 2026',
      'Winner · Apr 2 2026',
      'Onboarding · Apr 10 2026',
      'Off-boarding · Jun 1 2026',
    ],
  },
  {
    name: 'Turbines ZZ',
    riskSummary: 'Tier 2 · Risk Score 88',
    dueDate: '30 May 2026',
    engagement: 'Caesarea water turbines',
    domains: 'Firmware, Security, Fire Doors',
    lifecycle: ['Contender · Mar 2 2026', 'Winner · Apr 15 2026', 'Off-boarding · Jun 1 2026'],
  },
  {
    name: 'Turbines ZZ',
    riskSummary: 'Tier 2 · Risk Score 88',
    dueDate: '12 Apr 2026',
    engagement: 'Caesarea water turbines',
    domains: 'Firmware, Security, Fire Doors',
    lifecycle: [
      'Under Review · Mar 2 2026',
      'Onboarding · Mar 10 2026',
      'Winner · Apr 15 2026',
      'Ongoing · Apr 18 2026',
    ],
  },
]
</script>

<template>
  <section class="projects-section">
    <header class="projects-header">
      <h2>Projects</h2>
      <span class="create-project-chip">Create New Project</span>
    </header>

    <div class="project-list">
      <article v-for="project in projects" :key="`${project.name}-${project.dueDate}`" class="project-card">
        <header class="project-card-head">
          <div>
            <h3>{{ project.name }}</h3>
            <p>{{ project.riskSummary }}</p>
          </div>
          <div class="project-meta">
            <p>Due Date: {{ project.dueDate }}</p>
            <span class="edit-chip">Edit</span>
          </div>
        </header>
        <p><strong>Engagement:</strong> {{ project.engagement }}</p>
        <p><strong>Domains:</strong> {{ project.domains }}</p>
        <div class="lifecycle-row">
          <span v-for="phase in project.lifecycle" :key="`${project.name}-${project.dueDate}-${phase}`">
            {{ phase }}
          </span>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.projects-section {
  border: 1px solid #ebe9f7;
  border-radius: 0.75rem;
  background: #fff;
  padding: 0.9rem;
  display: grid;
  gap: 0.85rem;
}

.projects-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.8rem;
}

.projects-header h2 {
  font-size: 1rem;
}

.create-project-chip {
  display: inline-flex;
  border-radius: 0.42rem;
  padding: 0.4rem 0.55rem;
  background: #6f50f7;
  color: #fff;
  font-size: 0.74rem;
  font-weight: 600;
}

.project-list {
  display: grid;
  gap: 0.65rem;
}

.project-card {
  border: 1px solid #eceaf8;
  border-radius: 0.65rem;
  padding: 0.78rem;
  display: grid;
  gap: 0.45rem;
}

.project-card-head {
  display: flex;
  justify-content: space-between;
  gap: 0.7rem;
  flex-wrap: wrap;
}

.project-card-head h3 {
  font-size: 0.94rem;
}

.project-card-head p,
.project-meta p {
  color: #6e6a8d;
  font-size: 0.76rem;
}

.project-meta {
  display: grid;
  justify-items: end;
  gap: 0.25rem;
}

.edit-chip {
  font-size: 0.72rem;
  padding: 0.2rem 0.46rem;
  border-radius: 0.36rem;
  border: 1px solid #dad5f8;
  color: #5e4ac5;
}

.project-card > p {
  color: #615d84;
  font-size: 0.78rem;
}

.lifecycle-row {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.lifecycle-row span {
  border-radius: 999px;
  background: #f2f0fc;
  color: #615d84;
  font-size: 0.71rem;
  padding: 0.24rem 0.46rem;
}
</style>
