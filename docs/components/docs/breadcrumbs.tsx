"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { generateBreadcrumbs } from '@/lib/breadcrumb-utils';
import { ChevronRight } from 'lucide-react';
import { useEffect } from 'react';

export function Breadcrumbs() {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  // Debug: log the breadcrumbs
  useEffect(() => {
    console.log('Current pathname:', pathname);
    console.log('Generated breadcrumbs:', breadcrumbs);
  }, [pathname, breadcrumbs]);

  // Always show breadcrumbs, even if there's only one item
  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 text-sm ">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.href} className="flex flex-wrap items-center">
          {index > 0 && (
            <ChevronRight className="sm:h-3 sm:w-3 w-4 h-4 text-muted-foreground mx-2" />
          )}
          {index === breadcrumbs.length - 1 ? (
            <span className="font-medium text-foreground line-clamp-1">
              {breadcrumb.title}
            </span>
          ) : (
            <Link
              href={breadcrumb.href}
              className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              {breadcrumb.title}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
} 