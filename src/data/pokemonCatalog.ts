import gen8Stats from './stats/gen8.json'
import gen9Stats from './stats/gen9.json'
import enNames from '../locales/en/pokemon-names.json'
import zhNames from '../locales/zh-Hant/pokemon-names.json'
import type { ModernBaseStats, Pokemon } from '../types/pokemon'
import {
  DEFAULT_GENERATION,
  type GenerationId,
} from './generations'

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

const traditionalChineseNames = zhNames as Record<string, string>
const englishNames = enNames as Record<string, string>

function buildPokemonCatalog(
  rawPokemon: readonly RawPokemon[],
): readonly PokemonCatalogEntry[] {
  return rawPokemon
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
}

const POKEMON_CATALOGS: Record<
  GenerationId,
  readonly PokemonCatalogEntry[]
> = {
  gen8: buildPokemonCatalog(gen8Stats as RawPokemon[]),
  gen9: buildPokemonCatalog(gen9Stats as RawPokemon[]),
}

export function getPokemonCatalog(
  generation: GenerationId,
): readonly PokemonCatalogEntry[] {
  return POKEMON_CATALOGS[generation]
}

// 保留既有 Gen 9 匯出，直到 UI 完成世代參數串接。
export const POKEMON_CATALOG = getPokemonCatalog(DEFAULT_GENERATION)

export function formatDexNumber(id: number): string {
  return `#${id.toString().padStart(4, '0')}`
}

export function searchPokemon(
  query: string,
  generation: GenerationId = DEFAULT_GENERATION,
  limit = 10,
): PokemonCatalogEntry[] {
  const catalog = getPokemonCatalog(generation)
  const normalizedQuery = query.trim()

  if (normalizedQuery === '') {
    return catalog.slice(0, limit)
  }

  if (/^#?\d+$/.test(normalizedQuery)) {
    const id = Number.parseInt(normalizedQuery.replace('#', ''), 10)
    return catalog.filter((pokemon) => pokemon.id === id).slice(0, limit)
  }

  const textQuery = normalizedQuery.toLocaleLowerCase()

  return catalog.filter((pokemon) => {
    return (
      pokemon.displayName.toLocaleLowerCase().includes(textQuery) ||
      pokemon.englishName.toLocaleLowerCase().includes(textQuery) ||
      pokemon.key.toLocaleLowerCase().includes(textQuery)
    )
  }).slice(0, limit)
}
