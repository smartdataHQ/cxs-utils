import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Database,
  Users,
  Globe,
  Code,
  Book,
  BarChart3,
  Zap,
  GitFork,
  ShoppingCart,
  Shirt,
  Boxes, DollarSign, Theater, ReceiptEuro, Radar
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { MarkdocRenderer } from '@/components/markdoc/markdoc-renderer';
import { readMarkdocContent, getMarkdocPath } from '@/lib/markdoc-utils';

export default function DocsHome() {
  let markdocContent = '';
  try {
    const markdocPath = getMarkdocPath( 'app/docs/semantic-events/schema');
    markdocContent = readMarkdocContent(markdocPath);
  } catch (error) {
  }

  const features = [
    {
      icon: GitFork,
      title: "Entity Linking",
      description: "Link to involved entities, both explicitly and implicitly.",
      color: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
      url: "./schema/involves"
    },
    {
      icon: ShoppingCart,
      title: "eCommerce",
      description: "Cover all aspects of eCommerce.",
      color: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
      url: "./schema/commerce"
    },
    {
      icon: Shirt,
      title: "Products",
      description: "Extended Products.",
      color: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
      url: "./schema/products"
    },
    {
      icon: Boxes,
      title: "Traits",
      description: "Extended user and product traits.",
      color: "bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400",
      url: "./schema/traits"
    },
    {
      icon: Radar,
      title: "Location",
      description: "Entity sentiment analysis for events.",
      color: "bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400",
      url: "./schema/location"
    },
    {
      icon: ReceiptEuro,
      title: "Context",
      description: "Standard Context properties for events.",
      color: "bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400",
      url: "./schema/context"
    },
    {
      icon: Boxes,
      title: "Classification",
      description: "Extendable classification properties.",
      color: "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400",
      url: "./schema/classification"
    },
    {
      icon: Theater,
      title: "Sentiment Analysis",
      description: "Entity sentiment analysis for events.",
      color: "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400",
      url: "./schema/sentiment"
    },
    {
      icon: ReceiptEuro,
      title: "Analysis Cost",
      description: "Track the cost of analysis for events.",
      color: "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400",
      url: "./schema/cost"
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Markdoc Content */}
      <div className="mx-auto max-w-7xl md:py-16 lg:px-8">
          <MarkdocRenderer content={markdocContent} />
      </div>
      {/* Features Grid */}
      <div className="mx-auto max-w-7xl px-6 pt-24 pb-6 md:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Semantic Business Events
          </h2>
          <h4 className="text-1xl font-semibold tracking-tight text-gray-700 dark:text-gray-300 sm:text-2xl mt-4">
            The Main Event Components
          </h4>
        </div>
        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl"><Link href={feature.url}>{feature.title}</Link></CardTitle>
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
    </div>
  );
}