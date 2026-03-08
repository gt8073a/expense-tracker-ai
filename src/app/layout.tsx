import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ExpenseTracker',
  description: 'Track your expenses with ease',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 antialiased`}>
        <div className="min-h-screen flex">
          {/* Sidebar */}
          <Navigation />

          {/* Main content */}
          <main className="flex-1 lg:pl-64">
            <div className="min-h-screen p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
