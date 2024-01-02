// pages/api/uploadSales.ts

import { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';

type UserData = {
  email: string;
  usdcSend: number;
  usdcReceived: number;
  firstName: string;
  lastName: string;
  ethAddress: string;
  btcAddress: string;
  tokenAmount: number;
};

function createDatabase() {
  const db = new sqlite3.Database('sales.db'); // Renomme la base de données à sales.db

  // Vérifie si la table UserData existe
  //   db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='UserData'", (err, table) => {
  //     if (err) {
  //       console.error('Error checking table existence:', err);
  //       return;
  //     }

  //     if (!table) {
  //       // La table UserData n'existe pas, donc nous la créons
  //       db.run(`
  //       CREATE TABLE IF NOT EXISTS UserData (
  //         id INTEGER PRIMARY KEY,
  //         email TEXT,
  //         usdcSend REAL,
  //         usdcReceived REAL,
  //         firstName TEXT,
  //         lastName TEXT,
  //         ethAddress TEXT,
  //         btcAddress TEXT,
  //         tokenAmount REAL
  //       )
  //       `);
  //       console.log('UserData table created successfully');
  //     }
  //   });

  return db;
}

function insertUserData(db: sqlite3.Database, userData: UserData) {
  const {
    email,
    usdcSend,
    usdcReceived,
    firstName,
    lastName,
    ethAddress,
    btcAddress,
    tokenAmount,
  } = userData;

  db.run(
    'INSERT INTO UserData (email, usdcSend, usdcReceived, firstName, lastName, ethAddress, btcAddress, tokenAmount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [email, usdcSend, usdcReceived, firstName, lastName, ethAddress, btcAddress, tokenAmount],
    (err) => {
      if (err) {
        console.error('Error inserting data:', err);
      } else {
        console.log('Data inserted successfully');
      }
    }
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userDataList } = req.body;

    if (!userDataList || !Array.isArray(userDataList)) {
      return res.status(400).json({ error: 'Invalid request payload' });
    }

    const db = createDatabase();

    userDataList.forEach((userData: UserData) => {
      insertUserData(db, userData);
    });

    db.close();

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
