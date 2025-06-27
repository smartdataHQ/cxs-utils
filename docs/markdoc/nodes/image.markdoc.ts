import { nodes, Tag } from '@markdoc/markdoc';
import EnhancedImage from '../../components/EnhancedImage';

export const image = {
  ...nodes.image,
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    let src = attributes.src;
    let width: string | number | undefined = undefined;
    let height: string | number | undefined = undefined;

    // Try to parse width and height from src query parameters
    if (src && src.includes('?')) {
      const [baseSrc, queryString] = src.split('?');
      const params = new URLSearchParams(queryString);

      const w = params.get('width') || params.get('w');
      const h = params.get('height') || params.get('h');

      if (w && !isNaN(Number(w))) {
        width = Number(w);
      }
      if (h && !isNaN(Number(h))) {
        height = Number(h);
      }
      // Clean the src of these query params if they were only for layout hints
      // However, some image CDNs use query params for transformations, so be cautious.
      // For this use case, let's assume w/h or width/height are purely for layout.
      // A more robust solution might involve specific param names like `layout_width`.
      // For now, we'll pass the original src to EnhancedImage and let it handle it.
      // Or, we can strip them if we are sure they are only for this purpose.
      // Let's try stripping them for now, assuming they are layout hints.
      // params.delete('width');
      // params.delete('w');
      // params.delete('height');
      // params.delete('h');
      // src = params.toString() ? `${baseSrc}?${params.toString()}` : baseSrc;
      // Reconsidering: It's probably safer to pass the original src and let EnhancedImage use the dimensions.
      // The `next/image` component itself doesn't use query params from `src` for layout.
    }

    const props = {
      src: attributes.src, // Pass original src
      alt: attributes.alt,
      caption: attributes.title,
      width: width || attributes.width, // Prioritize parsed, then direct attributes if any
      height: height || attributes.height,
    };

    // Remove undefined props to keep it clean for EnhancedImage
    Object.keys(props).forEach(key => props[key] === undefined && delete props[key]);

    return new Tag(EnhancedImage, props, []);
  }
};
