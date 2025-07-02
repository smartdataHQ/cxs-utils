"use client";

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, ArrowRight, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { searchResults, recentSearches, getSearchResultIcon, type SearchResult } from './search-config';

interface DocsSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocsSearch({ open, onOpenChange }: DocsSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  // Simulate search with debouncing
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const timeoutId = setTimeout(() => {
      const filtered = searchResults.filter(
        (result) =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.content.toLowerCase().includes(query.toLowerCase()) ||
          result.section?.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setSelectedIndex(0);
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = useCallback((result: SearchResult) => {
    router.push(result.href);
    onOpenChange(false);
    setQuery('');
  }, [router, onOpenChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(results.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + Math.max(results.length, 1)) % Math.max(results.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  }, [results, selectedIndex, handleSelect]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <div className="flex items-center border-b px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search semantic events documentation..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 shadow-none focus-visible:ring-0 text-base"
            autoFocus
          />
          <kbd className="hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            ESC
          </kbd>
        </div>

        <ScrollArea className="max-h-96">
          {query && results.length > 0 && (
            <div className="p-2">
              <div className="mb-2 px-2 text-xs font-medium text-muted-foreground">
                Results ({results.length})
              </div>
              {results.map((result, index) => {
                const ResultIcon = getSearchResultIcon(result);
                return (
                  <Button
                    key={`${result.href}-${index}`}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-auto p-3 text-left",
                      index === selectedIndex && "bg-accent"
                    )}
                    onClick={() => handleSelect(result)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className="mt-0.5 flex-shrink-0">
                        <ResultIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{result.title}</span>
                          {result.section && (
                            <>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <Badge variant="secondary" className="text-xs">
                                {result.section}
                              </Badge>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {result.content}
                        </p>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          )}

          {query && results.length === 0 && (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No results found</h3>
              <p className="text-sm text-muted-foreground">
                Try searching for "core events", "schema", or "validation".
              </p>
            </div>
          )}

          {!query && (
            <div className="p-2">
              <div className="mb-2 px-2 text-xs font-medium text-muted-foreground">
                Recent searches
              </div>
              {recentSearches.map((search) => (
                <Button
                  key={search}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3 text-left"
                  onClick={() => setQuery(search)}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{search}</span>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="border-t px-4 py-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="h-4 w-4 flex items-center justify-center rounded border bg-muted text-[10px]">↑</kbd>
                <kbd className="h-4 w-4 flex items-center justify-center rounded border bg-muted text-[10px]">↓</kbd>
                <span>to navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="h-4 px-1 flex items-center justify-center rounded border bg-muted text-[10px]">↵</kbd>
                <span>to select</span>
              </div>
            </div>
            <span>Powered by Semantic Search</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}