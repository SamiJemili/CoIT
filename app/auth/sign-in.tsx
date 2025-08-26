import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { router, Link } from 'expo-router';
import { auth, db } from '../../lib/firebase';

const withTimeout = <T,>(p: Promise<T>, ms = 12000) =>
  Promise.race<T>([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error('TIMEOUT')), ms)),
  ]);

export default function SignIn() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const go = async () => {
    if (!email.trim() || !password) return Alert.alert('Email / Mot de passe requis');

    setLoading(true);
    try {
      const cred = await withTimeout(
        signInWithEmailAndPassword(auth, email.trim(), password)
      );
   // Profil Firestore
      const pref = doc(db, 'profiles', cred.user.uid);
      let snap;
      try {
        snap = await withTimeout(getDoc(pref));
      } catch {
        snap = undefined as any;
      }

            if (!snap || !snap.exists()) {
        Alert.alert(
          'Erreur',
          !snap ? 'Profil introuvable' : 'Profil utilisateur introuvable.'
        );
        await signOut(auth);
        return;
      }

    const role = (snap.data()?.role as string) || 'client';
      if (role === 'consultant') {
        router.replace('/consultant');
      } else {
        router.replace('/'); // accueil client
      }
    } catch (e: any) {
      console.error('LOGIN ERROR >>', e);
      Alert.alert('Erreur', e?.message || String(e));
      try { await signOut(auth); } catch {}
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, gap: 14 }}>
      <Text style={{ fontSize: 28, fontWeight: '800', marginBottom: 8 }}>Se connecter</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
      />
      <TextInput
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
      />

      <Pressable
        onPress={go}
        disabled={loading}
        style={{
          marginTop: 6, backgroundColor: '#0f172a', borderRadius: 12, paddingVertical: 14,
          alignItems: 'center', opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: 'white', fontWeight: '800' }}>SE CONNECTER</Text>}
      </Pressable>

      <Link href="/auth/sign-up" style={{ marginTop: 14, color: '#2563eb' }}>
        Créer un compte
      </Link>
    </View>
  );
}
