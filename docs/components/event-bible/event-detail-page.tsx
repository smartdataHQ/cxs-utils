'use client';

import React, { useState } from 'react';
import { SemanticEvent } from '@/lib/types/event-bible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EventDocumentationLoader } from './event-documentation-loader';
import { 
  ChevronLeft, 
  Copy, 
  Check, 
  Calendar, 
  Tag, 
  Globe, 
  Link as LinkIcon,
  AlertTriangle
} from 'lucide-react';

interface EventDetailPageProps {
  event: SemanticEvent;
  relatedEvents?: SemanticEvent[];
  relatedEventsLoading?: boolean;
  onBack?: () => void;
  onEventClick?: (event: SemanticEvent) => void;
  eventSlug?: string;
}

export function EventDetailPage({ 
  event, 
  relatedEvents = [], 
  relatedEventsLoading = false,
  onBack,
  onEventClick,
  eventSlug
}: EventDetailPageProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Note: This component is now primarily used for non-main routes
  // The main event bible route uses server-side rendering
  const mdocContent = null;

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Filter related events by category or domain
  const filteredRelatedEvents = relatedEvents.filter(relatedEvent => 
    relatedEvent.airtable_id !== event.airtable_id && (
      relatedEvent.category === event.category || 
      relatedEvent.domain === event.domain
    )
  ).slice(0, 6);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-8 px-2 hover:bg-accent"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Event Bible
        </Button>
        <span>/</span>
        <span className="text-foreground font-medium">{event.name}</span>
      </div>

      {/* Event Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{event.name}</h1>
            <p className="text-lg text-muted-foreground">{event.description}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopy(event.name, 'eventName')}
            className="self-start"
          >
            {copiedField === 'eventName' ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            Copy Event Name
          </Button>
        </div>

        {/* Event Metadata */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline">{event.category}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Badge variant="secondary">{event.domain}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Updated {formatDate(event.lastUpdated)}
            </span>
          </div>
        </div>

        {/* Aliases */}
        {event.aliases.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Event Aliases</h3>
            <div className="flex flex-wrap gap-2">
              {event.aliases.map((alias, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {alias.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ({alias.vertical})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Deprecation Warning */}
      {event.deprecated && (
        <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <AlertTriangle className="h-5 w-5" />
              Deprecated Event
            </CardTitle>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              This event has been marked as deprecated and should not be used in new implementations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.deprecationReason && (
              <div>
                <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2">
                  Deprecation Reason
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  {event.deprecationReason}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {event.deprecationDate && (
                <div>
                  <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-1">
                    Deprecated On
                  </h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    {formatDate(event.deprecationDate)}
                  </p>
                </div>
              )}
              
              {event.replacementEvent && (
                <div>
                  <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-1">
                    Replacement Event
                  </h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    {event.replacementEvent}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-orange-100/50 dark:bg-orange-900/20 p-3 rounded-lg">
              <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2">
                Migration Recommendations
              </h4>
              <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                <li>• Avoid using this event in new implementations</li>
                <li>• Plan migration to the replacement event if available</li>
                <li>• Review existing implementations using this event</li>
                {event.replacementEvent && (
                  <li>• Update tracking calls to use "{event.replacementEvent}" instead</li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Documentation */}
      {eventSlug && (
        <EventDocumentationLoader 
          slug={eventSlug}
          eventName={event.name}
          initialContent={mdocContent}
        />
      )}

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <h4>Best Practices</h4>
            <ul>
              <li>Always include the required category and domain properties</li>
              <li>Add contextual information relevant to your use case</li>
              <li>Use consistent property naming across similar events</li>
              <li>Include user and session identifiers when available</li>
            </ul>

            <h4>Common Use Cases</h4>
            <p>
              This event is typically used in <strong>{event.domain}</strong> contexts
              for <strong>{event.category}</strong> related activities. Consider the
              specific requirements of your implementation when adding custom properties.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Related Events */}
      {(filteredRelatedEvents.length > 0 || relatedEventsLoading) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Related Events
              {relatedEventsLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent ml-2" />
              )}
            </CardTitle>
            <CardDescription>
              Other events in the same category or domain
            </CardDescription>
          </CardHeader>
          <CardContent>
            {relatedEventsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
                      <div className="h-4 bg-muted animate-pulse rounded w-full" />
                      <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                      <div className="flex gap-2">
                        <div className="h-5 bg-muted animate-pulse rounded w-16" />
                        <div className="h-5 bg-muted animate-pulse rounded w-20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRelatedEvents.map((relatedEvent) => (
                  <div
                    key={relatedEvent.airtable_id}
                    className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => onEventClick?.(relatedEvent)}
                  >
                    <div className="space-y-2">
                      <h4 className="font-medium">{relatedEvent.name}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {relatedEvent.description}
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {relatedEvent.category}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {relatedEvent.domain}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
}