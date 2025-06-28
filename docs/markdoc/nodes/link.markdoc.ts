import { Tag, nodes } from '@markdoc/markdoc';

// Helper function to determine if a URL is external
function isExternalUrl(url: string | undefined, base_url?: string): boolean {
  if (!url) return false;
  if (url.startsWith('#') || url.startsWith('/')) return false; // Anchor links or relative paths are not external

  try {
    const linkUrl = new URL(url);
    if (base_url) {
      const baseUrlHostname = new URL(base_url).hostname;
      return linkUrl.hostname !== baseUrlHostname;
    }
    // If no base_url is provided, consider any absolute http/https link as external
    return linkUrl.protocol === 'http:' || linkUrl.protocol === 'https:';
  } catch (e) {
    // Invalid URL, treat as not external
    return false;
  }
}

export const link = {
  ...nodes.link, // Spread the default link node configuration
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);

    // TODO: Get current site's base URL from config if available
    // For now, we'll treat all absolute URLs as potentially external
    // const siteBaseUrl = config.variables?.site?.base_url;

    let isExternal = false;
    if (attributes.href && typeof attributes.href === 'string') {
      // A simple check: if it starts with http/https, it's external.
      // A more robust check would compare against a known list of internal hostnames or a base URL.
      if (attributes.href.startsWith('http://') || attributes.href.startsWith('https://')) {
        isExternal = true;
        // Example of how you might use a base_url if it was available in Markdoc config variables
        // isExternal = isExternalUrl(attributes.href, config.variables?.siteConfig?.baseUrl);
      }
    }

    if (isExternal) {
      attributes.target = '_blank';
      attributes.rel = 'noopener noreferrer';
      // Optionally, add a class for styling external links (e.g., adding an icon)
      // attributes.class = attributes.class ? `${attributes.class} external-link` : 'external-link';
    }

    return new Tag('a', attributes, children);
  },
};
