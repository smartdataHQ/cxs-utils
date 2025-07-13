import Markdoc, { Config } from '@markdoc/markdoc';

const config: Config = {
  tags: {
    callout: {
      render: 'Callout',
      attributes: {
        type: {
          type: String,
          default: 'info',
          matches: ['info', 'warning', 'success', 'error'],
          errorLevel: 'critical',
        },
        title: {
          type: String,
        },
      },
    },
  },
  nodes: {
    document: {
      render: undefined, // Don't render document wrapper
    },
    heading: {
      render: 'Heading',
      attributes: {
        level: { type: Number, required: true },
        id: { type: String },
      },
    },
    paragraph: {
      render: 'p',
    },
    list: {
      render: 'List',
    },
    item: {
      render: 'li',
    },
    blockquote: {
      render: 'blockquote',
    },
    code: {
      render: 'code',
    },
    fence: {
      render: 'CodeBlock',
      attributes: {
        language: { type: String },
        title: { type: String },
      },
    },
    table: {
      render: 'table',
      attributes: {
        className: { type: String, default: 'w-full border-collapse border border-border' },
      },
    },
    thead: {
      render: 'thead',
    },
    tbody: {
      render: 'tbody',
    },
    tr: {
      render: 'tr',
    },
    th: {
      render: 'th',
      attributes: {
        scope: { type: String, default: 'col' },
        className: { type: String, default: 'border border-border px-4 py-2 text-left font-semibold' },
      },
    },
    td: {
      render: 'td',
      attributes: {
        className: { type: String, default: 'border border-border px-4 py-2' },
      },
    },
    link: {
      render: 'a',
      attributes: {
        href: { type: String, required: true },
        title: { type: String },
      },
    },
    strong: {
      render: 'strong',
    },
    em: {
      render: 'em',
    },
    hr: {
      render: 'hr',
    },
    image: {
      render: 'img',
      attributes: {
        src: { type: String, required: true },
        alt: { type: String },
        title: { type: String },
        className: { type: String, default: 'rounded-lg border my-6' },
      },
    },
  },
};

export default config;