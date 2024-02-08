import { NextApiRequest, NextApiResponse } from 'next';
import 'firebase/firestore';
import { collection, getDocs } from 'firebase/firestore/lite';
import { Site } from '@/components/Types/types';

import { db } from '@/components/Database/firebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await getSites();

    return res.status(200).json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des sites :', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la récupération des sites.' });
  }
}

async function getSites(): Promise<Site[]> {
  const sitesCol = collection(db, 'sites');
  const sitesSnapshot = await getDocs(sitesCol);
  const sitesList = sitesSnapshot.docs.map((doc) => doc.data());

  const ret = sitesList.map((site) => {
    const s: Site = {
      id: site.id,
      name: site.name as string,
      shortName: site.shortName as string,
      expenses: [],
    };

    return s;
  });

  return ret;
}
