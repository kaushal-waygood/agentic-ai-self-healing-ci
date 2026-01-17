import './globals.css';
import { poppins, pt_sans } from './fonts';
import 'driver.js/dist/driver.css';
import './driver-custom.css';

import { zobsAiHomeMetadata } from '@/metadata/metadata';
import LayoutPage from './LayoutPage';

export const metadata = {
  title: zobsAiHomeMetadata.title,
  description: zobsAiHomeMetadata.description,
  keywords: zobsAiHomeMetadata.keywords,
  alternates: {
    canonical: 'https://www.zobsai.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${pt_sans.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        <LayoutPage>{children}</LayoutPage>
      </body>
    </html>
  );
}
