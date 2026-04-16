import type { TabPath } from './constants'
import { TAB_PATHS } from './constants'

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffleInPlace<T>(arr: T[], rand: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
}

export function buildPseudoRandomSequence(seed: number, visitsPerTab: number): TabPath[] {
  const seq: TabPath[] = []
  const rand = mulberry32(seed)
  for (const path of TAB_PATHS) {
    for (let k = 0; k < visitsPerTab; k++) seq.push(path)
  }
  shuffleInPlace(seq, rand)
  return seq
}
