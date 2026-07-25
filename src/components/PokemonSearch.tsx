import {
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
} from 'react'
import {
  formatDexNumber,
  searchPokemon,
  type PokemonCatalogEntry,
} from '../data/pokemonCatalog'

interface PokemonSearchProps {
  query: string
  selectedPokemon: PokemonCatalogEntry | null
  onQueryChange: (query: string) => void
  onSelect: (pokemon: PokemonCatalogEntry) => void
}

export function PokemonSearch({
  query,
  selectedPokemon,
  onQueryChange,
  onSelect,
}: PokemonSearchProps) {
  const listboxId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const suggestions = useMemo(() => searchPokemon(query), [query])
  const hasQuery = query.trim() !== ''
  const isListboxVisible = isOpen && hasQuery

  const selectPokemon = (pokemon: PokemonCatalogEntry) => {
    onSelect(pokemon)
    onQueryChange(`${formatDexNumber(pokemon.id)} ${pokemon.displayName}`)
    setIsOpen(false)
    setActiveIndex(0)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setIsOpen(false)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex((current) =>
        suggestions.length === 0 ? 0 : (current + 1) % suggestions.length,
      )
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex((current) =>
        suggestions.length === 0
          ? 0
          : (current - 1 + suggestions.length) % suggestions.length,
      )
      return
    }

    if (event.key === 'Enter' && isOpen && suggestions[activeIndex]) {
      event.preventDefault()
      selectPokemon(suggestions[activeIndex])
    }
  }

  return (
    <div className="relative">
      <label
        className="field-label mb-2 block text-sm font-semibold"
        htmlFor="pokemon-search"
      >
        寶可夢
      </label>
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-lg"
        >
          ◉
        </span>
        <input
          aria-activedescendant={
            isListboxVisible && suggestions[activeIndex]
              ? `${listboxId}-${activeIndex}`
              : undefined
          }
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={isListboxVisible}
          autoComplete="off"
          className="search-control w-full rounded-2xl border py-3.5 pl-11 pr-4 text-base outline-none transition"
          id="pokemon-search"
          onChange={(event) => {
            onQueryChange(event.target.value)
            setIsOpen(true)
            setActiveIndex(0)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="輸入 #0025、皮卡丘或 Pikachu"
          role="combobox"
          type="search"
          value={query}
        />
      </div>

      {isListboxVisible && (
        <ul
          className="suggestions-panel absolute z-30 mt-2 max-h-80 w-full overflow-auto rounded-2xl border p-2 shadow-2xl shadow-black/40"
          id={listboxId}
          role="listbox"
        >
          {suggestions.length > 0 ? (
            suggestions.map((pokemon, index) => (
              <li
                aria-selected={selectedPokemon?.key === pokemon.key}
                className={`cursor-pointer rounded-xl px-3 py-2.5 transition ${
                  index === activeIndex
                    ? 'suggestion-active'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
                id={`${listboxId}-${index}`}
                key={pokemon.key}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectPokemon(pokemon)}
                role="option"
              >
                <span className="suggestion-id mr-3 font-mono text-xs font-bold">
                  {formatDexNumber(pokemon.id)}
                </span>
                <span className="font-semibold">{pokemon.displayName}</span>
                <span className="ml-2 text-sm text-slate-500">
                  {pokemon.englishName}
                </span>
              </li>
            ))
          ) : (
            <li className="px-3 py-5 text-center text-sm text-slate-500">
              找不到符合的寶可夢
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
