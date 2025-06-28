import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import navData from './sidenav-data.json'; // Import the generated JSON

interface NavItem {
  title: string;
  path: string;
  order?: number;
  children?: NavItem[];
}

// Recursive function to render navigation links
const renderNavLinks = (items: NavItem[], currentPath: string, level: number = 0) => {
  return (
    <ul className={`flex column level-${level}`}>
      {items.map((item) => {
        const active = currentPath === item.path || (currentPath.startsWith(item.path) && item.path !== '/docs' && currentPath.charAt(item.path.length) === '/');
        // For the root /docs path, only exact match should be active unless it's the only thing.
        const isDocsRootActive = item.path === '/docs' && currentPath === '/docs';
        const itemIsActive = item.path === '/docs' ? isDocsRootActive : active;

        return (
          <li key={item.path} className={itemIsActive ? 'active' : ''}>
            <Link href={item.path}>
              {item.title}
            </Link>
            {item.children && item.children.length > 0 && (
              renderNavLinks(item.children, currentPath, level + 1)
            )}
          </li>
        );
      })}
      <style jsx>{`
        .level-0 {
          padding-left: 0; /* No padding for the first level ul */
        }
        .level-0 > li > a {
           font-size: larger; /* Make top-level items (sections) have larger font */
           font-weight: 500;
           padding: 0.5rem 0 0.5rem;
           display: block; /* Make the link clickable area larger */
        }
        .level-1 {
           padding-left: 1rem; /* Indent for second level */
        }
         .level-2 {
           padding-left: 1rem; /* Further indent for third level */
        }
        /* Add more levels if needed */
      `}</style>
    </ul>
  );
};

export function SideNav() {
  const router = useRouter();

  // The sidenav-data.json is an array of top-level sections.
  // The old structure had a title for the section and then links.
  // The new structure's top-level items are the sections themselves.
  // We can iterate through navData directly if its top-level items are what we want as sections.
  // Or, if navData is a single root object with children, we use navData.children.
  // Based on generate-nav.js, navData is an array of sections.

  return (
    <nav className="sidenav">
      {/* Each item in navData is a top-level section or page */}
      {navData.map((section) => (
        <div key={section.path} className="nav-section">
          {/* Top-level item is a link itself */}
          <Link
            href={section.path}
            className={router.pathname === section.path ? 'active section-title' : 'section-title'}
          >
            {section.title}
          </Link>
          {/* Render children if they exist */}
          {section.children && section.children.length > 0 && (
            renderNavLinks(section.children, router.pathname, 1) // Start children at level 1
          )}
        </div>
      ))}
      <style jsx>
        {`
          nav {
            position: sticky;
            top: var(--top-nav-height);
            height: calc(100vh - var(--top-nav-height));
            flex: 0 0 auto;
            overflow-y: auto;
            padding: 2.5rem 2rem 2rem;
            border-right: 1px solid var(--border-color);
            width: 280px; /* Fixed width for the sidenav */
          }
          .nav-section {
            margin-bottom: 1rem; /* Space between sections */
          }
          .section-title {
            font-size: larger;
            font-weight: 500;
            padding: 0.5rem 0 0.5rem;
            display: block;
            text-decoration: none;
            color: inherit; /* Ensure it inherits text color */
          }
          .section-title.active {
            text-decoration: underline;
            font-weight: bold; /* Make active section title bold */
          }
          .section-title:hover {
            text-decoration: underline;
          }

          /* General list styling from previous version, slightly adapted */
          ul { /* Applied via renderNavLinks's scoped style */
            padding: 0;
            margin: 0; /* Reset margin for UL */
          }
          li {
            list-style: none;
            margin: 0; /* Reset margin for LI */
          }
          li :global(a) {
            text-decoration: none;
            display: block; /* Make links take full width for easier clicking */
            padding: 0.25rem 0; /* Add some padding to links */
          }
          li :global(a:hover),
          li.active > :global(a) { /* Target direct child 'a' of active 'li' */
            text-decoration: underline;
          }
          li.active > :global(a) {
             font-weight: bold; /* Make active link bold */
          }
        `}
      </style>
    </nav>
  );
}
