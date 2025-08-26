import { Link, useRouter } from 'expo-router';
import { View, Text, Pressable, Alert } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';

export default function Home() {
  const r = useRouter();

  const logout = async () => {
    try {
      await signOut(getAuth());
      r.replace('/auth/sign-in');
    } catch (e: any) {
      Alert.alert('Erreur', e?.message ?? String(e));
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, gap: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: '800' }}>CoIT</Text>
      <Text style={{ color: '#5a6472', marginBottom: 8 }}>
        Bienvenue sur CoIT. Choisissez votre action.
      </Text>

      <Link href="/request/new" asChild>
        <Pressable
          style={{
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#e3e8ef',
            backgroundColor: '#fff',
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '700' }}>Créer une demande</Text>
          <Text style={{ color: '#5a6472' }}>Décrivez votre besoin TI</Text>
        </Pressable>
      </Link>

      <Link href="/request" asChild>
        <Pressable
          style={{
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#e3e8ef',
            backgroundColor: '#fff',
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '700' }}>Mes demandes</Text>
          <Text style={{ color: '#5a6472' }}>Suivre statut et chat</Text>
        </Pressable>
      </Link>

      <Pressable
        onPress={logout}
        style={{
          marginTop: 24,
          backgroundColor: '#1d4ed8',
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>
          Se déconnecter
        </Text>
      </Pressable>
    </View>
  );
}
