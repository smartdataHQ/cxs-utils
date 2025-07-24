"use client";

import { useState } from 'react';
import { DocsSidebar } from './docs-sidebar';
import { DocsHeader } from './docs-header';
import { DocsSearch } from './docs-search';
import { Breadcrumbs } from './breadcrumbs';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocsLayoutProps {
  children: React.ReactNode;
}

export function DocsLayout({ children }: DocsLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <DocsHeader onMenuClick={() => setSidebarOpen(true)} onSearchClick={() => setSearchOpen(true)} />
      
      {/* New Section Header - Similar to image */}
      <div className="lg:hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-16 z-30">
        <div className="flex h-12 items-center px-3">
          {/* Hamburger menu for sidebar toggle */}
           <Button
              variant="ghost"
              size="sm"
              className="mr-2 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          {/* Dynamic Breadcrumbs */}
          <Breadcrumbs />
        </div>
      </div>
      
      <div className="flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "!fixed !top-[65px] inset-y-0 left-0 z-50 w-80 bg-background border-r transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0 !top-0" : "-translate-x-full"
        )}>
          {/* Mobile sidebar header with breadcrumbs and close button */}
          <div className="flex h-12 items-center justify-between px-3 border-b lg:hidden">
            <span className="text-sm font-medium">Documentation</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Sidebar content */}
          <div className="h-[calc(100vh-7rem)] lg:h-[calc(100vh-7rem)]">
            <DocsSidebar onLinkClick={() => setSidebarOpen(false)} />
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 lg:pl-0 lg:ml-[320px] max-w-[100%]">
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