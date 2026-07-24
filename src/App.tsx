import { useMemo, useState } from 'react'
import { PokemonSearch } from './components/PokemonSearch'
import { NumberInput } from './components/NumberInput'
import {
  StatRow,
  type StatInputValue,
  type StatResult,
} from './components/StatRow'
import { NATURES, getNatureModifier } from './data/natures'
import {
  formatDexNumber,
  type PokemonCatalogEntry,
} from './data/pokemonCatalog'
import { calculateIvRange } from './domain/ivCalculator'
import { STAT_NAMES, type StatName } from './types/pokemon'
import './App.css'

const STAT_LABELS: Record<StatName, string> = {
  hp: 'HP',
  attack: '攻擊',
  defense: '防禦',
  'special-attack': '特攻',
  'special-defense': '特防',
  speed: '速度',
}

function createInitialStatInputs(): Record<StatName, StatInputValue> {
  return Object.fromEntries(
    STAT_NAMES.map((stat) => [stat, { observed: '', ev: '0' }]),
  ) as Record<StatName, StatInputValue>
}

function parseIntegerInRange(
  value: string,
  minimum: number,
  maximum: number,
): number | null {
  if (value.trim() === '') {
    return null
  }

  const parsedValue = Number(value)
  return Number.isInteger(parsedValue) &&
    parsedValue >= minimum &&
    parsedValue <= maximum
    ? parsedValue
    : null
}

