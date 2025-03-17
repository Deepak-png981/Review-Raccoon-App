import ClientProviders from '@/components/ClientProviders';
import HomePage from '@/components/HomePage';

export default function Home() {
  return (
    <ClientProviders>
      <HomePage />
    </ClientProviders>
  );
}
