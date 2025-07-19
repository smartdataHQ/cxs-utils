'use client';

import React from 'react';
import { SemanticEvent } from '@/lib/types/event-bible';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lightbulb } from 'lucide-react';
import Link from 'next/link';

interface AliasSuggestionsProps {
  events: SemanticEvent[];
  searchTerm: string;
  onAliasClick?: (event: SemanticEvent, alias: { name: string; vertical: string; topic: string }) => void;
  onEventClick?: (event: SemanticEvent) => void;
}

export function AliasSuggestions({ 
  events, 
  searchTerm, 
  onAliasClick, 
  onEventClick 
}: AliasSuggestionsProps) {
  // Find events that have aliases matching the search term
  const aliasMatches = React.useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const searchLower = searchTerm.toLowerCase();
    const matches: Array<{
      event: SemanticEvent;
      matchingAliases: Array<{ name: string; vertical: string; topic: string }>;
    }> = [];

    events.forEach(event => {
      const matchingAliases = event.aliases.filter(alias => 
        alias.name.toLowerCase().includes(searchLower) ||
        alias.vertical.toLowerCase().includes(searchLower)
      );

      if (matchingAliases.length > 0) {
        matches.push({ event, matchingAliases });
      }
    });

    return matches.slice(0, 3); // Show top 3 matches
  }, [events, searchTerm]);

  if (aliasMatches.length === 0) return null;

  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-sm">
          <Lightbulb className="h-4 w-4" />
          Use-Case Specific Matches
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {aliasMatches.map(({ event, matchingAliases }) => (
          <div key={event.airtable_id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Link className="flex items-center gap-2" href="/docs/semantic-events/bible/[...eventSlug]" as={`/docs/semantic-events/bible/${event.topic}`}>
                  <span className="font-medium text-sm">{event.name} ({event.category})</span>
                </Link>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 pl-4 border-l-2 border-amber-200 dark:border-amber-800">
              {matchingAliases.map((alias, index) => (
                <Button key={index} variant="ghost" size="sm" onClick={() => onAliasClick?.(event, alias)} className="h-6 px-2 text-xs hover:bg-amber-100 dark:hover:bg-amber-900/20">
                  {alias.name} ({alias.vertical})
                </Button>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}