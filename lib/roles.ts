// lib/roles.ts
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function getUserRole(uid: string): Promise<'client'|'consultant'|null> {
  try {
    const snap = await getDoc(doc(db, 'profiles', uid));
    const role = snap.exists() ? (snap.data() as any).role : null;
    return role === 'consultant' ? 'consultant' : role === 'client' ? 'client' : null;
  } catch {
    // en cas d'offline ou autre : ne bloque pas l'app
    return null;
  }
}
