import { MarkdocRenderer } from '@/components/markdoc/markdoc-renderer';
import { readMarkdocContent, getMarkdocPath } from '@/lib/markdoc-utils';

interface MarkdocPageProps {
  /**
   * The path to the page relative to app/docs (e.g., 'entities', 'semantic-events/validation')
   */
  pagePath: string;
}

/**
 * Reusable component for rendering Markdoc pages
 * This eliminates the repetitive page.tsx files throughout the docs
 */
export function MarkdocPage({ pagePath }: MarkdocPageProps) {
  try {
    const markdocPath = getMarkdocPath(`app/docs/${pagePath}`);
    const markdocContent = readMarkdocContent(markdocPath);

    return (
      <article className="prose prose-slate dark:prose-invert max-w-none">
        <MarkdocRenderer content={markdocContent} />
      </article>
    );
  } catch (error) {
    console.error('Error rendering Markdoc page:', error);
    return (
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h1>Page Not Found</h1>
        <p>The requested documentation page could not be found.</p>
      </div>
    );
  }
}