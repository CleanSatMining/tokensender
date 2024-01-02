'use client';

import { FC, useState } from 'react';
import { Group, Button, FileInput, Table, Stack, ScrollArea, Text } from '@mantine/core';
import Papa from 'papaparse';
import 'regenerator-runtime/runtime';

type CsvData = {
  emailSend: boolean;
  whitelisting: boolean;
  occurence: number;
  timestamp: number;
  name: string;
  firstname: string;
  email: string;
  kycActivated: boolean;
  kycLevel: number;
  bridgeEthAddress: string;
  ethAddress: string;
  bridgeBtcAddress: string;
  btcAddress: string;
  email2: string;
  none1: string;
  id: number;
  none2: string;
};

type User = {
  name: string;
  firstname: string;
  email: string;
  kycActivated: boolean;
  kycLevel: number;
  ethAddresses: string[];
  btcAddresses: string[];
  id: number[];
};

function parseUsersToCsvData(users: User[]): CsvData[] {
  const csvDataArray: CsvData[] = [];

  users.forEach((user) => {
    if (user.ethAddresses.length >= user.btcAddresses.length) {
      user.ethAddresses.forEach((ethAddress, index) => {
        if (index < user.ethAddresses.length - 1 || index === 0) {
          console.log(user.name, 'index', index, user.ethAddresses.length, user.ethAddresses);
          const csvData: CsvData = {
            emailSend: true, // Remplacez par la valeur correcte si elle est disponible dans vos données utilisateur
            whitelisting: true, // Remplacez par la valeur correcte si elle est disponible dans vos données utilisateur
            occurence: 0, // Remplacez par la valeur correcte si elle est disponible dans vos données utilisateur
            timestamp: 0, // Remplacez par la valeur correcte si elle est disponible dans vos données utilisateur
            name: user.name,
            firstname: user.firstname,
            email: user.email,
            kycActivated: user.kycActivated,
            kycLevel: user.kycLevel,
            bridgeEthAddress: user.ethAddresses[0],
            ethAddress: user.ethAddresses.length > index + 1 ? user.ethAddresses[index + 1] : '',
            bridgeBtcAddress: user.btcAddresses.length > 0 ? user.btcAddresses[0] : '',
            btcAddress: user.btcAddresses.length > index + 1 ? user.btcAddresses[index + 1] : '',
            email2: user.email, // Ne définissez que pour la première adresse
            none1: '', // Ne définissez que pour la première adresse
            id: user.id[0], // Ne définissez que pour la première adresse
            none2: user.id.map((i) => `#${i}`).join(','),
          };

          csvDataArray.push(csvData);
        }
      });
    } else {
      user.btcAddresses.forEach((btcAddress, index) => {
        if (index < user.btcAddresses.length - 1 || index === 0) {
          const csvData: CsvData = {
            emailSend: true, // Remplacez par la valeur correcte si elle est disponible dans vos données utilisateur
            whitelisting: true, // Remplacez par la valeur correcte si elle est disponible dans vos données utilisateur
            occurence: 0, // Remplacez par la valeur correcte si elle est disponible dans vos données utilisateur
            timestamp: 0, // Remplacez par la valeur correcte si elle est disponible dans vos données utilisateur
            name: user.name,
            firstname: user.firstname,
            email: user.email,
            kycActivated: user.kycActivated,
            kycLevel: user.kycLevel,
            bridgeEthAddress: user.ethAddresses[0],
            ethAddress: user.ethAddresses.length > index + 1 ? user.ethAddresses[index + 1] : '',
            bridgeBtcAddress: user.btcAddresses.length > 0 ? user.btcAddresses[0] : '',
            btcAddress: user.btcAddresses.length > index + 1 ? user.btcAddresses[index + 1] : '',
            email2: user.email, // Ne définissez que pour la première adresse
            none1: '', // Ne définissez que pour la première adresse
            id: user.id[0], // Ne définissez que pour la première adresse
            none2: user.id.map((i) => `#${i}`).join(','),
          };

          csvDataArray.push(csvData);
        }
      });
    }
  });

  return csvDataArray;
}

