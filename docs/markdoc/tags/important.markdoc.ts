import { Callout } from '../../components';
import { Tag } from '@markdoc/markdoc';

export const important = {
  children: ['paragraph', 'tag', 'list'],
  attributes: {
    title: {
      type: String,
    },
  },
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    const finalAttributes = { ...attributes, type: 'important' };
    if (attributes.title === undefined) {
        finalAttributes.title = 'Important';
    }
    return new config.Tag(Callout, finalAttributes, children);
  }
};
