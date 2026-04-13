<script setup>
import { ref } from 'vue'

const libraryOptionsPool = [
  'SOC 2 Type II Pack',
  'ISO 27001 Essentials',
  'HIPAA Happy Hour',
  'GDPR Greatest Hits',
  'FedRAMP Fan Fiction',
  'PCI-DSS Pizza Party',
  'NIST Nice List',
  'CMMC Cat Memes',
]

const aiPresetPool = [
  'Serious Vendor Voice',
  'Friendly But Firm',
  'Compliance Poet',
  'Bulletproof Brevity',
  'Risk-Averse RomCom',
  'Audit Season Survival',
  'Policy Paladin',
  'Security Stand-up',
]

const questions = [
  'If your CEO were a sandwich, which fillings would improve quarterly earnings?',
  'On a scale of mint tea to rocket fuel, how caffeinated is your compliance team today?',
  'Describe your vendor risk in a haiku (5-7-5 optional, enthusiasm mandatory).',
]

const presetAnswers = [
  'Extra pickles, hold the regret.',
  'Somewhere between cold brew and aviation-grade espresso.',
  'Spreadsheet rows whisper low / The auditor hums softly / We click I agree.',
]

const answers = ref(['', '', ''])

const libraryOpen = ref(false)
const presetOpen = ref(false)
const libraryChoices = ref([])
const presetChoices = ref([])
const selectedLibrary = ref('')
const selectedPreset = ref('')

const vendictModalOpen = ref(false)

function pickRandomFour(pool) {
  const copy = [...pool]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, 4)
}

function toggleLibraries() {
  presetOpen.value = false
  libraryOpen.value = !libraryOpen.value
  if (libraryOpen.value) {
    libraryChoices.value = pickRandomFour(libraryOptionsPool)
  }
}

function togglePresets() {
  libraryOpen.value = false
  presetOpen.value = !presetOpen.value
  if (presetOpen.value) {
    presetChoices.value = pickRandomFour(aiPresetPool)
  }
}

function selectLibrary(label) {
  selectedLibrary.value = label
  libraryOpen.value = false
}

function selectPreset(label) {
  selectedPreset.value = label
  presetOpen.value = false
}

function openVendictModal() {
  vendictModalOpen.value = true
}

function closeVendictModal() {
  vendictModalOpen.value = false
}

function autocompleteHere() {
  answers.value = [...presetAnswers]
}

function clearQuestionnaire() {
  answers.value = ['', '', '']
}

function onDocumentClick(e) {
  const t = e.target
  if (!(t instanceof Element)) return
  if (t.closest('.v2026-dropdown-wrap')) return
  libraryOpen.value = false
  presetOpen.value = false
}
</script>

<template>
  <section class="vendict-2026-demo" @click="onDocumentClick">
    <div class="vendict-2026-dual">
      <article
        class="questionnaire-card vendict-2026-pane vendict-2026-figma"
        aria-label="Vendict 2026 layout from design"
      >
        <p class="questionnaire-banner">
          Import the questionnaire to Vendict to see stats and enable autocomplete
        </p>

        <h2 class="questionnaire-title">Questionnaire detected</h2>
        <p class="questionnaire-source">Whistic</p>
        <p class="questionnaire-description">
          Your questionnaire was uploaded to Vendict and answers are being generated.
        </p>

        <div class="v2026-dropdown-wrap">
          <button
            type="button"
            class="questionnaire-field v2026-dropdown-trigger"
            aria-haspopup="listbox"
            :aria-expanded="libraryOpen"
            @click.stop="toggleLibraries"
          >
            <span>{{ selectedLibrary || 'Select libraries' }}</span>
            <span aria-hidden="true">▾</span>
          </button>
          <ul v-if="libraryOpen" class="v2026-dropdown-list" role="listbox">
            <li v-for="opt in libraryChoices" :key="opt">
              <button type="button" class="v2026-dropdown-option" @click.stop="selectLibrary(opt)">
                {{ opt }}
              </button>
            </li>
          </ul>
        </div>

        <div class="v2026-dropdown-wrap">
          <button
            type="button"
            class="questionnaire-field v2026-dropdown-trigger"
            aria-haspopup="listbox"
            :aria-expanded="presetOpen"
            @click.stop="togglePresets"
          >
            <span>{{ selectedPreset || 'Select AI preset' }}</span>
            <span aria-hidden="true">▾</span>
          </button>
          <ul v-if="presetOpen" class="v2026-dropdown-list" role="listbox">
            <li v-for="opt in presetChoices" :key="opt">
              <button type="button" class="v2026-dropdown-option" @click.stop="selectPreset(opt)">
                {{ opt }}
              </button>
            </li>
          </ul>
        </div>

        <div class="questionnaire-spinner" aria-label="Loading"></div>

        <button
          type="button"
          class="questionnaire-btn questionnaire-btn-primary"
          @click="openVendictModal"
        >
          Open in Vendict
        </button>
        <p class="questionnaire-helper">Open and answer in Vendict</p>

        <button type="button" class="questionnaire-btn questionnaire-btn-secondary" @click="autocompleteHere">
          Autocomplete Here
        </button>
        <p class="questionnaire-helper">Use Vendict AI</p>
      </article>

      <article
        class="questionnaire-card vendict-2026-pane vendict-2026-side-questionnaire"
        aria-label="Funny questionnaire"
      >
        <h2 class="questionnaire-title v2026-side-title">Quick questionnaire</h2>
        <p class="questionnaire-description v2026-side-intro">
          Same vibe as the Vendict panel — answer if you dare.
        </p>

        <div v-for="(q, i) in questions" :key="i" class="v2026-q-block">
          <label class="v2026-q-label" :for="`q-${i}`">{{ q }}</label>
          <textarea
            :id="`q-${i}`"
            v-model="answers[i]"
            class="v2026-q-input"
            rows="3"
            placeholder="Your answer…"
          />
        </div>

        <button type="button" class="v2026-clear-btn" @click="clearQuestionnaire">
          Clear the Questionnaire
        </button>
      </article>
    </div>

    <Teleport to="body">
      <div
        v-if="vendictModalOpen"
        class="v2026-modal-backdrop"
        role="presentation"
        @click="closeVendictModal"
      >
        <div class="v2026-modal" role="dialog" aria-labelledby="v2026-modal-title" @click.stop>
          <p id="v2026-modal-title" class="v2026-modal-text">Opened in Vendict</p>
          <button type="button" class="questionnaire-btn questionnaire-btn-primary v2026-modal-close" @click="closeVendictModal">
            OK
          </button>
        </div>
      </div>
    </Teleport>
  </section>
</template>
