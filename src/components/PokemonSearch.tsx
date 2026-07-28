import {
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
} from 'react'
import type { GenerationId } from '../data/generations'
import {
  formatDexNumber,
  searchPokemon,
  type PokemonCatalogEntry,
} from '../data/pokemonCatalog'

interface PokemonSearchProps {
  className?: string
  generation: GenerationId
  query: string
  selectedPokemon: PokemonCatalogEntry | null
  onQueryChange: (query: string) => void
  onSelect: (pokemon: PokemonCatalogEntry) => void
}

export function PokemonSearch({
  className = '',
  generation,
  query,
  selectedPokemon,
  onQueryChange,
  onSelect,
}: PokemonSearchProps) {
  const listboxId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const suggestions = useMemo(
    () => searchPokemon(query, generation),
    [generation, query],
  )
  const hasQuery = query.trim() !== ''
  const isListboxVisible = isOpen && hasQuery

  const selectPokemon = (pokemon: PokemonCatalogEntry) => {
    onSelect(pokemon)
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

    if (
      event.key === 'Enter' &&
      isListboxVisible &&
      suggestions[activeIndex]
    ) {
      event.preventDefault()
      selectPokemon(suggestions[activeIndex])
    }
  }

  return (
    <div className={`relative min-w-0 ${className}`}>
      <label
        className="field-label mb-1 block text-xs font-semibold sm:mb-2 sm:text-sm"
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
          className="search-control h-11 w-full border py-0 pl-10 pr-3 text-sm outline-none transition sm:h-auto sm:py-3.5 sm:pl-11 sm:pr-4 sm:text-base"
          id="pokemon-search"
          onBlur={() => {
            setIsOpen(false)
            setActiveIndex(0)
          }}
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
