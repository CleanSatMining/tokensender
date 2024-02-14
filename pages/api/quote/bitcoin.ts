import { NextApiRequest, NextApiResponse } from 'next';
import 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await fetch('https://dashboard.cleansatmining.net/api/quote/bitcoin');
    const jsonData = await response.json();
    return res.status(200).json(jsonData);
  } catch (error) {
    console.error('Erreur lors de la récupération des sites :', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la récupération des sites.' });
  }
}
