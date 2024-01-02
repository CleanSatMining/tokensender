import '@mantine/core/styles.css';
import Head from 'next/head';
import React from 'react';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { theme } from '../theme';

export const metadata = {
  title: 'CleanSat Mining support',
  description: 'Le site dupport de CleanSat Mining!',
};

export default function DefaultLayout({ children }: { children: any }) {
  return (
    <div>
      <Head>
        <title>CSM - Sales</title>
        <ColorSchemeScript />
        <link rel="icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </Head>
      <div>
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </div>
    </div>
  );
}
