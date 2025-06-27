import React from 'react';
import Link from 'next/link';

export function TableOfContents({ toc }) {
  const items = toc.filter(
    (item) => item.id && (item.level === 2 || item.level === 3)
  );

  if (items.length <= 1) {
    return null;
  }

  return (
    <nav className="toc-wrapper">
      <ul className="flex column">
        {items.map((item) => {
          const href = `#${item.id}`;
          // Active state detection might need adjustment if not working correctly with Next.js Link for hash changes
          const active =
            typeof window !== 'undefined' && window.location.hash === href;
          return (
            <li
              key={item.title}
              className={[
                active ? 'active' : undefined,
                item.level === 3 ? 'padded' : undefined,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <Link href={href}>
                <a>{item.title}</a>
              </Link>
            </li>
          );
        })}
      </ul>
      <style jsx>
        {`
          .toc-wrapper {
            flex: 0 0 auto; /* Don't grow or shrink */
            width: 200px; /* Fixed width for TOC, adjust as needed */
            align-self: flex-start; /* Align to the top of the flex container (.main-content-wrapper) */
            position: sticky;
            top: 1.5rem; /* Sticky relative to the scrolling container, adjust padding as needed */
            max-height: calc(100vh - var(--top-nav-height) - 3rem); /* Max height considering top nav and some padding */
            overflow-y: auto;
            padding: 0.5rem 0 0 1.5rem; /* Padding on the left to separate from main content */
            margin-left: 1rem; /* Add some margin to push it away from main content slightly */
            border-left: 1px solid var(--border-color);
          }
          ul {
            margin: 0;
            padding: 0; /* Remove default ul padding */
          }
          li {
            list-style-type: none;
            margin: 0 0 0.75rem; /* Adjust spacing */
            font-size: 0.875rem; /* Slightly smaller font for TOC */
          }
          li :global(a) {
            text-decoration: none;
            color: var(--text-color-secondary); /* Use a secondary text color */
          }
          li :global(a:hover),
          li.active :global(a) {
            text-decoration: underline;
            color: var(--link-color-active); /* Use an active link color */
          }
          li.padded {
            padding-left: 1rem;
          }

          @media (max-width: 1200px) { /* Example: Hide TOC if CodePane is present and screen is too small */
            /* This media query might need to be coordinated with CodePane's visibility */
            /* For instance, if CodePane is visible, TOC might be hidden earlier */
             .toc-wrapper {
                /* display: none; */ /* Uncomment to hide TOC on smaller screens */
             }
          }
        `}
      </style>
    </nav>
  );
}
