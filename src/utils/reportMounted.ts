/** Used for tab navigation performance benchmarks (console hook). */
export function reportMounted(componentName: string): void {
  console.log(`Mounted ${componentName}`)
}
