import { NextApiRequest, NextApiResponse } from 'next';

import 'firebase/firestore';
import { doc, deleteDoc } from 'firebase/firestore/lite';

import { db } from '@/components/Database/firebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, expense } = req.query;

    if (!id || !expense) {
      return res.status(400).json({ error: "L'id du site et l'id de la dépense sont requis." });
    }

    await deleteExpenses(id as string, expense as string);

    return res.status(200).json({ status: 'OK' });
  } catch (error) {
    console.error('Erreur lors de la récupération des depenses :', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la récupération des depense.' });
  }
}

async function deleteExpenses(siteId: string, expenseId: string) {
  await deleteDoc(doc(db, `sites/${siteId}/expenses`, expenseId));
}
