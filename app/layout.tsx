import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import GlobalMusicButton from '@/components/GlobalMusicButton';

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
      <body className="font-sans">
        <Providers>
          {children}
          <GlobalMusicButton />
        </Providers>
      </body>
    </html>
  );
}
