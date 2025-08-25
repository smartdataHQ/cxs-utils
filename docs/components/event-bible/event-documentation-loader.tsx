'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MarkdocRenderer } from '@/components/markdoc/markdoc-renderer';
import { BookOpen, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EventDocumentationLoaderProps {
  slug: string;
  eventName: string;
  initialContent?: string | null;
}

export function EventDocumentationLoader({
  slug,
  eventName,
  initialContent
}: EventDocumentationLoaderProps) {
  const [content, setContent] = useState<string | null>(initialContent || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchDocumentation = async (isRetry = false) => {
    if (content && !isRetry) return; // Don't fetch if we already have content unless retrying

    setIsLoading(true);
    setError(null);
    setIsGenerating(false);

    // Add timeout to prevent infinite loading
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 90000); // 90 second timeout

    try {
      const response = await fetch(`/api/event-documentation/${slug}`, {
        signal: controller.signal,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch documentation');
      }

      setContent(data.content);
      setIsGenerating(data.isGenerating || false);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Documentation loading timed out. This may happen when generating new documentation.');
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const retryFetch = () => {
    if (retryCount >= 3) {
      setError('Maximum retry attempts reached. Please try again later.');
      return;
    }

    setContent(null);
    setRetryCount(prev => prev + 1);
    fetchDocumentation(true);
  };

  useEffect(() => {
    if (!initialContent) {
      fetchDocumentation();
    }
  }, [slug, initialContent]);

  // Auto-retry for generation states
  useEffect(() => {
    if (isGenerating && !isLoading) {
      const retryTimer = setTimeout(() => {
        console.log('Documentation still generating, checking again...');
        fetchDocumentation(true);
      }, 5000); // Check every 5 seconds if still generating

      return () => clearTimeout(retryTimer);
    }
  }, [isGenerating, isLoading]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Event Documentation
          </CardTitle>
          <CardDescription>
            Detailed documentation and implementation guidance for this event
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {isGenerating ? 'Generating Documentation' : 'Fetching Latest Documentation'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isGenerating
                    ? `AI is generating comprehensive documentation for ${eventName}...`
                    : `Loading comprehensive documentation for ${eventName}...`
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  {isGenerating
                    ? 'This may take up to 60 seconds for AI generation...'
                    : 'This may take a few moments as we retrieve the latest implementation guidance.'
                  }
                </p>
                {retryCount > 0 && (
                  <p className="text-xs text-amber-600">
                    Retry attempt {retryCount}/3
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <AlertCircle className="h-5 w-5" />
            Documentation Error
          </CardTitle>
          <CardDescription className="text-red-700 dark:text-red-300">
            Failed to load documentation for this event
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={retryFetch}
              disabled={retryCount >= 3}
              className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry {retryCount > 0 ? `(${retryCount}/3)` : ''}
            </Button>
            {retryCount >= 3 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRetryCount(0);
                  setError(null);
                }}
                className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20"
              >
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!content) {
    return (
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <BookOpen className="h-5 w-5" />
            Loading Documentation
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Event Documentation
        </CardTitle>
        <CardDescription>
          Detailed documentation and implementation guidance for this event
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MarkdocRenderer content={content} />
      </CardContent>
    </Card>
  );
}