function validateEthAddress(address: string | null): string {
  // Trimer et mettre en minuscules
  const trimmedAddress = address?.trim().toLowerCase() ?? '';

  // Vérifier le format
  const isValidFormat = trimmedAddress.startsWith('0x') && trimmedAddress.length === 42;

  return isValidFormat ? trimmedAddress : '';
}

function validateBtcAddress(address: string | null): string {
  // Trimer et mettre en minuscules
  const trimmedAddress = address?.trim().toLowerCase() ?? '';

  // Vérifier le format
  const isValidFormat = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(trimmedAddress);

  return isValidFormat ? trimmedAddress : '';
}

// Fonction pour supprimer les doublons d'un tableau
function removeDuplicates(array: string[]): string[] {
  const arrayToSet = new Set<string>(array);

  return Array.from(arrayToSet).filter(
    (value, index, self) => self.map((a) => a.toLowerCase()).indexOf(value.toLowerCase()) === index
  );
}
function removeDuplicatesNumber(array: number[]): number[] {
  return array.filter((value, index, self) => self.indexOf(value) === index);
}

function mergeUsersByEmail(extractedUsers: User[]) {
  const mergedUsers: { [key: string]: User } = {};

  let fusionNumber = 0;

  extractedUsers.forEach((user, index) => {
    const email = user.email.toLowerCase();

    if (email === null || email === '') {
      // Si l'e-mail n'existe pas déjà dans mergedUsers, ajoutez-le
      mergedUsers[index] = { ...user };
    } else if (!mergedUsers[email]) {
      // Si l'e-mail n'existe pas déjà dans mergedUsers, ajoutez-le
      mergedUsers[email] = { ...user };
    } else {
      // Si l'e-mail existe déjà, fusionnez les données
      console.log('Fusion', email);
      fusionNumber += 1;
      mergedUsers[email] = {
        ...mergedUsers[email],
        id: removeDuplicatesNumber([...mergedUsers[email].id, ...user.id]),
        ethAddresses: removeDuplicates([...mergedUsers[email].ethAddresses, ...user.ethAddresses]),
        btcAddresses: removeDuplicates([...mergedUsers[email].btcAddresses, ...user.btcAddresses]),
        // Ajoutez d'autres champs que vous souhaitez fusionner
      };
    }
  });

  // Convertir mergedUsers en tableau
  const mergedUsersArray = Object.values(mergedUsers);
  return { mergedUsersArray, fusionNumber };
}

function mergeUsersByName(extractedUsers: User[], fusionInit: number) {
  const mergedUsers: { [key: string]: User } = {};

  let fusionNumber = fusionInit;

  extractedUsers.forEach((user, index) => {
    const name = user.firstname.toLowerCase() + user.name.toLowerCase();

    if (name === null || name === '') {
      // Si l'e-mail n'existe pas déjà dans mergedUsers, ajoutez-le
      mergedUsers[index] = { ...user };
    } else if (!mergedUsers[name]) {
      // Si l'e-mail n'existe pas déjà dans mergedUsers, ajoutez-le
      mergedUsers[name] = { ...user };
    } else {
      // Si l'e-mail existe déjà, fusionnez les données
      console.log('Fusion', name);
      fusionNumber += 1;
      mergedUsers[name] = {
        ...mergedUsers[name],
        id: removeDuplicatesNumber([...mergedUsers[name].id, ...user.id]),
        email: removeDuplicates([
          ...mergedUsers[name].email.split(','),
          ...user.email.split(','),
        ]).join(','),
        ethAddresses: removeDuplicates([...mergedUsers[name].ethAddresses, ...user.ethAddresses]),
        btcAddresses: removeDuplicates([...mergedUsers[name].btcAddresses, ...user.btcAddresses]),
        // Ajoutez d'autres champs que vous souhaitez fusionner
      };
    }
  });

  // Convertir mergedUsers en tableau
  const mergedUsersArray = Object.values(mergedUsers);
  return { mergedUsersArray, fusionNumber };
}

