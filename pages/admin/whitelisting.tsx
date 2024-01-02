'use client';

import { Welcome } from '@/components/Welcome/Welcome';
import { ColorSchemeToggle } from '@/components/ColorSchemeToggle/ColorSchemeToggle';
import CSVUploader from '@/components/Users/Import';
import MtPelerinSalesUploader from '@/components/Sales/MtPelerinSalesUploader';
import DefaultLayout from '@/layouts/DefaultLayout';

export default function Whitelisting() {
  const handleUpload = (data: any[]) => {
    // Gère les données après le téléchargement si nécessaire
    console.log('Uploaded data:', data);
  };
  return (
    <DefaultLayout>
      <MtPelerinSalesUploader onUpload={handleUpload} />
      <Welcome />
      <ColorSchemeToggle />
      <CSVUploader />
    </DefaultLayout>
  );
}
