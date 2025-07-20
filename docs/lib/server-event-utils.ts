import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { SemanticEvent } from '@/lib/types/event-bible';
import { OpenAI } from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

async function generateMdocContent(event: SemanticEvent): Promise<string> {
  if (!openai) {
    throw new Error("OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable.");
  }

  const templatePath = join(process.cwd(), 'docs/data/event-bible/documentation/template.mdoc');
  const template = await readFile(templatePath, 'utf8');
  const schemaPath = join(process.cwd(), 'cxs/schema/pydantic/semantic_event.py');
  const schema = await readFile(schemaPath, 'utf8');

  const prompt = `
Based on the following event data and schema, generate a Markdoc file content:

Event Name: ${event.name}
Description: ${event.description}
Category: ${event.category}
Domain: ${event.domain}
Topic: ${event.topic}
Aliases: ${JSON.stringify(event.aliases)}

Schema:
${schema}

Use this template and fill in the placeholders:
${template}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0].message.content || '';
}

// Server-side utilities for event bible

// Generate slug for mdoc file lookup
export function generateEventSlug(event: SemanticEvent): string {
  // Convert event name to snake_case and create slug pattern: domain.category.event_name
  const eventName = event.name.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '');

  // Handle domain as string or array - use first domain if array
  const domainValue = Array.isArray(event.domain) ? event.domain[0] : event.domain;
  const domain = domainValue.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '');

  const category = event.category.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '');
  return `${domain}.${category}.${eventName}`;
}

export async function getEvents(): Promise<SemanticEvent[]> {
  const eventsPath = join(process.cwd(), 'data/event-bible/events.json');
  const eventsData = await readFile(eventsPath, 'utf8');
  const { events } = JSON.parse(eventsData);
  return events;
}

export async function getEventBySlug(eventSlug: string[]): Promise<SemanticEvent | null> {
  const events = await getEvents();
  const slug = eventSlug.join('.');
  
  // First try to match by topic (which is the primary slug format)
  let event = events.find(event => event.topic === slug);
  
  // If not found, try to match by alias topics
  if (!event) {
    event = events.find(event => 
      event.aliases && event.aliases.some(alias => alias.topic === slug)
    );
  }
  
  // If still not found, try to match by generated slug as fallback
  if (!event) {
    event = events.find(event => {
      const generatedSlug = generateEventSlug(event);
      return generatedSlug === slug;
    });
  }
  
  return event || null;
}

export async function getEventWithAliasInfo(eventSlug: string[]): Promise<{
  event: SemanticEvent | null;
  isAlias: boolean;
  aliasInfo?: { name: string; vertical: string; topic: string, description: string };
}> {
  const events = await getEvents();
  const slug = eventSlug.join('.');
  
  // First try to match by topic (which is the primary slug format)
  let event = events.find(event => event.topic === slug);
  if (event) {
    return { event, isAlias: false };
  }
  
  // Try to match by alias topics
  for (const eventItem of events) {
    if (eventItem.aliases) {
      const matchingAlias = eventItem.aliases.find(alias => alias.topic === slug);
      if (matchingAlias) {
        return { 
          event: eventItem, 
          isAlias: true, 
          aliasInfo: matchingAlias
        };
      }
    }
  }
  
  // If still not found, try to match by generated slug as fallback
  event = events.find(event => {
    const generatedSlug = generateEventSlug(event);
    return generatedSlug === slug;
  });
  
  return { event: event || null, isAlias: false };
}

export async function getEventDocumentation(slug: string): Promise<string | null> {
  const docPath = join(process.cwd(), 'data/event-bible/documentation', `${slug}.mdoc`);

  try {
    const content = await readFile(docPath, 'utf8');
    return content.trim();
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File not found, try to generate it
      console.log(`Documentation for ${slug} not found. Attempting to generate...`);
      const events = await getEvents();
      const event = events.find(e => e.topic === slug || (e.aliases && e.aliases.some(a => a.topic === slug)));

      if (event) {
        try {
          const newContent = await generateMdocContent(event);
          await writeFile(docPath, newContent, 'utf8');
          console.log(`Successfully generated and saved documentation for ${slug}.`);
          return newContent;
        } catch (generationError) {
          console.error(`Failed to generate documentation for ${slug}:`, generationError);
          return null;
        }
      } else {
        console.log(`No event found for slug ${slug}, cannot generate documentation.`);
        return null;
      }
    } else {
      console.error(`Error reading documentation file for ${slug}:`, error);
      return null;
    }
  }
}

export async function hasDocumentation(slug: string): Promise<boolean> {
  const content = await getEventDocumentation(slug);
  return content !== null;
}

export async function getEventsWithDocumentation(): Promise<(SemanticEvent & { hasDocumentation: boolean })[]> {
  const events = await getEvents();
  
  return await Promise.all(
    events.map(async (event) => {
      const slug = generateEventSlug(event);
      const hasDocs = await hasDocumentation(slug);
      return { ...event, hasDocumentation: hasDocs };
    })
  );
}

export function generateStaticParams(): { eventSlug: string[] }[] {
  // This would be called at build time
  // For now, return empty array - you'd populate this with actual event slugs
  return [];
}

export async function generateAllStaticParams(): Promise<{ eventSlug: string[] }[]> {
  const events = await getEvents();
  
  const params: { eventSlug: string[] }[] = [];
  
  events.forEach(event => {
    // Add the primary event topic
    params.push({
      eventSlug: event.topic.split('.')
    });
    
    // Add alias topics if they exist
    if (event.aliases && event.aliases.length > 0) {
      event.aliases.forEach(alias => {
        if (alias.topic) {
          params.push({
            eventSlug: alias.topic.split('.')
          });
        }
      });
    }
  });
  
  return params;
}