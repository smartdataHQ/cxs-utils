'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { EventBibleTable } from '@/components/event-bible/event-bible-table';
import { SearchAndFilter, FilterState } from '@/components/event-bible/search-and-filter';
import { AliasSuggestions } from '@/components/event-bible/alias-suggestions';
import { SemanticEvent } from '@/lib/types/event-bible';
import { createClientAirtableService } from '@/lib/client-airtable-service';
import { getFallbackEvents, FALLBACK_ERROR_MESSAGE } from '@/lib/event-bible-fallback';
import { useEventBiblePriming } from '@/hooks/use-event-bible-priming';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, BookOpen, RefreshCw, WifiOff, CheckCircle } from 'lucide-react';

export default function EventBiblePage() {
  const router = useRouter();
  const [events, setEvents] = useState<SemanticEvent[]>([]);
  const [usingFallback, setUsingFallback] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>({});
  
  // Use the priming hook for cache management
  const { isLoading, isReady, error: primingError, refresh, eventsCount } = useEventBiblePriming();
  
  // Use debounced search for better performance
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search term
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load events from Airtable (with priming)
  useEffect(() => {
    const loadEvents = async () => {
      if (!isReady && !primingError) {
        return; // Still priming
      }

      try {
        const airtableService = createClientAirtableService();
        const eventsData = await airtableService.fetchAllEvents();
        
        setEvents(eventsData);
        setUsingFallback(false);
      } catch (err: any) {
        console.error('Failed to load events:', err);
        
        // Use fallback events when Airtable is unavailable
        const fallbackEvents = getFallbackEvents();
        setEvents(fallbackEvents);
        setUsingFallback(true);
      }
    };

    loadEvents();
  }, [isReady, primingError]);

  // Improved search function that searches all relevant fields
  const searchInEvent = useCallback((event: SemanticEvent, searchTerm: string): boolean => {
    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower) return true;

    // Search in main event fields with proper type checking
    const searchableFields = [
      event.name,
      event.description,
      event.category,
      event.topic,
      event.airtable_id,
      event.deprecationReason,
      event.replacementEvent,
    ].filter(field => field && typeof field === 'string').map(field => field ? field.toLowerCase() : "");

    // Handle domain field separately (might be string or array)
    const domainFields: string[] = [];
    if (event.domain) {
        domainFields.push(event.domain);
    }

    // Search in aliases with proper type checking
    const aliasFields = event.aliases.flatMap(alias => [
      alias.name,
      alias.vertical,
      alias.topic,
    ]).filter(field => field && typeof field === 'string').map(field => field.toLowerCase());

    // Combine all searchable text
    const allSearchableText = [...searchableFields, ...domainFields, ...aliasFields].join(' ');

    // Support multiple search terms (space-separated)
    const searchTerms = searchLower.split(/\s+/).filter(term => term.length > 0);
    
    // All search terms must be found (AND logic)
    return searchTerms.every(term => allSearchableText.includes(term));
  }, []);

  // Memoized filtered events for performance
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Apply search filter using debounced search term
    if (debouncedSearchTerm.trim()) {
      filtered = filtered.filter(event => searchInEvent(event, debouncedSearchTerm));
    }

    // Apply category filter
    if (activeFilters.category) {
      filtered = filtered.filter(event => event.category === activeFilters.category);
    }

    // Apply domain filter (handle both string and array domains)
    if (activeFilters.domain) {
      filtered = filtered.filter(event => {
        return event.domain === activeFilters.domain;
      });
    }

    // Apply vertical filter
    if (activeFilters.vertical) {
      filtered = filtered.filter(event => 
        event.aliases.some(alias => alias.vertical === activeFilters.vertical)
      );
    }

    return filtered;
  }, [events, debouncedSearchTerm, activeFilters, searchInEvent]);

  // Handle search changes
  const handleSearch = useCallback((newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
  }, []);

  // Handle filter changes
  const handleFilter = useCallback((newFilters: FilterState) => {
    setActiveFilters(newFilters);
  }, []);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setActiveFilters({});
  }, []);

  // Handle event click - navigate to detail page using topic slug
  const handleEventClick = useCallback((event: SemanticEvent) => {
    router.push(`/docs/semantic-events/bible/${event.topic}`);
  }, [router]);

  // Handle alias click - navigate to alias-specific view
  const handleAliasClick = useCallback((event: SemanticEvent, alias: { name: string; vertical: string; topic: string }) => {
    router.push(`/docs/semantic-events/bible/${alias.topic}`);
  }, [router]);

  return (
    <div className="container mx-auto md:py-8 md:px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Event Bible ({eventsCount})</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Discover and explore all available semantic events. Search, filter, and dive deep into 
          event documentation to understand how to implement them in your applications.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="outline" className="text-xs">
            Core Events & Industry Aliases
          </Badge>
          <Badge variant="outline" className="text-xs">
            Interactive Navigation
          </Badge>
          <Badge variant="outline" className="text-xs">
            Searchable Documentation
          </Badge>
        </div>
      </div>

      {/* Priming Status */}
      {isLoading && (
        <Alert className="mb-6" variant="default">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Loading Event Bible</p>
              <p className="text-sm">
                Priming cache with events from Airtable...
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Error State */}
      {primingError && !usingFallback && (
        <Alert className="mb-6" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Failed to Load Event Bible</p>
              <p className="text-sm">{primingError}</p>
              {primingError.includes('Airtable') && (
                <div className="mt-2">
                  <p className="text-sm">
                    This might be due to:
                  </p>
                  <ul className="text-sm mt-1 ml-4 list-disc">
                    <li>Missing or invalid Airtable API configuration</li>
                    <li>Network connectivity issues</li>
                    <li>Airtable service temporarily unavailable</li>
                  </ul>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Filter Controls */}
      {!primingError && (
        <Card className="p-6 mb-6">
          <SearchAndFilter
            events={events}
            onSearch={handleSearch}
            onFilter={handleFilter}
            onClearFilters={handleClearFilters}
            searchTerm={searchTerm}
            activeFilters={activeFilters}
            isSearching={isSearching}
          />
          
          {/* Search Results Summary */}
          {events.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>
                  Showing <span className="font-medium text-foreground">{filteredEvents.length}</span> of{' '}
                  <span className="font-medium text-foreground">{events.length}</span> events
                  {filteredEvents.length !== events.length && (
                    <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                      {events.length - filteredEvents.length} filtered out
                    </span>
                  )}
                </div>
                {(searchTerm || Object.keys(activeFilters).length > 0) && (
                  <div className="text-xs">
                    {searchTerm && `Search: "${searchTerm}"`}
                    {searchTerm && Object.keys(activeFilters).length > 0 && ' • '}
                    {Object.keys(activeFilters).length > 0 && `${Object.keys(activeFilters).length} filter${Object.keys(activeFilters).length !== 1 ? 's' : ''}`}
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Alias Suggestions */}
      {!isLoading && !primingError && events.length > 0 && searchTerm && (
        <AliasSuggestions
          events={events}
          searchTerm={searchTerm}
          onAliasClick={handleAliasClick}
          onEventClick={handleEventClick}
        />
      )}

      {/* No Results State */}
      {!isLoading && !primingError && events.length > 0 && filteredEvents.length === 0 && (
        <Card className="p-8 text-center mb-6">
          <div className="max-w-md mx-auto">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-4">
              No events match your current search and filter criteria.
            </p>
            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear all filters and search
              </Button>
              {searchTerm && (
                <p className="text-sm text-muted-foreground">
                  Try searching for broader terms or check your spelling
                </p>
              )}
              {Object.keys(activeFilters).length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Try removing some filters to see more results
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Events Table */}
      <EventBibleTable
        events={filteredEvents}
        loading={isLoading}
        error={primingError}
        onEventClick={handleEventClick}
        onAliasClick={handleAliasClick}
      />

      {/* Empty State for No Configuration */}
      {!isLoading && !primingError && events.length === 0 && (
        <Card className="p-8 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Events Available</h3>
          <p className="text-muted-foreground mb-4">
            The Event Bible is not configured or no events are available.
          </p>
          <p className="text-sm text-muted-foreground">
            Please check your Airtable configuration and ensure events are properly set up.
          </p>
        </Card>
      )}
    </div>
  );
}