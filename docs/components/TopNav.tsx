import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SearchBar from './SearchBar'; // Import SearchBar
import SearchResults from './SearchResults'; // Import SearchResults
// Remove direct import of svg, it's referenced by path in Image src
// import '../public/context-suite-logo.svg'

export function TopNav({ children }) {
  return (
    <nav>
      <Link href="/" className="flex logo-link">
        {/* Ensure the Image component can resolve this path correctly */}
        <Image src="/context-suite-logo.svg" alt="Context Suite" width={150} height={30} priority />
      </Link>

      <div className="nav-center-content">
        {/* SearchBar and SearchResults will be positioned here or nearby */}
        <div className="search-container">
          <SearchBar />
          <SearchResults /> {/* SearchResults will control its own visibility via context */}
        </div>
      </div>

      <section className="nav-right-links">{children}</section>

      <style jsx>
        {`
          nav {
            top: 0;
            position: fixed;
            width: 100%;
            z-index: 100; /* Ensure TopNav is above other content */
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            padding: 0.75rem 2rem; /* Adjusted padding */
            background: white;
            border-bottom: 1px solid var(--border-color);
            height: var(--top-nav-height); /* Use CSS variable for height */
          }
          .logo-link {
            display: flex; /* For proper alignment of the Image */
            align-items: center;
          }
          nav :global(a) {
            text-decoration: none;
          }
          .nav-center-content {
            flex-grow: 1;
            display: flex;
            justify-content: center; /* Center search bar if desired, or left */
          }
          .search-container {
            position: relative; /* For SearchResults absolute positioning */
            /* Add more styling if needed to constrain search bar width */
          }
          .nav-right-links {
            display: flex;
            gap: 1rem;
            padding: 0;
          }
        `}
      </style>
    </nav>
  );
}
