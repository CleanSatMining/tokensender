import { NextApiRequest, NextApiResponse } from 'next';
import 'firebase/firestore';
import BigNumber from 'bignumber.js';

type EbitdaDataReceived = {
  feeCsm: number;
  taxe: number;
  EBITDA: number;
  provision: number;
  feeOperator: number;
  electricityCost: number;
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

type EbitdaDataSend = {
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  console.log('req.body:', req.body);
  let requestBody = req.body;
  if (typeof req.body === 'string') {
    try {
      requestBody = JSON.parse(req.body);
    } catch (error) {
      console.error('Erreur lors de la récupération des sites :', error);
    }
  }
  const { startTimestamp, endTimestamp, btcPrice, basePricePerKWH } = requestBody;

  try {
    const body = {
      startTimestamp,
      endTimestamp,
      btcPrice,
      basePricePerKWH,
    };
    const response = await fetch(`https://dashboard.cleansatmining.net/api/sites/${id}/ebitda`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    const jsonData: EbitdaDataReceived = await response.json();
    return res.status(200).json(mapEbitdaData(jsonData));
  } catch (error) {
    console.error('Erreur lors de la récupération des sites :', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la récupération des sites.' });
  }
}

function mapEbitdaData(oldData: EbitdaDataReceived): EbitdaDataSend {
  return {
    feeCsm: {
      usd: oldData.feeCsm,
      btc: new BigNumber(oldData.feeCsm).dividedBy(oldData.btcPrice).toNumber(),
    },
    taxe: {
      usd: oldData.taxe,
      btc: new BigNumber(oldData.taxe).dividedBy(oldData.btcPrice).toNumber(),
    },
    EBITDA: {
      usd: oldData.EBITDA,
      btc: new BigNumber(oldData.EBITDA).dividedBy(oldData.btcPrice).toNumber(),
    },
    provision: {
      usd: oldData.provision,
      btc: new BigNumber(oldData.provision).dividedBy(oldData.btcPrice).toNumber(),
    },
    feeOperator: {
      usd: oldData.feeOperator,
      btc: new BigNumber(oldData.feeOperator).dividedBy(oldData.btcPrice).toNumber(),
    },
    electricityCost: {
      usd: oldData.electricityCost,
      btc: new BigNumber(oldData.electricityCost).dividedBy(oldData.btcPrice).toNumber(),
    },
    btcPrice: oldData.btcPrice,
    minedBtc: {
      quantity: oldData.minedBtc.quantity,
      value: oldData.minedBtc.value,
    },
    period: oldData.period,
    startTimestamp: oldData.startTimestamp,
    endTimestamp: oldData.endTimestamp,
    uptime: {
      machines: oldData.uptime.machines,
      days: oldData.uptime.days,
      percent: oldData.uptime.percent,
      hashrate: oldData.uptime.hashrate,
    },
  };
}
