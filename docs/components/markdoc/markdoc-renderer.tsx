"use client";

import Markdoc from '@markdoc/markdoc';
import React from 'react';
import { CodeBlock } from './code-block';
import { Callout } from './callout';
import * as LucideIcons from 'lucide-react';

// Helper function to extract text content from Markdoc children
function extractTextFromChildren(children: any[]): string {
  return children
    .map(child => {
      if (typeof child === 'string') return child;
      if (child && typeof child === 'object' && child.children) {
        return extractTextFromChildren(child.children);
      }
      return '';
    })
    .join('')
    .trim();
}

// Helper function to generate URL-safe slugs from heading text
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

const components = {
  CodeBlock,
  Callout,
};

interface MarkdocRendererProps {
  content: string;
}

function getLucideIcon(iconName: string) {
  const iconKey = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  return (LucideIcons as any)[iconKey] || LucideIcons.FileText;
}

function IconText({ iconName, children }: { iconName: string; children: React.ReactNode }) {
  const Icon = getLucideIcon(iconName);
  return (
    <span className="inline-flex items-center gap-1">
      <Icon className="h-4 w-4 inline" />
      {children}
    </span>
  );
}

function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="table-container overflow-x-auto my-8">
      <table className="w-full border-collapse border border-border rounded-lg overflow-hidden shadow-sm">
        {children}
      </table>
    </div>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-muted/50">{children}</thead>;
}

function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

function TableRow({ children, isHeader = false }: { children: React.ReactNode; isHeader?: boolean }) {
  return (
    <tr className={isHeader ? 'bg-muted/50' : 'hover:bg-muted/20 transition-colors duration-150 even:bg-muted/10'}>
      {children}
    </tr>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <th className="border border-border px-4 py-3 text-left font-semibold text-sm text-foreground">
      {children}
    </th>
  );
}

function TableCell({ children }: { children: React.ReactNode }) {
  return (
    <td className="border border-border px-4 py-3 text-sm text-foreground">
      {children}
    </td>
  );
}

function List({ ordered, children }: { ordered?: boolean; children: React.ReactNode }) {
  const ListTag = ordered ? 'ol' : 'ul';
  const listClasses = ordered ? 'list-decimal mb-6 space-y-2 text-foreground pl-6' : 'list-disc mb-6 space-y-2 text-foreground pl-6';
  return React.createElement(ListTag, { className: listClasses }, children);
}

function Heading({ level, children, id }: { level: number; children: React.ReactNode; id?: string }) {
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
  const headingClasses = {
    1: 'text-4xl font-bold text-foreground border-b border-border pb-4 mb-8 mt-0 scroll-mt-20',
    2: 'text-3xl font-semibold text-foreground mt-16 mb-6 scroll-mt-20',
    3: 'text-2xl font-semibold text-foreground mt-12 mb-5 scroll-mt-20',
    4: 'text-xl font-semibold text-foreground mt-8 mb-4 scroll-mt-20',
    5: 'text-lg font-semibold text-foreground mt-6 mb-3 scroll-mt-20',
    6: 'text-base font-semibold text-foreground mt-4 mb-2 scroll-mt-20',
  };
  return React.createElement(HeadingTag, { className: headingClasses[level as keyof typeof headingClasses], id }, children);
}

function Navigation({ previous, previousTitle, next, nextTitle }: { 
  previous?: string; 
  previousTitle?: string; 
  next?: string; 
  nextTitle?: string; 
}) {
  return (
    <div className="flex justify-between items-center mt-8 pt-4 border-t border-border">
      <div>
        {previous && (
          <a 
            href={previous} 
            className="inline-flex items-center px-4 py-2 bg-muted text-muted-foreground hover:bg-muted/80 text-decoration-none rounded-md font-medium transition-colors"
          >
            ← Previous: {previousTitle || 'Previous'}
          </a>
        )}
      </div>
      <div>
        {next && (
          <a 
            href={next} 
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-decoration-none rounded-md font-medium transition-colors"
          >
            Next: {nextTitle || 'Next'} →
          </a>
        )}
      </div>
    </div>
  );
}

