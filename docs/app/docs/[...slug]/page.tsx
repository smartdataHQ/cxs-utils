import { MarkdocRenderer } from '@/components/markdoc/markdoc-renderer';
import { readMarkdocContent, getMarkdocPath } from '@/lib/markdoc-utils';
import { notFound } from 'next/navigation';
import { existsSync } from 'fs';
import { join } from 'path';

interface PageProps {
  params: {
    slug: string[];
  };
}

/**
 * Dynamic catch-all route for all documentation pages
 * This single file replaces ALL individual page.tsx files
 */
export default function DynamicDocsPage({ params }: PageProps) {
  const pagePath = params.slug.join('/');
  
  // Debug: Log the page path being requested
  console.log('🔍 [DynamicDocsPage] Requested page path:', pagePath);
  
  // Check if the corresponding .mdoc file exists
  const markdocPath = join(process.cwd(), `app/docs/${pagePath}/page.mdoc`);
  
  console.log('🔍 [DynamicDocsPage] Looking for Markdoc file at:', markdocPath);
  
  if (!existsSync(markdocPath)) {
    console.error('❌ [DynamicDocsPage] Markdoc file not found:', markdocPath);
    notFound();
  }

  console.log('✅ [DynamicDocsPage] Markdoc file found, rendering page');

  try {
    const markdocContent = readMarkdocContent(markdocPath);
    
    console.log('📖 [DynamicDocsPage] Read content length:', markdocContent.length);
    console.log('📝 [DynamicDocsPage] Content preview:', markdocContent.substring(0, 200) + '...');
    
    return (
      <article className="max-w-none">
        <MarkdocRenderer content={markdocContent} />
      </article>
    );
  } catch (error) {
    console.error('❌ [DynamicDocsPage] Error reading Markdoc content:', error);
    return (
      <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
        <h1>Error Loading Page</h1>
        <p>There was an error loading this documentation page.</p>
        <pre className="text-sm bg-muted p-4 rounded mt-4">
          {error instanceof Error ? error.message : 'Unknown error'}
        </pre>
      </div>
    );
  }
}

/**
 * Generate metadata for each page dynamically
 */
export async function generateMetadata({ params }: PageProps) {
  const pagePath = params.slug.join('/');
  
  console.log('🔍 [generateMetadata] Generating metadata for:', pagePath);
  
  try {
    const { extractMetadata, readMarkdocContent } = await import('@/lib/markdoc-utils');
    const markdocPath = join(process.cwd(), `app/docs/${pagePath}/page.mdoc`);
    const content = readMarkdocContent(markdocPath);
    const metadata = extractMetadata(content);
    
    console.log('✅ [generateMetadata] Metadata extracted:', metadata);
    
    return {
      title: `${metadata.title} - ContextSuite Documentation`,
      description: metadata.description || 'ContextSuite semantic events documentation',
    };
  } catch (error) {
    console.error('❌ [generateMetadata] Error generating metadata:', error);
    return {
      title: 'Documentation - ContextSuite',
      description: 'ContextSuite semantic events documentation',
    };
  }
}

/**
 * Generate static params for all documentation pages
 * This enables static generation at build time
 */
export async function generateStaticParams() {
  console.log('🔍 [generateStaticParams] Generating static params for docs pages');
  
  try {
    const { glob } = await import('glob');
    
    // Find all .mdoc files in the docs directory
    const mdocFiles = glob.sync('app/docs/**/page.mdoc', { 
      cwd: process.cwd(),
      ignore: ['app/docs/page.mdoc'] // Exclude the root docs page
    });
    
    console.log('🔍 [generateStaticParams] Found .mdoc files:', mdocFiles);
    
    const params = mdocFiles.map(file => {
      // Convert file path to slug array
      // e.g., 'app/docs/entities/identification/page.mdoc' -> ['entities', 'identification']
      const slug = file
        .replace('app/docs/', '')
        .replace('/page.mdoc', '')
        .split('/');
      
      console.log('🔍 [generateStaticParams] Generated slug for', file, ':', slug);
      
      return { slug };
    });
    
    console.log('✅ [generateStaticParams] Generated', params.length, 'static params');
    return params;
  } catch (error) {
    console.error('❌ [generateStaticParams] Error generating static params:', error);
    return [];
  }
}