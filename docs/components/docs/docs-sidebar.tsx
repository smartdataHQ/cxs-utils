"use client";

import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { navigationConfig, type NavigationItem } from './navigation-config';

interface NavigationItemProps {
  item: NavigationItem;
  level?: number;
  onLinkClick?: () => void;
}

function NavigationItem({ item, level = 0, onLinkClick }: NavigationItemProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.href || (item.href !== '/docs' && pathname?.startsWith(item.href));

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <li>
      <div className="flex items-center">
        <Link
          href={item.href}
          onClick={handleLinkClick}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground flex-1',
            level > 0 && 'ml-4',
            isActive
              ? 'bg-accent text-accent-foreground font-medium'
              : 'text-muted-foreground'
          )}
        >
          <item.icon className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-auto h-5 text-xs">
              {item.badge}
            </Badge>
          )}
        </Link>
        {hasChildren && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-accent rounded"
          >
            {isOpen ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        )}
      </div>
      {hasChildren && isOpen && (
        <ul className="mt-1 space-y-1">
          {item.children!.map((child) => (
            <NavigationItem key={child.href} item={child} level={level + 1} onLinkClick={onLinkClick} />
          ))}
        </ul>
      )}
    </li>
  );
}

interface DocsSidebarProps {
  onLinkClick?: () => void;
}

export function DocsSidebar({ onLinkClick }: DocsSidebarProps) {
  return (
  <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-hidden">
    <ScrollArea className="h-full px-4 py-6">
      <div className="space-y-8">
        {navigationConfig.map((section) => (
          <div key={section.title}>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <NavigationItem key={item.href} item={item} onLinkClick={onLinkClick} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </ScrollArea>
  </div>
  );
}