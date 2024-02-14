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
  Select,
} from '@mantine/core';
import { MonthPickerInput, DateValue } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { IconTrash, IconEdit, IconCheck, IconX, IconReload } from '@tabler/icons-react';

import DefaultLayout from '@/layouts/DefaultLayout';
import { Expense, Site } from '@/components/Types/types';
import { Site as SiteData } from '@/components/Types/Site';
import { formatBTC, formatTimestampDay, formatUsd, formatPercent } from '@/components/Utils/format';
import { getFirstDayOfMonth, getLastDayOfMonth } from '@/components/Utils/date';

type EbitdaData = {
  feeCsm: { usd: number; btc: number };
  taxe: { usd: number; btc: number };
  EBITDA: { usd: number; btc: number };
  provision: { usd: number; btc: number };
  feeOperator: { usd: number; btc: number };
  electricityCost: { usd: number; btc: number };
  btcPrice: number;
  minedBtc: {
    quantity: number;
    value: number;
  };
  period: number;
  startTimestamp: number;
  endTimestamp: number;
  uptime: {
    machines: number;
    days: number;
    percent: number;
    hashrate: number;
  };
};

const AddExpensePage: React.FC = () => {
  const [month, setMonth] = useState<DateValue | undefined>(undefined);
  const [expenses, setExpenses] = useState<Expense[]>([]); // Remplacez [] par le type de votre modèle de données
  const [sites, setSites] = useState<Site[]>([]);
  const [siteId, setSiteId] = useState<string>('1');
  const [expenseId, setExpenseId] = useState<string>('');
  const [confirmationOpened, { toggle: toggleConfirmation, close: closeConfirmation }] =
    useDisclosure(false);
  const [modalAddOpened, { open, close }] = useDisclosure(false);
  const [btcPrice, setBtcPrice] = useState<number>(0);
  const [btcPriceInput, setBtcPriceInput] = useState<number>(0);
  const [ebitdaData, setEbitdaData] = useState<EbitdaData | undefined>(undefined);
  const [editBtcPrice, setEditBtcPrice] = useState<boolean>(false);
  const [editBaseElectricityPrice, setEditBaseElectricityPrice] = useState<boolean>(false);
  const [currency, setCurrency] = useState<string>('$');
  const [siteData, setSiteData] = useState<Map<string, SiteData>>(new Map());
  const [baseElectricityPrice, setBaseElectricityPrice] = useState<number>(0);
  const [baseElectricityPriceInput, setBaseElectricityPriceInput] = useState<number>(0);
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
    setEditBtcPrice(false);
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

  const fetchBtcPrice = async () => {
    try {
      console.log('fetch btc price');
      const response = await fetch('/api/quote/bitcoin');
      const jsonData = await response.json();
      console.log('fetch btc price', JSON.stringify(jsonData, null, 4));
      setBtcPrice(jsonData.price);

      setBtcPriceInput(jsonData.price);
    } catch (error) {
      console.error('Erreur lors de la requête API fetch btc price : ', error);
    }
  };

  useEffect(() => {
    let sitesData: Site[] = [];
    const getSites = async () => {
      try {
        const response = await fetch('/api/sites');

        if (!response.ok) {
          throw new Error(
            `Erreur lors de la récupération des dépenses (statut: ${response.status})`
          );
        }

        sitesData = await response.json();
        setSites(sitesData);
      } catch (error) {
        console.error('Error fetching expenses from API:', error);
        throw error;
      }

      const data: Map<string, SiteData> = new Map();

      for (const site of sitesData) {
        try {
          const response = await fetch(`/api/sites/${site.id}`);
          const siteApi: Site = await response.json();
          if (siteApi.data) {
            data.set(site.id, siteApi.data);
          }
        } catch (error) {
          console.error('Error fetching expenses from API:', error);
          throw error;
        }
      }
      setSiteData(data);
      setBaseElectricityPrice(data.get(siteId)?.mining.electricity.usdPricePerKWH ?? 0);
    };

    getSites();
  }, []);

  useEffect(() => {
    const getExpenses = getSiteExpenses(siteId, setExpenses);
    getExpenses();
    setBaseElectricityPrice(siteData.get(siteId)?.mining.electricity.usdPricePerKWH ?? 0);
  }, [siteId]);

  useEffect(() => {
    const fetchBitcoinPrice = async () => {
      try {
        const response = await fetch('/api/quote/bitcoin');
        const jsonData = await response.json();
        setBtcPrice(jsonData.price);
      } catch (error) {
        console.error('Error fetching bitcoin price:', error);
      }
    };

    fetchBitcoinPrice();
  }, []);

  useEffect(() => {
    const fetchEbitda = async () => {
      try {
        const body = {
          startTimestamp: month ? getFirstDayOfMonth(month.getTime()) : 0,
          endTimestamp: month ? getLastDayOfMonth(month.getTime()) : 0,
          btcPrice,
          basePricePerKWH: baseElectricityPrice,
        };

        const response = await fetch(`/api/sites/${siteId}/ebitda`, {
          method: 'POST',
          body: JSON.stringify(body),
        });
        const jsonData: EbitdaData = await response.json();
        console.log(
          'jsonData',
          month?.getTime(),
          JSON.stringify(body, null, 4),
          JSON.stringify(jsonData, null, 4)
        );
        setEbitdaData(jsonData);
      } catch (error) {
        console.error('Error fetching ebitda:', error);
      }
    };

    if (modalAddOpened && month) {
      fetchEbitda();
    }
  }, [modalAddOpened, month, siteId, btcPrice, baseElectricityPrice]);

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
        opened={modalAddOpened}
        onClose={() => {
          close();
          setEditBtcPrice(false);
        }}
        title={`${sites.find((s) => s.id === siteId)?.name} : Ajouter une dépense`}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <form onSubmit={form.onSubmit((values) => handleAddExpense(values))}>
          <MonthPickerInput
            label="Mois des dépenses"
            mt="sm"
            {...form.getInputProps('dateTime')}
            onChange={setMonth}
            value={month}
          />
          <Group>
            {ebitdaData && (
              <Text fw={700} size="xs">
                {`Du ${formatTimestampDay(ebitdaData?.startTimestamp)} au ${formatTimestampDay(ebitdaData?.endTimestamp)} (${ebitdaData.period} jours)`}
              </Text>
            )}
          </Group>
          <Group mt="xs" justify="space-between">
            <Text>Prix BTC</Text>
            <Group gap={0}>
              {!editBtcPrice && <Text fw={500}>{formatUsd(btcPrice, 0, currency)}</Text>}

              {editBtcPrice && (
                <Group gap={5}>
                  <Select
                    data={['$', '€']}
                    w={60}
                    value={currency}
                    onChange={(value) => setCurrency(typeof value === 'string' ? value : '$')}
                  />
                  <NumberInput
                    prefix={currency}
                    variant="filled"
                    placeholder={btcPrice.toString()}
                    value={btcPriceInput}
                    size="sm"
                    w={120}
                    allowNegative={false}
                    onChange={(v) => setBtcPriceInput(typeof v === 'number' ? v : btcPrice)}
                  />
                </Group>
              )}

              {!editBtcPrice && (
                <ActionIcon
                  variant="transparent"
                  aria-label="Edit"
                  onClick={() => {
                    setBtcPriceInput(btcPrice);
                    setEditBtcPrice(true);
                  }}
                >
                  <IconEdit style={{ width: '70%', height: '70%' }} stroke={1.5} />
                </ActionIcon>
              )}
              <ActionIcon variant="transparent" aria-label="Reload" onClick={fetchBtcPrice}>
                <IconReload style={{ width: '70%', height: '70%' }} stroke={1.5} />
              </ActionIcon>
              {editBtcPrice && (
                <>
                  <ActionIcon
                    color="red"
                    variant="transparent"
                    aria-label="Cancel"
                    onClick={() => setEditBtcPrice(false)}
                  >
                    <IconX style={{ width: '70%', height: '70%' }} stroke={1.5} />
                  </ActionIcon>
                  <ActionIcon
                    color="green"
                    variant="transparent"
                    aria-label="Edit"
                    onClick={() => {
                      setBtcPrice(btcPriceInput);
                      setEditBtcPrice(false);
                    }}
                  >
                    <IconCheck style={{ width: '70%', height: '70%' }} stroke={1.5} />
                  </ActionIcon>
                </>
              )}
            </Group>
          </Group>
          <Group justify="space-between">
            <Text>Prix électricité</Text>
            <Group gap={0}>
              {!editBaseElectricityPrice && (
                <Text fw={500}>{`${currency}${baseElectricityPrice}/kwh`}</Text>
              )}
              {editBaseElectricityPrice && (
                <NumberInput
                  prefix={currency}
                  variant="filled"
                  placeholder={baseElectricityPrice.toString()}
                  value={baseElectricityPriceInput}
                  size="sm"
                  w={120}
                  allowNegative={false}
                  onChange={(v) =>
                    setBaseElectricityPriceInput(typeof v === 'number' ? v : baseElectricityPrice)
                  }
                />
              )}
              {!editBaseElectricityPrice && (
                <ActionIcon
                  variant="transparent"
                  aria-label="Edit"
                  onClick={() => {
                    setBaseElectricityPriceInput(baseElectricityPrice);
                    setEditBaseElectricityPrice(true);
                  }}
                >
                  <IconEdit style={{ width: '70%', height: '70%' }} stroke={1.5} />
                </ActionIcon>
              )}
              <ActionIcon
                variant="transparent"
                aria-label="Reload"
                onClick={() => {
                  setBaseElectricityPriceInput(
                    siteData.get(siteId)?.mining.electricity.usdPricePerKWH ?? 0
                  );
                  setBaseElectricityPrice(
                    siteData.get(siteId)?.mining.electricity.usdPricePerKWH ?? 0
                  );
                }}
              >
                <IconReload style={{ width: '70%', height: '70%' }} stroke={1.5} />
              </ActionIcon>
              {editBaseElectricityPrice && (
                <>
                  <ActionIcon
                    color="red"
                    variant="transparent"
                    aria-label="Cancel"
                    onClick={() => setEditBaseElectricityPrice(false)}
                  >
                    <IconX style={{ width: '70%', height: '70%' }} stroke={1.5} />
                  </ActionIcon>
                  <ActionIcon
                    color="green"
                    variant="transparent"
                    aria-label="Edit"
                    onClick={() => {
                      setBaseElectricityPrice(baseElectricityPriceInput);
                      setEditBaseElectricityPrice(false);
                    }}
                  >
                    <IconCheck style={{ width: '70%', height: '70%' }} stroke={1.5} />
                  </ActionIcon>
                </>
              )}
            </Group>
          </Group>

          {ebitdaData && (
            <>
              <Group mt="xs" justify="space-between">
                <Text c="red">Revenu</Text>
                <Text c="red" fw={500}>
                  {`${formatBTC(ebitdaData?.minedBtc.quantity)} (${formatUsd(ebitdaData?.minedBtc.value, 0, currency)})`}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text c="red">Uptime</Text>
                <Text c="red" fw={500}>
                  {`${formatPercent((ebitdaData?.uptime.percent ?? 0) / 100)}`}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text c="red">Provision</Text>
                <Text c="red" fw={500}>
                  {`${formatBTC(ebitdaData?.provision.btc)} (${formatUsd(ebitdaData?.provision.usd, 0, currency)})`}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text c="red">Ebitda</Text>
                <Text c="red" fw={500}>
                  {`${formatBTC(ebitdaData?.EBITDA.btc)} (${formatUsd(ebitdaData?.EBITDA.usd, 0, currency)})`}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text c="red">Taxe</Text>
                <Text c="red" fw={500}>
                  {`${formatBTC(ebitdaData?.taxe.btc)} (${formatUsd(ebitdaData?.taxe.usd, 0, currency)})`}
                </Text>
              </Group>
            </>
          )}
          <NumberInput
            mt="sm"
            label="Facture électricité en Bitcoin (₿)"
            placeholder="Montant ₿"
            {...form.getInputProps('electricity')}
          />

          {ebitdaData && (
            <Group>
              <Text c="red">Coûts estimés :</Text>
              <Text c="red" fw={500}>
                {`${formatBTC(ebitdaData?.electricityCost.btc)} (${formatUsd(ebitdaData?.electricityCost.usd, 0, currency)})`}
              </Text>
            </Group>
          )}
          <NumberInput
            mt="sm"
            label="Frais CSM en Bitcoin (₿)"
            placeholder="Montant ₿"
            {...form.getInputProps('csm')}
          />

          {ebitdaData && (
            <Group>
              <Text c="red">Coûts estimés :</Text>
              <Text c="red" fw={500}>
                {`${formatBTC(ebitdaData?.feeCsm.btc)} (${formatUsd(ebitdaData?.feeCsm.usd, 0, currency)})`}
              </Text>
            </Group>
          )}
          <NumberInput
            mt="sm"
            label="Frais opérateur en Bitcoin (₿)"
            placeholder="Montant ₿"
            {...form.getInputProps('operator')}
          />

          {ebitdaData && (
            <Group>
              <Text c="red">Coûts estimés :</Text>
              <Text c="red" fw={500}>
                {`${formatBTC(ebitdaData?.feeOperator.btc)} (${formatUsd(ebitdaData?.feeOperator.usd, 0, currency)})`}
              </Text>
            </Group>
          )}
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