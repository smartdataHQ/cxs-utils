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
  Eye,
  Filter,
  BarChart3,
  Workflow,
  Car,
  ShoppingCart,
  Package,
  Calendar,
  Music,
  Utensils,
  Cloud,
  Home,
  CreditCard,
  Plane,
  type LucideIcon
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
    title: 'Getting Started',
    items: [
      { 
        title: 'Introduction to Semantic Events', 
        href: '/docs', 
        icon: BookOpen 
      },
      { 
        title: 'Integrations', 
        href: '/docs/integrations', 
        icon: Globe 
      },
      { 
        title: 'Understanding Datapoints', 
        href: '/docs/datapoints', 
        icon: Database 
      },
      { 
        title: 'Understanding Entities', 
        href: '/docs/entities', 
        icon: Users, 
        children: [
          { 
            title: 'Entity Identification System', 
            href: '/docs/entities/identification', 
            icon: Target 
          },
          { 
            title: 'Entity Roles', 
            href: '/docs/entities/roles', 
            icon: Shield 
          },
        ]
      },
    ],
  },
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
        title: 'Events vs Timestamps', 
        href: '/docs/semantic-events/events-vs-timestamps', 
        icon: Clock 
      },
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
    title: 'Event Bible',
    items: [
      { title: 'The Event Bible', href: '/docs/semantic-events/bible', icon: Book },
      { title: 'Core Events', href: '/docs/semantic-events/bible/core-events', icon: Activity },
      { title: 'Events by Category', href: '/docs/semantic-events/bible/by-category', icon: Layers },
    ],
  },
  {
    title: 'Industry Events',
    items: [
      { title: 'Auctions & C2C Marketplaces', href: '/docs/semantic-events/bible/auctions-and-c2c-marketplaces', icon: ShoppingCart },
      { title: 'Automotive & Mobility', href: '/docs/semantic-events/bible/automotive-and-mobility', icon: Car },
      { title: 'B2B Wholesale & Procurement', href: '/docs/semantic-events/bible/b2b-wholesale-and-procurement', icon: Package },
      { title: 'Digital Goods & Content', href: '/docs/semantic-events/bible/digital-goods-and-content', icon: Music },
      { title: 'Events & Ticketing', href: '/docs/semantic-events/bible/events-and-ticketing', icon: Calendar },
      { title: 'Food & Dining', href: '/docs/semantic-events/bible/food-and-dining', icon: Utensils },
      { title: 'Online Services', href: '/docs/semantic-events/bible/online-services', icon: Cloud },
      { title: 'Real Estate', href: '/docs/semantic-events/bible/real-estate', icon: Home },
      { title: 'Subscription Commerce', href: '/docs/semantic-events/bible/subscription-commerce', icon: CreditCard },
      { title: 'Travel & Hospitality', href: '/docs/semantic-events/bible/travel-and-hospitality', icon: Plane },
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
];