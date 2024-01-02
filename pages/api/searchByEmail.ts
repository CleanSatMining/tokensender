import { NextApiRequest, NextApiResponse } from 'next';
//import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs/promises';
import { UserData } from '@/components/Sales/MtPelerinSalesUploader';

const dataFilePath = path.join(process.cwd(), 'savedData.json');

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
        const data = await fs.readFile(dataFilePath, 'utf-8');
        const parsedData: UserData[] = JSON.parse(data);

        // Recherche des occurrences basées sur l'e-mail
        const results = parsedData.filter((user) => user.email === email);

        return res.status(200).json({ success: true, results });
      } catch (error2) {
        console.error('Erreur lors de la recherche par e-mail :', error2);
        return res.status(500).json({ success: false, error: 'Erreur serveur interne.' });
      }

      //   //const db = new sqlite3.Database('sales.db');
      //   const dbPath = path.join(__dirname, '../public/sales.db');
      //   const db = new sqlite3.Database(dbPath);

      //   // Requête pour rechercher dans la base de données à partir de l'adresse e-mail
      //   db.all('SELECT * FROM UserData WHERE email = ?', [email.toLowerCase()], (err, rows) => {
      //     if (err) {
      //       db.close();
      //       console.error('Error searching in the database:', err);
      //       res.status(500).json({ error: 'Internal Server Error' });
      //     } else {
      //       db.close();
      //       console.error('Result searching in the database:', rows);

      //       res.status(200).json({ results: rows });
      //     }
      //   });
      //   db.close();
      // } else {
      //   res.status(405).json({ error: 'Method Not Allowed' });
      // }
    }
  } catch (error) {
    console.error('Error in handler:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
