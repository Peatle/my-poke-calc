import { describe, expect, it } from 'vitest'
import {
  POKEMON_CATALOG,
  formatDexNumber,
  getPokemonCatalog,
  searchPokemon,
} from './pokemonCatalog'
import type { GenerationId } from './generations'

describe('寶可夢圖鑑搜尋', () => {
  it('預設使用 Gen 9 並依全國圖鑑編號排列', () => {
    const firstTen = searchPokemon('')
    expect(firstTen).toHaveLength(10)
    expect(firstTen.map((pokemon) => pokemon.id)).toEqual(
      [...firstTen].map((pokemon) => pokemon.id).sort((a, b) => a - b),
    )
    expect(POKEMON_CATALOG[0].key).toBe('bulbasaur')
  })

  it.each(['25', '025', '#0025'])('%s 可精確搜尋皮卡丘', (query) => {
    const results = searchPokemon(query)
    expect(results.length).toBeGreaterThan(0)
    expect(results.every((pokemon) => pokemon.id === 25)).toBe(true)
    expect(results[0].key).toBe('pikachu')
  })

  it('同一圖鑑編號的不同型態不會被去重', () => {
    const rotomForms = searchPokemon('479')
    expect(rotomForms.length).toBeGreaterThanOrEqual(6)
    expect(new Set(rotomForms.map((pokemon) => pokemon.key)).size).toBe(
      rotomForms.length,
    )
  })

  it('支援繁中、英文與 key 搜尋', () => {
    expect(searchPokemon('妙蛙種子')[0].key).toBe('bulbasaur')
    expect(searchPokemon('BULBASAUR')[0].key).toBe('bulbasaur')
    expect(searchPokemon('rattata-alola')[0].key).toBe('rattata-alola')
  })

  it('圖鑑編號統一顯示四位數', () => {
    expect(formatDexNumber(1)).toBe('#0001')
    expect(formatDexNumber(25)).toBe('#0025')
    expect(formatDexNumber(1025)).toBe('#1025')
  })

  describe.each<GenerationId>(['gen8', 'gen9'])('%s 版本化目錄', (generation) => {
    it('完整目錄依全國圖鑑編號排列', () => {
      const catalog = getPokemonCatalog(generation)
      expect(catalog.map((pokemon) => pokemon.id)).toEqual(
        [...catalog].map((pokemon) => pokemon.id).sort((a, b) => a - b),
      )
    })

    it('支援數字、前導零、繁中、英文與 key 搜尋', () => {
      expect(searchPokemon('#0025', generation)[0].key).toBe('pikachu')
      expect(searchPokemon('妙蛙種子', generation)[0].key).toBe('bulbasaur')
      expect(searchPokemon('BULBASAUR', generation)[0].key).toBe('bulbasaur')
      expect(searchPokemon('rattata-alola', generation)[0].key).toBe(
        'rattata-alola',
      )
    })

    it('同一圖鑑編號的不同型態不會被去重', () => {
      const rotomForms = searchPokemon('479', generation)
      expect(rotomForms.length).toBeGreaterThanOrEqual(6)
      expect(new Set(rotomForms.map((pokemon) => pokemon.key)).size).toBe(
        rotomForms.length,
      )
    })
  })

  it('Gen 8 與 Gen 9 搜尋結果不會跨世代污染', () => {
    expect(searchPokemon('899', 'gen8')).toEqual([])
    expect(searchPokemon('詭角鹿', 'gen8')).toEqual([])
    expect(searchPokemon('899', 'gen9')[0].key).toBe('wyrdeer')
    expect(searchPokemon('詭角鹿', 'gen9')[0].key).toBe('wyrdeer')
  })

  it('同一隻寶可夢會使用所選世代的歷史種族值', () => {
    const gen8Cresselia = searchPokemon('cresselia', 'gen8')[0]
    const gen9Cresselia = searchPokemon('cresselia', 'gen9')[0]

    expect(gen8Cresselia.stats.defense).toBe(120)
    expect(gen8Cresselia.stats['special-defense']).toBe(130)
    expect(gen9Cresselia.stats.defense).toBe(110)
    expect(gen9Cresselia.stats['special-defense']).toBe(120)
  })

  it('可以限制指定世代的搜尋結果數量', () => {
    expect(searchPokemon('', 'gen8', 3)).toHaveLength(3)
    expect(searchPokemon('', 'gen9', 4)).toHaveLength(4)
  })
})
