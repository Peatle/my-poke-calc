import { useMemo, useState } from 'react'
import { PokemonSearch } from './components/PokemonSearch'
import { NumberInput } from './components/NumberInput'
import {
  StatRow,
  type StatInputValue,
  type StatResult,
} from './components/StatRow'
import {
  DEFAULT_GENERATION,
  GENERATIONS,
  type GenerationId,
} from './data/generations'
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

const STAT_SHORT_LABELS: Record<StatName, string> = {
  hp: 'HP',
  attack: '攻',
  defense: '防',
  'special-attack': '特攻',
  'special-defense': '特防',
  speed: '速',
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
  const [generation, setGeneration] =
    useState<GenerationId>(DEFAULT_GENERATION)
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

  const changeGeneration = (nextGeneration: GenerationId) => {
    if (nextGeneration === generation) {
      return
    }

    setGeneration(nextGeneration)
    setSelectedPokemon(null)
    setPokemonQuery('')
    setStatInputs(createInitialStatInputs())
  }

  const changePokemonQuery = (query: string) => {
    setPokemonQuery(query)

    if (selectedPokemon) {
      setSelectedPokemon(null)
      setStatInputs(createInitialStatInputs())
    }
  }

  const selectPokemon = (pokemon: PokemonCatalogEntry) => {
    setSelectedPokemon(pokemon)
    setPokemonQuery(`${formatDexNumber(pokemon.id)} ${pokemon.displayName}`)
    setStatInputs(createInitialStatInputs())
  }

  return (
    <main className="app-shell min-h-screen text-slate-100">
      <div className="app-container mx-auto w-full max-w-6xl px-3 py-4 sm:px-6 sm:py-12">
        <header className="app-header mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 sm:mb-10 sm:flex sm:items-end sm:justify-between">
          <div className="contents sm:block">
            <div className="brand-kicker generation-picker col-start-1 row-start-1 rounded-full border sm:mb-3">
              <span
                aria-hidden="true"
                className="generation-picker-dot"
              />
              <select
                aria-label="遊戲世代"
                className="generation-picker-select"
                id="generation"
                onChange={(event) =>
                  changeGeneration(event.target.value as GenerationId)
                }
                value={generation}
              >
                {Object.entries(GENERATIONS).map(([id, config]) => (
                  <option key={id} value={id}>
                    {config.shortLabel}
                  </option>
                ))}
              </select>
            </div>
            <h1 className="page-title col-start-1 row-start-2 self-center text-3xl font-black tracking-tight sm:text-5xl">
              寶可夢 IV 計算器
            </h1>
          </div>
          <button
            className="reset-button col-start-2 row-start-2 min-h-9 shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition sm:min-h-0 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
            onClick={resetForm}
            type="button"
          >
            重設
          </button>
        </header>

        <section className="surface-panel mb-3 grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-3 rounded-xl border p-3 backdrop-blur sm:mb-6 sm:grid-cols-2 sm:gap-5 sm:rounded-3xl sm:p-7 lg:grid-cols-[1.4fr_0.55fr_0.8fr]">
          <PokemonSearch
            className="col-span-2 lg:col-span-1"
            generation={generation}
            key={generation}
            onQueryChange={changePokemonQuery}
            onSelect={selectPokemon}
            query={pokemonQuery}
            selectedPokemon={selectedPokemon}
          />

          <div className="min-w-0">
            <label
              className="field-label mb-1 block text-xs font-semibold sm:mb-2 sm:text-sm"
              htmlFor="level"
            >
              等級
            </label>
            <NumberInput
              ariaLabel="等級"
              className="h-11 sm:h-[54px]"
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

          <div className="min-w-0">
            <label
              className="field-label mb-1 block text-xs font-semibold sm:mb-2 sm:text-sm"
              htmlFor="nature"
            >
              性格
            </label>
            <select
              className="select-control h-11 w-full border px-3 text-sm outline-none transition sm:h-[54px] sm:px-4 sm:text-base"
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
          <section className="selected-card mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 rounded-xl border px-3 py-2.5 sm:mb-5 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:rounded-2xl sm:px-5 sm:py-4">
            <div className="flex min-w-0 items-baseline">
              <span className="suggestion-id mr-2 shrink-0 font-mono text-xs font-bold sm:mr-3 sm:text-sm">
                {formatDexNumber(selectedPokemon.id)}
              </span>
              <span className="truncate text-base font-black text-white sm:text-lg">
                {selectedPokemon.displayName}
              </span>
              <span className="ml-2 hidden text-sm text-slate-500 sm:inline">
                {selectedPokemon.englishName}
              </span>
            </div>
            <div
              className={`ev-total-badge rounded-full px-2 py-1 text-[11px] font-bold sm:px-3 sm:text-xs ${
                isEvTotalValid
                  ? 'bg-slate-800 text-slate-300'
                  : 'bg-red-500/15 text-red-300'
              }`}
            >
              EV 合計 {evTotal} / 510
            </div>

            <div
              aria-label="種族值"
              className="base-stats-strip col-span-full mt-2 grid grid-cols-6 border-t pt-2 sm:hidden"
              role="group"
            >
              {STAT_NAMES.map((stat) => (
                <div className="base-stat-cell text-center" key={stat}>
                  <span className="block text-[9px] font-semibold leading-3 text-slate-500">
                    {STAT_SHORT_LABELS[stat]}
                  </span>
                  <span className="block font-mono text-sm font-bold leading-4 text-slate-200">
                    {selectedPokemon.stats[stat]}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="empty-card mb-3 rounded-xl border px-3 py-2.5 text-center text-xs sm:mb-5 sm:rounded-2xl sm:px-5 sm:py-4 sm:text-sm">
            請先搜尋並選擇一隻寶可夢
          </section>
        )}

        <section className="stats-panel overflow-hidden rounded-xl border sm:rounded-3xl">
          <div className="mobile-stat-grid mobile-stats-header grid items-center gap-x-1 px-2 text-center sm:hidden">
            <span className="text-left">能力</span>
            <span>實際值</span>
            <span>EV</span>
            <span>IV</span>
          </div>

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

        <footer className="footer-copy mt-4 flex flex-col gap-1.5 px-1 text-[11px] leading-4 sm:mt-6 sm:gap-2 sm:px-2 sm:text-xs sm:leading-5">
          <p>
            資料來源：
            <a
              href="https://pokeapi.co/"
              rel="noreferrer"
              target="_blank"
            >
              PokéAPI（pokeapi.co）
            </a>
          </p>
          <p>計算結果僅供參考，請以遊戲內實際資料為準。</p>
          <p>
            本網站為非官方、非商業性的粉絲製作資訊工具，與任天堂、Game
            Freak、Creatures Inc. 及 The Pokémon Company
            無任何關聯。寶可夢（Pokémon）及相關商標與內容之權利歸其各自權利人所有。
          </p>
        </footer>
      </div>
    </main>
  )
}

export default App
