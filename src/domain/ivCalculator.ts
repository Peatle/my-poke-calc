import type { NatureModifier, StatName } from '../types/pokemon'

const MIN_IV = 0
const MAX_IV = 31
const MIN_EV = 0
const MAX_EV = 252
const MIN_LEVEL = 1
const MAX_LEVEL = 100

export interface StatCalculationInput {
  stat: StatName
  baseStat: number
  iv: number
  ev: number
  level: number
  nature?: NatureModifier
}

export interface IvCalculationInput
  extends Omit<StatCalculationInput, 'iv'> {
  observedStat: number
}

export interface IvRange {
  min: number
  max: number
  values: readonly number[]
}

function assertIntegerInRange(
  name: string,
  value: number,
  min: number,
  max?: number,
) {
  const isAboveMaximum = max !== undefined && value > max

  if (!Number.isInteger(value) || value < min || isAboveMaximum) {
    const range = max === undefined ? `${min} 以上` : `${min}–${max}`
    throw new RangeError(`${name} 必須是 ${range} 的整數`)
  }
}

function assertNatureModifier(nature: number) {
  if (nature !== 0.9 && nature !== 1 && nature !== 1.1) {
    throw new RangeError('nature 必須是 0.9、1 或 1.1')
  }
}

export function calculateStat({
  stat,
  baseStat,
  iv,
  ev,
  level,
  nature = 1,
}: StatCalculationInput): number {
  assertIntegerInRange('baseStat', baseStat, 1)
  assertIntegerInRange('iv', iv, MIN_IV, MAX_IV)
  assertIntegerInRange('ev', ev, MIN_EV, MAX_EV)
  assertIntegerInRange('level', level, MIN_LEVEL, MAX_LEVEL)
  assertNatureModifier(nature)

  const effortPoints = Math.floor(ev / 4)
  const scaledStat = Math.floor(
    ((2 * baseStat + iv + effortPoints) * level) / 100,
  )

  if (stat === 'hp') {
    return scaledStat + level + 10
  }

  const natureScale = nature === 1.1 ? 11 : nature === 0.9 ? 9 : 10
  return Math.floor(((scaledStat + 5) * natureScale) / 10)
}

export function findPossibleIvs(input: IvCalculationInput): number[] {
  assertIntegerInRange('observedStat', input.observedStat, 1)

  const possibleIvs: number[] = []

  for (let iv = MIN_IV; iv <= MAX_IV; iv += 1) {
    if (calculateStat({ ...input, iv }) === input.observedStat) {
      possibleIvs.push(iv)
    }
  }

  return possibleIvs
}

export function calculateIvRange(input: IvCalculationInput): IvRange | null {
  const values = findPossibleIvs(input)

  if (values.length === 0) {
    return null
  }

  return {
    min: values[0],
    max: values[values.length - 1],
    values,
  }
}
