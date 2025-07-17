// Mock Algolia implementation for build compatibility
// In a real application, you would configure Algolia properly

export interface SearchResult {
  objectID: string;
  title: string;
  content: string;
  url: string;
  hierarchy: {
    lvl0: string;
    lvl1: string;
    lvl2?: string;
    lvl3?: string;
  };
  type: 'content' | 'heading';
}

export async function searchDocs(query: string): Promise<SearchResult[]> {
  // Mock implementation - replace with actual Algolia search
  console.log('Search query:', query);
  return [];
}

export async function configureSearch() {
  // Mock implementation - replace with actual Algolia configuration
  console.log('Search configured');
}