import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import FlexSearch from 'flexsearch'; // This was already installed

// Define types for search results and context
interface SearchResultItem {
  path: string;
  title: string;
  descriptionSnippet?: string;
  // score?: number; // FlexSearch provides a score
}

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: SearchResultItem[];
  isLoadingIndex: boolean;
  isSearchVisible: boolean;
  setIsSearchVisible: (visible: boolean) => void;
  performSearch: (query: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

// The structure of the exported index from generate-search-index.js
// It's an object where each key is a part of the FlexSearch index (e.g., 'reg', 'cfg', 'map', 'ctx')
interface ExportedIndexData {
  [key: string]: any;
}

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isLoadingIndex, setIsLoadingIndex] = useState<boolean>(true);
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);

  // Use React.MutableRefObject to hold the index instance
  const searchIndexRef = React.useRef<FlexSearch.Document<SearchResultItem, true> | null>(null);

  useEffect(() => {
    // Initialize FlexSearch index on component mount
    const index = new FlexSearch.Document<SearchResultItem, true>({
      document: {
        id: 'id', // Must match the export structure
        index: ['title', 'content'], // Fields that were indexed
        store: ['title', 'path', 'descriptionSnippet'] // Fields that were stored
      },
      tokenize: 'forward',
      resolution: 9,
      profile: 'default',
    });

    fetch('/search-index.json') // Path to the exported index in public/
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok for search-index.json');
        }
        return response.json();
      })
      .then((exportedIndexData: ExportedIndexData) => {
        // Import each part of the index
        for (const key in exportedIndexData) {
          index.import(key, exportedIndexData[key]);
        }
        searchIndexRef.current = index;
        setIsLoadingIndex(false);
        console.log('Search index loaded successfully.');
      })
      .catch(error => {
        console.error('Failed to load or import search index:', error);
        setIsLoadingIndex(false); // Still set loading to false on error
      });
  }, []); // Empty dependency array means this runs once on mount

  const performSearch = useCallback((query: string) => {
    if (!searchIndexRef.current || !query) {
      setSearchResults([]);
      return;
    }
    // FlexSearch's document search returns an array of results from different fields.
    // Each item in the array contains `field` (e.g., 'title') and `result` (array of IDs).
    const resultsFromIndex = searchIndexRef.current.search(query, {
        enrich: true, // To get enriched results with stored fields
        limit: 10, // Limit number of results
    });

    // Flatten and map results to SearchResultItem structure
    const uniqueResults = new Map<string, SearchResultItem>();

    resultsFromIndex.forEach(fieldResult => {
        fieldResult.result.forEach(doc => {
            // 'doc' here is the stored document when enrich: true
            if (doc && !uniqueResults.has(doc.path)) { // Ensure unique paths
                 uniqueResults.set(doc.path, {
                    path: doc.path,
                    title: doc.title,
                    descriptionSnippet: doc.descriptionSnippet,
                });
            }
        });
    });
    setSearchResults(Array.from(uniqueResults.values()));
  }, []);


  const handleSetSearchQuery = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]); // Clear results if query is empty
    } else {
      performSearch(query);
    }
  };


  return (
    <SearchContext.Provider value={{
      searchQuery,
      setSearchQuery: handleSetSearchQuery,
      searchResults,
      isLoadingIndex,
      isSearchVisible,
      setIsSearchVisible,
      performSearch // Expose performSearch directly if needed by other components
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
