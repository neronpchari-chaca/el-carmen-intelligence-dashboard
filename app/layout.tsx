import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'El Carmen Intelligence Dashboard',
  description: 'Sistema ejecutivo de inteligencia para genética de maní',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
