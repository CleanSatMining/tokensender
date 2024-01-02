'use client';

import React, { useCallback, useState } from 'react';
import Papa from 'papaparse';
import { Button, FileInput, Loader, Alert, Group, Table, ScrollArea, Text } from '@mantine/core';

type CSVData = {
  'Received on': string;
  'Amount received': string;
  Currency: string;
  Email: string;
  'First name': string;
  'Last name': string;
  'Postal address': string;
  'ETH Address': string;
  'BTC Address': string;
  'USDC Amount without Fees': string;
  'USDC Amount With Fees': string;
  '#tokens': string;
};

export type UserData = {
  email: string;
  usdcSend: number;
  usdcReceived: number;
  firstName: string;
  lastName: string;
  ethAddress: string;
  btcAddress: string;
  tokenAmount: number;
};

function parseCSVDataList(csvDataList: CSVData[]): UserData[] {
  console.log('parse csv');
  return csvDataList.map((csvData) => {
    let token = 0;
    let usdcSend = 0;
    let usdcReceived = 0;
    try {
      token = parseFloat(csvData['#tokens']);
    } catch (e1) {
      console.error('parse token', e1);
    }
    try {
      usdcSend = parseFloat(csvData['USDC Amount without Fees']);
    } catch (e1) {
      console.error('parse usdcSend', e1);
    }
    try {
      usdcReceived = parseFloat(csvData['USDC Amount With Fees']);
    } catch (e1) {
      console.error('parse usdcReceived', e1);
    }
    const userData: UserData = {
      email: csvData.Email.toLowerCase(),
      usdcSend,
      usdcReceived,
      firstName: csvData['First name'],
      lastName: csvData['Last name'],
      ethAddress: csvData['ETH Address'].toLowerCase(),
      btcAddress: csvData['BTC Address'].toLowerCase(),
      tokenAmount: token,
    };

    return userData;
  });
}

interface MtPelerinSalesUploaderProps {
  onUpload: (data: CSVData[]) => void;
}

const MtPelerinSalesUploader: React.FC<MtPelerinSalesUploaderProps> = ({ onUpload }) => {
  const [csvData, setCSVData] = useState<CSVData[]>([]);
  //const [sales, setSales] = useState<UserData[]>([]);
  const [fileData, setFileData] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);

      try {
        const result = await new Promise<CSVData[]>((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (parsedResult) => resolve(parsedResult.data as CSVData[]),
            error: reject,
          });
        });

        setCSVData(result);
        onUpload(result);
        const tempSales = parseCSVDataList(result);
        console.log('Sales formated', JSON.stringify(tempSales, null, 4));

        // Call the API to upload the data
        const apiResponse = await fetch('/api/uploadSales', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userDataList: tempSales }),
        });

        if (!apiResponse.ok) {
          throw new Error(`API call failed with status: ${apiResponse.status}`);
        }

        console.log('Data uploaded successfully to the API');
      } catch (parseError) {
        console.error('Error parsing CSV:', parseError);
        setError('Error parsing CSV. Please check your file format.');
      } finally {
        setLoading(false);
      }
    },
    [onUpload]
  );

  const handleFileUpload = (file: File | null) => {
    setFileData(file);
    setCSVData([]); // Réinitialise les données lorsqu'un nouveau fichier est sélectionné
    if (file) handleFile(file);
  };

  const handleInitDatabase = async () => {
    try {
      const apiResponse = await fetch('/api/initDatabase', {
        method: 'POST',
      });

      if (!apiResponse.ok) {
        throw new Error(`API call failed with status: ${apiResponse.status}`);
      }

      console.log('Database initialized successfully');
    } catch (error1) {
      console.error('Error initializing database:', error1);
    }
  };

  const columns = [
    { name: 'Received on', sortable: true },
    { name: 'Amount received', sortable: true },
    { name: 'Currency', sortable: true },
    { name: 'Email', sortable: true },
    { name: 'First name', sortable: true },
    { name: 'Last name', sortable: true },
    { name: 'ETH Address', sortable: true },
    { name: 'BTC Address', sortable: true },
    { name: 'USDC Amount without Fees', sortable: true },
    { name: 'USDC Amount With Fees', sortable: true },
    { name: '#tokens', sortable: true },
  ];

  const rows = csvData.map((user, index) => (
    <Table.Tr key={index}>
      <Table.Td>
        <Text>{user['Received on']}</Text>
      </Table.Td>
      <Table.Td>{user['Amount received']}</Table.Td>
      <Table.Td>{user.Currency}</Table.Td>
      <Table.Td>
        <Text>{user.Email}</Text>
      </Table.Td>
      <Table.Td>{user['First name']}</Table.Td>
      <Table.Td>
        <Text>{user['Last name']}</Text>
      </Table.Td>
      <Table.Td>
        <Text>{user['ETH Address']}</Text>
      </Table.Td>
      <Table.Td>
        <Text>{user['BTC Address']}</Text>
      </Table.Td>
      <Table.Td>{user['USDC Amount without Fees']}</Table.Td>
      <Table.Td>{user['USDC Amount With Fees']}</Table.Td>
      <Table.Td>{user['#tokens']}</Table.Td>
    </Table.Tr>
  ));

  return (
    <div style={{ margin: '10px' }}>
      <Button onClick={handleInitDatabase}>Initialize Database</Button>
      <FileInput
        value={fileData}
        accept="csv"
        label="Upload files"
        placeholder="Upload files"
        onChange={handleFileUpload}
      />
      {loading && <Loader />}
      {error && <Alert color="red">{error}</Alert>}
      {/* Optionnel : Affiche les données dans le composant (juste pour la démonstration) */}
      <Group justify="center">
        <ScrollArea style={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table striped highlightOnHover width={700} horizontalSpacing={5}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{columns[0].name}</Table.Th>
                <Table.Th>{columns[1].name}</Table.Th>
                <Table.Th>{columns[2].name}</Table.Th>
                <Table.Th>{columns[3].name}</Table.Th>
                <Table.Th>{columns[5].name}</Table.Th>
                <Table.Th>{columns[6].name}</Table.Th>
                <Table.Th>{columns[7].name}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </ScrollArea>
      </Group>
    </div>
  );
};

export default MtPelerinSalesUploader;
