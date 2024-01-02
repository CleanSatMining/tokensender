// pages/api/initDatabase.ts

import { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const db = new sqlite3.Database('sales.db');

    // Réinitialise la table UserData (supprime et recrée)
    db.run('DROP TABLE IF EXISTS UserData');
    db.run(`
      CREATE TABLE UserData (
        id INTEGER PRIMARY KEY,
        email TEXT,
        usdcSend REAL,
        usdcReceived REAL,
        firstName TEXT,
        lastName TEXT,
        ethAddress TEXT,
        btcAddress TEXT,
        tokenAmount REAL
      )
    `);

    db.close();

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
