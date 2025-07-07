import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Info, CheckCircle, XCircle, Lightbulb, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalloutProps {
  type?: 'info' | 'warning' | 'success' | 'error' | 'tip' | 'note';
  title?: string;
  /** Optional action element (e.g. a link or button) */
  action?: React.ReactNode;
  children: React.ReactNode;
}

const calloutConfig = {
  info: {
    icon: Info,
    className: 'border-blue-200 bg-blue-50/50 text-blue-900 dark:border-blue-800/50 dark:bg-blue-950/30 dark:text-blue-100',
    iconClassName: 'text-blue-600 dark:text-blue-400',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-yellow-200 bg-yellow-50/50 text-yellow-900 dark:border-yellow-800/50 dark:bg-yellow-950/30 dark:text-yellow-100',
    iconClassName: 'text-yellow-600 dark:text-yellow-400',
  },
  success: {
    icon: CheckCircle,
    className: 'border-green-200 bg-green-50/50 text-green-900 dark:border-green-800/50 dark:bg-green-950/30 dark:text-green-100',
    iconClassName: 'text-green-600 dark:text-green-400',
  },
  error: {
    icon: XCircle,
    className: 'border-red-200 bg-red-50/50 text-red-900 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-100',
    iconClassName: 'text-red-600 dark:text-red-400',
  },
  tip: {
    icon: Lightbulb,
    className: 'border-purple-200 bg-purple-50/50 text-purple-900 dark:border-purple-800/50 dark:bg-purple-950/30 dark:text-purple-100',
    iconClassName: 'text-purple-600 dark:text-purple-400',
  },
  note: {
    icon: Zap,
    className: 'border-indigo-200 bg-indigo-50/50 text-indigo-900 dark:border-indigo-800/50 dark:bg-indigo-950/30 dark:text-indigo-100',
    iconClassName: 'text-indigo-600 dark:text-indigo-400',
  },
};

export function Callout({
  type = 'info',
  title,
  action,
  children,
}: CalloutProps) {
  const { icon: Icon, className, iconClassName } = calloutConfig[type];

  return (
    <Alert
      role="alert"
      className={cn(
        'my-8 rounded-md border-0 border-l-4 p-4 shadow-sm',
        className
      )}
    >
      {/* Optional action button in the top-right */}
      {action && (
        <div className="absolute right-4 top-4 shrink-0">{action}</div>
      )}

      {/* Main content row – icon + text column */}
      <div className="flex items-start gap-3">
        <Icon
          aria-hidden
          className={cn('h-5 w-5 flex-shrink-0', iconClassName)}
        />

        <div className="min-w-0 flex-1">
          {title && (
            <AlertTitle className="text-base font-semibold leading-6">
              {title}
            </AlertTitle>
          )}

          <AlertDescription className="mt-2 prose-sm max-w-none [&>*]:mb-2 [&>*:last-child]:mb-0">
            {children}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
