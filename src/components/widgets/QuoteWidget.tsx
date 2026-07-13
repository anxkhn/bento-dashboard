import { useState, useEffect, useCallback } from 'react'

interface Quote {
  text: string
  author: string
  category: string
}

const MOCK_QUOTES: Quote[] = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "Motivation"
  },
  {
    text: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs",
    category: "Innovation"
  },
  {
    text: "Stay hungry, stay foolish.",
    author: "Steve Jobs",
    category: "Motivation"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    category: "Dreams"
  },
  {
    text: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle",
    category: "Perseverance"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "Success"
  },
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb",
    category: "Action"
  },
  {
    text: "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs",
    category: "Life"
  }
]

const QUOTABLE_API = 'https://api.quotable.io/random'

export function QuoteWidget() {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchQuote = useCallback(async () => {
    setLoading(true)

    try {
      const response = await fetch(QUOTABLE_API)
      
      if (!response.ok) {
        throw new Error('Failed to fetch quote')
      }

      const data = await response.json()
      
      setQuote({
        text: data.content,
        author: data.author,
        category: data.tags?.[0] || 'Inspirational'
      })
    } catch (err) {
      console.error('Failed to fetch quote:', err)
      const randomQuote = MOCK_QUOTES[Math.floor(Math.random() * MOCK_QUOTES.length)]
      setQuote(randomQuote)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuote()
  }, [fetchQuote])

  const handleNewQuote = () => {
    fetchQuote()
  }

  const handleCopy = async () => {
    if (!quote) return
    
    try {
      await navigator.clipboard.writeText(`"${quote.text}" - ${quote.author}`)
    } catch {
      console.error('Failed to copy quote')
    }
  }

  if (loading) {
    return (
      <div className="widget-card p-6 h-full flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="widget-card p-6 h-full flex items-center justify-center">
        <p className="text-gray-400">No quote available</p>
      </div>
    )
  }

  return (
    <div className="widget-card p-6 h-full flex flex-col justify-between">
      <div>
        <span className="text-xs text-primary-500 font-medium uppercase tracking-wide">
          {quote.category}
        </span>
        <blockquote className="mt-3">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-200 leading-relaxed">
            "{quote.text}"
          </p>
          <footer className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            — {quote.author}
          </footer>
        </blockquote>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={handleCopy}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Copy quote"
        >
          Copy
        </button>
        <button
          onClick={handleNewQuote}
          className="text-xs text-primary-500 hover:text-primary-600 transition-colors"
          aria-label="Get new quote"
        >
          New Quote
        </button>
      </div>
    </div>
  )
}
