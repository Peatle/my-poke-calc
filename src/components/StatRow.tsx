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
    <span
      className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-bold ${
        modifier === 1.1
          ? 'bg-rose-500/15 text-rose-300'
          : 'bg-sky-500/15 text-sky-300'
      }`}
    >
      {modifier === 1.1 ? '↑ 1.1' : '↓ 0.9'}
    </span>
  )
}

function ResultDisplay({ result }: { result: StatResult }) {
  if (result.kind === 'idle') {
    return <span className="text-slate-600">—</span>
  }

  if (result.kind === 'shedinja') {
    return (
      <span className="text-xs leading-5 text-amber-300">
        <span className="block">HP 固定為 1</span>
        <span className="block">無法逆推 IV</span>
      </span>
    )
  }

  if (result.kind === 'error') {
    return <span className="text-xs leading-5 text-red-300">{result.message}</span>
  }

  const isPerfect = result.min === 31 && result.max === 31

  return (
    <span
      className={
        isPerfect
          ? 'inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-3 py-1 text-amber-300'
          : 'font-bold text-white'
      }
    >
      <span>{result.min === result.max ? result.min : `${result.min}–${result.max}`}</span>
      {isPerfect && <span className="text-xs font-bold">最棒</span>}
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
    <div className="grid gap-3 border-t border-slate-800 px-4 py-4 sm:grid-cols-[1.25fr_0.65fr_1fr_1fr_1.2fr] sm:items-center sm:px-5">
      <div className="flex items-center justify-between sm:block">
        <div className="font-bold text-white">
          {label}
          <NatureBadge modifier={natureModifier} />
        </div>
        <div className="text-sm text-slate-500 sm:hidden">
          種族值 <span className="font-mono text-slate-300">{baseStat ?? '—'}</span>
        </div>
      </div>

      <div className="hidden font-mono text-sm text-slate-300 sm:block">
        {baseStat ?? '—'}
      </div>

      <div className="grid grid-cols-[5rem_1fr] items-center gap-3 sm:block">
        <span className="text-xs font-semibold text-slate-500 sm:sr-only">
          實際能力值
        </span>
        <NumberInput
          ariaLabel={`${label}實際能力值`}
          disabled={baseStat === null || (stat === 'hp' && result.kind === 'shedinja')}
          min={1}
          onChange={(observed) => onChange({ ...value, observed })}
          placeholder="輸入"
          value={value.observed}
        />
      </div>

      <div className="grid grid-cols-[5rem_1fr] items-center gap-3 sm:block">
        <span className="text-xs font-semibold text-slate-500 sm:sr-only">EV</span>
        <NumberInput
          ariaLabel={`${label}EV`}
          disabled={baseStat === null || result.kind === 'shedinja'}
          max={252}
          min={0}
          onChange={(ev) => onChange({ ...value, ev })}
          value={value.ev}
        />
      </div>

      <div className="grid grid-cols-[5rem_1fr] items-center gap-3 sm:block">
        <span className="text-xs font-semibold text-slate-500 sm:sr-only">IV 結果</span>
        <div
          aria-live="polite"
          className="min-h-8 text-sm sm:flex sm:items-center"
        >
          <ResultDisplay result={result} />
        </div>
      </div>
    </div>
  )
}
