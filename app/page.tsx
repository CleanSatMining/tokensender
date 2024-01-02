'use client';

import { Space, Text } from '@mantine/core';
import { Welcome } from '../components/Welcome/Welcome';
import SearchByEmail from '@/components/Sales/SearchByEmail';

const message = "Entrer votre e-mail pour vérifier votre adresse d'envoi des tokens CSM alpha";

export default function HomePage() {
  return (
    <>
      <Welcome />
      <Space h={20} />
      <Text ta="center">{message}</Text>
      <Space h={10} />
      <SearchByEmail />
    </>
  );
}
