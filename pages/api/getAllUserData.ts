// pages/api/getAllUserData.ts

import { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'savedData.json');

/* eslint-disable */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  /* eslint-enable */
  if (req.method === 'GET') {
    try {
      // Charge les données depuis le fichier
      const data = await fs.readFile(dataFilePath, 'utf-8');
      const parsedData = JSON.parse(data);

      return res.status(200).json({ success: true, data: parsedData });
    } catch (error) {
      console.error('Erreur lors de la lecture des données :', error);
      return res.status(500).json({ success: false, error: 'Erreur serveur interne.' });
    }

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
