'use client';

import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import {
  Button,
  Table,
  ActionIcon,
  Container,
  SegmentedControl,
  Stack,
  Group,
  Text,
  Modal,
  NumberInput,
} from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { IconTrash } from '@tabler/icons-react';

import DefaultLayout from '@/layouts/DefaultLayout';
import { Expense, Site } from '@/components/Types/types';
import { formatBTC, formatTimestampDay } from '@/components/Utils/format';

const AddExpensePage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]); // Remplacez [] par le type de votre modèle de données
  const [sites, setSites] = useState<Site[]>([]);
  const [siteId, setSiteId] = useState<string>('1');
  const [expenseId, setExpenseId] = useState<string>('');
  const [confirmationOpened, { toggle: toggleConfirmation, close: closeConfirmation }] =
    useDisclosure(false);
  const [opened, { open, close }] = useDisclosure(false);
  const form = useForm({
    initialValues: { csm: 0, electricity: 0, operator: 0, dateTime: new Date() },

    // functions will be used to validate values at corresponding key
    validate: {
      dateTime: (value) =>
        value.getTime() > new Date().getTime() ? "La date doit anterieur à aujourd'hui" : null,
      csm: (value) => (value < 0 ? 'Les frais CSM doivent être superieur à 0' : null),
      electricity: (value) =>
        value < 0 ? "La note d'electricité doivent être superieur à 0" : null,
      operator: (value) => (value < 0 ? "Les frais d'operateur doivent être superieur à 0" : null),
    },
  });

  const handleAddExpense = async (values: {
    csm: number;
    electricity: number;
    operator: number;
    dateTime: Date;
  }) => {
    await fetch(`/api/sites/${siteId}/expenses/add`);

    try {
      const response = await fetch(`/api/sites/${siteId}/expenses/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: siteId,
          dateTime: values.dateTime.getTime(),
          electricity: values.electricity,
          csm: values.csm,
          operator: values.operator,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de l'ajout de la dépense (statut: ${response.status})`);
      }

      // La dépense a été ajoutée avec succès
      console.log('La dépense a été ajoutée avec succès');
    } catch (error) {
      console.error(`Erreur lors de l'ajout de la dépense : ${error}`);
    }

    const getExpenses = getSiteExpenses(siteId, setExpenses);
    getExpenses();
    close();
  };

  const handleClickDeleteExpense = async (id: string) => {
    setExpenseId(id);
    toggleConfirmation();
  };

  const handleDeleteExpense = async () => {
    await fetch(`/api/sites/${siteId}/expenses/${expenseId}/delete`);

    const getExpenses = getSiteExpenses(siteId, setExpenses);
    getExpenses();
    closeConfirmation();
  };

  useEffect(() => {
    const getSites = async () => {
      try {
        const response = await fetch('/api/sites');

        if (!response.ok) {
          throw new Error(
            `Erreur lors de la récupération des dépenses (statut: ${response.status})`
          );
        }

        const sitesData = await response.json();
        setSites(sitesData);
        return sitesData;
      } catch (error) {
        console.error('Error fetching expenses from API:', error);
        throw error;
      }
    };

    getSites();
  }, []);

  useEffect(() => {
    const getExpenses = getSiteExpenses(siteId, setExpenses);
    getExpenses();
  }, [siteId]);

  const rows = expenses.map((expense) => (
    <Table.Tr key={expense.id}>
      <Table.Td>{formatTimestampDay(expense.dateTime)}</Table.Td>
      <Table.Td>{formatBTC(expense.electricity)}</Table.Td>
      <Table.Td>{formatBTC(expense.csm)}</Table.Td>
      <Table.Td>{formatBTC(expense.operator)}</Table.Td>
      <Table.Td>
        <ActionIcon
          variant="transparent"
          color="red"
          onClick={() => handleClickDeleteExpense(expense.id)}
        >
          <IconTrash />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <DefaultLayout>
      <Container>
        <h1>Ajouter ou supprimer une dépense</h1>

        <Stack align="flex-start" justify="flex-start" style={{ marginBottom: '10px' }}>
          <SegmentedControl
            color="lime"
            value={siteId}
            onChange={setSiteId}
            data={sites.map((s) => ({
              label: s.shortName,
              value: s.id,
            }))}
          />
          <Button onClick={open}>Ajouter une dépense</Button>
        </Stack>
        <Table.ScrollContainer minWidth={500}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Electricity</Table.Th>
                <Table.Th>CSM</Table.Th>
                <Table.Th>Operator</Table.Th>
                <Table.Th />
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Container>
      <Modal
        opened={confirmationOpened}
        withCloseButton
        onClose={closeConfirmation}
        radius="md"
        title={`${sites.find((s) => s.id === siteId)?.name} : Supprimer dépense ${expenseId}`}
      >
        <Text size="sm" mb="xs" fw={500}>
          {`Vouler vous vraiment supprimer la dépense du ${expenses.find((e) => e.id === expenseId) ? formatTimestampDay(expenses.find((e) => e.id === expenseId)?.dateTime ?? 0) : expenseId}?`}
        </Text>

        <Group align="flex-end">
          <Button color="lime" onClick={closeConfirmation}>
            Annuler
          </Button>
          <Button color="red" onClick={() => handleDeleteExpense()}>
            Confirmer
          </Button>
        </Group>
      </Modal>
      <Modal
        opened={opened}
        onClose={close}
        title={`${sites.find((s) => s.id === siteId)?.name} : Ajouter une dépense`}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <form onSubmit={form.onSubmit((values) => handleAddExpense(values))}>
          <MonthPickerInput label="Mois des dépenses" mt="sm" {...form.getInputProps('dateTime')} />
          <NumberInput
            mt="sm"
            label="Facture électricité en Bitcoin (₿)"
            placeholder="Montant ₿"
            {...form.getInputProps('electricity')}
          />
          <NumberInput
            mt="sm"
            label="Frais CSM en Bitcoin (₿)"
            placeholder="Montant ₿"
            {...form.getInputProps('csm')}
          />
          <NumberInput
            mt="sm"
            label="Frais opérateur en Bitcoin (₿)"
            placeholder="Montant ₿"
            {...form.getInputProps('operator')}
          />
          <Button type="submit" mt="sm">
            Submit
          </Button>
        </form>
      </Modal>
    </DefaultLayout>
  );
};

export default AddExpensePage;
function getSiteExpenses(siteId: string, setExpenses: Dispatch<SetStateAction<Expense[]>>) {
  return async () => {
    try {
      const response = await fetch(`/api/sites/${siteId}/expenses`);

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des dépenses (statut: ${response.status})`);
      }

      const expensesData = await response.json();
      setExpenses(expensesData);
      return expensesData;
    } catch (error) {
      console.error('Error fetching expenses from API:', error);
      throw error;
    }
  };
}
