'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { SemanticEvent } from '@/lib/types/event-bible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface VirtualizedEventTableProps {
  events: SemanticEvent[];
  onEventClick?: (event: SemanticEvent) => void;
  itemHeight?: number;
  containerHeight?: number;
}

type SortField = 'name' | 'category' | 'domain' | 'lastUpdated';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export function VirtualizedEventTable({ 
  events, 
  onEventClick,
  itemHeight = 80,
  containerHeight = 600
}: VirtualizedEventTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    field: 'name', 
    direction: 'asc' 
  });
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sort events
  const sortedEvents = useMemo(() => {
    const sorted = [...events];
    sorted.sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      switch (sortConfig.field) {
        case 'lastUpdated':
          aValue = new Date(a.lastUpdated);
          bValue = new Date(b.lastUpdated);
          break;
        default:
          aValue = a[sortConfig.field];
          bValue = b[sortConfig.field];
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [events, sortConfig]);

  // Calculate visible items
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      sortedEvents.length
    );

    return {
      startIndex,
      endIndex,
      items: sortedEvents.slice(startIndex, endIndex)
    };
  }, [sortedEvents, scrollTop, itemHeight, containerHeight]);

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return '↕️';
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const totalHeight = sortedEvents.length * itemHeight;
  const offsetY = visibleItems.startIndex * itemHeight;

  return (
    <Card>
      <div className="overflow-hidden">
        {/* Header */}
        <div className="border-b bg-background sticky top-0 z-10">
          <div className="grid grid-cols-12 gap-4 p-4">
            <div className="col-span-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('name')}
                className="font-semibold justify-start p-0"
              >
                Event Name {getSortIcon('name')}
              </Button>
            </div>
            <div className="col-span-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('category')}
                className="font-semibold justify-start p-0"
              >
                Category {getSortIcon('category')}
              </Button>
            </div>
            <div className="col-span-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('domain')}
                className="font-semibold justify-start p-0"
              >
                Domain {getSortIcon('domain')}
              </Button>
            </div>
            <div className="col-span-3">
              <span className="font-semibold text-sm">Description</span>
            </div>
            <div className="col-span-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('lastUpdated')}
                className="font-semibold justify-start p-0"
              >
                Updated {getSortIcon('lastUpdated')}
              </Button>
            </div>
          </div>
        </div>

        {/* Virtualized Content */}
        <div
          ref={containerRef}
          className="overflow-auto"
          style={{ height: containerHeight }}
          onScroll={handleScroll}
        >
          <div style={{ height: totalHeight, position: 'relative' }}>
            <div
              style={{
                transform: `translateY(${offsetY}px)`,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
              }}
            >
              {visibleItems.items.map((event, index) => {
                const actualIndex = visibleItems.startIndex + index;
                return (
                  <div
                    key={event.airtable_id}
                    className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                    style={{ height: itemHeight }}
                    onClick={() => onEventClick?.(event)}
                  >
                    <div className="grid grid-cols-12 gap-4 p-4 h-full items-center">
                      <div className="col-span-4">
                        <div className="font-medium text-sm truncate">{event.name}</div>
                        {event.aliases.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {event.aliases.slice(0, 2).map((alias, aliasIndex) => (
                              <Badge key={aliasIndex} variant="secondary" className="text-xs">
                                {alias.name}
                              </Badge>
                            ))}
                            {event.aliases.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{event.aliases.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="col-span-2">
                        <Badge variant="outline" className="text-xs">{event.category}</Badge>
                      </div>
                      <div className="col-span-2">
                        <Badge variant="secondary" className="text-xs">{event.domain}</Badge>
                      </div>
                      <div className="col-span-3">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>
                      </div>
                      <div className="col-span-1">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(event.lastUpdated)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer with count */}
        <div className="border-t p-2 text-center text-sm text-muted-foreground bg-background">
          Showing {visibleItems.items.length} of {sortedEvents.length} events
        </div>
      </div>
    </Card>
  );
}