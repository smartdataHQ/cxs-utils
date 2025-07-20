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

  const fetchDocumentation = async () => {
    if (content) return; // Don't fetch if we already have content
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/event-documentation/${slug}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch documentation');
      }

      setContent(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const retryFetch = () => {
    setContent(null);
    fetchDocumentation();
  };

  useEffect(() => {
    if (!initialContent) {
      fetchDocumentation();
    }
  }, [slug, initialContent]);

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
                <p className="text-lg font-medium">Fetching Latest Documentation</p>
                <p className="text-sm text-muted-foreground">
                  Loading comprehensive documentation for <strong>{eventName}</strong>...
                </p>
                <p className="text-xs text-muted-foreground">
                  This may take a few moments as we retrieve the latest implementation guidance.
                </p>
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={retryFetch}
            className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Loading Documentation
          </Button>
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