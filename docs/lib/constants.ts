/**
 * Application-wide constants
 * This centralizes configuration values used throughout the app
 */

export const APP_CONFIG = {
  name: 'ContextSuite',
  description: 'Semantic Events Documentation',
  version: '1.0.0',
  author: 'ContextSuite Team',
} as const;

export const ROUTES = {
  home: '/',
  docs: '/docs',
  entities: '/docs/entities',
  semanticEvents: '/docs/semantic-events',
  validation: '/docs/semantic-events/validation',
  gettingStarted: '/docs/semantic-events/getting-started',
} as const;

export const EXTERNAL_LINKS = {
  github: 'https://github.com/contextsuite',
  website: 'https://contextsuite.com',
  support: 'mailto:support@contextsuite.com',
} as const;

export const THEME_CONFIG = {
  defaultTheme: 'system',
  enableSystem: true,
  disableTransitionOnChange: true,
} as const;