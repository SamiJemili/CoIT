import { useState, useMemo } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { addDoc, collection, serverTimestamp, waitForPendingWrites } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { router } from 'expo-router';
import { db } from '../../lib/firebase';
import { withTimeout } from '../../lib/with-timeout';
import { useTheme } from '../../lib/theme';

export default function NewRequest() {
  const [title, setTitle]   = useState('');
  const [desc, setDesc]     = useState('');
  const [loading, setLoad]  = useState(false);
    const { colors } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, padding: 20, gap: 12 },
    title: { fontSize: 24, fontWeight: '800', color: colors.text },
    input: { borderWidth: 1, borderRadius: 10, padding: 12, borderColor: colors.border, color: colors.text },
    inputDesc: { borderWidth: 1, borderRadius: 10, padding: 12, minHeight: 120, borderColor: colors.border, color: colors.text },
    sendBtn: { marginTop: 6, backgroundColor: colors.brand, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    sendText: { color: colors.bg, fontWeight: '800' },
  }), [colors]);

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
            price: null,
          priceStatus: null,
          createdAt: serverTimestamp(),
       }),
        20000,
      );

      // On force un flush réseau court (sans bloquer l’UI)
      try {
     await withTimeout(waitForPendingWrites(db), 8000);
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
        <View style={styles.container}>
      <Text style={styles.title}>Nouvelle demande</Text>
      <TextInput
        placeholder="Titre"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="Description"
        value={desc}
        onChangeText={setDesc}
        multiline
        style={styles.inputDesc}
      />

      <Pressable
        onPress={submit}
        disabled={loading}
          style={[styles.sendBtn, { opacity: loading ? 0.7 : 1 }]}
      >
              {loading ? <ActivityIndicator color={colors.bg} /> : <Text style={styles.sendText}>ENVOYER</Text>}
      </Pressable>
    </View>
  );
}
