import React, { ReactNode } from 'react';

// SVG Icon Components (simple examples)
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="callout-icon">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
  </svg>
);

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="callout-icon">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const LightbulbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="callout-icon">
    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 14.95a1 1 0 001.414 1.414l.707-.707a1 1 0 00-1.414-1.414l-.707.707zM4 10a1 1 0 01-1-1V7a1 1 0 112 0v2a1 1 0 01-1 1zM15 9.5A1.5 1.5 0 0113.5 11H11V9.5a2.5 2.5 0 00-5 0V11H3.5A1.5 1.5 0 012 9.5V8a1 1 0 011-1h12a1 1 0 011 1v1.5zM8 13a1 1 0 001 1h2a1 1 0 001-1v-1a1 1 0 011-1h2.158a1 1 0 01.832 1.536l-1.876 3.127A3.125 3.125 0 0113.125 18H6.875a3.125 3.125 0 01-2.814-2.337l-1.875-3.127A1 1 0 013.014 11H5a1 1 0 011 1v1z" />
  </svg>
);

const ExclamationIcon = () => ( // Or a Bell icon could be used for "important"
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="callout-icon">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm-1-5a1 1 0 100 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
  </svg>
);


interface CalloutProps {
  title?: string;
  children: ReactNode;
  type?: 'note' | 'warning' | 'tip' | 'important' | 'default';
}

export function Callout({ title, children, type = 'default' }: CalloutProps) {
  const typeClass = `callout-${type}`;

  const IconComponent = () => {
    switch (type) {
      case 'note':
        return <InfoIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'tip':
        return <LightbulbIcon />;
      case 'important':
        return <ExclamationIcon />;
      default:
        return null;
    }
  };

  return (
    <div className={`callout ${typeClass}`}>
      <div className="callout-header">
        <IconComponent />
        {title && <strong>{title}</strong>}
      </div>
      <div className="callout-content">
        {children}
      </div>
      <style jsx>
        {`
          .callout {
            display: flex;
            flex-direction: column;
            margin: 1.5em 0;
            padding: 1rem 1.25rem;
            border: 1px solid var(--border-color);
            border-left-width: 4px;
            border-radius: 4px;
            background-color: var(--code-bg, #f9fafb); /* Default background similar to code blocks */
          }

          .callout-header {
            display: flex;
            align-items: center;
            font-weight: 600;
            margin-bottom: 0.5em;
          }

          /* Icon styling is done via the .callout-icon class on SVGs */

          .callout-content :global(p:first-child) {
            margin-top: 0;
          }
          .callout-content :global(p:last-child) {
            margin-bottom: 0;
          }

          .callout-default {
            border-left-color: var(--border-color);
          }
          .callout-note {
            border-left-color: var(--note-color, #3b82f6);
            background-color: var(--note-bg-color, #eff6ff);
          }
          .callout-note :global(.callout-icon) {
            color: var(--note-color, #3b82f6);
          }
           .callout-note .callout-header strong {
            color: var(--note-text-color, var(--note-color, #3b82f6));
          }


          .callout-warning {
            border-left-color: var(--warning-color, #f97316);
            background-color: var(--warning-bg-color, #fff7ed);
          }
          .callout-warning :global(.callout-icon) {
            color: var(--warning-color, #f97316);
          }
          .callout-warning .callout-header strong {
            color: var(--warning-text-color, var(--warning-color, #f97316));
          }

          .callout-tip {
            border-left-color: var(--tip-color, #10b981);
            background-color: var(--tip-bg-color, #f0fdf4);
          }
           .callout-tip :global(.callout-icon) {
            color: var(--tip-color, #10b981);
          }
          .callout-tip .callout-header strong {
            color: var(--tip-text-color, var(--tip-color, #10b981));
          }

          .callout-important {
            border-left-color: var(--important-color, #ef4444);
            background-color: var(--important-bg-color, #fef2f2);
          }
          .callout-important :global(.callout-icon) {
            color: var(--important-color, #ef4444);
          }
          .callout-important .callout-header strong {
            color: var(--important-text-color, var(--important-color, #ef4444));
          }
        `}
      </style>
      {/* Global style for icons, as JSX style can't easily target SVG children for fill/stroke */}
      <style jsx global>{`
        .callout-icon {
          width: 1.25em;
          height: 1.25em;
          margin-right: 0.5em;
          /* Fill/stroke is set by specific type color above */
        }
      `}</style>
    </div>
  );
}
