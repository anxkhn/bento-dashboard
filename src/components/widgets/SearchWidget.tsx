import { useState, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { useDebounce } from '@/hooks/debounce';
import { set } from 'date-fns';

type SearchEngine = 'google' | 'duckduckgo' | 'bing'

const SEARCH_ENGINES: Record<SearchEngine, { name: string; url: string }> = {
  google: { name: 'Google', url: 'https://www.google.com/search?q=' },
  duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
  bing: { name: 'Bing', url: 'https://www.bing.com/search?q=' },
}

const SEARCH_SUGGESTIONS = [
  'github',
  'stackoverflow',
  'react documentation',
  'typescript handbook',
  'tailwind css',
  'npm package',
]

export function SearchWidget() {
  const [query, setQuery] = useState('')
  const [engine, setEngine] = useState<SearchEngine>('google')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debouncedQuery = useDebounce(query, 300)

  const handleSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    const encodedQuery = encodeURIComponent(searchQuery.trim())
    const searchUrl = SEARCH_ENGINES[engine].url + encodedQuery
    window.open(searchUrl, '_blank', 'noopener,noreferrer')
  }, [engine])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(query)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      return handleSearch(query)
    }
    if (e.key === 'Escape') {
      return setShowSuggestions(false)
    }
    
  }

  const filteredSuggestions = SEARCH_SUGGESTIONS.filter(
    (suggestion) =>
      suggestion.toLowerCase().includes(debouncedQuery.toLowerCase()) &&
      debouncedQuery.length > 0
  )

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    handleSearch(suggestion)
    setShowSuggestions(false)
  }

  const clearSearch = () => {
    setQuery('')
  }


  return (
    <div className="widget-card p-6 h-full flex flex-col justify-center">
      <h2 className="text-lg font-semibold mb-4 text-center">Quick Search</h2>

      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={handleKeyDown}
              placeholder={`Search ${SEARCH_ENGINES[engine].name}...`}
              className="input-field pl-10 pr-8"
              aria-label="Search query"
              autoComplete="off"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={!query.trim()}
          >
            Search
          </button>
        </div>

        {showSuggestions && filteredSuggestions.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.map((suggestion) => (
              <li key={suggestion}>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        )}
      </form>

      <div className="flex justify-center gap-2 mt-4">
        {(Object.keys(SEARCH_ENGINES) as SearchEngine[]).map((key) => (
          <button
            key={key}
            onClick={() => setEngine(key)}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              engine === key
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {SEARCH_ENGINES[key].name}
          </button>
        ))}
      </div>
    </div>
  )
}
