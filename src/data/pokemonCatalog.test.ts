import { describe, expect, it } from 'vitest'
import {
  POKEMON_CATALOG,
  formatDexNumber,
  searchPokemon,
} from './pokemonCatalog'

describe('寶可夢圖鑑搜尋', () => {
  it('預設依全國圖鑑編號排列', () => {
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
})