export function MarkdocRenderer({ content }: MarkdocRendererProps) {
  try {
    const ast = Markdoc.parse(content);
    const renderedContent = Markdoc.transform(ast, {
      nodes: {
        fence: {
          render: 'CodeBlock',
          attributes: { language: { type: String }, title: { type: String } },
          transform(node, config) {
            const attributes = node.transformAttributes(config);
            const children = node.transformChildren(config);
            return new Markdoc.Tag('CodeBlock', { language: attributes.language || 'text', title: attributes.title }, children);
          },
        },
        table: {
          render: 'Table',
          transform(node, config) {
            return new Markdoc.Tag('Table', {}, node.transformChildren(config));
          },
        },
        thead: {
          render: 'TableHead',
          transform(node, config) {
            return new Markdoc.Tag('TableHead', {}, node.transformChildren(config));
          },
        },
        tbody: {
          render: 'TableBody',
          transform(node, config) {
            return new Markdoc.Tag('TableBody', {}, node.transformChildren(config));
          },
        },
        tr: {
          render: 'TableRow',
          transform(node, config) {
            return new Markdoc.Tag('TableRow', {}, node.transformChildren(config));
          },
        },
        th: {
          render: 'TableHeader',
          transform(node, config) {
            return new Markdoc.Tag('TableHeader', {}, node.transformChildren(config));
          },
        },
        td: {
          render: 'TableCell',
          transform(node, config) {
            return new Markdoc.Tag('TableCell', {}, node.transformChildren(config));
          },
        },
        heading: {
          render: 'Heading',
          attributes: { level: { type: Number, required: true }, id: { type: String } },
          transform(node, config) {
            const attributes = node.transformAttributes(config);
            const children = node.transformChildren(config);
            
            // Generate ID from heading text if not provided
            let id = attributes.id;
            if (!id && children && children.length > 0) {
              const headingText = extractTextFromChildren(children);
              id = generateSlug(headingText);
            }
            
            return new Markdoc.Tag('Heading', { level: attributes.level, id }, children);
          },
        },
        paragraph: {
          render: 'p',
          transform(node, config) {
            return new Markdoc.Tag('p', { className: 'text-foreground leading-7 mb-6 text-base' }, node.transformChildren(config));
          },
        },
        list: {
          render: 'List',
          attributes: { ordered: { type: Boolean } },
          transform(node, config) {
            const attributes = node.transformAttributes(config);
            return new Markdoc.Tag('List', { ordered: attributes.ordered }, node.transformChildren(config));
          },
        },
        item: {
          render: 'li',
          transform(node, config) {
            return new Markdoc.Tag('li', { className: 'leading-7 text-base mb-1' }, node.transformChildren(config));
          },
        },
        blockquote: {
          render: 'blockquote',
          transform(node, config) {
            return new Markdoc.Tag(
              'blockquote',
              { className: 'border-l-4 border-primary pl-6 py-4 italic text-muted-foreground bg-muted/30 rounded-r-lg my-8' },
              node.transformChildren(config)
            );
          },
        },
        code: {
          render: 'code',
          transform(node) {
            return new Markdoc.Tag(
              'code',
              { className: 'bg-muted px-2 py-1 rounded text-sm font-mono text-foreground border' },
              [node.attributes?.content ?? '']
            );
          },
        },
        link: {
          render: 'a',
          attributes: { href: { type: String, required: true }, title: { type: String } },
          transform(node, config) {
            const attributes = node.transformAttributes(config);
            return new Markdoc.Tag(
              'a',
              {
                href: attributes.href,
                title: attributes.title,
                className: 'text-primary hover:text-primary/80 underline underline-offset-4 transition-colors font-medium',
              },
              node.transformChildren(config)
            );
          },
        },
        strong: {
          render: 'strong',
          transform(node, config) {
            return new Markdoc.Tag('strong', { className: 'font-semibold text-foreground' }, node.transformChildren(config));
          },
        },
        em: {
          render: 'em',
          transform(node, config) {
            return new Markdoc.Tag('em', { className: 'italic' }, node.transformChildren(config));
          },
        },
        hr: {
          render: 'hr',
          transform() {
            return new Markdoc.Tag('hr', { className: 'border-border my-12' }, []);
          },
        },
        html_block: {
          render: 'div',
          transform(node) {
            return new Markdoc.Tag('div', { dangerouslySetInnerHTML: { __html: node.attributes?.content || '' } }, []);
          },
        },
      },
      tags: {
        callout: {
          render: 'Callout',
          attributes: { type: { type: String, default: 'info' }, title: { type: String } },
        },
        icon: {
          render: 'IconText',
          attributes: { name: { type: String, required: true } },
          transform(node, config) {
            const attributes = node.transformAttributes(config);
            const children = node.transformChildren(config);
            return new Markdoc.Tag('IconText', { iconName: attributes.name }, children);
          },
        },
        navigation: {
          render: 'Navigation',
          attributes: { 
            previous: { type: String },
            previousTitle: { type: String },
            next: { type: String },
            nextTitle: { type: String }
          },
          transform(node, config) {
            const attributes = node.transformAttributes(config);
            return new Markdoc.Tag('Navigation', attributes, []);
          },
        },
      },
    });

    const extendedComponents = {
      ...components,
      IconText,
      Table,
      TableHead,
      TableBody,
      TableRow,
      TableHeader,
      TableCell,
      List,
      Heading,
      Navigation,
    };

    return <div className="markdoc-content max-w-none">{Markdoc.renderers.react(renderedContent, React, { components: extendedComponents })}</div>;
  } catch (error) {
    console.error('Error rendering Markdoc content:', error);
    return (
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-red-800 dark:text-red-200 text-xl font-semibold mb-2 flex items-center gap-2">
            <LucideIcons.AlertTriangle className="h-5 w-5" />
            Rendering Error
          </h2>
          <p className="text-red-700 dark:text-red-300 mb-4">There was an error rendering this page. Please check the console for details.</p>
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-red-800 dark:text-red-200 mb-2">Error Details</summary>
            <pre className="text-xs bg-red-100 dark:bg-red-900/50 p-3 rounded border overflow-auto">
              {error instanceof Error ? error.message : 'Unknown error'}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}
