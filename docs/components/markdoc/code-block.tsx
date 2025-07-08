"use client";

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import { Copy, Check, Terminal } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  children: string;
  language?: string;
  title?: string;
  className?: string;
}

export function CodeBlock({ children, language = 'text', title, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { theme, resolvedTheme } = useTheme();
  
  // Clean up the code content
  const code = typeof children === 'string' ? children.trim() : String(children).trim();
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Determine if we should show line numbers
  const showLineNumbers = code.split('\n').length > 3;
  
  // Get the appropriate theme
  const isDark = resolvedTheme === 'dark' || theme === 'dark';
  const syntaxTheme = isDark ? oneDark : oneLight;

  // Language display name mapping
  const languageNames: Record<string, string> = {
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'jsx': 'React JSX',
    'tsx': 'React TSX',
    'json': 'JSON',
    'bash': 'Bash',
    'shell': 'Shell',
    'sql': 'SQL',
    'python': 'Python',
    'css': 'CSS',
    'html': 'HTML',
    'markdown': 'Markdown',
    'yaml': 'YAML',
    'xml': 'XML',
    'text': 'Text',
  };

  const displayLanguage = languageNames[language] || language.toUpperCase();

  return (
    <div className={cn("relative group my-8", className)}>
      {/* Header with title and language */}
      {(title || language !== 'text') && (
        <div className="flex items-center justify-between bg-muted/80 backdrop-blur-sm px-4 py-3 rounded-t-lg border border-b-0">
          <div className="flex items-center gap-2">
            {title && (
              <>
                <Terminal className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{title}</span>
              </>
            )}
            {!title && language !== 'text' && (
              <span className="text-sm font-medium text-foreground">{displayLanguage}</span>
            )}
          </div>
          {language !== 'text' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
                {language}
              </span>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Code content */}
      <div className="relative">
        <SyntaxHighlighter
          language={language === 'text' ? 'plaintext' : language}
          style={syntaxTheme}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            borderRadius: title || language !== 'text' ? '0 0 0.5rem 0.5rem' : '0.5rem',
            fontSize: '0.875rem',
            lineHeight: '1.6',
            border: '1px solid hsl(var(--border))',
            borderTop: title || language !== 'text' ? 'none' : '1px solid hsl(var(--border))',
            background: isDark ? '#0d1117' : '#f8f9fa',
            padding: '1.5rem',
            overflow: 'auto',
          }}
          lineNumberStyle={{
            color: isDark ? '#6e7681' : '#656d76',
            backgroundColor: 'transparent',
            paddingRight: '1rem',
            minWidth: '2.5rem',
            fontSize: '0.75rem',
          }}
          wrapLines={true}
          wrapLongLines={true}
        >
          {code}
        </SyntaxHighlighter>
        
        {/* Copy button */}
        <Button
          size="sm"
          variant="outline"
          className={cn(
            "absolute top-3 right-3 h-8 w-8 p-0 transition-all duration-200",
            "opacity-0 group-hover:opacity-100",
            "bg-background/90 backdrop-blur-sm border-border/50",
            "hover:bg-accent hover:border-accent-foreground/20",
            copied && "opacity-100"
          )}
          onClick={handleCopy}
          title={copied ? "Copied!" : "Copy code"}
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
    </div>
  );
}