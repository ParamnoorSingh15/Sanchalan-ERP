import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import QueryProvider from '@/providers/QueryProvider';
import SmoothScrollProvider from '@/lib/smoothScroll';
import { TooltipProvider } from '@/components/ui/tooltip';

const inter = Inter({ subsets: ['latin'] });

import { ThemeProvider } from '@/components/layout/ThemeProvider';

export const metadata = {
  title: 'Sanchalan ERP',
  description: 'Enterprise Resource Planning System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            <AuthProvider>
              <SmoothScrollProvider>
                <TooltipProvider>
                  {children}
                </TooltipProvider>
              </SmoothScrollProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
