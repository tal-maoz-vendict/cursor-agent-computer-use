<script setup>
import { ref } from 'vue'

const libraryPool = [
  'SOC 2 Starter Pack',
  'ISO 27001 Library',
  'NIST Cybersecurity Pack',
  'PCI-DSS Toolkit',
  'Cloud Security Bundle',
  'Funny Compliance Memes',
  'Zero Trust Playbook',
  'Audit Trail Classics',
]

const presetPool = [
  'Sarcastic CISO',
  'Calm Compliance Coach',
  'Speedrun Answers',
  'Strict Auditor Mode',
  'Friendly Security Nerd',
  'Ultra Enterprise Tone',
  'Coffee Fueled Writer',
  'Board Ready Summary',
]

const predefinedAnswers = [
  'We secure everything with one brave intern and a giant mug of coffee.',
  'Our backup strategy is three clouds, two hard drives, and one lucky rubber duck.',
  'Incidents are handled by snacks, dashboards, and dramatic keyboard typing.',
]

const questions = ref([
  {
    id: 1,
    prompt: 'How does your team handle password fatigue during audits?',
    answer: '',
  },
  {
    id: 2,
    prompt: 'What happens when a phishing email looks suspiciously delicious?',
    answer: '',
  },
  {
    id: 3,
    prompt: 'How fast can you produce evidence when an auditor appears in chat?',
    answer: '',
  },
])

const selectedLibrary = ref('Select libraries')
const selectedPreset = ref('Select AI preset')
const libraryOptions = ref([])
const presetOptions = ref([])
const showLibraryOptions = ref(false)
const showPresetOptions = ref(false)
const showModal = ref(false)

function pickRandomOptions(pool) {
  const options = [...pool]

  for (let index = options.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const temp = options[index]
    options[index] = options[swapIndex]
    options[swapIndex] = temp
  }

  return options.slice(0, 4)
}

function openLibraryOptions() {
  libraryOptions.value = pickRandomOptions(libraryPool)
  showLibraryOptions.value = true
  showPresetOptions.value = false
}

function openPresetOptions() {
  presetOptions.value = pickRandomOptions(presetPool)
  showPresetOptions.value = true
  showLibraryOptions.value = false
}

function selectLibrary(option) {
  selectedLibrary.value = option
  showLibraryOptions.value = false
}

function selectPreset(option) {
  selectedPreset.value = option
  showPresetOptions.value = false
}

function openVendictModal() {
  showModal.value = true
}

function closeVendictModal() {
  showModal.value = false
}

function autocompleteQuestionnaire() {
  questions.value = questions.value.map((question, index) => ({
    ...question,
    answer: predefinedAnswers[index] || '',
  }))
}

function clearQuestionnaire() {
  questions.value = questions.value.map((question) => ({
    ...question,
    answer: '',
  }))
}
</script>

<template>
  <section class="studio-view">
    <div class="studio-grid">
      <article class="studio-panel">
        <p class="questionnaire-banner">
          Import the questionnaire to Vendict to see stats and enable autocomplete
        </p>
        <h2 class="questionnaire-title">Questionnaire detected</h2>
        <p class="questionnaire-source">Whistic</p>
        <p class="questionnaire-description">
          Your questionnaire was uploaded to Vendict and answers are being generated.
        </p>

        <div class="dropdown-group">
          <button type="button" class="questionnaire-field" @click="openLibraryOptions">
            <span>{{ selectedLibrary }}</span>
            <span aria-hidden="true">v</span>
          </button>
          <ul v-if="showLibraryOptions" class="dropdown-options" aria-label="Libraries options">
            <li v-for="option in libraryOptions" :key="`library-${option}`">
              <button type="button" class="dropdown-option" @click="selectLibrary(option)">
                {{ option }}
              </button>
            </li>
          </ul>
        </div>

        <div class="dropdown-group">
          <button type="button" class="questionnaire-field" @click="openPresetOptions">
            <span>{{ selectedPreset }}</span>
            <span aria-hidden="true">v</span>
          </button>
          <ul v-if="showPresetOptions" class="dropdown-options" aria-label="AI preset options">
            <li v-for="option in presetOptions" :key="`preset-${option}`">
              <button type="button" class="dropdown-option" @click="selectPreset(option)">
                {{ option }}
              </button>
            </li>
          </ul>
        </div>

        <div class="questionnaire-spinner" aria-label="Loading"></div>

        <button type="button" class="questionnaire-btn questionnaire-btn-primary" @click="openVendictModal">
          Open in Vendict
        </button>
        <p class="questionnaire-helper">Open and answer in Vendict</p>

        <button
          type="button"
          class="questionnaire-btn questionnaire-btn-secondary"
          @click="autocompleteQuestionnaire"
        >
          Autocomplete Here
        </button>
        <p class="questionnaire-helper">Use Vendict AI</p>

        <button type="button" class="questionnaire-btn questionnaire-btn-clear" @click="clearQuestionnaire">
          Clear the Questionnaire
        </button>
      </article>

      <article class="studio-panel">
        <h3 class="answers-title">Funny Security Questionnaire</h3>
        <p class="answers-subtitle">
          Three important questions, zero seriousness, and a lot of compliance energy.
        </p>

        <div
          v-for="question in questions"
          :key="question.id"
          class="question-answer-pair"
        >
          <label :for="`question-${question.id}`" class="question-label">{{ question.prompt }}</label>
          <input
            :id="`question-${question.id}`"
            v-model="question.answer"
            type="text"
            class="answer-input"
            placeholder="Type your answer..."
          />
        </div>
      </article>
    </div>

    <div v-if="showModal" class="modal-backdrop" @click.self="closeVendictModal">
      <div class="modal-card" role="dialog" aria-modal="true" aria-label="Opened in Vendict modal">
        <p>Opened in Vendict</p>
        <button type="button" class="modal-close-btn" @click="closeVendictModal">Close</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.studio-view {
  width: 100%;
}

