// pages/api/uploadSales.ts

import { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'savedData.json');

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

    try {
      await fs.access(dataFilePath);
    } catch (error) {
      await fs.writeFile(dataFilePath, '[]', 'utf-8');
    }

    try {
      // Charge les données existantes depuis le fichier
      const existingData = await fs.readFile(dataFilePath, 'utf-8');
      const parsedData = JSON.parse(existingData);

      // Ajoute les nouvelles données
      parsedData.push(userDataList);

      // Enregistre les données mises à jour dans le fichier
      await fs.writeFile(dataFilePath, JSON.stringify(userDataList, null, 2));

      return res.status(200).json({ success: true, message: 'Données enregistrées avec succès.' });
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des données :", error);
      return res.status(500).json({ success: false, error: 'Erreur serveur interne.' });
    }

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
