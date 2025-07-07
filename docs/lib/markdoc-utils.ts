import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Utility function to read Markdoc content from file system
 * This centralizes the file reading logic used across all documentation pages
 */
export function readMarkdocContent(relativePath: string): string {
  const markdocPath = join(process.cwd(), relativePath);
  
  
  if (!existsSync(markdocPath)) {
    throw new Error(`Markdoc file not found: ${markdocPath}`);
  }
  
  try {
    const content = readFileSync(markdocPath, 'utf8');
    return content;
  } catch (error) {
    throw error;
  }
}

/**
 * Generate the full path to a Markdoc file based on the page path
 * Tries page.mdoc first, then falls back to index.mdoc if page.mdoc doesn't exist
 */
export function getMarkdocPath(pagePath: string): string {
  const pageMdocPath = `${pagePath}/page.mdoc`;
  const indexMdocPath = `${pagePath}/index.mdoc`;
  
  // Check if page.mdoc exists, otherwise use index.mdoc
  if (existsSync(join(process.cwd(), pageMdocPath))) {
    return pageMdocPath;
  } else {
    return indexMdocPath;
  }
}

/**
 * Common metadata for documentation pages
 */
export interface DocPageMetadata {
  title: string;
  description?: string;
}

/**
 * Extract metadata from Markdoc frontmatter
 */
export function extractMetadata(content: string): DocPageMetadata {
  
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return { title: 'Documentation' };
  }

  const frontmatter = frontmatterMatch[1];
  const titleMatch = frontmatter.match(/title:\s*(.+)/);
  const descriptionMatch = frontmatter.match(/description:\s*(.+)/);

  const metadata = {
    title: titleMatch ? titleMatch[1].trim().replace(/['"]/g, '') : 'Documentation',
    description: descriptionMatch ? descriptionMatch[1].trim().replace(/['"]/g, '') : undefined,
  };
  
  return metadata;
}

/**
 * Check if a Markdoc file exists for the given page path
 */
export function markdocFileExists(pagePath: string): boolean {
  try {
    const markdocPath = getMarkdocPath(`app/docs/${pagePath}`);
    const fullPath = join(process.cwd(), markdocPath);
    const exists = existsSync(fullPath);
    return exists;
  } catch {
    return false;
  }
}