import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { createUserWithEmailAndPassword, updateProfile, signOut, deleteUser } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { router } from 'expo-router';
import { auth, db } from '../../lib/firebase';

type Role = 'client' | 'consultant';

// utilitaire: coupe court si Firestore traîne
const withTimeout = <T,>(p: Promise<T>, ms = 12000) =>
  Promise.race<T>([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error('TIMEOUT')), ms)),
  ]);

export default function SignUp() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [role, setRole]               = useState<Role>('client');
  const [loading, setLoading]         = useState(false);

  const submit = async () => {
    if (!displayName.trim()) return Alert.alert('Nom requis');
    if (!email.trim())        return Alert.alert('Email requis');
    if (password.length < 6)  return Alert.alert('Mot de passe ≥ 6 caractères');

    setLoading(true);
        let cred: any = null;
    try {
      // 1) Création du compte
          cred = await withTimeout(
        createUserWithEmailAndPassword(auth, email.trim(), password)
      );

      // 2) Nom d’affichage (facultatif)
      if (displayName.trim()) {
        await updateProfile(cred.user, { displayName: displayName.trim() });
      }

     // 3) Profil Firestore obligatoire
      await withTimeout(
        setDoc(
          doc(db, 'profiles', cred.user.uid),
          {
            uid: cred.user.uid,
            displayName: displayName.trim(),
            email: cred.user.email,
            role,
            createdAt: serverTimestamp(),
          },
          { merge: true }
        )
      );

      // 4) Retour au login (on se déconnecte)
      try { await signOut(auth); } catch {}
      Alert.alert('Compte créé', 'Veuillez vous connecter avec vos identifiants.');
      router.replace('/auth/sign-in');
    } catch (e: any) {
      console.error('SIGNUP ERROR >>', e);
      Alert.alert('Erreur', e?.message || String(e));
       if (cred) {
        try { await deleteUser(cred.user); } catch {}
      }
      try { await signOut(auth); } catch {}
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, gap: 14 }}>
      <Text style={{ fontSize: 28, fontWeight: '800', marginBottom: 8 }}>Créer un compte</Text>

      <TextInput
        placeholder="Nom"
        value={displayName}
        onChangeText={setDisplayName}
        autoCapitalize="words"
        style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
      />

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

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable
          onPress={() => setRole('client')}
          style={{
            flex: 1, padding: 12, borderRadius: 10, borderWidth: 1,
            backgroundColor: role === 'client' ? '#e0ecff' : 'white', alignItems: 'center'
          }}
        >
          <Text style={{ fontWeight: '600' }}>Client</Text>
        </Pressable>
        <Pressable
          onPress={() => setRole('consultant')}
          style={{
            flex: 1, padding: 12, borderRadius: 10, borderWidth: 1,
            backgroundColor: role === 'consultant' ? '#e0ecff' : 'white', alignItems: 'center'
          }}
        >
          <Text style={{ fontWeight: '600' }}>Consultant</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={submit}
        disabled={loading}
        style={{
          marginTop: 6, backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 14,
          alignItems: 'center', opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: 'white', fontWeight: '800' }}>CRÉER MON COMPTE</Text>}
      </Pressable>
    </View>
  );
}
