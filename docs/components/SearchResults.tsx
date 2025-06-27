import React from 'react';
import Link from 'next/link';
import { useSearch } from './context/SearchContext';

// Helper to highlight search terms (simple version)
const Highlight: React.FC<{ text?: string; query: string }> = ({ text = '', query }) => {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i}>{part}</mark>
        ) : (
          part
        )
      )}
    </>
  );
};


const SearchResults: React.FC = () => {
  const {
    searchResults,
    searchQuery,
    isLoadingIndex,
    isSearchVisible,
    setIsSearchVisible
  } = useSearch();

  if (!isSearchVisible || !searchQuery.trim()) {
    return null;
  }

  if (isLoadingIndex) {
    // Optionally show a loading state within the results area too,
    // but SearchBar placeholder might be enough.
    return null;
  }

  return (
    <div className="search-results-dropdown">
      {searchResults.length > 0 ? (
        <ul>
          {searchResults.map((result) => (
            <li key={result.path}>
              <Link href={result.path}>
                <a onClick={() => setIsSearchVisible(false)} className="search-result-link">
                  <div className="search-result-title">
                    <Highlight text={result.title} query={searchQuery} />
                  </div>
                  {result.descriptionSnippet && (
                    <div className="search-result-snippet">
                      <Highlight text={result.descriptionSnippet} query={searchQuery} />
                    </div>
                  )}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="no-results">
          No results found for "<strong>{searchQuery}</strong>".
        </div>
      )}
      <style jsx>{`
        .search-results-dropdown {
          position: absolute;
          top: calc(100% + 5px); /* Below the search bar */
          left: 0;
          /* right: 0; */ /* Remove to use explicit width */
          width: 320px; /* Set an explicit width, can be adjusted */
          min-width: 280px; /* Ensure it's not too narrow */
          background-color: white;
          border: 1px solid var(--border-color, #ccc);
          /* border-top: none; */ /* Keep top border for visual separation if needed, or remove if box-shadow is enough */
          border-radius: 0 0 4px 4px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          z-index: 1000; /* Ensure it's above other content */
          max-height: 400px; /* Limit height and make it scrollable */
          overflow-y: auto;
        }
        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .search-result-link {
          display: block;
          padding: 0.75rem 1rem;
          text-decoration: none;
          color: var(--text-color-main);
          border-bottom: 1px solid var(--border-color, #eee);
        }
        .search-result-link:hover {
          background-color: var(--code-bg, #f9fafb);
        }
        .search-result-link:last-child {
          border-bottom: none;
        }
        .search-result-title {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        .search-result-title :global(mark) {
          background-color: #ffdd77; /* Yellow highlight */
          padding: 0;
        }
        .search-result-snippet {
          font-size: 0.875rem;
          color: var(--text-color-secondary, #555);
          line-height: 1.4;
        }
         .search-result-snippet :global(mark) {
          background-color: #ffdd77; /* Yellow highlight */
          padding: 0;
        }
        .no-results {
          padding: 1rem;
          text-align: center;
          color: var(--text-color-secondary, #777);
        }
      `}</style>
    </div>
  );
};

export default SearchResults;
