import { db } from '../firebase-admin';
import { ContactSignupDTO } from '../dto';

const COLLECTION = 'contact-signups';

export async function submitContactForm(data: Omit<ContactSignupDTO, 'createdAt'>) {
  try {
    const docRef = await db.collection(COLLECTION).add({
      ...data,
      createdAt: new Date(), // Admin SDK uses standard Date or FieldValue.serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return { success: false, error };
  }
}
