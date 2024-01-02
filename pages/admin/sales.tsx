'use client';

import React from 'react';
import { IconUpload, IconDatabase } from '@tabler/icons-react';
import '@mantine/core/styles.css';
import { Tabs, rem } from '@mantine/core';
import MtPelerinSalesUploader from '@/components/Sales/MtPelerinSalesUploader';
import UserDataTable from '@/components/Sales/UserDataTable';

import DefaultLayout from '@/layouts/DefaultLayout';

export const metadata = {
  title: 'CleanSat Mining support',
  description: 'Le site dupport de CleanSat Mining!',
};

const SalesPage: React.FC = () => {
  const iconStyle = { width: rem(12), height: rem(12) };
  const handleUpload = (data: any[]) => {
    // Gère les données après le téléchargement si nécessaire
    console.log('Uploaded data:', data);
  };

  // Affiche le composant uniquement sur la page /admin/sales

  return (
    <DefaultLayout>
      <div>
        <h1>Sales Page</h1>

        <Tabs defaultValue="database">
          <Tabs.List>
            <Tabs.Tab value="database" leftSection={<IconDatabase style={iconStyle} />}>
              Database
            </Tabs.Tab>
            <Tabs.Tab value="upload" leftSection={<IconUpload style={iconStyle} />}>
              Upload
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="database">
            <UserDataTable />
          </Tabs.Panel>

          <Tabs.Panel value="upload">
            <MtPelerinSalesUploader onUpload={handleUpload} />
          </Tabs.Panel>
        </Tabs>
      </div>
    </DefaultLayout>
  );
};

export default SalesPage;
