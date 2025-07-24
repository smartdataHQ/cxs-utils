"use client";

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Menu, Search, Activity } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DocsHeaderProps {
  onMenuClick: () => void;
  onSearchClick: () => void;
}

export function DocsHeader({ onMenuClick, onSearchClick }: DocsHeaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearchClick = () => {
    onSearchClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      onSearchClick();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-6 gap-3">
        {/* Mobile menu button */}
       

        {/* Logo */}
        <Link href="/docs" className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ContextSuite
          </span>
          <span className="text-sm text-muted-foreground hidden sm:inline">
            Semantic Events
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* Search button */}
          <Button
            variant="outline"
            className="relative h-9 md:w-full md:max-w-[200px] justify-start text-sm text-muted-foreground px-2 sm:pr-12"
            onClick={handleSearchClick}
            onKeyDown={handleKeyDown}
          >
            <Search className="md:mr-2 h-4 w-4" />
            <span className="hidden md:inline-flex">Search events...</span>
            <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          {/* Theme toggle */}
          {mounted && <ThemeToggle />}
        </div>
      </div>
    </header>
  );
}