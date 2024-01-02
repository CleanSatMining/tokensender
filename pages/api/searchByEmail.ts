import { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';
import path from 'path';

/* eslint-disable */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  /* eslint-enable */
  try {
    if (req.method === 'GET') {
      const { email } = req.query;

      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Invalid email parameter' });
      }

      //const db = new sqlite3.Database('sales.db');
      const dbPath = path.join(__dirname, '../public/sales.db');
      const db = new sqlite3.Database(dbPath);

      // Requête pour rechercher dans la base de données à partir de l'adresse e-mail
      db.all('SELECT * FROM UserData WHERE email = ?', [email.toLowerCase()], (err, rows) => {
        if (err) {
          db.close();
          console.error('Error searching in the database:', err);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          db.close();
          console.error('Result searching in the database:', rows);

          res.status(200).json({ results: rows });
        }
      });
      db.close();
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Error in handler:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
