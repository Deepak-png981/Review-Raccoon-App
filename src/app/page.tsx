import { Suspense } from 'react';
import ClientProviders from '@/components/ClientProviders';
import HomePage from '@/components/HomePage';
import Loading from '@/components/Loading';
export default function Home() {
  return (
    <ClientProviders>
      <Suspense fallback={<Loading />}>
        <HomePage />
      </Suspense>
    </ClientProviders>
  );
}
