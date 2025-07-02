import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/common/error-boundary';
import { APP_CONFIG, THEME_CONFIG } from '@/lib/constants';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} - ${APP_CONFIG.description}`,
  description: 'Comprehensive documentation for ContextSuite semantic event tracking platform. Learn how to implement standardized event schemas for analytics, personalization, and insights.',
  keywords: ['semantic events', 'event tracking', 'analytics', 'schema', 'eCommerce events', 'travel events', 'real estate events', 'ContextSuite'],
  authors: [{ name: APP_CONFIG.author }],
  creator: APP_CONFIG.name,
  publisher: APP_CONFIG.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme={THEME_CONFIG.defaultTheme}
            enableSystem={THEME_CONFIG.enableSystem}
            disableTransitionOnChange={THEME_CONFIG.disableTransitionOnChange}
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}