import { useEffect, useState, useMemo } from 'react';
import { View, Text, Switch, Pressable, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';
import { getAuth, signOut } from 'firebase/auth';
import { db } from '../../lib/firebase';
import {
  onSnapshot, collection, query, where, orderBy, limit,
} from 'firebase/firestore';
import { useTheme } from '../../lib/theme';

type Req = {
  id: string;
  title?: string;
  status?: 'open'|'assigned'|'on_hold'|'closed';
  requesterEmail?: string;
  price?: number;
  priceStatus?: 'pending' | 'accepted' | 'rejected' | null;
};

const statusLabel: Record<string, string> = {
  open: 'Ouverte',
  assigned: 'Assignée',
  on_hold: 'En attente',
  closed: 'Clôturée',
};
export default function Consultant() {
  const [online, setOnline] = useState(false);
  const [loading, setLoad]  = useState(true);
  const [reqs, setReqs]     = useState<Req[]>([]);
    const { colors } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, padding: 16, gap: 12 },
    header: { fontSize: 26, color: colors.text, fontFamily: 'InterBold' },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    statusText: { color: colors.text },
     logoutBtn: { backgroundColor: colors.accent, padding: 12, borderRadius: 12, alignItems: 'center' },
    logoutText: { color: colors.text, fontFamily: 'InterBold' },
    sectionTitle: { marginTop: 10, color: colors.text, fontFamily: 'InterBold' },
    loadingWrap: { marginTop: 24, alignItems: 'center' },
    loadingText: { color: colors.subtext, marginTop: 8 },
    emptyText: { color: colors.subtext, marginTop: 12 },
    card: { padding: 12, borderWidth: 1, borderRadius: 12, marginVertical: 6, borderColor: colors.border },
    cardTitle: { color: colors.text, fontFamily: 'InterBold' },
    cardEmail: { color: colors.subtext },
    cardStatus: { color: colors.subtext },
  }), [colors]);

  useEffect(() => {
    // On prend "open" et "assigned" (sans orderBy pour éviter un index composite)
    const q = query(
      collection(db, 'requests'),
      where('status', 'in', ['open', 'assigned', 'on_hold']),
      limit(50),
    );

    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      setReqs(rows);
      setLoad(false);
    }, (err) => {
      console.error('CONSULTANT SNAP ERROR >>', err);
      setLoad(false);
      Alert.alert('Erreur', err?.message || String(err));
    });

    return unsub;
  }, []);

  const logout = async () => {
    try { await signOut(getAuth()); } catch {}
    router.replace('/auth/sign-in');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Panneau Consultant</Text>

    <View style={styles.statusRow}>
        <Text style={styles.statusText}>{online ? 'En ligne' : 'Hors ligne'}</Text>
        <Switch value={online} onValueChange={setOnline} />
      </View>

       <Pressable onPress={logout} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </Pressable>

        <Text style={styles.sectionTitle}>Demandes en cours</Text>

      {loading ? (
        <View style={styles.loadingWrap}>
           <ActivityIndicator color={colors.accent} />
          <Text style={styles.loadingText}>Chargement…</Text>
        </View>
      ) : reqs.length === 0 ? (
        <Text style={styles.emptyText}>Aucune demande.</Text>
      ) : (
        reqs.map(r => (
          <Link
            key={r.id}
            href={{ pathname: '/request/[id]', params: { id: r.id, consultant: '1' } }}
            asChild
          >
              <Pressable style={styles.card}>
              <Text style={styles.cardTitle}>{r.title || '(sans titre)'}</Text>
              {!!r.requesterEmail && <Text style={styles.cardEmail}>{r.requesterEmail}</Text>}
              <Text style={styles.cardStatus}>
                Statut : {r.status || 'open'}
                {r.price ? ` • ${r.price}€` : ''}
              </Text>
            </Pressable>
          </Link>
        ))
      )}
    </View>
  );
}
