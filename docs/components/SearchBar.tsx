import React, { useState, useEffect, useRef } from 'react';
import { useSearch } from './context/SearchContext';

const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery, setIsSearchVisible, isLoadingIndex } = useSearch();
  const [inputValue, setInputValue] = useState<string>(searchQuery);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Update internal input value if context query changes (e.g. cleared externally)
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setInputValue(query);
    setSearchQuery(query); // This will trigger search in context
    if (query.trim() !== '') {
      setIsSearchVisible(true);
    }
    // Optionally hide results if query becomes empty, though setSearchQuery handles this for results array
  };

  const handleFocus = () => {
    if (inputValue.trim() !== '' || searchQuery.trim() !== '') { // Show results if there's already a query or input
        setIsSearchVisible(true);
    }
    // Or always show on focus to allow seeing recent/empty state? For now, only if query exists.
  };

  // Handle clicks outside the search bar and results to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Assuming SearchResults component will be a sibling or child of searchContainerRef or managed separately
      // This logic might need to be more sophisticated if SearchResults is not part of this component tree.
      // For now, this closes if clicking outside the SearchBar itself.
      // A common pattern is to have SearchResults also use a ref and check if the click is within either.
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        // Check if there is an active query. If so, don't hide.
        // This behavior can be tricky. Often, results are in a dropdown that handles its own closure.
        // Let's simplify: results visibility is mainly driven by query presence and explicit close actions.
        // setIsSearchVisible(false); // This might be too aggressive.
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchContainerRef, setIsSearchVisible]);


  return (
    <div className="search-bar-container" ref={searchContainerRef}>
      <input
        type="search"
        placeholder={isLoadingIndex ? "Loading search..." : "Search docs..."}
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        disabled={isLoadingIndex}
        className="search-input"
      />
      {/* SearchResults component will be rendered elsewhere, controlled by isSearchVisible */}
      <style jsx>{`
        .search-bar-container {
          position: relative; /* For potential dropdown results positioning */
          /* Add more styling as needed */
        }
        .search-input {
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--border-color, #ccc);
          border-radius: 4px;
          font-size: 0.9rem;
          min-width: 200px; /* Adjust as needed */
        }
        .search-input:focus {
          border-color: var(--link-color-active, #0070f3);
          outline: none;
          box-shadow: 0 0 0 2px rgba(0, 112, 243, 0.2);
        }
      `}</style>
    </div>
  );
};

export default SearchBar;
