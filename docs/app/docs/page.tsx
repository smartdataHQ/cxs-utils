import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Database, Users, Globe, Code, Book, BarChart3, Zap } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { MarkdocRenderer } from '@/components/markdoc/markdoc-renderer';
import { readMarkdocContent, getMarkdocPath } from '@/lib/markdoc-utils';

export default function DocsHome() {
  // Read the main docs content from the .mdoc file
  const markdocPath = getMarkdocPath('app/docs');
  const markdocContent = readMarkdocContent(markdocPath);

  const features = [
    {
      icon: Activity,
      title: "Semantic Events",
      description: "Standardized event tracking system that captures meaningful business interactions with rich context and metadata.",
      color: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
    },
    {
      icon: Database,
      title: "Comprehensive Schema",
      description: "Flexible, extensible schema supporting commerce, content, travel, real estate, and custom industry verticals.",
      color: "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400"
    },
    {
      icon: Users,
      title: "Entity Management",
      description: "Advanced entity identification and role management system for tracking users, products, and business objects.",
      color: "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400"
    },
    {
      icon: Globe,
      title: "Multi-Industry Support",
      description: "Pre-built event schemas for eCommerce, travel, real estate, automotive, B2B, and subscription businesses.",
      color: "bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400"
    },
    {
      icon: Code,
      title: "Developer Friendly",
      description: "Rich APIs, SDKs, and comprehensive documentation with validation tools and best practices.",
      color: "bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400"
    },
    {
      icon: BarChart3,
      title: "Analytics Ready",
      description: "Events designed for analytics, reporting, and machine learning with built-in dimensions and metrics.",
      color: "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
    }
  ];

  const quickLinks = [
    { 
      title: "Introduction to Semantic Events", 
      href: ROUTES.semanticEvents, 
      description: "Learn the fundamentals of semantic event tracking and why it matters",
      icon: Activity
    },
    { 
      title: "Getting Started", 
      href: ROUTES.gettingStarted, 
      description: "Quick start guide to implementing semantic events in your application",
      icon: Zap
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Markdoc Content */}
      <div className="markdoc-content max-w-none mb-16">
        <MarkdocRenderer content={markdocContent} />
      </div>

      {/* Features Grid */}
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Comprehensive Event Tracking for Modern Applications
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Build better products with standardized, semantic event tracking that provides rich context 
            and meaningful insights across all your business interactions.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-gray-50 dark:bg-gray-900 px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Start Your Journey
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Jump into the most important sections to understand and implement semantic events.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {quickLinks.map((link) => (
              <Card key={link.title} className="hover:shadow-md transition-all duration-200 group">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 group-hover:from-blue-100 group-hover:to-purple-100 dark:group-hover:from-blue-900 dark:group-hover:to-purple-900 transition-colors">
                      <link.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle>
                      <Link 
                        href={link.href}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                      >
                        {link.title}
                      </Link>
                    </CardTitle>
                  </div>
                  <CardDescription className="mt-2">{link.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-16 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Implement Semantic Events?
          </h2>
          <p className="mt-6 text-lg leading-8 text-blue-100">
            Start tracking meaningful business interactions with our comprehensive event schemas and best practices.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg" variant="secondary">
              <Link href={ROUTES.gettingStarted}>
                Start Implementation
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-blue-600">
              <Link href="/docs/integrations">
                View Integrations
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}