import { describe, expect, it } from 'vitest'
import { NATURES, getNatureModifier } from './natures'

describe('性格資料', () => {
  it('包含 25 種性格且 ID 不重複', () => {
    expect(NATURES).toHaveLength(25)
    expect(new Set(NATURES.map((nature) => nature.id)).size).toBe(25)
  })

  it('固執提升攻擊、降低特攻', () => {
    const adamant = NATURES.find((nature) => nature.id === 'adamant')
    expect(adamant).toBeDefined()

    expect(getNatureModifier(adamant!, 'attack')).toBe(1.1)
    expect(getNatureModifier(adamant!, 'special-attack')).toBe(0.9)
    expect(getNatureModifier(adamant!, 'speed')).toBe(1)
  })

  it('HP 不受任何性格影響', () => {
    NATURES.forEach((nature) => {
      expect(getNatureModifier(nature, 'hp')).toBe(1)
    })
  })
})
