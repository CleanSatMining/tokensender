import { NextApiRequest, NextApiResponse } from 'next';

import 'firebase/firestore';
import { collection, getDocs } from 'firebase/firestore/lite';
import { Expense } from '@/components/Types/types';

import { db } from '@/components/Database/firebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "L'id du site est requis." });
    }

    const data = await getExpenses(id as string);

    return res.status(200).json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des depenses :', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la récupération des depense.' });
  }
}

async function getExpenses(siteId: string): Promise<Expense[]> {
  const expensesCol = collection(db, `sites/${siteId}/expenses`);
  const expenseSnapshot = await getDocs(expensesCol);
  //const expenseList = expenseSnapshot.docs.map((doc) => doc.data());
  //console.log(JSON.stringify(expenseSnapshot.docs[0].id, null, 4));

  const ret = expenseSnapshot.docs.map((expenseDoc) => {
    const expense = expenseDoc.data();
    const dateSeconde = expense.date.seconds as string;

    const e: Expense = {
      id: expenseDoc.id,
      csm: expense.csm as number,
      operator: expense.operator as number,
      electricity: expense.electricity as number,
      dateTime: parseInt(dateSeconde, 10) * 1000,
      siteId,
    };

    return e;
  });

  return ret;
}
