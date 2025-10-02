import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Filter } from 'lucide-react'
import type { DiscoverParams } from '@/services/api'

interface MovieFiltersProps {
  onFiltersChange: (filters: DiscoverParams) => void
  onClear?: () => void
  className?: string
  defaultFilters?: DiscoverParams
}

const GENRES = [
  'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror',
  'Music', 'Mystery', 'Romance', 'Sci-Fi', 'Sport', 'Thriller', 'War', 'Western'
]

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'rating', label: 'Rating' },
  { value: 'year', label: 'Year' },
  { value: 'title', label: 'Title' },
] as const

const YEARS = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString())

export function MovieFilters({
  onFiltersChange,
  onClear,
  className,
  defaultFilters = {},
}: MovieFiltersProps) {
  const [filters, setFilters] = useState<DiscoverParams>(defaultFilters)
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    defaultFilters.genres ? defaultFilters.genres.split(', ') : []
  )
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const updatedFilters = {
      ...filters,
      genres: selectedGenres.length > 0 ? selectedGenres.join(', ') : undefined,
    }
    onFiltersChange(updatedFilters)
  }, [filters, selectedGenres])

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  const handleSortChange = (sortBy: DiscoverParams['sortBy']) => {
    setFilters(prev => ({ ...prev, sortBy }))
  }

  const handleYearChange = (year: string) => {
    setFilters(prev => ({ ...prev, year: year || undefined }))
  }

  const handleRatingChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseFloat(value) : undefined
    setFilters(prev => ({
      ...prev,
      [type === 'min' ? 'ratingMin' : 'ratingMax']: numValue,
    }))
  }

  const handleClear = () => {
    setFilters({})
    setSelectedGenres([])
    if (onClear) {
      onClear()
    }
  }

  const hasActiveFilters = selectedGenres.length > 0 ||
    filters.sortBy || filters.year || filters.ratingMin || filters.ratingMax

  return (
    <div className={className}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="mb-4"
      >
        <Filter className="h-4 w-4 mr-2" />
        Filters
        {hasActiveFilters && (
          <Badge variant="secondary" className="ml-2">
            {selectedGenres.length + Object.keys(filters).filter(key => filters[key as keyof DiscoverParams]).length}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filters</CardTitle>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={handleClear}>
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sort By */}
            <div>
              <h4 className="font-medium mb-3">Sort By</h4>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={filters.sortBy === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSortChange(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Genres */}
            <div>
              <h4 className="font-medium mb-3">Genres</h4>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((genre) => (
                  <Button
                    key={genre}
                    variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleGenreToggle(genre)}
                  >
                    {genre}
                  </Button>
                ))}
              </div>
            </div>

            {/* Year */}
            <div>
              <h4 className="font-medium mb-3">Release Year</h4>
              <select
                value={filters.year || ''}
                onChange={(e) => handleYearChange(e.target.value)}
                className="w-full md:w-auto px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">Any year</option>
                {YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Range */}
            <div>
              <h4 className="font-medium mb-3">IMDb Rating</h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  placeholder="Min"
                  value={filters.ratingMin || ''}
                  onChange={(e) => handleRatingChange('min', e.target.value)}
                  className="w-20 px-2 py-1 border border-input bg-background rounded text-sm"
                />
                <span className="text-muted-foreground">to</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  placeholder="Max"
                  value={filters.ratingMax || ''}
                  onChange={(e) => handleRatingChange('max', e.target.value)}
                  className="w-20 px-2 py-1 border border-input bg-background rounded text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}