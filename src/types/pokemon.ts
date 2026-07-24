export const STAT_NAMES = [
  'hp',
  'attack',
  'defense',
  'special-attack',
  'special-defense',
  'speed',
] as const

export type StatName = (typeof STAT_NAMES)[number]

export type NatureModifier = 0.9 | 1 | 1.1

export interface ModernBaseStats {
  hp: number
  attack: number
  defense: number
  'special-attack': number
  'special-defense': number
  speed: number
}

export interface Pokemon {
  id: number
  key: string
  stats: ModernBaseStats
  system: 'IV'
}

export type PokemonNameDictionary = Readonly<Record<string, string>>