function mergeUsersByEthAddress(extractedUsers: User[], fusionInit: number) {
  const mergedUsersMap: { [key: string]: User } = {};
  const mergedIndexesByEthAddress: { [key: string]: number[] } = {};
  const mergedUsers: User[] = extractedUsers.slice();
  //const indexesToBeMerged = Object.values(mergedIndexesByEthAddress).flat();

  let fusionNumber = fusionInit;

  extractedUsers.forEach((user, index) => {
    user.ethAddresses.forEach((ethAddress) => {
      if (ethAddress === null || ethAddress === '') {
        //mergedUsers[index] = { ...user };
      } else if (!mergedIndexesByEthAddress[ethAddress]) {
        // Si l'adresse Ethereum n'existe pas déjà dans mergedUsers, ajoutez-la
        mergedIndexesByEthAddress[ethAddress] = [index];
      } else {
        // Si l'adresse Ethereum existe déjà, fusionnez les données
        fusionNumber += 1;
        mergedIndexesByEthAddress[ethAddress].push(index);
      }
    });
  });

  //console.log('Fusion ETH', JSON.stringify(mergedIndexesByEthAddress, null, 4));

  Object.values(mergedIndexesByEthAddress).forEach((userIndexes) => {
    if (userIndexes.length > 1) {
      console.log(
        'Fusion ETH',
        userIndexes,
        userIndexes.map((i) => extractedUsers[i].email),
        userIndexes.map((i) => extractedUsers[i].id.toString())
      );
      const addresses = new Set<string>();
      userIndexes.forEach((userIndex) => {
        extractedUsers[userIndex].ethAddresses.forEach((address: string) => {
          addresses.add(address);
        });
      });
      userIndexes.forEach((userIndex) => {
        mergedUsers[userIndex] = {
          ...extractedUsers[userIndex],
          ethAddresses: Array.from(addresses),
          // Ajoutez d'autres champs que vous souhaitez fusionner
        };
      });
    }
  });

  // Convertir mergedUsers en tableau
  //const mergedUsersArray = Object.values(mergedUsersMap);

  extractedUsers.forEach((user, index) => {
    const addresses = user.ethAddresses.toString();

    if (addresses === null || addresses === '') {
      // Si l'e-mail n'existe pas déjà dans mergedUsers, ajoutez-le
      mergedUsersMap[index] = { ...user };
    } else if (!mergedUsersMap[addresses]) {
      // Si l'e-mail n'existe pas déjà dans mergedUsers, ajoutez-le
      mergedUsersMap[addresses] = { ...user };
    } else {
      // Si l'e-mail existe déjà, fusionnez les données
      console.log('Fusion', addresses);
      fusionNumber += 1;
      mergedUsersMap[addresses] = {
        ...mergedUsersMap[addresses],
        id: removeDuplicatesNumber([...mergedUsersMap[addresses].id, ...user.id]),
        email: removeDuplicates([
          ...mergedUsersMap[addresses].email.split(','),
          ...user.email.split(','),
        ]).join(','),
        btcAddresses: removeDuplicates([
          ...mergedUsersMap[addresses].btcAddresses,
          ...user.btcAddresses,
        ]),
        // Ajoutez d'autres champs que vous souhaitez fusionner
      };
    }
  });

  // Convertir mergedUsers en tableau
  const mergedUsersArray = Object.values(mergedUsersMap);

  return { mergedUsersArray, fusionNumber };
}

