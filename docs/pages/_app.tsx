import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { SideNav, TableOfContents, TopNav } from '../components';
import CodePaneDisplay from '../components/CodePaneDisplay';
import { AsideContentProvider, useAsideContent } from '../components/context/AsideContentContext';

import 'prismjs';
import 'prismjs/components/prism-bash.min';
import 'prismjs/themes/prism.css';
import '../public/globals.css';

import type { AppProps } from 'next/app';
import type { MarkdocNextJsPageProps } from '@markdoc/next.js';

const TITLE = 'Markdoc';
const DESCRIPTION = 'A powerful, flexible, Markdown-based authoring framework';

function collectHeadings(node, sections = []) {
  if (node) {
    if (node.name === 'Heading') {
      const title = node.children[0];
      if (typeof title === 'string') {
        sections.push({ ...node.attributes, title });
      }
    }
    if (node.children) {
      for (const child of node.children) {
        collectHeadings(child, sections);
      }
    }
  }
  return sections;
}

export type MyAppProps = MarkdocNextJsPageProps;

function AppContent({ Component, pageProps }: AppProps<MyAppProps>) {
  const { markdoc } = pageProps;
  const router = useRouter();
  const { asideContent, setAsideContent } = useAsideContent();

  useEffect(() => {
    const handleRouteChange = () => {
      setAsideContent(null);
    };
    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events, setAsideContent]);

  let title = TITLE;
  let description = DESCRIPTION;
  if (markdoc) {
    if (markdoc.frontmatter.title) title = markdoc.frontmatter.title;
    if (markdoc.frontmatter.description) description = markdoc.frontmatter.description;
  }

  const toc = pageProps.markdoc?.content ? collectHeadings(pageProps.markdoc.content) : [];

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="referrer" content="strict-origin" />
        <meta name="title" content={title} />
        <meta name="description" content={description} />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TopNav>
        <Link href="/docs">Docs</Link>
      </TopNav>
      <div className="page-container">
        <SideNav /> {/* Flex: 0 0 auto (from its own styles) */}
        <div className={`main-content-wrapper ${asideContent ? 'with-aside' : 'without-aside'}`}>
          {/* This wrapper helps manage the layout of main content and TOC */}
          <main className="main-article-content">
            <Component {...pageProps} />
          </main>
          <TableOfContents toc={toc} /> {/* Positioned sticky relative to main-content-wrapper */}
        </div>
        <CodePaneDisplay /> {/* Flex: 0 0 auto (from its own styles) */}
      </div>
      <style jsx>{`
        .page-container {
          position: fixed; /* Changed from fixed to relative for potential footer, but fixed is fine for now */
          top: var(--top-nav-height);
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          overflow: hidden; /* Prevent whole page scroll when content scrolls */
        }

        .main-content-wrapper {
          flex-grow: 1; /* Takes up available space between SideNav and CodePane */
          display: flex; /* To position main and TOC */
          overflow-y: auto; /* Primary scrollbar for content area */
          height: calc(100vh - var(--top-nav-height));
        }

        .main-article-content {
          flex-grow: 1; /* Main article takes available space from TOC */
          padding: 1.5rem 2rem 2rem;
          max-width: 800px; /* Max width for readability */
          margin-right: auto; /* Pushes TOC to the right if not enough space */
          margin-left: auto; /* Centers content if TOC is not present or space allows */
        }

        /* Responsive adjustments: On smaller screens, CodePane might be hidden or stacked. */
        /* For now, we assume CodePane and SideNav have fixed/max widths and main content fills the rest. */

        @media (max-width: 1024px) { /* Example breakpoint for when TOC might become too squished */
          .main-article-content {
            margin-right: 0; /* Allow TOC to take its space or hide TOC */
          }
          /* Consider hiding TOC or CodePaneDisplay at smaller sizes if needed */
        }
        @media (max-width: 768px) { /* Example breakpoint for mobile */
           .main-content-wrapper {
             /* On mobile, perhaps only main content is visible, side/code panes are drawers */
           }
        }
      `}</style>
    </>
  );
}

export default function MyApp(props: AppProps<MyAppProps>) {
  return (
    <AsideContentProvider>
      <AppContent {...props} />
    </AsideContentProvider>
  );
}
