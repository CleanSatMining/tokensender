// pages/api/getAllUserData.ts

import { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';
/* eslint-disable */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  /* eslint-enable */
  if (req.method === 'GET') {
    const db = new sqlite3.Database('sales.db');

    // Requête pour récupérer toutes les données de la table UserData
    db.all('SELECT * FROM UserData', (err, rows) => {
      if (err) {
        console.error('Error fetching data from the database:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      db.close();
      console.log('Data fetched from the database:', rows);
      return res.status(200).json({ userData: rows });
    });
    db.close();
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
