import { useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, Alert } from 'react-native';
import UIButton from '../../components/UIButton';
import { createUserWithEmailAndPassword, updateProfile, signOut, deleteUser } from 'firebase/auth';
import type { UserCredential } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { router } from 'expo-router';
import { auth, db } from '../../lib/firebase';
import { withTimeout } from '../../lib/with-timeout';

type Role = 'client' | 'consultant';



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
          let cred: UserCredential | null = null;
    try {
      // 1) Création du compte
       cred = await withTimeout(
        createUserWithEmailAndPassword(auth, email.trim(), password),
        12000,
      );

      // 2) Nom d’affichage (facultatif)
       const user = cred!.user;
      if (displayName.trim()) {
          await updateProfile(user, { displayName: displayName.trim() });
      }

     // 3) Profil Firestore obligatoire
       try {
        await withTimeout(
          setDoc(
             doc(db, 'profiles', user.uid),
            {
              uid: user.uid,
              displayName: displayName.trim(),
              email: user.email,
              role,
              createdAt: serverTimestamp(),
            },
            { merge: true }
          ),
          20000
        );
      } catch (err: any) {
        console.error('SETDOC ERROR >>', err);
        Alert.alert(
          'Erreur',
          "Échec lors de l'écriture du profil",
          [
            { text: 'Réessayer', onPress: submit },
            { text: 'Connexion', onPress: () => router.replace('/auth/sign-in') },
          ]
        );
        if (cred) {
          try { await deleteUser(cred.user); } catch {}
        }
        try { await signOut(auth); } catch {}
        return;
      }
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
        <UIButton
          onPress={() => setRole('client')}
          style={{
             flex: 1,
            padding: 12,
            borderRadius: 10,
            borderWidth: 1,
            backgroundColor: role === 'client' ? '#e0ecff' : 'white',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontWeight: '600' }}>Client</Text>
         </UIButton>
        <UIButton
          onPress={() => setRole('consultant')}
          style={{
           flex: 1,
            padding: 12,
            borderRadius: 10,
            borderWidth: 1,
            backgroundColor: role === 'consultant' ? '#e0ecff' : 'white',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontWeight: '600' }}>Consultant</Text>
         </UIButton>
      </View>

       <UIButton
        onPress={submit}
        disabled={loading}
       title={loading ? '' : 'CRÉER MON COMPTE'}
        style={{ marginTop: 6 }}
      >
          {loading ? <ActivityIndicator color="#fff" /> : undefined}
      </UIButton>
    </View>
  );
}
