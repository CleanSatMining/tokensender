import { NextApiRequest, NextApiResponse } from 'next';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { app } from '@/components/Database/firebase';

/* eslint-disable */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  /* eslint-enable */

  try {
    // Charge les données depuis le fichier
    const data = await downloadFile();
    console.log('data', data);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Erreur lors de la lecture des données :', error);
    return res.status(500).json({ success: false, error: 'Erreur serveur interne.' });
  }
}

export async function downloadFile() {
  const storage = getStorage(app);
  // Create a storage reference from our storage service
  const storageRef = ref(storage, 'users/savedData.json');

  // Get the download URL
  try {
    const url = await getDownloadURL(storageRef);

    // Fetch the JSON data at the URL
    const response = await fetch(url);
    const data = await response.json();

    return data;
  } catch (error) {
    // Handle any errors
    console.error(error);
    throw error;
  }
}
