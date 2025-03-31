/* eslint-disable react-refresh/only-export-components */
import '../index.css';
import { metadata, viewport } from './metadata';
import ClientProviders from '@/components/ClientProviders';

export { metadata, viewport };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
