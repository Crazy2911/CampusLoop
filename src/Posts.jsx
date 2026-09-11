import StatusSummary from './StatusSummary'
import { useState, useEffect } from 'react'
import PostCard from './PostCard'

function readSavedFilter(name, fallback) {
  try {
    const saved = localStorage.getItem('campusloop-filters')

    if (!saved) {
      return fallback
    }

    const filters = JSON.parse(saved)

    if (
      filters === null ||
      typeof filters !== 'object' ||
      Array.isArray(filters)
    ) {
      return fallback
    }

    const value = filters[name]

    if (name === 'activeType') {
      return ['all', 'fix', 'reuse'].includes(value)
        ? value
        : fallback
    }

    if (name === 'query') {
      return typeof value === 'string'
        ? value.slice(0, 400)
        : fallback
    }

    if (name === 'category') {
      const fixCategories = ['Electrical', 'Plumbing', 'Furniture']
      const reuseCategories = ['Books', 'Electronics', 'Supplies']

      let allowedCategories = [
        'all',
        ...fixCategories,
        ...reuseCategories,
      ]

      if (filters.activeType === 'fix') {
        allowedCategories = ['all', ...fixCategories]
      } else if (filters.activeType === 'reuse') {
        allowedCategories = ['all', ...reuseCategories]
      }

      return allowedCategories.includes(value) ? value : fallback
    }

    return fallback
  } catch {
    // Invalid saved JSON or unavailable storage must not crash the page.
    return fallback
  }
}

function Posts({ posts }) {
  const [activeType, setActiveType] = useState(() =>
  readSavedFilter('activeType', 'all')
)

const [query, setQuery] = useState(() =>
  readSavedFilter('query', '')
)

const [category, setCategory] = useState(() =>
  readSavedFilter('category', 'all')
)

const [storageError, setStorageError] = useState('')

useEffect(() => {
  try {
    const filters = {
      activeType,
      query,
      category,
    }

    localStorage.setItem(
      'campusloop-filters',
      JSON.stringify(filters)
    )

    setStorageError('')
  } catch {
    setStorageError(
      'Your browser could not save these filters. You can still browse, but your selections may reset after a refresh.'
    )
  }
}, [activeType, query, category])

  const filters = [
    { value: 'all', label: 'All posts' },
    { value: 'fix', label: 'Fix' },
    { value: 'reuse', label: 'ReUse' },
  ]

  const fixCategories = ['Electrical', 'Plumbing', 'Furniture']
  const reuseCategories = ['Books', 'Electronics', 'Supplies']

  let categories = [...fixCategories, ...reuseCategories]

  if (activeType === 'fix') {
    categories = fixCategories
  } else if (activeType === 'reuse') {
    categories = reuseCategories
  }

  const searchText = query.trim().toLowerCase()

  const filteredPosts = posts.filter((post) => {
    const matchesType =
      activeType === 'all' || post.type === activeType

    const matchesCategory =
      category === 'all' || post.category === category

    const searchableText =
      `${post.title} ${post.description} ${post.location}`.toLowerCase()

    const matchesSearch = searchableText.includes(searchText)

    return matchesType && matchesCategory && matchesSearch
  })

  function changeType(type) {
    setActiveType(type)
    setCategory('all')
  }

  function clearFilters() {
    setActiveType('all')
    setQuery('')
    setCategory('all')
  }

  const hasFilters =
    activeType !== 'all' || query !== '' || category !== 'all'

  return (
    <section aria-labelledby="board-heading">
      <h1
        id="board-heading"
        className="text-2xl font-bold text-[#263F38]"
      >
        Your campus board
      </h1>

      <p className="mt-2 leading-relaxed text-[#596B62]">
        Report what needs fixing. Share what you no longer need.
      </p>
      <StatusSummary posts={posts} />
      {storageError && (
      <div
        role="status"
        className="mt-4 rounded-lg border border-[#E6CB91] bg-[#FFF7E6] p-3 text-sm leading-relaxed text-[#76541D]"
      >
        {storageError}
      </div>
    )}

      {/* Post-type filters */}
      <div
        role="group"
        aria-label="Filter posts by type"
        className="mt-6 grid grid-cols-3 gap-2 rounded-xl bg-[#E9EFEB] p-1"
      >
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            aria-pressed={activeType === filter.value}
            onClick={() => changeType(filter.value)}
            className={`board-tab min-h-11 rounded-lg px-2 py-2 text-sm font-semibold ${
              activeType === filter.value
                ? 'bg-[#263F38] text-white'
                : 'text-[#435E50]'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Search and category: stacked on mobile */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex min-w-0 flex-col gap-2">
          <span className="text-sm font-semibold">
            Search posts
          </span>

          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, description or location"
            maxLength={400}
            className="input min-h-11 w-full min-w-0 rounded-lg border-[#BBCBC1] bg-white text-base"
          />
        </label>

        <label className="flex min-w-0 flex-col gap-2">
          <span className="text-sm font-semibold">
            Category
          </span>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="select min-h-11 w-full min-w-0 rounded-lg border-[#BBCBC1] bg-white text-base"
          >
            <option value="all">All categories</option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Result count and reset */}
      <div className="my-3 flex min-h-11 flex-wrap items-center justify-between gap-2">
        <p role="status" className="text-sm text-[#596B62]">
          {filteredPosts.length}{' '}
          {filteredPosts.length === 1 ? 'post' : 'posts'}
          
        </p>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="nav-link min-h-11 rounded-lg px-3 text-sm font-semibold text-[#263F38]"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#BBCBC1] bg-white p-6 text-center">
          <h2 className="text-lg font-semibold">
            {posts.length === 0
              ? 'No campus posts yet'
              : 'No matching posts'}
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-[#596B62]">
            {posts.length === 0
              ? 'The board is ready. New posts will appear here once added.'
              : 'Try a different search or clear your filters.'}
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="nav-link mt-4 min-h-11 rounded-lg bg-[#E9EFEB] px-4 py-2 text-sm font-semibold text-[#263F38]"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </section>
  )
}

export default Posts