'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { EventDetailPage } from '@/components/event-bible/event-detail-page';
import { SemanticEvent } from '@/lib/types/event-bible';
import { createClientAirtableService } from '@/lib/client-airtable-service';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { EventDetailSkeleton } from '@/components/common/loading-spinner';
import { AlertTriangle, BookOpen, ChevronLeft } from 'lucide-react';

export default function EventDetailPageRoute() {
  const router = useRouter();
  const params = useParams();
  const eventSlug = params?.eventId as string; // This is actually a slug now

  const [event, setEvent] = useState<SemanticEvent | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<SemanticEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [relatedEventsLoading, setRelatedEventsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Load main event data
  useEffect(() => {
    const loadEventData = async () => {
      if (!eventSlug) {
        setError('Invalid event slug');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setNotFound(false);
        
        const airtableService = createClientAirtableService();
        
        // Fetch the specific event by slug
        const eventData = await airtableService.fetchEventBySlug(eventSlug);
        
        if (!eventData) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setEvent(eventData);
        
      } catch (err: any) {
        console.error('Failed to load event:', err);
        setError(err.message || 'Failed to load event details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [eventSlug]);

  // Lazy load related events after main event is loaded
  useEffect(() => {
    const loadRelatedEvents = async () => {
      if (!event) return;

      try {
        setRelatedEventsLoading(true);
        const airtableService = createClientAirtableService();
        
        // Fetch all events to find related ones
        const allEvents = await airtableService.fetchAllEvents();
        const related = allEvents.filter(e => 
          e.airtable_id !== event.airtable_id && (
            e.category === event.category || 
            e.domain === event.domain
          )
        );
        setRelatedEvents(related);
      } catch (relatedError) {
        console.warn('Failed to load related events:', relatedError);
        // Continue without related events
        setRelatedEvents([]);
      } finally {
        setRelatedEventsLoading(false);
      }
    };

    loadRelatedEvents();
  }, [event]);

  // Handle navigation back to Event Bible
  const handleBack = () => {
    router.push('/docs/semantic-events/bible');
  };

  // Handle navigation to another event using topic slug
  const handleEventClick = (clickedEvent: SemanticEvent) => {
    router.push(`/docs/semantic-events/bible/${clickedEvent.topic}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <EventDetailSkeleton />
      </div>
    );
  }

  // Not found state
  if (notFound) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="h-8 px-2 hover:bg-accent"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Event Bible
          </Button>
        </div>

        <Card className="p-8 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The event with slug "{eventSlug}" could not be found.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>This might be because:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>The event ID is invalid or has been changed</li>
              <li>The event has been removed from Airtable</li>
              <li>There's a temporary issue with the data source</li>
            </ul>
          </div>
          <div className="mt-6">
            <Button onClick={handleBack}>
              Browse All Events
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="h-8 px-2 hover:bg-accent"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Event Bible
          </Button>
        </div>

        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            {error.includes('Airtable') && (
              <div className="mt-2">
                <p className="text-sm">
                  This might be due to:
                </p>
                <ul className="text-sm mt-1 ml-4 list-disc">
                  <li>Missing or invalid Airtable API configuration</li>
                  <li>Network connectivity issues</li>
                  <li>Airtable service temporarily unavailable</li>
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>

        <div className="text-center">
          <Button onClick={handleBack}>
            Back to Event Bible
          </Button>
        </div>
      </div>
    );
  }

  // Success state - render the event detail page
  if (!event) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <EventDetailPage
        event={event}
        relatedEvents={relatedEvents}
        relatedEventsLoading={relatedEventsLoading}
        onBack={handleBack}
        onEventClick={handleEventClick}
      />
    </div>
  );
}