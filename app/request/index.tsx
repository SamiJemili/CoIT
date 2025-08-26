import { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

type Req = {
  id: string;
  title?: string;
  status?: string;
  createdAt?: any; // Timestamp
};

export default function MyRequests() {
  const [uid, setUid] = useState<string | null>(getAuth().currentUser?.uid ?? null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Req[]>([]);

  // suit l’auth pour être sûr d’avoir l’uid
  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), (u) => setUid(u?.uid ?? null));
    return unsub;
  }, []);

  // abonnement aux demandes de l’utilisateur
  useEffect(() => {
    if (!uid) { setItems([]); setLoading(false); return; }

    const q = query(collection(db, 'requests'), where('requesterId', '==', uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Req[];
        // tri côté client pour éviter d’exiger un index composite
        rows.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
        setItems(rows);
        setLoading(false);
      },
      (_err) => {
        // en cas d’erreur réseau, on montre juste une liste vide
        setItems([]);
        setLoading(false);
      }
    );
    return unsub;
  }, [uid]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: '#666' }}>Chargement…</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 28, fontWeight: '800' }}>Mes demandes</Text>

      {items.length === 0 ? (
        <Text style={{ color: '#6b7280' }}>Aucune demande pour le moment.</Text>
      ) : (
        items.map((r) => (
          <Link key={r.id} href={`/request/${r.id}`} asChild>
            <Pressable style={{ padding: 14, borderWidth: 1, borderRadius: 12, marginVertical: 6 }}>
              <Text style={{ fontWeight: '700' }}>{r.title || '(sans titre)'}</Text>
              <Text style={{ color: '#6b7280', marginTop: 4 }}>Statut : {r.status ?? 'open'}</Text>
            </Pressable>
          </Link>
        ))
      )}
    </View>
  );
}
