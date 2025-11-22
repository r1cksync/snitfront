import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Flow State Facilitator',
  description: 'AI-powered focus and flow state monitoring',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
