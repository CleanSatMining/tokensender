import React, { useState } from 'react';
import { Space, Input, Button, Alert, Loader, Group, Table, ScrollArea, Text } from '@mantine/core';
import { UserData } from './MtPelerinSalesUploader';

interface SearchByEmailProps {}

const SearchByEmail: React.FC<SearchByEmailProps> = () => {
  const [email, setEmail] = useState('');
  const [results, setResults] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/searchByEmail?email=${email}`);
      const data = await response.json();
      console.log('Result searching by email:', JSON.stringify(data, null, 4));
      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      setResults(data.results || []);
    } catch (error1) {
      console.error('Error searching by email:', error1);
      setError('Erreur lors de la recherche par e-mail. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  const columns = [
    { name: 'Adresse ETH reçut', sortable: true },
    { name: 'USDC payé', sortable: true },
    { name: 'USDC reçut', sortable: true },
    { name: 'tokens estimés', sortable: true },
  ];
  const rows = results.map((user, index) => (
    <Table.Tr key={index}>
      <Table.Td>
        <Text>{user.ethAddress}</Text>
      </Table.Td>
      <Table.Td>{user.usdcSend}</Table.Td>
      <Table.Td>{user.usdcReceived}</Table.Td>
      <Table.Td>
        <Text>{user.tokenAmount}</Text>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <div>
      <Group justify="center">
        <Input
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value.toLowerCase())}
          placeholder="Entrer votre email"
        />
        <Button onClick={handleSearch}>Rechercher</Button>
        {loading && <Loader />}
      </Group>
      <Space h={20} />
      {error && <Alert color="red">{error}</Alert>}
      {results.length > 0 && (
        <Group justify="center">
          <ScrollArea style={{ maxWidth: '100%', overflowX: 'auto' }}>
            <Table striped highlightOnHover width={700} horizontalSpacing={5}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{columns[0].name}</Table.Th>
                  <Table.Th>{columns[1].name}</Table.Th>
                  <Table.Th>{columns[2].name}</Table.Th>
                  <Table.Th>{columns[3].name}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </ScrollArea>
        </Group>
      )}
    </div>
  );
};

export default SearchByEmail;
