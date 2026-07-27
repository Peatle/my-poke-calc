export const GENERATIONS = {
  gen8: {
    label: 'Gen 8（劍／盾／BDSP）',
    shortLabel: 'GEN 8',
  },
  gen9: {
    label: 'Gen 9（朱／紫）',
    shortLabel: 'GEN 9',
  },
} as const

export type GenerationId = keyof typeof GENERATIONS

export const DEFAULT_GENERATION: GenerationId = 'gen9'
