import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ProjectProvider } from '@/context/ProjectContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'NextGen - Project Generator Platform',
  description: 'Generate runnable NestJS skeletons based on user configuration',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased bg-[#0a0a0a] font-sans`}>
        <ProjectProvider>{children}</ProjectProvider>
      </body>
    </html>
  );
}
