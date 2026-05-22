import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://el-carmen-intelligence-dashboard.vercel.app'),
  title: 'El Carmen Intelligence Dashboard',
  description: 'Sistema ejecutivo de inteligencia para genética de maní',
  applicationName: 'El Carmen Intelligence Dashboard',
  keywords: ['genética', 'agricultura', 'dashboard', 'inteligencia', 'maní'],
  icons: {
    icon: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#050807',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
