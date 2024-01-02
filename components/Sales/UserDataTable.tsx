// components/UserDataTable.tsx

import React, { useState, useEffect } from 'react';
import { Table, ScrollArea, Group, Text } from '@mantine/core';
import { UserData } from './MtPelerinSalesUploader';

interface UserDataTableProps {}

const UserDataTable: React.FC<UserDataTableProps> = () => {
  const [userData, setUserData] = useState<UserData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getAllUserData');
        const result = await response.json();

        const d: UserData[] = result.data || [];
        console.log('setUserData', JSON.stringify(d, null, 4));
        setUserData(d);
      } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
      }
    };

    fetchData();
    // Appelle l'API getAllUserData lors du montage du composant
    // fetch('/api/getAllUserData')
    //   .then((response) => response.json())
    //   .then((data) => {
    //     setUserData(data.userData || []);
    //   })
    //   .catch((error) => {
    //     console.error('Error fetching data:', error);
    //   });
  }, []);

  const columns = [
    { name: 'email', align: 'center' },
    { name: 'usdc Send', align: 'center' },
    { name: 'usdc Received', align: 'center' },
    { name: 'firstName', align: 'center' },
    { name: 'lastName', align: 'center' },
    { name: 'eth Address', align: 'center' },
    { name: 'btc Address', align: 'center' },
    { name: 'tokenAmount', align: 'center' },
  ];

  console.log('userData:', userData);

  const rows = userData.map((user, index) => (
    <Table.Tr key={index}>
      <Table.Td>
        <Text>{user.email}</Text>
      </Table.Td>
      <Table.Td>
        <Text>{user.usdcSend}</Text>
      </Table.Td>
      <Table.Td>
        <Text>{user.usdcReceived}</Text>
      </Table.Td>
      <Table.Td>
        <Text>{user.firstName}</Text>
      </Table.Td>
      <Table.Td>
        <Text>{user.lastName}</Text>
      </Table.Td>
      <Table.Td>
        <Text>{user.ethAddress}</Text>
      </Table.Td>
      <Table.Td>
        <Text>{user.btcAddress}</Text>
      </Table.Td>
      <Table.Td>
        <Text>{user.tokenAmount}</Text>
      </Table.Td>
    </Table.Tr>
  ));
  return (
    <Group justify="center">
      <ScrollArea style={{ maxWidth: '100%', overflowX: 'auto' }}>
        <Table striped highlightOnHover width={700} horizontalSpacing={5}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{columns[0].name}</Table.Th>
              <Table.Th>{columns[1].name}</Table.Th>
              <Table.Th>{columns[2].name}</Table.Th>
              <Table.Th>{columns[3].name}</Table.Th>
              <Table.Th>{columns[4].name}</Table.Th>
              <Table.Th>{columns[5].name}</Table.Th>
              <Table.Th>{columns[6].name}</Table.Th>
              <Table.Th>{columns[7].name}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </ScrollArea>
    </Group>
  );
};

export default UserDataTable;
