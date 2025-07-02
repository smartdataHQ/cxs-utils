import { MarkdocRenderer } from '@/components/markdoc/markdoc-renderer';
import { readMarkdocContent, getMarkdocPath } from '@/lib/markdoc-utils';

export default function EntityIdentificationPage() {
  const markdocPath = getMarkdocPath('app/docs/entities/identification');
  const markdocContent = readMarkdocContent(markdocPath);

  return (
    <article className="max-w-none">
      <MarkdocRenderer content={markdocContent} />
    </article>
  );
}