function mergeUsersById(extractedUsers: User[], fusionInit: number) {
  const mergedUsers: { [key: string]: User } = {};

  let fusionNumber = fusionInit;

  extractedUsers.forEach((user, index) => {
    const ids = user.id.toString();

    if (ids === null || ids === '') {
      // Si l'e-mail n'existe pas déjà dans mergedUsers, ajoutez-le
      mergedUsers[index] = { ...user };
    } else if (!mergedUsers[ids]) {
      // Si l'e-mail n'existe pas déjà dans mergedUsers, ajoutez-le
      mergedUsers[ids] = { ...user };
    } else {
      // Si l'e-mail existe déjà, fusionnez les données
      console.log('Fusion ids ...', ids);
      fusionNumber += 1;
      mergedUsers[ids] = {
        ...mergedUsers[ids],
        email: removeDuplicates([
          ...mergedUsers[ids].email.split(','),
          ...user.email.split(','),
        ]).join(','),
        ethAddresses: removeDuplicates([...mergedUsers[ids].ethAddresses, ...user.ethAddresses]),
        btcAddresses: removeDuplicates([...mergedUsers[ids].btcAddresses, ...user.btcAddresses]),
        // Ajoutez d'autres champs que vous souhaitez fusionner
      };
    }
  });

  // Convertir mergedUsers en tableau
  const mergedUsersArray = Object.values(mergedUsers);
  return { mergedUsersArray, fusionNumber };
}

