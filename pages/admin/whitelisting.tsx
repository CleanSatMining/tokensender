'use client';

import { Welcome } from '@/components/Welcome/Welcome';
import { ColorSchemeToggle } from '@/components/ColorSchemeToggle/ColorSchemeToggle';
import CSVUploader from '@/components/Users/Import';

import DefaultLayout from '@/layouts/DefaultLayout';

export default function Whitelisting() {
  return (
    <DefaultLayout>
      <Welcome />
      <ColorSchemeToggle />
      <CSVUploader />
    </DefaultLayout>
  );
}
