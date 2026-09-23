import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'ClassBoard — Student Notes Portal',
  description: 'Your classroom notes, always within reach. Select your class to access lessons, whiteboard notes, and educational materials from Year 7 to Year 12.',
  keywords: ['Classroom notes', 'Digital board', 'School notes', 'Year 10 notes', 'Computer Science', 'Physics', 'Mathematics'],
  authors: [{ name: 'EBoard Education' }],
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-screen flex flex-col font-sans antialiased bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
