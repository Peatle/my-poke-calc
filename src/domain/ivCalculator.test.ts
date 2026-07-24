import { describe, expect, it } from 'vitest'
import {
  calculateIvRange,
  calculateStat,
  findPossibleIvs,
} from './ivCalculator'
import type {
  IvCalculationInput,
  StatCalculationInput,
} from './ivCalculator'
import type { NatureModifier } from '../types/pokemon'

const neutralSpeedInput: StatCalculationInput = {
  stat: 'speed',
  baseStat: 102,
  iv: 31,
  ev: 252,
  level: 50,
  nature: 1,
}

describe('能力值正向計算', () => {
  it('正確計算 HP', () => {
    expect(
      calculateStat({
        stat: 'hp',
        baseStat: 108,
        iv: 31,
        ev: 252,
        level: 50,
      }),
    ).toBe(215)
  })

  it('正確計算中性性格的一般能力值', () => {
    expect(calculateStat(neutralSpeedInput)).toBe(154)
  })

  it('正確套用增加與降低能力的性格', () => {
    expect(calculateStat({ ...neutralSpeedInput, nature: 1.1 })).toBe(169)
    expect(calculateStat({ ...neutralSpeedInput, nature: 0.9 })).toBe(138)
  })

  it('EV 每四點才產生一次效果', () => {
    const input = {
      stat: 'attack',
      baseStat: 100,
      iv: 31,
      level: 50,
      nature: 1,
    } satisfies Omit<StatCalculationInput, 'ev'>

    expect(calculateStat({ ...input, ev: 3 })).toBe(120)
    expect(calculateStat({ ...input, ev: 4 })).toBe(121)
  })
})

describe('IV 逆推', () => {
  const rangeInput: IvCalculationInput = {
    stat: 'speed',
    baseStat: 100,
    ev: 0,
    level: 50,
    nature: 1,
    observedStat: 120,
  }

  it('回傳所有符合能力值的 IV', () => {
    expect(findPossibleIvs(rangeInput)).toEqual([30, 31])
  })

  it('將候選 IV 整理成範圍', () => {
    expect(calculateIvRange(rangeInput)).toEqual({
      min: 30,
      max: 31,
      values: [30, 31],
    })
  })

  it('在等級 100 可逆推出單一 IV', () => {
    expect(
      calculateIvRange({
        ...rangeInput,
        level: 100,
        observedStat: 236,
      }),
    ).toEqual({
      min: 31,
      max: 31,
      values: [31],
    })
  })

  it('能力值不可能達成時回傳 null', () => {
    expect(calculateIvRange({ ...rangeInput, observedStat: 999 })).toBeNull()
  })
})

describe('輸入驗證', () => {
  it.each([
    ['IV', { ...neutralSpeedInput, iv: 32 }],
    ['EV', { ...neutralSpeedInput, ev: 253 }],
    ['等級', { ...neutralSpeedInput, level: 0 }],
    ['種族值', { ...neutralSpeedInput, baseStat: 0 }],
    [
      '性格修正',
      { ...neutralSpeedInput, nature: 1.2 as NatureModifier },
    ],
  ])('%s 超出範圍時拒絕計算', (_label, input) => {
    expect(() => calculateStat(input)).toThrow(RangeError)
  })

  it('觀測能力值不是正整數時拒絕逆推', () => {
    expect(() =>
      findPossibleIvs({
        stat: 'attack',
        baseStat: 100,
        ev: 0,
        level: 50,
        observedStat: 0,
      }),
    ).toThrow(RangeError)
  })
})
