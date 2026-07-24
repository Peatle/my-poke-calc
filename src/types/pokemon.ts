export type StatSystem = 'DV' | 'IV'

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

export interface IBaseStats {
  hp: number
  attack: number
  defense: number
  speed: number
  special?: number
  'special-attack'?: number
  'special-defense'?: number
}

export interface ModernBaseStats extends IBaseStats {
  'special-attack': number
  'special-defense': number
}

export interface Pokemon {
  id: number
  key: string
  stats: ModernBaseStats
  system: 'IV'
}

export interface IPokemonData {
  id: number
  key: string
  stats: IBaseStats
  system: StatSystem
}

export interface IPokemonDisplay extends IPokemonData {
  displayName: string
}

export type INameDict = Record<string, string>

export type PokemonNameDictionary = Readonly<Record<string, string>>
