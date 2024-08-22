import { NextApiRequest, NextApiResponse } from 'next';
import 'firebase/firestore';
import { collection, addDoc } from 'firebase/firestore/lite';
import { Expense } from '@/components/Types/types';

import { db } from '@/components/Database/firebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "L'id du site est requis." });
    }

    const { dateTime, electricity, csm, operator, btcPrice, currency, subaccount } = req.body;

    if (
      !dateTime ||
      electricity === undefined ||
      csm === undefined ||
      operator === undefined ||
      btcPrice === undefined
    ) {
      // console.log(
      //   'Les paramètres dateTime, electricity, csm et operator sont requis.',
      //   JSON.stringify(req.body),
      //   dateTime,
      //   electricity,
      //   csm,
      //   operator
      // );
      return res
        .status(400)
        .json({ error: 'Les paramètres dateTime, electricity, csm et operator sont requis.' });
    }

    await addExpense(id as string, {
      currency: currency as string,
      btcPrice: parseFloat(btcPrice),
      dateTime: new Date(dateTime).getTime(),
      electricity: parseFloat(electricity),
      csm: parseFloat(csm),
      operator: parseFloat(operator),
      id: id as string,
      siteId: id as string,
      subaccount: subaccount as number,
    });

    return res.status(200).json({ status: 'OK' });
  } catch (error) {
    console.error('Erreur lors de la récupération des depenses :', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la récupération des depense.' });
  }
}

async function addExpense(siteId: string, expense: Expense) {
  await addDoc(collection(db, `sites/${siteId}/expenses`), {
    date: {
      seconds: expense.dateTime / 1000,
    },
    csm: expense.csm,
    operator: expense.operator,
    electricity: expense.electricity,
    btcPrice: expense.btcPrice,
    currency: expense.currency,
    subaccount: expense.subaccount,
  });
}
