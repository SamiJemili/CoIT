import { useEffect, useState, useMemo } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useTheme } from '../../lib/theme';

type Req = {
  id: string;
  title?: string;
  status?: string;
  createdAt?: any; // Timestamp
    price?: number;
  priceStatus?: 'pending' | 'accepted' | 'rejected' | null;
};

export default function MyRequests() {
  const [uid, setUid] = useState<string | null>(getAuth().currentUser?.uid ?? null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Req[]>([]);
  const { colors } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 8, color: colors.subtext },
    container: { flex: 1, padding: 16, gap: 12 },
    title: { fontSize: 28, fontWeight: '800', color: colors.text },
    empty: { color: colors.subtext },
    card: { padding: 14, borderWidth: 1, borderRadius: 12, marginVertical: 6, borderColor: colors.border },
    cardTitle: { fontWeight: '700', color: colors.text },
    cardSub: { color: colors.subtext, marginTop: 4 },
  }), [colors]);

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
      <View style={styles.loading}>
        <ActivityIndicator color={colors.brand} />
        <Text style={styles.loadingText}>Chargement…</Text>
      </View>
    );
  }

  return (
     <View style={styles.container}>
      <Text style={styles.title}>Mes demandes</Text>

      {items.length === 0 ? (
      <Text style={styles.empty}>Aucune demande pour le moment.</Text>
      ) : (
        items.map((r) => (
          <Link key={r.id} href={`/request/${r.id}`} asChild>
            <Pressable style={styles.card}>
              <Text style={styles.cardTitle}>{r.title || '(sans titre)'}</Text>
              <Text style={styles.cardSub}>
                Statut : {r.status ?? 'open'}
                {r.price ? ` • ${r.price}€` : ''}
              </Text>
            </Pressable>
          </Link>
        ))
      )}
    </View>
  );
}
