import Prism from 'prismjs';
import React, {useRef, useEffect, useState} from 'react';

export function CodeBlock({children, 'data-language': language}) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (ref.current) {
      Prism.highlightElement(ref.current, false);
    }
  }, [children]);

  const handleCopy = async () => {
    if (ref.current?.textContent) {
      try {
        await navigator.clipboard.writeText(ref.current.textContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      } catch (err) {
        console.error('Failed to copy text: ', err);
        // You could add more user-friendly error handling here
      }
    }
  };

  return (
    <div className="code" aria-live="polite">
      <button onClick={handleCopy} className="copy-button">
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <pre
        ref={ref}
        className={`language-${language}`}
      >
        {children}
      </pre>
      <style jsx>
        {`
          .code {
            position: relative;
            margin-bottom: 1.5em; /* Added margin to prevent overlap with content below */
          }

          .copy-button {
            position: absolute;
            top: 0.5em;
            right: 0.5em;
            background: #eaeaea;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 0.3em 0.6em;
            cursor: pointer;
            font-size: 0.8em;
            color: #333;
            z-index: 1; /* Ensure button is above the pre block's scrollbar if any */
          }

          .copy-button:hover {
            background: #dcdcdc;
          }

          .copy-button:active {
            background: #cecece;
          }

          /* Override Prism styles */
          .code :global(pre[class*='language-']) {
            text-shadow: none;
            border-radius: 4px;
            padding-top: 2.5em; /* Add padding to top to make space for the button */
          }
        `}
      </style>
    </div>
  );
}
