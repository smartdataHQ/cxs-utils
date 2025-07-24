'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SemanticEvent } from '@/lib/types/event-bible';
import { ChevronDown, X, Search, Filter } from 'lucide-react';

export interface FilterState {
  category?: string;
  domain?: string;
  vertical?: string;
}

interface SearchAndFilterProps {
  events: SemanticEvent[];
  onSearch: (searchTerm: string) => void;
  onFilter: (filter: FilterState) => void;
  onClearFilters: () => void;
  searchTerm?: string;
  activeFilters?: FilterState;
  isSearching?: boolean;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function SearchAndFilter({
  events,
  onSearch,
  onFilter,
  onClearFilters,
  searchTerm = '',
  activeFilters = {},
  isSearching = false
}: SearchAndFilterProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300);

  // Extract unique values for filter options with proper deduplication
  const filterOptions = React.useMemo(() => {
    const categories = new Set<string>();
    const domains = new Set<string>();
    const verticals = new Set<string>();

    events.forEach(event => {

      // Handle category (should be string)
      if (event.category && typeof event.category === 'string' && event.category.trim()) {
        categories.add(event.category.trim());
      }

      // Handle domain (might be string or array)
      if (event.domain) {
        if (typeof event.domain === 'string' && event.domain.trim()) {
          domains.add(event.domain.trim());
        } else if (Array.isArray(event.domain)) {
          event.domain.forEach(d => {
            if (typeof d === 'string' && d.trim()) {
              domains.add(d.trim());
            }
          });
        }
      }

      // Handle verticals from aliases
      if (event.aliases && Array.isArray(event.aliases)) {
        event.aliases.forEach(alias => {
          if (alias && alias.vertical && typeof alias.vertical === 'string' && alias.vertical.trim()) {
            verticals.add(alias.vertical.trim());
          }
        });
      }
    });

    const result = {
      categories: Array.from(categories).sort((a, b) => a.localeCompare(b)),
      domains: Array.from(domains).sort((a, b) => a.localeCompare(b)),
      verticals: Array.from(verticals).sort((a, b) => a.localeCompare(b))
    };



    return result;
  }, [events]);

  // Effect to handle debounced search
  useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  // Update local search term when prop changes
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleFilterChange = useCallback((filterType: keyof FilterState, value: string | undefined) => {
    const newFilters = { ...activeFilters };
    
    if (value) {
      newFilters[filterType] = value;
    } else {
      delete newFilters[filterType];
    }
    
    onFilter(newFilters);
  }, [activeFilters, onFilter]);

  const handleClearFilters = useCallback(() => {
    setLocalSearchTerm('');
    onClearFilters();
  }, [onClearFilters]);

  const hasActiveFilters = Object.keys(activeFilters).length > 0 || localSearchTerm.length > 0;
  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search events by name, description, category, domain, topic, aliases, or ID..."
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          className="pl-10 pr-10"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="h-3 w-3 mr-2" />
              Category
              {activeFilters.category && (
                <Badge variant="secondary" className="ml-2 h-4 px-1 text-xs">
                  1
                </Badge>
              )}
              <ChevronDown className="h-3 w-3 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-80 overflow-auto w-48">
            <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleFilterChange('category', undefined)}
              className={!activeFilters.category ? 'bg-accent' : ''}
            >
              All Categories
            </DropdownMenuItem>
            {filterOptions.categories.map((category) => (
              <DropdownMenuItem
                key={category}
                onClick={() => handleFilterChange('category', category)}
                className={activeFilters.category === category ? 'bg-accent' : ''}
              >
                {category}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Domain Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="h-3 w-3 mr-2" />
              Domain
              {activeFilters.domain && (
                <Badge variant="secondary" className="ml-2 h-4 px-1 text-xs">
                  1
                </Badge>
              )}
              <ChevronDown className="h-3 w-3 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 max-h-80 overflow-auto">
            <DropdownMenuLabel>Filter by Domain</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleFilterChange('domain', undefined)}
              className={!activeFilters.domain ? 'bg-accent' : ''}
            >
              All Domains
            </DropdownMenuItem>
            {filterOptions.domains.map((domain) => (
              <DropdownMenuItem
                key={domain}
                onClick={() => handleFilterChange('domain', domain)}
                className={activeFilters.domain === domain ? 'bg-accent' : ''}
              >
                {domain}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Vertical Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="h-3 w-3 mr-2" />
              Vertical
              {activeFilters.vertical && (
                <Badge variant="secondary" className="ml-2 h-4 px-1 text-xs">
                  1
                </Badge>
              )}
              <ChevronDown className="h-3 w-3 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 max-h-80 overflow-auto">
            <DropdownMenuLabel>Filter by Vertical</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleFilterChange('vertical', undefined)}
              className={!activeFilters.vertical ? 'bg-accent' : ''}
            >
              All Verticals
            </DropdownMenuItem>
            {filterOptions.verticals.map((vertical) => (
              <DropdownMenuItem
                key={vertical}
                onClick={() => handleFilterChange('vertical', vertical)}
                className={activeFilters.vertical === vertical ? 'bg-accent' : ''}
              >
                {vertical}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}

        {/* Active Filter Count */}
        {activeFilterCount > 0 && (
          <div className="text-sm text-muted-foreground">
            {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
          </div>
        )}
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {localSearchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{localSearchTerm}"
              <button
                onClick={() => setLocalSearchTerm('')}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {activeFilters.category && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Category: {activeFilters.category}
              <button
                onClick={() => handleFilterChange('category', undefined)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {activeFilters.domain && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Domain: {activeFilters.domain}
              <button
                onClick={() => handleFilterChange('domain', undefined)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {activeFilters.vertical && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Vertical: {activeFilters.vertical}
              <button
                onClick={() => handleFilterChange('vertical', undefined)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}


    </div>
  );
}