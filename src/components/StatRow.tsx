import type { NatureModifier, StatName } from '../types/pokemon'
import { NumberInput } from './NumberInput'

export interface StatInputValue {
  observed: string
  ev: string
}

export type StatResult =
  | { kind: 'idle' }
  | { kind: 'error'; message: string }
  | { kind: 'shedinja' }
  | { kind: 'range'; min: number; max: number }

interface StatRowProps {
  stat: StatName
  label: string
  baseStat: number | null
  value: StatInputValue
  natureModifier: NatureModifier
  result: StatResult
  onChange: (value: StatInputValue) => void
}

function NatureBadge({ modifier }: { modifier: NatureModifier }) {
  if (modifier === 1) {
    return null
  }

  return (
    <>
      <span
        aria-label={modifier === 1.1 ? '性格補正上升' : '性格補正下降'}
        className={`ml-0.5 text-[11px] font-black sm:hidden ${
          modifier === 1.1 ? 'text-emerald-300' : 'text-red-300'
        }`}
      >
        {modifier === 1.1 ? '↑' : '↓'}
      </span>
      <span
        className={`ml-2 hidden rounded-full px-2 py-0.5 text-[11px] font-bold sm:inline-flex ${
          modifier === 1.1
            ? 'bg-emerald-500/15 text-emerald-300'
            : 'bg-red-500/15 text-red-300'
        }`}
      >
        {modifier === 1.1 ? '↑ 1.1' : '↓ 0.9'}
      </span>
    </>
  )
}

function ResultDisplay({ result }: { result: StatResult }) {
  if (result.kind === 'idle') {
    return <span className="text-slate-600">—</span>
  }

  if (result.kind === 'shedinja') {
    return (
      <>
        <span className="result-compact-label text-amber-300 sm:hidden">
          N/A
        </span>
        <span className="result-detail text-amber-300">
          <span className="block">HP 固定為 1</span>
          <span className="block">無法逆推 IV</span>
        </span>
      </>
    )
  }

  if (result.kind === 'error') {
    return (
      <>
        <span className="result-compact-label text-red-300 sm:hidden">
          錯誤
        </span>
        <span className="result-detail text-red-300">{result.message}</span>
      </>
    )
  }

  const isPerfect = result.min === 31 && result.max === 31
  const value =
    result.min === result.max ? result.min : `${result.min}–${result.max}`

  return (
    <span
      className={
        isPerfect
          ? 'inline-flex items-center text-amber-300 sm:gap-2'
          : 'font-bold text-white'
      }
    >
      <span>{value}</span>
      {isPerfect && (
        <>
          <span aria-hidden="true" className="font-bold sm:hidden">
            ★
          </span>
          <span className="hidden text-base font-bold sm:inline">最棒</span>
        </>
      )}
    </span>
  )
}

export function StatRow({
  stat,
  label,
  baseStat,
  value,
  natureModifier,
  result,
  onChange,
}: StatRowProps) {
  return (
    <div className="stat-row mobile-stat-grid grid items-center gap-x-1 border-t px-2 py-1 transition-colors sm:grid-cols-[1.25fr_0.65fr_1fr_1fr_1.2fr] sm:gap-3 sm:px-5 sm:py-4">
      <div className="flex min-w-0 items-center sm:block">
        <div className="truncate text-xs font-bold text-white sm:text-base">
          {label}
          <NatureBadge modifier={natureModifier} />
        </div>
      </div>

      <div className="hidden font-mono text-lg text-slate-300 sm:block">
        {baseStat ?? '—'}
      </div>

      <div className="min-w-0">
        <NumberInput
          ariaLabel={`${label}實際能力值`}
          className="stat-value-input"
          disabled={
            baseStat === null ||
            (stat === 'hp' && result.kind === 'shedinja')
          }
          min={1}
          onChange={(observed) => onChange({ ...value, observed })}
          placeholder="輸入"
          stepperVisibility="desktop-only"
          value={value.observed}
        />
      </div>

      <div className="min-w-0">
        <NumberInput
          ariaLabel={`${label}EV`}
          className="stat-value-input"
          disabled={baseStat === null || result.kind === 'shedinja'}
          max={252}
          min={0}
          onChange={(ev) => onChange({ ...value, ev })}
          stepperVisibility="desktop-only"
          value={value.ev}
        />
      </div>

      <div
        aria-live="polite"
        className={`result-cell min-w-0 text-center text-xs sm:flex sm:min-h-8 sm:items-center sm:justify-center sm:px-3 sm:py-2 sm:text-lg ${
          result.kind === 'error' || result.kind === 'shedinja'
            ? 'result-cell--with-detail'
            : ''
        }`}
      >
        <ResultDisplay result={result} />
      </div>
    </div>
  )
}
