import React from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';

const items = [
  {
    title: 'Core Concepts',
    links: [
        {href: '/docs/semantic-events', children: 'Introduction to Semantic Events'},
        {href: '/docs/semantic-events/events-vs-timestamps', children: 'Events as First-Class Citizens'},
        {href: '/docs/entities', children: 'Understanding Entities'},
        {href: '/docs/entities/roles', children: 'Entity Roles'},
        {href: '/docs/entities/identification', children: 'Entity Identification'},
    ],
  },
  {
    title: 'Implementation Guide',
    links: [
        {href: '/docs/semantic-events/getting-started', children: 'Getting Started'},
        {href: '/docs/semantic-events/best-practices', children: 'Best Practices'},
        {href: '/docs/semantic-events/core-functions', children: 'Core Functions'},
        {href: '/docs/semantic-events/validation', children: 'Event Validation'},
    ],
  },
  {
    title: 'Schema Reference',
    links: [
        {href: '/docs/semantic-events/schema', children: 'Semantic Events Schema'},
        {href: '/docs/semantic-events/schema/classification', children: 'Classification'},
        {href: '/docs/datapoints', children: 'DataPoints'},
    ],
  },
  {
    title: 'Event Bible',
    links: [
        {href: '/docs/semantic-events/bible', children: 'Introduction'},
        {href: '/docs/semantic-events/bible/core-events', children: 'Core Events'},
        {href: '/docs/semantic-events/bible/travel-and-hospitality', children: 'Travel & Hospitality'},
        // {href: '/docs/semantic-events/bible/events-and-ticketing', children: 'Events & Ticketing'},
        //  {href: '/docs/semantic-events/bible/food-and-dining', children: 'Food & Dining'},
        // {href: '/docs/semantic-events/bible/automotive-and-mobility', children: 'Automotivehref & Mobility}'},'':'',
        // {href: '/docs/semantic-events/bible/real-estate', children: 'Real Estate'},
        // {href: '/docs/semantic-events/bible/online-services', children: 'Online Services'},
        // {href: '/docs/semantic-events/bible/subscription-commerce', children: 'Subscription Commerce'},
        // {href: '/docs/semantic-events/bible/auctions-and-c2c-marketplaces', children: 'Auctions & C2C Marketplaces'},
        // {href: '/docs/semantic-events/bible/b2b-wholesale-and-procurement', children: 'B2B Wholesale & Procurement'},
        // {href: '/docs/semantic-events/bible/digital-goods-and-content', children: 'Digital Goods & Content'},
        // {href: '/docs/semantic-events/bible/by-category', children: 'By Category'},
    ],
  }
];

export function SideNav() {
  const router = useRouter();

  return (
    <nav className="sidenav">
      {items.map((item) => (
        <div key={item.title}>
          <span>{item.title}</span>
          <ul className="flex column">
            {item.links.map((link) => {
              const active = router.pathname === link.href;
              return (
                <li key={link.href} className={active ? 'active' : ''}>
                  <Link {...link} />
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <style jsx>
        {`
          nav {
            position: sticky;
            top: var(--top-nav-height);
            height: calc(100vh - var(--top-nav-height));
            flex: 0 0 auto;
            overflow-y: auto;
            padding: 2.5rem 2rem 2rem;
            border-right: 1px solid var(--border-color);
          }
          span {
            font-size: larger;
            font-weight: 500;
            padding: 0.5rem 0 0.5rem;
          }
          ul {
            padding: 0;
          }
          li {
            list-style: none;
            margin: 0;
          }
          li :global(a) {
            text-decoration: none;
          }
          li :global(a:hover),
          li.active :global(a) {
            text-decoration: underline;
          }
        `}
      </style>
    </nav>
  );
}
