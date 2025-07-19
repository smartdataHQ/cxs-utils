import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { MarkdocRenderer } from '@/components/markdoc/markdoc-renderer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CodeBlock } from '@/components/markdoc/code-block';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  Calendar, 
  Tag, 
  Globe, 
  BookOpen,
  Code,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { 
  getEventBySlug,
  getEventWithAliasInfo,
  getEventDocumentation,
  generateAllStaticParams 
} from '@/lib/server-event-utils';

// Generate static params for all events
export async function generateStaticParams() {
  return await generateAllStaticParams();
}

interface PageProps {
  params: {
    eventSlug: string[];
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { event, isAlias, aliasInfo } = await getEventWithAliasInfo(params.eventSlug);
  
  if (!event) {
    return {
      title: 'Event Not Found',
      description: 'The requested event could not be found.'
    };
  }
  
  const domain = Array.isArray(event.domain) ? event.domain.join(', ') : event.domain;
  const displayName = isAlias && aliasInfo ? aliasInfo.name : event.name;
  const titleSuffix = isAlias && aliasInfo ? ` (${aliasInfo.vertical})` : '';
  
  return {
    title: `${displayName}${titleSuffix} - Event Documentation`,
    description: `${event.description} | Category: ${event.category} | Domain: ${domain}${isAlias && aliasInfo ? ` | ${aliasInfo.vertical} View` : ''}`,
    keywords: [
      displayName,
      event.name,
      event.category,
      domain,
      ...(isAlias && aliasInfo ? [aliasInfo.vertical] : []),
      'semantic events',
      'event tracking',
      'analytics'
    ].join(', ')
  };
}

export default async function EventDocumentationPage({ params }: PageProps) {
  const { event, isAlias, aliasInfo } = await getEventWithAliasInfo(params.eventSlug);
  
  if (!event) {
    notFound();
  }
  
  const slug = params.eventSlug.join('.');
  const mdocContent = await getEventDocumentation(slug);
  
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

  // Generate Jitsu code examples
  const basicExample = `// Basic event tracking
jitsu.track('${event.name.toLowerCase().replace(/\s+/g, '_')}', {
  // Event properties
  category: '${event.category}',
  domain: '${Array.isArray(event.domain) ? event.domain[0] : event.domain}',
  
  // Add your custom properties here
  // property_name: 'property_value',
});`;

  const advancedExample = `// Advanced event tracking with context
jitsu.track('${event.name.toLowerCase().replace(/\s+/g, '_')}', {
  // Core event properties
  category: '${event.category}',
  domain: '${Array.isArray(event.domain) ? event.domain[0] : event.domain}',
  
  // Context information
  user_id: 'user_123',
  session_id: 'session_456',
  
  // Custom properties based on your use case
  
}, {
  // Optional: Override default context
  page: {
    title: document.title,
    url: window.location.href
  },
  user: {
    // User context if available
  }
});`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/docs/semantic-events/bible">
          <Button variant="ghost" size="sm" className="h-8 px-2 hover:bg-accent">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Event Bible
          </Button>
        </Link>
        <span>/</span>
        {isAlias && aliasInfo ? (
          <>
            <Link href={`/docs/semantic-events/bible/${event.topic}`} className="hover:text-foreground">
              {event.name}
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">
              {aliasInfo.name} ({aliasInfo.vertical})
            </span>
          </>
        ) : (
          <span className="text-foreground font-medium">
            {event.name}
          </span>
        )}
      </div>

      {/* Event Header */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {isAlias && aliasInfo ? aliasInfo.name : event.name}
          </h1>
          <p className="text-lg text-muted-foreground">{isAlias && aliasInfo && aliasInfo.description ? aliasInfo.description : event.description}</p>
        </div>

        {/* Event Metadata */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline">{event.category}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Badge variant="secondary">
              {Array.isArray(event.domain) ? event.domain.join(', ') : event.domain}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Updated {formatDate(event.lastUpdated)}
            </span>
          </div>
        </div>

        {/* Aliases Navigation */}
        {event.aliases && event.aliases.length > 0 && (
          <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="text-lg">Available Versions</CardTitle>
              <CardDescription>
                This event has use-case specific versions. Choose the one that best matches your use case.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Core Event */}
                <div className={!isAlias ? "flex items-center justify-between p-3 border rounded-lg bg-accent/50 transition-colors" : "flex items-center justify-between p-3 border rounded-lg hover:bg-accent/25 transition-colors"}>
                  <Link href={`/docs/semantic-events/bible/${event.topic}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{event.name}</span>
                      <Badge variant="outline" className="text-xs"> Core Event</Badge>
                    </div>
                  </div>
                  </Link>
                </div>

                {/* Aliases */}
                {event.aliases.map((alias, index) => {
                  const isCurrentAlias = isAlias && aliasInfo?.topic === alias.topic;
                  return (
                    <div key={index} className={isCurrentAlias ? "flex items-center justify-between p-3 border rounded-lg bg-accent/50 transition-colors" : "flex items-center justify-between p-3 border rounded-lg hover:bg-accent/25 transition-colors"}>
                      <Link href={`/docs/semantic-events/bible/${alias.topic}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{alias.name}</span>
                          <Badge variant={"outline"} className="text-xs">{alias.vertical}</Badge>
                        </div>
                      </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
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
        </Card>
      )}

      {/* Event Documentation from mdoc file */}
      {mdocContent && (
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
            <MarkdocRenderer content={mdocContent} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}