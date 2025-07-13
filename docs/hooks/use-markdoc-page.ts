import { useMemo } from 'react';
import { readMarkdocContent, getMarkdocPath, extractMetadata } from '@/lib/markdoc-utils';

/**
 * Custom hook for handling Markdoc page data
 * This centralizes the logic for reading and processing Markdoc content
 */
export function useMarkdocPage(pagePath: string) {
  const { content, metadata } = useMemo(() => {
    const markdocPath = getMarkdocPath(`app/docs/${pagePath}`);
    const content = readMarkdocContent(markdocPath);
    const metadata = extractMetadata(content);
    
    return { content, metadata };
  }, [pagePath]);

  return { content, metadata };
}