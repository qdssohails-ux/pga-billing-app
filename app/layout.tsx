import type { Metadata, Viewport } from 'next';
import './globals.css';
import ServiceWorkerRegister from '@/app/components/service-worker-register';

export const metadata: Metadata = {
  title: 'PGA Billing, Inventory & Stock Inquiry System',
  description: 'Responsive PWA for inventory inquiry and POS billing.',
  applicationName: 'PGA Billing',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'PGA Billing',
    statusBarStyle: 'default',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#09375f',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
