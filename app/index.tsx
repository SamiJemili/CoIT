import { Link, useRouter } from 'expo-router';
import { View, Text, Alert } from 'react-native';
import UIButton from '../components/UIButton';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/theme';
import { getAuth, signOut } from 'firebase/auth';

export default function Home() {
  const r = useRouter();
   const { colors } = useTheme();

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
       <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text }}>CoIT</Text>
      <Text style={{ color: colors.subtext, marginBottom: 8 }}>
        Bienvenue sur CoIT. Choisissez votre action.
      </Text>

      <Link href="/request/new" asChild>
        <UIButton
          style={{
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
             borderColor: colors.border,
            backgroundColor: colors.bg,
          }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons
              name="create-outline"
              size={24}
              color={colors.accent}
              style={{ marginRight: 8 }}
            />
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
              Créer une demande
            </Text>
          </View>
          <Text style={{ color: colors.subtext }}>Décrivez votre besoin TI</Text>
        </UIButton>
      </Link>

      <Link href="/request" asChild>
        <UIButton
          style={{
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
               borderColor: colors.border,
            backgroundColor: colors.bg,
          }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons
              name="reader-outline"
              size={24}
              color={colors.text}
              style={{ marginRight: 8 }}
            />
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
              Mes demandes
            </Text>
          </View>
          <Text style={{ color: colors.subtext }}>Suivre statut et chat</Text>
        </UIButton>
      </Link>

      <UIButton
        onPress={logout}
       
      
       title="Se déconnecter"
        style={{ marginTop: 24 }}
        textStyle={{ fontSize: 18 }}
        />
    </View>
  );
}
