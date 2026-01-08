import { db } from '../firebase-admin';
import { ProductDTO } from '../dto';

const COLLECTION = 'products';

export async function getProducts(): Promise<ProductDTO[]> {
  try {
    const snapshot = await db.collection(COLLECTION).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductDTO));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<ProductDTO | null> {
  try {
    const snapshot = await db.collection(COLLECTION).where('slug', '==', slug).limit(1).get();
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as ProductDTO;
  } catch (error) {
    console.error(`Error fetching product with slug ${slug}:`, error);
    return null;
  }
}

export async function getFeaturedProducts(): Promise<ProductDTO[]> {
  try {
    const snapshot = await db.collection(COLLECTION).where('featured', '==', true).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductDTO));
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}
