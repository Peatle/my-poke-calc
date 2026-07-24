import gen9Stats from './stats/gen9.json'
import enNames from '../locales/en/pokemon-names.json'
import zhNames from '../locales/zh-Hant/pokemon-names.json'
import type { ModernBaseStats, Pokemon } from '../types/pokemon'

interface RawPokemon {
  id: number
  key: string
  stats: ModernBaseStats
  system: 'IV'
}

export interface PokemonCatalogEntry extends Pokemon {
  displayName: string
  englishName: string
}

const rawPokemon = gen9Stats as RawPokemon[]
const traditionalChineseNames = zhNames as Record<string, string>
const englishNames = enNames as Record<string, string>

export const POKEMON_CATALOG: readonly PokemonCatalogEntry[] = rawPokemon
  .map((pokemon, sourceIndex) => ({
    pokemon: {
      ...pokemon,
      displayName: traditionalChineseNames[pokemon.key] ?? pokemon.key,
      englishName: englishNames[pokemon.key] ?? pokemon.key,
    },
    sourceIndex,
  }))
  .sort(
    (left, right) =>
      left.pokemon.id - right.pokemon.id ||
      left.sourceIndex - right.sourceIndex,
  )
  .map(({ pokemon }) => pokemon)

export function formatDexNumber(id: number): string {
  return `#${id.toString().padStart(4, '0')}`
}

export function searchPokemon(
  query: string,
  limit = 10,
): PokemonCatalogEntry[] {
  const normalizedQuery = query.trim()

  if (normalizedQuery === '') {
    return POKEMON_CATALOG.slice(0, limit)
  }

  if (/^#?\d+$/.test(normalizedQuery)) {
    const id = Number.parseInt(normalizedQuery.replace('#', ''), 10)
    return POKEMON_CATALOG.filter((pokemon) => pokemon.id === id).slice(0, limit)
  }

  const textQuery = normalizedQuery.toLocaleLowerCase()

  return POKEMON_CATALOG.filter((pokemon) => {
    return (
      pokemon.displayName.toLocaleLowerCase().includes(textQuery) ||
      pokemon.englishName.toLocaleLowerCase().includes(textQuery) ||
      pokemon.key.toLocaleLowerCase().includes(textQuery)
    )
  }).slice(0, limit)
}