.studio-grid {
  display: flex;
  gap: 1rem;
  align-items: stretch;
}

.studio-panel {
  flex: 1 1 0;
  border: 2px solid #5bc5d4;
  border-radius: 0.95rem;
  background: #ffffff;
  padding: 1.25rem;
  height: 37rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.questionnaire-banner {
  margin: 0 0 1.5rem;
  padding: 0.9rem 1rem;
  border-radius: 0.6rem;
  border: 2px solid #4caf88;
  background: #e8f8f0;
  color: #17212b;
  font-size: 0.95rem;
  line-height: 1.4;
}

.questionnaire-title {
  margin: 0;
  text-align: center;
  font-size: 1.8rem;
  font-weight: 700;
  color: #0f172a;
}

.questionnaire-source {
  margin: 0.4rem 0 0.8rem;
  text-align: center;
  font-size: 1.3rem;
  font-weight: 700;
  color: #0f172a;
}

.questionnaire-description {
  margin: 0 0 1.2rem;
  text-align: center;
  color: #475569;
}

.dropdown-group {
  margin-bottom: 0.75rem;
  position: relative;
}

.questionnaire-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 2.85rem;
  border-radius: 0.55rem;
  border: 1px solid #d1d5db;
  padding: 0 0.85rem;
  font-size: 0.95rem;
  color: #0f172a;
  background: #ffffff;
  text-align: left;
  cursor: pointer;
}

.dropdown-options {
  margin: 0.25rem 0 0;
  padding: 0.35rem;
  list-style: none;
  border: 1px solid #d1d5db;
  border-radius: 0.55rem;
  background: #ffffff;
}

.dropdown-option {
  border: none;
  width: 100%;
  padding: 0.55rem;
  border-radius: 0.45rem;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.dropdown-option:hover {
  background: #eef2ff;
}

.questionnaire-spinner {
  width: 1.3rem;
  height: 1.3rem;
  margin: 0.8rem auto 1rem;
  border: 3px solid #d9defa;
  border-top-color: #5b6fd8;
  border-radius: 50%;
  animation: questionnaire-spin 1s linear infinite;
}

.questionnaire-btn {
  width: 100%;
  min-height: 2.85rem;
  border-radius: 0.55rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
}

.questionnaire-btn-primary {
  border: none;
  color: #ffffff;
  background: #5b6fd8;
}

.questionnaire-btn-secondary {
  border: 2px solid #5b6fd8;
  color: #5b6fd8;
  background: #ffffff;
}

.questionnaire-btn-clear {
  margin-top: auto;
  border: 1px solid #d1d5db;
  color: #334155;
  background: #f8fafc;
}

.questionnaire-helper {
  margin: 0.55rem 0 1rem;
  text-align: center;
  font-size: 0.86rem;
  color: #64748b;
}

.answers-title {
  margin: 0;
  font-size: 1.4rem;
  color: #0f172a;
}

.answers-subtitle {
  margin: 0.6rem 0 1.2rem;
  color: #475569;
}

.question-answer-pair {
  display: grid;
  gap: 0.45rem;
  margin-bottom: 1rem;
}

.question-label {
  font-weight: 600;
  color: #1e293b;
}

.answer-input {
  min-height: 2.8rem;
  border-radius: 0.55rem;
  border: 1px solid #cbd5e1;
  padding: 0 0.85rem;
  font-size: 0.94rem;
  color: #0f172a;
}

.answer-input:focus {
  outline: 2px solid #c7d2fe;
  border-color: #818cf8;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.25);
  display: grid;
  place-items: center;
  padding: 1rem;
}

.modal-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 0.7rem;
  padding: 1rem 1.2rem;
  min-width: 14rem;
  text-align: center;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.18);
}

.modal-card p {
  margin: 0 0 0.8rem;
  color: #0f172a;
  font-weight: 600;
}

.modal-close-btn {
  border: none;
  border-radius: 0.5rem;
  min-height: 2rem;
  padding: 0 0.8rem;
  background: #e2e8f0;
  color: #1e293b;
  font-weight: 600;
  cursor: pointer;
}

@keyframes questionnaire-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 960px) {
  .studio-grid {
    flex-direction: column;
  }

  .studio-panel {
    height: auto;
    min-height: 0;
    overflow-y: visible;
  }
}
</style>
