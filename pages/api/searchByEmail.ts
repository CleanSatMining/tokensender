import { NextApiRequest, NextApiResponse } from 'next';

import { UserData } from '@/components/Sales/MtPelerinSalesUploader';
import { downloadFile } from './storage/users';

/* eslint-disable */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  /* eslint-enable */
  try {
    if (req.method === 'GET') {
      const { email } = req.query;

      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Invalid email parameter' });
      }

      try {
        // Charge les données depuis le fichier

        const parsedData: UserData[] = await downloadFile();

        // Recherche des occurrences basées sur l'e-mail
        const results = parsedData.filter((user) => user.email === email);

        return res.status(200).json({ success: true, results });
      } catch (error2) {
        console.error('Erreur lors de la recherche par e-mail :', error2);
        return res.status(500).json({ success: false, error: 'Erreur serveur interne.' });
      }
    }
  } catch (error) {
    console.error('Error in handler:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
