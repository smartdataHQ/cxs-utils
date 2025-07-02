import { MarkdocRenderer } from '@/components/markdoc/markdoc-renderer';
import { readMarkdocContent, getMarkdocPath } from '@/lib/markdoc-utils';

export default function IntegrationsPage() {
  const markdocPath = getMarkdocPath('app/docs/integrations');
  const markdocContent = readMarkdocContent(markdocPath);

  return (
    <article className="max-w-none">
      <MarkdocRenderer content={markdocContent} />
    </article>
  );
}