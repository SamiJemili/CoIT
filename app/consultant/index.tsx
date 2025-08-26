import { useEffect, useState } from 'react';
import { View, Text, Switch, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { getAuth, signOut } from 'firebase/auth';
import { db } from '../../lib/firebase';
import {
  onSnapshot, collection, query, where, orderBy, limit,
} from 'firebase/firestore';

type Req = { id: string; title?: string; status?: string; requesterEmail?: string };

export default function Consultant() {
  const [online, setOnline] = useState(false);
  const [loading, setLoad]  = useState(true);
  const [reqs, setReqs]     = useState<Req[]>([]);

  useEffect(() => {
    // On prend "open" et "assigned" (sans orderBy pour éviter un index composite)
    const q = query(
      collection(db, 'requests'),
      where('status', 'in', ['open', 'assigned']),
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
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 26, fontWeight: '800' }}>Panneau Consultant</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text>{online ? 'En ligne' : 'Hors ligne'}</Text>
        <Switch value={online} onValueChange={setOnline} />
      </View>

      <Pressable onPress={logout} style={{ backgroundColor:'#1d4ed8', padding:12, borderRadius:12, alignItems:'center' }}>
        <Text style={{ color:'#fff', fontWeight:'800' }}>Se déconnecter</Text>
      </Pressable>

      <Text style={{ marginTop: 10, fontWeight: '700' }}>Demandes (open / assigned)</Text>

      {loading ? (
        <View style={{ marginTop: 24, alignItems:'center' }}>
          <ActivityIndicator />
          <Text style={{ color:'#6b7280', marginTop:8 }}>Chargement…</Text>
        </View>
      ) : reqs.length === 0 ? (
        <Text style={{ color:'#6b7280', marginTop:12 }}>Aucune demande.</Text>
      ) : (
        reqs.map(r => (
          <Link
            key={r.id}
            href={{ pathname: '/request/[id]', params: { id: r.id, consultant: '1' } }}
            asChild
          >
            <Pressable style={{ padding:12, borderWidth:1, borderRadius:12, marginVertical:6 }}>
              <Text style={{ fontWeight:'700' }}>{r.title || '(sans titre)'}</Text>
              {!!r.requesterEmail && <Text style={{ color:'#666' }}>{r.requesterEmail}</Text>}
              <Text style={{ color:'#666' }}>Statut : {r.status || 'open'}</Text>
            </Pressable>
          </Link>
        ))
      )}
    </View>
  );
}
