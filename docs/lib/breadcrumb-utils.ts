import { navigationConfig, type NavigationItem, type NavigationSection } from '@/components/docs/navigation-config';

export interface BreadcrumbItem {
  title: string;
  href: string;
}

export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  // Helper to recursively find the shortest path to the item
  function findShortestPath(
    items: NavigationItem[],
    targetHref: string,
    parents: BreadcrumbItem[] = [],
    visited = new Set<string>()
  ): BreadcrumbItem[] | null {
    let shortest: BreadcrumbItem[] | null = null;
    for (const item of items) {
      // Avoid cycles
      if (visited.has(item.href)) continue;
      visited.add(item.href);
      const currentTrail = [...parents, { title: item.title, href: item.href }];
      if (item.href === targetHref) {
        if (!shortest || currentTrail.length < shortest.length) {
          shortest = currentTrail;
        }
      }
      if (item.children) {
        const found = findShortestPath(item.children, targetHref, currentTrail, new Set(visited));
        if (found && (!shortest || found.length < shortest.length)) {
          shortest = found;
        }
      }
    }
    return shortest;
  }

  // Search all sections
  let best: BreadcrumbItem[] | null = null;
  for (const section of navigationConfig) {
    const found = findShortestPath(section.items, pathname, [
      { title: section.title, href: section.items[0]?.href || '#' },
    ]);
    if (found && (!best || found.length < best.length)) {
      best = found;
    }
  }
  if (best) {
    // Remove duplicates (in case of repeated hrefs)
    const seen = new Set();
    return best.filter(bc => {
      if (seen.has(bc.href)) return false;
      seen.add(bc.href);
      return true;
    });
  }

  // Fallback: path-based breadcrumb
  const pathSegments = pathname.split('/').filter(Boolean);
  let accumulatedPath = '';
  return pathSegments.map((segment) => {
    accumulatedPath += '/' + segment;
    return {
      title: segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      href: accumulatedPath,
    };
  });
} 