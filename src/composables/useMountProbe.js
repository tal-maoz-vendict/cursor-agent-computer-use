import { onMounted } from 'vue'

/**
 * Logs a single line on mount: `Mounted <name>` — used for tab navigation timing probes.
 */
export function useMountProbe(componentName) {
  onMounted(() => {
    console.log(`Mounted ${componentName}`)
  })
}
