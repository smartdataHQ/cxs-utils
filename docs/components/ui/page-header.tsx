import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  className?: string;
}

/**
 * Reusable page header component for consistent styling across documentation pages
 */
export function PageHeader({ title, description, badge, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {badge && (
          <Badge variant="secondary" className="text-sm">
            {badge}
          </Badge>
        )}
      </div>
      {description && (
        <p className="text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}