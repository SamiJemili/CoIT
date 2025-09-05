import { Link, useRouter } from 'expo-router';
import { View, Text, Alert, StyleSheet } from 'react-native';
import UIButton from '../components/UIButton';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/theme';
import { getAuth, signOut } from 'firebase/auth';

export default function Home() {
  const r = useRouter();
   const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, gap: 16 },
     title: { fontSize: 28, color: colors.text, fontFamily: 'InterBold' },
    subtitle: { color: colors.subtext, marginBottom: 8 },
    button: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bg,
    },
    buttonRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    icon: { marginRight: 8 },
    buttonTitle: { fontSize: 18, color: colors.text, fontFamily: 'InterBold' },
    buttonSubtitle: { color: colors.subtext },
    logoutButton: { marginTop: 24 },
    logoutText: { fontSize: 18 },
  });

  const logout = async () => {
    try {
      await signOut(getAuth());
      r.replace('/auth/sign-in');
    } catch (e: any) {
      Alert.alert('Erreur', e?.message ?? String(e));
    }
  };

  return (
     <View style={styles.container}>
      <Text style={styles.title}>CoIT</Text>
      <Text style={styles.subtitle}>Bienvenue sur CoIT. Choisissez votre action.</Text>

      <Link href="/request/new" asChild>
          <UIButton style={styles.button}>
          <View style={styles.buttonRow}>
            <Ionicons
              name="create-outline"
              size={24}
              color={colors.accent}
               style={styles.icon}
            />
             <Text style={styles.buttonTitle}>Créer une demande</Text>
          </View>
          <Text style={styles.buttonSubtitle}>Décrivez votre besoin TI</Text>
        </UIButton>
      </Link>

      <Link href="/request" asChild>
        <UIButton style={styles.button}>
          <View style={styles.buttonRow}>
            <Ionicons
              name="reader-outline"
              size={24}
              color={colors.text}
               style={styles.icon}
            />
            <Text style={styles.buttonTitle}>Mes demandes</Text>
          </View>
          <Text style={{ color: colors.subtext }}>Suivre statut et chat</Text>
        </UIButton>
      </Link>

      <UIButton
        onPress={logout}
        title="Se déconnecter"
        style={styles.logoutButton}
        textStyle={styles.logoutText}
      />
    </View>
  );
}
