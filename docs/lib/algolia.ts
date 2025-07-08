import { algoliasearch } from 'algoliasearch';

// Initialize Algolia client
// In a real application, you would use environment variables
const client = algoliasearch('YourApplicationID', 'YourSearchOnlyAPIKey');
const index = client.initIndex('docs');

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
  try {
    const { hits } = await index.search<SearchResult>(query, {
      hitsPerPage: 20,
      attributesToRetrieve: ['title', 'content', 'url', 'hierarchy', 'type'],
      attributesToHighlight: ['title', 'content'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
    });

    return hits;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

export function configureSearch() {
  // Configure search settings
  index.setSettings({
    searchableAttributes: [
      'unordered(title)',
      'unordered(content)',
      'unordered(hierarchy.lvl0)',
      'unordered(hierarchy.lvl1)',
      'unordered(hierarchy.lvl2)',
      'unordered(hierarchy.lvl3)',
    ],
    attributesForFaceting: ['type', 'hierarchy.lvl0'],
    ranking: ['typo', 'geo', 'words', 'filters', 'proximity', 'attribute', 'exact', 'custom'],
    customRanking: ['desc(weight.page_rank)', 'desc(weight.level)', 'asc(weight.position)'],
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>',
    snippetEllipsisText: '…',
    attributesToSnippet: ['content:20'],
  });
}