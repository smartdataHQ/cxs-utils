'use client';

import React, { useState, useMemo } from 'react';
import { SemanticEvent } from '@/lib/types/event-bible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { EventTableSkeleton } from '@/components/common/loading-spinner';
import { VirtualizedEventTable } from './virtualized-event-table';
import { AlertTriangle } from 'lucide-react';

interface EventBibleTableProps {
  events: SemanticEvent[];
  loading?: boolean;
  error?: string | null;
  onEventClick?: (event: SemanticEvent) => void;
}

type SortField = 'name' | 'category' | 'domain' | 'lastUpdated';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

const ITEMS_PER_PAGE = 20;
const VIRTUALIZATION_THRESHOLD = 100; // Use virtualization for 100+ events

export function EventBibleTable({ 
  events, 
  loading = false, 
  error, 
  onEventClick 
}: EventBibleTableProps) {
  // Search is now handled by parent component
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    field: 'name', 
    direction: 'asc' 
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events;

    // Search filtering is now handled by the parent component
    // No need to duplicate search logic here

    // Apply sorting
    filtered.sort((a, b) => {
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

    return filtered;
  }, [events, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = filteredAndSortedEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  // Search is now handled by parent component

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

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <h3 className="text-lg font-semibold mb-2">Error Loading Events</h3>
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Event count display */}
      <div className="flex justify-end">
        <div className="text-sm text-muted-foreground">
          {filteredAndSortedEvents.length} event{filteredAndSortedEvents.length !== 1 ? 's' : ''}
        </div>
      </div>

      {loading ? (
        <EventTableSkeleton />
      ) : filteredAndSortedEvents.length >= VIRTUALIZATION_THRESHOLD ? (
        /* Use virtualized table for large datasets */
        <>
          <div className="hidden md:block">
            <VirtualizedEventTable
              events={filteredAndSortedEvents}
              onEventClick={onEventClick}
              containerHeight={600}
            />
          </div>
          {/* Mobile Card View for virtualized data */}
          <div className="md:hidden">
            <Card className="p-4">
              <div className="text-center text-muted-foreground">
                <p className="mb-2">Large dataset detected ({filteredAndSortedEvents.length} events)</p>
                <p className="text-sm">Use desktop view for optimal performance with large lists</p>
              </div>
            </Card>
          </div>
        </>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('name')}
                          className="font-semibold"
                        >
                          Event Name {getSortIcon('name')}
                        </Button>
                      </th>
                      <th className="text-left p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('category')}
                          className="font-semibold"
                        >
                          Category {getSortIcon('category')}
                        </Button>
                      </th>
                      <th className="text-left p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('domain')}
                          className="font-semibold"
                        >
                          Domain {getSortIcon('domain')}
                        </Button>
                      </th>
                      <th className="text-left p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('lastUpdated')}
                          className="font-semibold"
                        >
                          Last Updated {getSortIcon('lastUpdated')}
                        </Button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEvents.map((event) => (
                      <tr
                        key={event.airtable_id}
                        className={`border-b hover:bg-muted/50 cursor-pointer transition-colors ${
                          event.deprecated ? 'bg-orange-50/50 dark:bg-orange-950/20' : ''
                        }`}
                        onClick={() => onEventClick?.(event)}
                      >
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{event.name}</div>
                            {event.deprecated && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Deprecated
                              </Badge>
                            )}
                          </div>
                          {event.aliases.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {event.aliases.slice(0, 2).map((alias, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {alias.name}
                                </Badge>
                              ))}
                              {event.aliases.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{event.aliases.length - 2} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{event.category}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary">{event.domain}</Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {formatDate(event.lastUpdated)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {paginatedEvents.map((event) => (
              <Card
                key={event.airtable_id}
                className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
                  event.deprecated ? 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20' : ''
                }`}
                onClick={() => onEventClick?.(event)}
              >
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{event.name}</h3>
                      {event.deprecated && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Deprecated
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{event.category}</Badge>
                    <Badge variant="secondary">{event.domain}</Badge>
                  </div>

                  {event.aliases.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Aliases:</p>
                      <div className="flex flex-wrap gap-1">
                        {event.aliases.map((alias, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {alias.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Last updated: {formatDate(event.lastUpdated)}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}

          {filteredAndSortedEvents.length === 0 && !loading && (
            <Card className="p-6">
              <div className="text-center text-muted-foreground">
                <p>No events found matching your search criteria.</p>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}