const CSVUploader: FC = () => {
  const [loading, setLoading] = useState(false);
  const [fileData, setFileData] = useState<File | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [fusionCount, setFusionCount] = useState(0);
  const [filterMultiId, setFilterMultiId] = useState(false);

  const getFilteredUsers = () => {
    if (filterMultiId) {
      return users.filter((user) => user.id.length > 1);
    }
    return users;
  };

  const loadData = (file: File | null) => {
    if (file) {
      setLoading(true);

      Papa.parse(file, {
        complete: (result) => {
          setLoading(false);

          // Accédez aux données CSV analysées via result.data
          const rows = result.data.slice(1); // Ignore the header row

          // Parcourez chaque ligne et créez un objet CsvData
          const parsedData: CsvData[] = rows.map((row: any) => {
            const values = Object.values(row);
            //console.log('values', JSON.stringify(values, null, 4));

            const dataRow: CsvData = {
              emailSend: values[0] === 'true', // Exemple, assurez-vous d'adapter cela selon le type réel dans votre CSV
              whitelisting: values[1] === 'true', // Même chose ici
              occurence: parseInt(values[2] as string, 10),
              timestamp: parseInt(values[3] as string, 10),
              name: values[4] as string,
              firstname: values[5] as string,
              email:
                values[6] && (values[6] as string) !== ''
                  ? (values[6] as string)
                  : (values[13] as string),
              kycActivated: values[7] === 'true',
              kycLevel: parseInt(values[8] as string, 10),
              bridgeEthAddress: validateEthAddress(values[9] as string),
              ethAddress: validateEthAddress(values[10] as string),
              bridgeBtcAddress: validateBtcAddress(values[11] as string),
              btcAddress: validateBtcAddress(values[12] as string),
              email2: values[13] as string,
              none1: values[14] as string,
              id: parseInt(values[15] as string, 10),
              none2: values[16] as string,
            };

            return dataRow;
          });
          console.log('Données CSV:', JSON.stringify(parsedData, null, 4));

          const extractedUsers = parsedData
            .filter((csvRow) => csvRow.bridgeEthAddress !== null && csvRow.bridgeEthAddress !== '')
            .map((csvRow) => {
              const ids = csvRow.id === null ? [] : [csvRow.id];
              const ethAddresses: string[] =
                csvRow.ethAddress === null || csvRow.ethAddress === ''
                  ? [csvRow.bridgeEthAddress]
                  : [csvRow.bridgeEthAddress, csvRow.ethAddress];
              const btcAddresses: string[] =
                csvRow.bridgeBtcAddress === null || csvRow.bridgeBtcAddress === ''
                  ? []
                  : csvRow.btcAddress === null || csvRow.btcAddress === ''
                  ? [csvRow.bridgeBtcAddress]
                  : [csvRow.bridgeBtcAddress, csvRow.btcAddress];
              const user: User = {
                id: ids,
                firstname: csvRow.firstname ?? '',
                name: csvRow.name ?? '',
                email: csvRow.email ?? '',
                kycActivated: csvRow.kycActivated ?? '',
                kycLevel: csvRow.kycLevel === null ? csvRow.kycLevel : 0,
                ethAddresses,
                btcAddresses,
              };
              return user;
            });
          console.log('Data user', JSON.stringify(extractedUsers, null, 4));

          // Trouver les doublons et les fusionner
          const { mergedUsersArray: mergedUserByEmail, fusionNumber: totalFusionEmail } =
            mergeUsersByEmail(extractedUsers);

          console.log('Fusion email', totalFusionEmail, extractedUsers.length);

          const { mergedUsersArray: mergedUsersName, fusionNumber: totalFusionName } =
            mergeUsersByName(mergedUserByEmail, totalFusionEmail);

          console.log('Fusion name', totalFusionName, mergedUserByEmail.length);

          const { mergedUsersArray: mergedUsersEth, fusionNumber: totalFusionEth } =
            mergeUsersByEthAddress(mergedUsersName, totalFusionName);

          console.log('Fusion eth', totalFusionEth, mergedUsersName.length);

          const { mergedUsersArray: mergedUsersId, fusionNumber: totalFusionId } = mergeUsersById(
            mergedUsersEth,
            totalFusionEth
          );

          console.log('Fusion id', totalFusionId, mergedUsersEth.length);

          // Stockez les données dans l'état csvData
          setUsers(mergedUsersId);
          setFusionCount(totalFusionId);
        },
        header: true,
        dynamicTyping: true,
      });
    }
  };

  const handleFileChange = () => {
    const file = fileData;

    if (file) {
      setLoading(true);

      Papa.parse(file, {
        complete: (result) => {
          setLoading(false);

          // Accédez aux données CSV analysées via result.data
          const rows = result.data.slice(1); // Ignore the header row

          // Parcourez chaque ligne et créez un objet CsvData
          const parsedData: CsvData[] = rows.map((row: any) => {
            const values = Object.values(row);
            console.log('values', JSON.stringify(values, null, 4));

            const dataRow: CsvData = {
              emailSend: values[0] === 'true', // Exemple, assurez-vous d'adapter cela selon le type réel dans votre CSV
              whitelisting: values[1] === 'true', // Même chose ici
              occurence: parseInt(values[2] as string, 10),
              timestamp: parseInt(values[3] as string, 10),
              name: values[4] as string,
              firstname: values[5] as string,
              email: values[6] as string,
              kycActivated: values[7] === 'true',
              kycLevel: parseInt(values[8] as string, 10),
              bridgeEthAddress: values[9] as string,
              ethAddress: values[10] as string,
              bridgeBtcAddress: values[11] as string,
              btcAddress: values[12] as string,
              email2: values[13] as string,
              none1: values[14] as string,
              id: parseInt(values[15] as string, 10),
              none2: values[16] as string,
            };

            return dataRow;
          });
          console.log('Données CSV:', JSON.stringify(parsedData, null, 4));

          const data = parsedData
            .filter((csvRow) => csvRow.bridgeEthAddress !== null)
            .map((csvRow) => {
              const ids = csvRow.id === null ? [] : [csvRow.id];
              const ethAddresses: string[] =
                csvRow.ethAddress === null
                  ? [csvRow.bridgeEthAddress]
                  : [csvRow.bridgeEthAddress, csvRow.ethAddress];
              const btcAddresses: string[] =
                csvRow.bridgeBtcAddress === null
                  ? []
                  : csvRow.btcAddress === null
                  ? [csvRow.bridgeBtcAddress]
                  : [csvRow.bridgeBtcAddress, csvRow.btcAddress];
              const user: User = {
                id: ids,
                firstname: csvRow.firstname ?? '',
                name: csvRow.name ?? '',
                email: csvRow.email ?? '',
                kycActivated: csvRow.kycActivated ?? '',
                kycLevel: csvRow.kycLevel === null ? csvRow.kycLevel : 0,
                ethAddresses,
                btcAddresses,
              };
              return user;
            });
          console.log('Data user', JSON.stringify(data, null, 4));

          const { mergedUsersArray: mergedUserByEmail, fusionNumber: totalFusionEmail } =
            mergeUsersByEmail(data);

          const { mergedUsersArray: mergedUsersEth, fusionNumber: totalFusionEth } =
            mergeUsersByEthAddress(mergedUserByEmail, totalFusionEmail);

          const { mergedUsersArray: mergedUsers, fusionNumber: totalFusion } = mergeUsersById(
            mergedUsersEth,
            totalFusionEth
          );

          // Stockez les données dans l'état csvData
          setUsers(mergedUsers);
          setFusionCount(totalFusion);
        },
        header: true,
        dynamicTyping: true,
      });
    }
  };

  const handleToggleFilterMultiId = () => {
    setFilterMultiId((prev) => !prev);
  };

  const handleFileUpload = (file: File | null) => {
    setFileData(file);
    loadData(file);
  };

  const exportCSV = () => {
    const csvData = Papa.unparse(parseUsersToCsvData(users), {
      header: true,
    });

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'users.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const columns = [
    { name: 'ID', sortable: true },
    { name: 'Name', sortable: true },
    { name: 'Firstname', sortable: true },
    { name: 'Email', sortable: true },
    { name: 'KYC Activated', sortable: true },
    { name: 'KYC Level', sortable: true },
    { name: 'ETH Addresses', sortable: true },
    { name: 'BTC Addresses', sortable: true },
  ];

  const rows = getFilteredUsers().map((user, index) => (
    <Table.Tr key={index}>
      <Table.Td>
        {user.id.map((id) => (
          <Text color={user.id.length > 1 ? 'red' : 'blue'}>{id}</Text>
        ))}
      </Table.Td>
      <Table.Td>{user.name}</Table.Td>
      <Table.Td>{user.firstname}</Table.Td>
      <Table.Td>
        {user.email.split(',').map((mail) => (
          <Text>{mail}</Text>
        ))}
      </Table.Td>
      <Table.Td>{user.kycLevel}</Table.Td>
      <Table.Td>
        {user.ethAddresses.map((a) => (
          <Text>{a}</Text>
        ))}
      </Table.Td>
      <Table.Td>
        {user.btcAddresses.map((a) => (
          <Text>{a}</Text>
        ))}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack p={50}>
      <Group justify="center">
        <FileInput
          value={fileData}
          accept="csv"
          label="Upload files"
          placeholder="Upload files"
          onChange={handleFileUpload}
        />
        {/* <input type="file" accept=".csv" onChange={handleFileChange} /> */}
        {loading && (
          <Button
            disabled={loading}
            loading={loading}
            style={{ marginTop: '16px' }}
            onClick={handleFileChange}
          >
            {' '}
          </Button>
        )}
      </Group>
      {fileData && (
        <Group justify="center">
          <Button onClick={handleToggleFilterMultiId}>
            {filterMultiId
              ? 'Afficher tous les utilisateurs'
              : 'Afficher utilisateurs avec plusieurs ID'}
          </Button>
          <Group justify="center">
            <div>
              <Text>Users</Text>
              <Text fw={700} fz={20}>
                {users.length}
              </Text>
            </div>
            <div>
              <Text>Fusion</Text>
              <Text fw={700} fz={20}>
                {fusionCount}
              </Text>
            </div>
          </Group>
          <Button onClick={exportCSV}>Exporter en CSV</Button>
        </Group>
      )}
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
    </Stack>
  );
};

export default CSVUploader;
