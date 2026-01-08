import { db } from '../firebase-admin';
import { GlobalDTO, HomePageDTO } from '../dto';

export async function getHomePage(): Promise<HomePageDTO | null> {
  try {
    const doc = await db.collection('pages').doc('home').get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as HomePageDTO;
  } catch (error) {
    console.error('Error fetching home page data:', error);
    return null;
  }
}

export async function getGlobalSettings(): Promise<GlobalDTO | null> {
  try {
    const doc = await db.collection('globals').doc('settings').get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as GlobalDTO;
  } catch (error) {
    console.error('Error fetching global settings:', error);
    return null;
  }
}
