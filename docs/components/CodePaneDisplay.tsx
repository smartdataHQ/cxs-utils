import React from 'react';
import { useAsideContent } from './context/AsideContentContext';

const CodePaneDisplay: React.FC = () => {
  const { asideContent } = useAsideContent();

  if (!asideContent) {
    // If there's no aside content, render a div that takes up space but is invisible
    // This helps simplify the flexbox layout in _app.tsx by not having to conditionally change layout structure,
    // only content visibility. Alternatively, it could return null and _app.tsx could adjust.
    // For a fixed-width column design, it's often easier if the element is always there.
    // However, if we want main content to expand, returning null is better.
    // Given the flex-grow on main-content-wrapper, returning null is fine.
    return null;
  }

  return (
    <aside className="code-pane">
      <div className="code-pane-inner">
        {asideContent}
      </div>
      <style jsx>{`
        .code-pane {
          flex: 0 0 auto; /* Do not grow, do not shrink, basis is auto (or a fixed width) */
          width: clamp(300px, 35%, 450px); /* Responsive width: min 300px, preferred 35%, max 450px */
          height: calc(100vh - var(--top-nav-height)); /* Full height of the viewport below top nav */
          position: sticky; /* Sticky positioning */
          top: var(--top-nav-height); /* Stick to the bottom of the top nav */
          border-left: 1px solid var(--border-color);
          background-color: var(--code-pane-bg, #f7f7f7); /* Use CSS variable for theming */
          padding-top: 1.5rem; /* Match main content padding */
        }
        .code-pane-inner {
            height: 100%;
            overflow-y: auto; /* Allow scrolling within the pane */
            padding-right: 1.5rem; /* Match main content padding */
            padding-left: 1.5rem; /* Match main content padding */
            padding-bottom: 1.5rem; /* Match main content padding */
        }

        /* Styling for Markdoc components when they appear in the aside pane */
        .code-pane :global(pre[class*='language-']) {
          margin-top: 0;
          margin-bottom: 1em;
          /* Potentially adjust font size or other properties for the pane */
        }
        .code-pane :global(.tabs) { /* Example if you have a .tabs class on your Tabs component */
          margin-bottom: 1em;
        }
        /* Add more specific styling for tabs, codeblocks etc. if needed */

        @media (max-width: 1024px) { /* Adjust breakpoint as needed */
          .code-pane {
            display: none; /* Hide code pane on smaller screens */
          }
        }
      `}</style>
    </aside>
  );
};

export default CodePaneDisplay;
