import { notFound } from 'next/navigation';
import { existsSync } from 'fs';
import { join } from 'path';
import { MarkdocRenderer } from '@/components/markdoc/markdoc-renderer';
import { readMarkdocContent, getMarkdocPath, extractMetadata } from '@/lib/markdoc-utils';

interface DocsPageProps {
  params: {
    slug: string[];
  };
}

export default function DocsPage({ params }: DocsPageProps) {
  // Reconstruct the path from the slug array
  const slugPath = params.slug.join('/');
  const pagePath = `app/docs/${slugPath}`;
  
  // Check if the Markdoc file exists
  const markdocPagePath = `${pagePath}/page.mdoc`;
  const markdocIndexPath = `${pagePath}/index.mdoc`;
  const markdocDirectPath = `${pagePath}.mdoc`;
  
  let markdocPath = '';
  
  // Try to find the correct Markdoc file
  if (existsSync(join(process.cwd(), markdocPagePath))) {
    markdocPath = markdocPagePath;
  } else if (existsSync(join(process.cwd(), markdocIndexPath))) {
    markdocPath = markdocIndexPath;
  } else if (existsSync(join(process.cwd(), markdocDirectPath))) {
    markdocPath = markdocDirectPath;
  } else {
    console.error(`No Markdoc file found for path: ${pagePath}`);
    return notFound();
  }
  
  // Read the Markdoc content
  try {
    const markdocContent = readMarkdocContent(markdocPath);
    const metadata = extractMetadata(markdocContent);
    
    return (
      <div className="container mx-auto md:py-10">
        <div className="prose dark:prose-invert max-w-none">
          <h1 className="text-4xl font-extrabold mb-6">{metadata.title}</h1>
          <MarkdocRenderer content={markdocContent} />
        </div>
      </div>
    );
  } catch (error) {
    console.error(`Error reading Markdoc content: ${error}`);
    return notFound();
  }
}
