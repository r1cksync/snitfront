import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google'; // 1. Import Fonts
import './globals.css';
import { Providers } from '@/components/Providers';
import GlobalMusicButton from '@/components/GlobalMusicButton';

// 2. Configure Fonts
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans', // Defines the CSS variable for Tailwind
  display: 'swap',
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-serif', // Defines the CSS variable for Tailwind
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PromoFocus | Reclaim Your Attention',
  description: 'AI-powered focus and flow state monitoring workspace.',
  icons: {
    icon: '/favicon.ico', // Optional: Add your favicon path here
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 3. Inject font variables into the HTML tag so they are accessible globally
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans bg-[#FAFAFA] text-[#555555] antialiased selection:bg-[#2B4C7E] selection:text-white">
        <Providers>
          {children}
          <GlobalMusicButton />
        </Providers>
      </body>
    </html>
  );
}