import React from 'react';
import NextImage, { ImageProps as NextImageProps } from 'next/image';

interface EnhancedImageProps {
  src: string;
  alt?: string;
  caption?: string;
  width?: number | string; // next/image width can be string or number
  height?: number | string; // next/image height can be string or number
  // Add any other props you might want to control, e.g., layout, priority
  layout?: NextImageProps['layout'];
  priority?: NextImageProps['priority'];
}

const EnhancedImage: React.FC<EnhancedImageProps> = ({
  src,
  alt = '', // Default alt text to empty string if not provided
  caption,
  width,
  height,
  layout, // Default layout will be intrinsic if width/height are provided, or fill if not.
  priority = false,
}) => {
  // Determine if the image is external or internal (for next/image loader)
  const isExternal = src.startsWith('http://') || src.startsWith('https://');

  // next/image requires width and height for non-fill layouts with external srcs
  // or if layout is 'intrinsic' or 'fixed'.
  // If layout is 'responsive' or 'fill', width/height might not be strictly needed at the component level
  // but rather on a parent wrapper.
  // For simplicity, if width and height are not provided, we might fall back to a regular img tag
  // or try to use layout="fill" which requires a parent with position relative.

  let imageNode;

  if ((width && height) || layout === 'fill') {
    // If dimensions are provided, or layout is 'fill', use next/image
    imageNode = (
      <NextImage
        src={src}
        alt={alt}
        width={width as number} // Cast as number; next/image handles string for px but number is safer
        height={height as number}
        layout={layout || (width && height ? 'intrinsic' : undefined)} // Default to intrinsic if dims provided
        priority={priority}
        // Add loader for external images if not configured globally in next.config.js
        // loader={isExternal ? ({ src: imgSrc, width: imgWidth }) => `${imgSrc}?w=${imgWidth}` : undefined}
      />
    );
  } else if (isExternal) {
    // For external images without dimensions, next/image can be problematic without layout='fill'
    // or a custom loader that doesn't require dimensions.
    // Fallback to standard img for now, or log a warning.
    // A better solution would be to require dimensions or use layout='fill' with a sized parent.
    console.warn(`EnhancedImage: External image "${src}" is missing width/height and layout is not 'fill'. Consider providing dimensions or using layout='fill' on a sized parent for optimal performance with next/image. Falling back to standard <img>.`);
    imageNode = <img src={src} alt={alt} style={{ maxWidth: '100%', height: 'auto' }} />;
  } else {
    // For internal images without dimensions, next/image might still work with layout='responsive' or 'intrinsic'
    // if the image file can be statically analyzed by Next.js, but it's best to provide them.
    // Fallback to layout="responsive" and let next/image try.
    // This requires the image to be in the public directory or imported.
    console.warn(`EnhancedImage: Internal image "${src}" is missing width/height. Attempting layout='responsive'. Provide dimensions for best results.`);
    imageNode = (
        <div style={{ position: 'relative', width: '100%', paddingTop: '50%' /* Default aspect ratio placeholder */ }}>
            {/* Wrapper needed for layout responsive/fill if parent doesn't have explicit size */}
            <NextImage
                src={src}
                alt={alt}
                layout="responsive"
                objectFit="contain" // or 'cover', depending on desired behavior
                priority={priority}
            />
        </div>
    );
  }


  return (
    <figure className="enhanced-image-figure">
      {imageNode}
      {caption && <figcaption>{caption}</figcaption>}
      <style jsx>{`
        .enhanced-image-figure {
          margin: 1.5em 0; /* Default figure margin */
          text-align: center; /* Center image and caption if figure is block */
        }
        /* Ensure next/image is not constrained by figure if layout is responsive/fill in some cases */
        .enhanced-image-figure :global(span) {
            /* This targets the span wrapper NextImage often uses. Might need adjustment. */
            /* display: block !important;  Potentially needed for some layouts */
        }
        figcaption {
          margin-top: 0.5em;
          font-size: 0.875em;
          color: var(--text-color-secondary, #555);
          font-style: italic;
        }
      `}</style>
    </figure>
  );
};

export default EnhancedImage;
