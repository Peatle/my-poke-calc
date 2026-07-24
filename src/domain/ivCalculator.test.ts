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
  it('接受所有最小合法值', () => {
    expect(
      calculateStat({
        stat: 'hp',
        baseStat: 1,
        iv: 0,
        ev: 0,
        level: 1,
      }),
    ).toBe(11)
  })

  it('接受所有最大合法值', () => {
    expect(
      calculateStat({
        stat: 'attack',
        baseStat: 255,
        iv: 31,
        ev: 252,
        level: 100,
        nature: 1.1,
      }),
    ).toBe(669)
  })

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

  it('未提供性格倍率時預設為中性', () => {
    const inputWithoutNature = {
      stat: neutralSpeedInput.stat,
      baseStat: neutralSpeedInput.baseStat,
      iv: neutralSpeedInput.iv,
      ev: neutralSpeedInput.ev,
      level: neutralSpeedInput.level,
    } satisfies Omit<StatCalculationInput, 'nature'>

    expect(calculateStat(inputWithoutNature)).toBe(
      calculateStat({ ...inputWithoutNature, nature: 1 }),
    )
  })

  it('正確套用增加與降低能力的性格', () => {
    expect(calculateStat({ ...neutralSpeedInput, nature: 1.1 })).toBe(169)
    expect(calculateStat({ ...neutralSpeedInput, nature: 0.9 })).toBe(138)
  })

  it('HP 不受性格倍率影響', () => {
    const hpInput = {
      stat: 'hp',
      baseStat: 108,
      iv: 31,
      ev: 252,
      level: 50,
    } satisfies Omit<StatCalculationInput, 'nature'>

    expect(calculateStat({ ...hpInput, nature: 0.9 })).toBe(215)
    expect(calculateStat({ ...hpInput, nature: 1.1 })).toBe(215)
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

  it('IV 0 是唯一結果時不會與 null 混淆', () => {
    expect(
      calculateIvRange({
        stat: 'attack',
        baseStat: 100,
        ev: 0,
        level: 100,
        nature: 1,
        observedStat: 205,
      }),
    ).toEqual({
      min: 0,
      max: 0,
      values: [0],
    })
  })

  it('能力值不可能達成時回傳 null', () => {
    expect(calculateIvRange({ ...rangeInput, observedStat: 999 })).toBeNull()
  })
})

describe('輸入驗證', () => {
  it.each([
    ['IV 低於下限', { ...neutralSpeedInput, iv: -1 }],
    ['IV 高於上限', { ...neutralSpeedInput, iv: 32 }],
    ['IV 不是整數', { ...neutralSpeedInput, iv: 0.5 }],
    ['EV 低於下限', { ...neutralSpeedInput, ev: -1 }],
    ['EV 高於上限', { ...neutralSpeedInput, ev: 253 }],
    ['EV 不是整數', { ...neutralSpeedInput, ev: 3.5 }],
    ['等級低於下限', { ...neutralSpeedInput, level: 0 }],
    ['等級高於上限', { ...neutralSpeedInput, level: 101 }],
    ['等級不是整數', { ...neutralSpeedInput, level: 50.5 }],
    ['種族值低於下限', { ...neutralSpeedInput, baseStat: 0 }],
    ['種族值不是整數', { ...neutralSpeedInput, baseStat: 100.5 }],
    ['種族值是 NaN', { ...neutralSpeedInput, baseStat: Number.NaN }],
    [
      '種族值是 Infinity',
      { ...neutralSpeedInput, baseStat: Number.POSITIVE_INFINITY },
    ],
    [
      '性格修正不合法',
      { ...neutralSpeedInput, nature: 1.2 as NatureModifier },
    ],
  ])('%s 時拒絕計算', (_label, input) => {
    expect(() => calculateStat(input)).toThrow(RangeError)
  })

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    '觀測能力值為 %s 時拒絕逆推',
    (observedStat) => {
      expect(() =>
        findPossibleIvs({
          stat: 'attack',
          baseStat: 100,
          ev: 0,
          level: 50,
          observedStat,
        }),
      ).toThrow(RangeError)
    },
  )
})
