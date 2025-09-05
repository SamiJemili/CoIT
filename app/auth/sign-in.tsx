import { useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import UIButton from '../../components/UIButton';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { DocumentSnapshot, DocumentData } from 'firebase/firestore';
import { router, Link } from 'expo-router';
import { auth, db } from '../../lib/firebase';
import { withTimeout } from '../../lib/with-timeout';
import { useTheme } from '../../lib/theme';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, gap: 14 },
  title: { fontSize: 28, marginBottom: 8, color: colors.text, fontFamily: 'InterBold' },
    input: {
      borderWidth: 1,
      borderRadius: 10,
      padding: 12,
      borderColor: colors.border,
    },
    button: { marginTop: 6 },
    link: { marginTop: 14, color: colors.brand },
  });

  const go = async () => {
    if (!email.trim() || !password) return Alert.alert('Email / Mot de passe requis');

    setLoading(true);
    try {
      const cred = await withTimeout(
       signInWithEmailAndPassword(auth, email.trim(), password),
        20000,
      );
   // Profil Firestore
      const pref = doc(db, 'profiles', cred.user.uid);
    let snap: DocumentSnapshot<DocumentData> | null = null;
      try {
         snap = await withTimeout(getDoc(pref), 20000);
      } catch {
         snap = null;
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
 <View style={styles.container}>
      <Text style={styles.title}>Se connecter</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
         style={styles.input}
      />

      <UIButton
        onPress={go}
        disabled={loading}
         title={loading ? '' : 'SE CONNECTER'}
        style={styles.button}
      >
         {loading ? <ActivityIndicator color={colors.bg} /> : undefined}
       </UIButton>

      <Link href="/auth/sign-up" style={styles.link}>
        Créer un compte
      </Link>
    </View>
  );
}
