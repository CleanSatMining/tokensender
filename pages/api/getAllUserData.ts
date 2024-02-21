// pages/api/getAllUserData.ts

import { NextApiRequest, NextApiResponse } from 'next';

import { downloadFile } from './storage/users';

/* eslint-disable */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  /* eslint-enable */
  if (req.method === 'GET') {
    try {
      const parsedData = await downloadFile();

      return res.status(200).json({ success: true, data: parsedData });
    } catch (error) {
      console.error('Erreur lors de la lecture des données :', error);
      return res.status(500).json({ success: false, error: 'Erreur serveur interne.' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
