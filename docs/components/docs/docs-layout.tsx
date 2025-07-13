"use client";

import { useState } from 'react';
import { DocsSidebar } from './docs-sidebar';
import { DocsHeader } from './docs-header';
import { DocsSearch } from './docs-search';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface DocsLayoutProps {
  children: React.ReactNode;
}

export function DocsLayout({ children }: DocsLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <DocsHeader onMenuClick={() => setSidebarOpen(true)} onSearchClick={() => setSearchOpen(true)} />
      
      <div className="flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
          <div className="flex h-16 items-center justify-between px-6 border-b lg:hidden">
            <span className="text-lg font-semibold">Documentation</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <aside className="sticky top-16 h-[calc(100vh-4rem)]">
          <DocsSidebar />
          </aside>
        
        {/* Main content */}
        <main className="flex-1 lg:pl-0">
          <div className="mx-auto max-w-4xl px-6 py-8 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Search Modal */}
      <DocsSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}