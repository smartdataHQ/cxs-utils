import { Callout } from '../../components'; // Assuming Callout.tsx is in docs/components/
import { Tag } from '@markdoc/markdoc'; // Ensure Tag is imported if using new config.Tag

export const warning = {
  // render: Callout, // We use transform to pass specific props
  children: ['paragraph', 'tag', 'list'],
  attributes: {
    title: {
      type: String,
      // Default title will be set in transform if not provided
    },
  },
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    const finalAttributes = { ...attributes, type: 'warning' };
    if (attributes.title === undefined) { // Check if title is explicitly set to something (even null)
        finalAttributes.title = 'Warning';
    }
    // If using Markdoc.transform(ast, { Tag: CustomTag }) then use config.Tag
    // Otherwise, if Tag is globally available or imported, use it directly.
    // Assuming 'Tag' is available on the 'config' object passed by Markdoc.
    return new config.Tag(Callout, finalAttributes, children);
  }
};
