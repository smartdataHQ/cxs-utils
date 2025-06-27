import { Callout } from '../../components';
import { Tag } from '@markdoc/markdoc'; // Assuming Tag might be needed from config

export const tip = {
  children: ['paragraph', 'tag', 'list'],
  attributes: {
    title: {
      type: String,
    },
  },
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    const finalAttributes = { ...attributes, type: 'tip' };
    if (attributes.title === undefined) {
        finalAttributes.title = 'Tip';
    }
    return new config.Tag(Callout, finalAttributes, children);
  }
};
