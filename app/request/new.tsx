import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { addDoc, collection, serverTimestamp, waitForPendingWrites } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { router } from 'expo-router';
import { db, sleep } from '../../lib/firebase';

// coupe court si réseau lent
const withTimeout = <T,>(p: Promise<T>, ms = 12000) =>
  Promise.race<T>([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error('TIMEOUT')), ms)),
  ]);

export default function NewRequest() {
  const [title, setTitle]   = useState('');
  const [desc, setDesc]     = useState('');
  const [loading, setLoad]  = useState(false);

  const submit = async () => {
    const u = getAuth().currentUser;
    if (!u) return Alert.alert('Veuillez vous connecter.');
    if (!title.trim()) return Alert.alert('Titre requis');

    setLoad(true);
    try {
      const ref = await withTimeout(
        addDoc(collection(db, 'requests'), {
          title: title.trim(),
          description: desc.trim(),
          requesterId: u.uid,
          requesterEmail: u.email ?? '',
          status: 'open',
          createdAt: serverTimestamp(),
        })
      );

      // On force un flush réseau court (sans bloquer l’UI)
      try {
        await withTimeout(waitForPendingWrites(db), 4000);
      } catch {}

      // Redirige directement vers le chat de cette demande
      router.replace({ pathname: '/request/[id]', params: { id: ref.id } });
    } catch (e: any) {
      console.error('NEW REQUEST ERROR >>', e);
      Alert.alert('Erreur', e?.message || String(e));
    } finally {
      setLoad(false);
    }
  };

  return (
    <View style={{ flex:1, padding:20, gap:12 }}>
      <Text style={{ fontSize:24, fontWeight:'800' }}>Nouvelle demande</Text>
      <TextInput
        placeholder="Titre"
        value={title}
        onChangeText={setTitle}
        style={{ borderWidth:1, borderRadius:10, padding:12 }}
      />
      <TextInput
        placeholder="Description"
        value={desc}
        onChangeText={setDesc}
        multiline
        style={{ borderWidth:1, borderRadius:10, padding:12, minHeight:120 }}
      />

      <Pressable
        onPress={submit}
        disabled={loading}
        style={{ marginTop:6, backgroundColor:'#2563eb', borderRadius:12, paddingVertical:14, alignItems:'center', opacity:loading?0.7:1 }}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color:'#fff', fontWeight:'800' }}>ENVOYER</Text>}
      </Pressable>
    </View>
  );
}
