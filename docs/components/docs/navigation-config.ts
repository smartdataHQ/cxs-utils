import {
  BookOpen,
  FileText,
  Settings,
  Code,
  Search,
  Globe,
  Zap,
  Shield,
  Users,
  Database,
  GitBranch,
  Activity,
  Target,
  CheckCircle,
  Clock,
  Book,
  Layers,
  Link as LinkIcon,
  Filter,
  BarChart3,
  Workflow,
  ShoppingCart,
  Cloud,
  type LucideIcon, Boxes, FastForward, FileSearch2, Component, SquarePlay, FileDown, CheckCheck, BookType
} from 'lucide-react';

export interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  children?: NavigationItem[];
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

/**
 * Centralized navigation configuration
 * This eliminates the hardcoded navigation in docs-sidebar.tsx
 * Only includes links to existing .mdoc files to prevent NEXT_NOT_FOUND errors
 */
export const navigationConfig: NavigationSection[] = [
  {
    title: 'Semantic Events',
    items: [
      { title: 'What are Semantic Events?', href: '/docs/semantic-events/understanding-semantic-events', icon: BookOpen},
      { title: 'Quick Start', href: '/docs/semantic-events/getting-started', icon: Zap, children: [
        { title: 'Installation', href: '/docs/semantic-events/installation', icon: FileDown}
      ]},
      { title: 'Event Types', href: '/docs/semantic-events/event-types', icon: BookType},
      { title: 'Advanced Concepts', href: '/docs/semantic-events/advanced-concepts', icon: Boxes},
      { title: 'Core Principles', href: '/docs/semantic-events/core-principles', icon: CheckCheck},
    ],
  },
  {
    title: "Examples",
    items: [
      { title: 'The shortcut to insights', href: '/docs/semantic-events/the-event-bible', icon: FastForward },
      { title: 'Event Bible', href: '/docs/semantic-events/bible', icon: FileSearch2, badge: 'Interactive' },
    ]
  },
  {
    title: "Schema Reference",
    items: [
      { title: 'Semantic Events', href: '/docs/semantic-events/schema', icon: Component, children: [
        { title: 'Analysis Cost', href: '/docs/semantic-events/schema/analysis-cost', icon: Code },
        { title: 'Classification', href: '/docs/semantic-events/schema/classification', icon: Code },
        { title: 'Commerce', href: '/docs/semantic-events/schema/commerce', icon: Code },
        { title: 'Content & Properties', href: '/docs/semantic-events/schema/content-and-properties', icon: Code },
        { title: 'Context', href: '/docs/semantic-events/schema/context', icon: Code },
        { title: 'Dimensions & Metrics (BI)', href: '/docs/semantic-events/schema/dimensions-and-metrics', icon: Code },
        { title: 'Entity Sentiment', href: '/docs/semantic-events/schema/sentiment', icon: Code },
        { title: 'Governance', href: '/docs/semantic-events/schema/governance', icon: Code },
        { title: 'Involves', href: '/docs/semantic-events/schema/involves', icon: Code },
        { title: 'Location', href: '/docs/semantic-events/schema/location', icon: Code },
        { title: 'Processing Controls', href: '/docs/semantic-events/schema/processing', icon: Code },
        { title: 'Products', href: '/docs/semantic-events/schema/products', icon: Code },
        { title: 'Root Event', href: '/docs/semantic-events/schema/root', icon: Code },
        { title: 'Traits', href: '/docs/semantic-events/schema/traits', icon: Code },
      ]},
    ]
  }
    /*
  {
    title: 'Semantic Events',
    items: [
      { 
        title: 'Introduction', 
        href: '/docs/semantic-events', 
        icon: Activity 
      },
      { 
        title: 'Getting Started', 
        href: '/docs/semantic-events/getting-started', 
        icon: Zap 
      },
      { 
        title: 'Event Bible', 
        href: '/docs/semantic-events/bible', 
        icon: Book,
        badge: 'Interactive'
      },
      // { title: 'Events vs Timestamps', href: '/docs/semantic-events/events-vs-timestamps', icon: Clock },
      { 
        title: 'Event Validation', 
        href: '/docs/semantic-events/validation', 
        icon: Shield 
      },
      { title: 'Best Practices', href: '/docs/semantic-events/best-practices', icon: CheckCircle },
      { title: 'Core Functions', href: '/docs/semantic-events/core-functions', icon: Code },
    ],
  },
  {
    title: 'Schema Reference',
    items: [
      { title: 'Complete Schema Reference', href: '/docs/semantic-events/schema/all', icon: Database, badge: 'Complete' },
      { title: 'Core Event Schema', href: '/docs/semantic-events/schema/core', icon: Activity },
      { title: 'Required & Automatic Properties', href: '/docs/semantic-events/schema/required', icon: CheckCircle },
      { title: 'Commerce Event Properties', href: '/docs/semantic-events/schema/commerce', icon: ShoppingCart },
      { title: 'Custom Event Properties', href: '/docs/semantic-events/schema/properties', icon: Settings },
    ],
  },
  {
    title: 'Schema Components',
    items: [
      { title: 'Application Information', href: '/docs/semantic-events/schema/applications', icon: Code },
      { title: 'Classification Properties', href: '/docs/semantic-events/schema/classification', icon: Filter },
      { title: 'Device & OS Information', href: '/docs/semantic-events/schema/devices', icon: Settings },
      { title: 'Event Content', href: '/docs/semantic-events/schema/content', icon: FileText },
      { title: 'Event Context Properties', href: '/docs/semantic-events/schema/context', icon: Layers },
      { title: 'Event Location Properties', href: '/docs/semantic-events/schema/location', icon: Globe },
      { title: 'Marketing Attribution', href: '/docs/semantic-events/schema/marketing', icon: BarChart3 },
      { title: 'User Traits in Event Context', href: '/docs/semantic-events/schema/traits', icon: Users },
      { title: 'Website Interaction Properties', href: '/docs/semantic-events/schema/websites', icon: Globe },
    ],
  },
  {
    title: 'Advanced Schema',
    items: [
      { title: 'Entity Linking in Events', href: '/docs/semantic-events/schema/linking', icon: LinkIcon },
      { title: 'Event Access Control', href: '/docs/semantic-events/schema/access', icon: Shield },
      { title: 'Event Data Retention', href: '/docs/semantic-events/schema/retention', icon: Clock },
      { title: 'Event Dimensions & Metrics', href: '/docs/semantic-events/schema/dimensions', icon: BarChart3 },
      { title: 'Event Forwarding Control', href: '/docs/semantic-events/schema/integrations', icon: Workflow },
      { title: 'Event Processing & Pipeline', href: '/docs/semantic-events/schema/processing', icon: GitBranch },
      { title: 'Event Sources & Services', href: '/docs/semantic-events/schema/services', icon: Cloud },
      { title: 'Internal Analysis & Processing', href: '/docs/semantic-events/schema/analysis', icon: BarChart3 },
      { title: 'Involved Entities & Roles', href: '/docs/semantic-events/schema/involves', icon: Users },
      { title: 'Sentiment Properties', href: '/docs/semantic-events/schema/sentiment', icon: Activity },
      { title: 'Understanding Event Enrichments', href: '/docs/semantic-events/schema/enrichments', icon: Zap },
    ],
  },
  {
    title: 'Schema Management',
    items: [
      { title: 'Schema Compatibility & Evolution', href: '/docs/semantic-events/schema/compatibility', icon: GitBranch },
      { title: 'Schema Design Considerations', href: '/docs/semantic-events/schema/comparison', icon: Search },
    ],
  },
  */
];