function App() {
  const [selectedPokemon, setSelectedPokemon] =
    useState<PokemonCatalogEntry | null>(null)
  const [pokemonQuery, setPokemonQuery] = useState('')
  const [level, setLevel] = useState('50')
  const [natureId, setNatureId] = useState('serious')
  const [statInputs, setStatInputs] = useState(createInitialStatInputs)

  const selectedNature =
    NATURES.find((nature) => nature.id === natureId) ?? NATURES[12]
  const parsedLevel = parseIntegerInRange(level, 1, 100)
  const parsedEvs = Object.fromEntries(
    STAT_NAMES.map((stat) => [
      stat,
      parseIntegerInRange(statInputs[stat].ev, 0, 252),
    ]),
  ) as Record<StatName, number | null>
  const evTotal = STAT_NAMES.reduce(
    (total, stat) => total + (parsedEvs[stat] ?? 0),
    0,
  )
  const isEvTotalValid = evTotal <= 510

  const results = useMemo(() => {
    return Object.fromEntries(
      STAT_NAMES.map((stat): [StatName, StatResult] => {
        if (!selectedPokemon) {
          return [stat, { kind: 'idle' }]
        }

        if (selectedPokemon.key === 'shedinja' && stat === 'hp') {
          return [stat, { kind: 'shedinja' }]
        }

        const observedText = statInputs[stat].observed

        if (observedText.trim() === '') {
          return [stat, { kind: 'idle' }]
        }

        if (parsedLevel === null) {
          return [stat, { kind: 'error', message: '請檢查等級' }]
        }

        const ev = parsedEvs[stat]
        if (ev === null) {
          return [stat, { kind: 'error', message: 'EV 須為 0–252 整數' }]
        }

        if (!isEvTotalValid) {
          return [stat, { kind: 'error', message: 'EV 總和超過 510' }]
        }

        const observedStat = parseIntegerInRange(
          observedText,
          1,
          Number.MAX_SAFE_INTEGER,
        )
        if (observedStat === null) {
          return [stat, { kind: 'error', message: '能力值須為正整數' }]
        }

        const range = calculateIvRange({
          stat,
          baseStat: selectedPokemon.stats[stat],
          ev,
          level: parsedLevel,
          nature: getNatureModifier(selectedNature, stat),
          observedStat,
        })

        return range
          ? [stat, { kind: 'range', min: range.min, max: range.max }]
          : [stat, { kind: 'error', message: '無符合結果，請檢查輸入' }]
      }),
    ) as Record<StatName, StatResult>
  }, [
    isEvTotalValid,
    parsedEvs,
    parsedLevel,
    selectedNature,
    selectedPokemon,
    statInputs,
  ])

  const resetForm = () => {
    setSelectedPokemon(null)
    setPokemonQuery('')
    setLevel('50')
    setNatureId('serious')
    setStatInputs(createInitialStatInputs())
  }

  const selectPokemon = (pokemon: PokemonCatalogEntry) => {
    setSelectedPokemon(pokemon)
    setStatInputs(createInitialStatInputs())
  }

  return (
    <main className="app-shell min-h-screen text-slate-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="brand-kicker mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold tracking-[0.18em]">
              <span aria-hidden="true" className="brand-kicker-dot">●</span>
              GEN 9 · IV CALCULATOR
            </div>
            <h1 className="page-title text-3xl font-black tracking-tight sm:text-5xl">
              寶可夢 IV 計算器
            </h1>
            <p className="page-copy mt-3 max-w-2xl text-sm leading-6 sm:text-base">
              輸入遊戲中的能力值、努力值與性格，即時逆推出可能的個體值範圍。
            </p>
          </div>
          <button
            className="reset-button self-start rounded-xl px-4 py-2 text-sm font-semibold transition sm:self-auto"
            onClick={resetForm}
            type="button"
          >
            重設全部
          </button>
        </header>

        <section className="surface-panel mb-6 grid gap-5 rounded-3xl border p-5 backdrop-blur sm:grid-cols-2 sm:p-7 lg:grid-cols-[1.4fr_0.55fr_0.8fr]">
          <PokemonSearch
            onQueryChange={setPokemonQuery}
            onSelect={selectPokemon}
            query={pokemonQuery}
            selectedPokemon={selectedPokemon}
          />

          <div>
            <label
              className="field-label mb-2 block text-sm font-semibold"
              htmlFor="level"
            >
              等級
            </label>
            <NumberInput
              ariaLabel="等級"
              className="h-[54px]"
              describedBy={parsedLevel === null ? 'level-error' : undefined}
              id="level"
              invalid={parsedLevel === null}
              max={100}
              min={1}
              onChange={setLevel}
              value={level}
            />
            {parsedLevel === null && (
              <p className="mt-2 text-xs text-red-300" id="level-error">
                請輸入 1–100 的整數
              </p>
            )}
          </div>

          <div>
            <label
              className="field-label mb-2 block text-sm font-semibold"
              htmlFor="nature"
            >
              性格
            </label>
            <select
              className="select-control h-[54px] w-full rounded-2xl border px-4 text-base outline-none transition"
              id="nature"
              onChange={(event) => setNatureId(event.target.value)}
              value={natureId}
            >
              {NATURES.map((nature) => (
                <option key={nature.id} value={nature.id}>
                  {nature.zhName} · {nature.enName}
                </option>
              ))}
            </select>
          </div>
        </section>

        {selectedPokemon ? (
          <section className="selected-card mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-4">
            <div>
              <span className="suggestion-id mr-3 font-mono text-sm font-bold">
                {formatDexNumber(selectedPokemon.id)}
              </span>
              <span className="text-lg font-black text-white">
                {selectedPokemon.displayName}
              </span>
              <span className="ml-2 text-sm text-slate-500">
                {selectedPokemon.englishName}
              </span>
            </div>
            <div
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                isEvTotalValid
                  ? 'bg-slate-800 text-slate-300'
                  : 'bg-red-500/15 text-red-300'
              }`}
            >
              EV 合計 {evTotal} / 510
            </div>
          </section>
        ) : (
          <section className="empty-card mb-5 rounded-2xl border px-5 py-4 text-center text-sm">
            請先搜尋並選擇一隻寶可夢
          </section>
        )}

        <section className="stats-panel overflow-hidden rounded-3xl border">
          <div className="stats-header hidden grid-cols-[1.25fr_0.65fr_1fr_1fr_1.2fr] gap-3 px-5 py-3 text-base font-bold uppercase tracking-wider sm:grid">
            <span>能力</span>
            <span>種族值</span>
            <span>實際能力值</span>
            <span>EV</span>
            <span>IV 結果</span>
          </div>

          {STAT_NAMES.map((stat) => (
            <StatRow
              baseStat={selectedPokemon?.stats[stat] ?? null}
              key={stat}
              label={STAT_LABELS[stat]}
              natureModifier={getNatureModifier(selectedNature, stat)}
              onChange={(value) =>
                setStatInputs((current) => ({ ...current, [stat]: value }))
              }
              result={results[stat]}
              stat={stat}
              value={statInputs[stat]}
            />
          ))}
        </section>

        <footer className="footer-copy mt-6 flex flex-col gap-2 px-2 text-xs leading-5 sm:flex-row sm:justify-between">
          <p>適用 Gen 9 一般 IV 規則；結果會受等級、性格與 EV 影響。</p>
          <p>資料來源：PokeAPI</p>
        </footer>
      </div>
    </main>
  )
}

export default App
