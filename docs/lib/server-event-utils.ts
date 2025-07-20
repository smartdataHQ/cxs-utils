import { readFile, writeFile, readdir } from 'fs/promises';
import { join } from 'path';
import { SemanticEvent } from '@/lib/types/event-bible';
import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

const gemini = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

async function getAllMdocFiles(dirPath: string): Promise<string[]> {
  const dirents = await readdir(dirPath, { withFileTypes: true });
  const files = await Promise.all(dirents.map(async (dirent) => {
    const res = join(dirPath, dirent.name);
    if (dirent.isDirectory()) {
      return getAllMdocFiles(res);
    } else if (res.endsWith('.mdoc')) {
      return res;
    }
    return [];
  }));
  return Array.prototype.concat(...files);
}


async function generateMdocContent(event: SemanticEvent, useGemini: boolean = false): Promise<string> {
  if (useGemini && !gemini) {
    throw new Error("Gemini API key not configured. Please set the GEMINI_API_KEY environment variable.");
  }
  if (!useGemini && !openai) {
    throw new Error("OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable.");
  }

  const templatePath = join(process.cwd(), 'data/event-bible/documentation/template.mdoc');
  const template = await readFile(templatePath, 'utf8');
  const schemaPath = join(process.cwd(), '../cxs/schema/pydantic/semantic_event.py');
  const schema = await readFile(schemaPath, 'utf8');

  const schemaDocsPath = join(process.cwd(), 'app/docs/semantic-events');
  const mdocFiles = await getAllMdocFiles(schemaDocsPath);
  let mdocsContent = '';
  let documents = []
  for (const file of mdocFiles) {
    const content = await readFile(file, 'utf8');

    const url = '/docs/semantic-events' + file.replace(schemaDocsPath, '').replace(/\.mdoc$/, '');
    const headerMatch = content.match(/---\n([\s\S]+?)\n---/);
    let title = 'Documentation';
    let description = '';
    if (headerMatch) {
      const headerContent = headerMatch[1];
      const titleMatch = headerContent.match(/title:\s*(.+)/);
      const descriptionMatch = headerContent.match(/description:\s*(.+)/);
      if (titleMatch) {
        title = titleMatch[1].trim();
      }
      if (descriptionMatch) {
        description = descriptionMatch[1].trim();
      }
    }
    const doc_inventory = { 'title': title, 'description': description, 'url': url };
    console.log(doc_inventory)
    documents.push(doc_inventory);
    mdocsContent += `\n\n---\n\n${content}`;
  }

  const prompt = `
Based on the following event data and schema, generate a Markdoc file content:

When writing documentation, you are governed by this schema:
"""
${schema}
"""

When writing documentation, you are bound by this documentation:
"""
${mdocsContent}
"""

When referencing the documentation, you must use this information to create links:
"""
${documents}
"""

You need to write markdown documentation for the following Semantic Event:
"""
Event Name: ${event.name}
Description: ${event.description}
Category: ${event.category}
Domain: ${event.domain}
Topic: ${event.topic}
Aliases: ${JSON.stringify(event.aliases)}
Preferred attributes names: ${event.extraCategoryAttributes}, ${event.extraDomainAttributes}
"""

Documentation principles:
- Use the jitsu client v2 when creating examples. You must only include properties that the client does not add it self.
- Examine all product properties and how they can be relevant when the product structure is being used. Be true to the naming conventions of "Hospitality and Travel"
- In Products, units is always a multiplier of what you pay for. Make sure that the examples are according to the schema and the jitsu track client.
- You must always use dimensions for all low-cardinality properties you use in examples. Use 'properties' schema for other properties.
- You must always use metrics for numerical properties you use in examples.
- you must always use the dedicated context objects when examples involves them
- you must escape all code section with like this: \`\`\`javascript or \`\`\`python or \`\`\`json or \`\`\`html, depending on the code type.
- Never use personal data in examples when not using the 'traits' structure in dedicated events.
- Before creating any properties, dimensions or metrics you must make sure that there are no standard properties meant for that same use. Using declared properties is always better than creating generic ones.

You must NEVER escaped your output as markdown content.
Use this template while writing the mdoc/markdown documentation content:
"""
${template}
"""

`;

  if (useGemini) {
    const model = gemini!.getGenerativeModel({ model: "gemini-2.5-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || '';
  } else {
    const response = await openai!.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.7,
    });

    return response.choices[0].message.content || '';
  }
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

export async function getEventDocumentation(slug: string, useGemini?: boolean): Promise<string | null> {
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
          console.log(`Fetching Event Documentation for ${event.name}...`);
          // Use specified model or try Gemini first if available, fallback to OpenAI
          const shouldUseGemini = useGemini !== undefined ? useGemini : !!gemini;
          const newContent = await generateMdocContent(event, shouldUseGemini);
          await writeFile(docPath, newContent, 'utf8');
          console.log(`Successfully generated and saved documentation for ${slug} using ${shouldUseGemini ? 'Gemini' : 'OpenAI'}.`);
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

export async function getEventDocumentationWithStatus(slug: string, useGemini?: boolean): Promise<{
  content: string | null;
  isGenerating: boolean;
  error?: string;
}> {
  const docPath = join(process.cwd(), 'data/event-bible/documentation', `${slug}.mdoc`);

  try {
    const content = await readFile(docPath, 'utf8');
    return { content: content.trim(), isGenerating: false };
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File not found, try to generate it
      console.log(`Documentation for ${slug} not found. Attempting to generate...`);
      const events = await getEvents();
      const event = events.find(e => e.topic === slug || (e.aliases && e.aliases.some(a => a.topic === slug)));

      if (event) {
        try {
          console.log(`Fetching Event Documentation for ${event.name}...`);
          // Use specified model or try Gemini first if available, fallback to OpenAI
          const shouldUseGemini = useGemini !== undefined ? useGemini : !!gemini;
          const newContent = await generateMdocContent(event, shouldUseGemini);
          await writeFile(docPath, newContent, 'utf8');
          console.log(`Successfully generated and saved documentation for ${slug} using ${shouldUseGemini ? 'Gemini' : 'OpenAI'}.`);
          return { content: newContent, isGenerating: false };
        } catch (generationError) {
          console.error(`Failed to generate documentation for ${slug}:`, generationError);
          return {
            content: null,
            isGenerating: false,
            error: `Failed to generate documentation: ${generationError instanceof Error ? generationError.message : 'Unknown error'}`
          };
        }
      } else {
        console.log(`No event found for slug ${slug}, cannot generate documentation.`);
        return {
          content: null,
          isGenerating: false,
          error: `No event found for slug ${slug}`
        };
      }
    } else {
      console.error(`Error reading documentation file for ${slug}:`, error);
      return {
        content: null,
        isGenerating: false,
        error: `Error reading documentation file: ${error.message}`
      };
    }
  }
}

export async function hasDocumentation(slug: string): Promise<boolean> {
  const content = await getEventDocumentation(slug, true);
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

// Utility functions for model availability and selection
export function getAvailableModels(): { openai: boolean; gemini: boolean } {
  return {
    openai: !!openai,
    gemini: !!gemini
  };
}

export function getPreferredModel(): 'gemini' | 'openai' | null {
  if (gemini) return 'gemini';
  if (openai) return 'openai';
  return null;
}

// Direct model-specific generation functions
export async function generateDocumentationWithGemini(event: SemanticEvent): Promise<string> {
  if (!gemini) {
    throw new Error("Gemini API key not configured. Please set the GEMINI_API_KEY environment variable.");
  }
  return generateMdocContent(event, true);
}

export async function generateDocumentationWithOpenAI(event: SemanticEvent): Promise<string> {
  if (!openai) {
    throw new Error("OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable.");
  }
  return generateMdocContent(event, false);
}