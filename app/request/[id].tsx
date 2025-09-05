import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { auth, db } from '../../lib/firebase';
import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getUserRole } from '../../lib/roles';
import { useTheme } from '../../lib/theme';



interface Message {
  id: string;
  text: string;
  from: string;
  createdAt: any;
}
interface ReqInfo {
  status?: string;
  price?: number;
}


export default function RequestChat() {
   const { id, consultant } = useLocalSearchParams<{ id: string; consultant?: string }>(); // id de la demande
  const isConsultant = consultant === '1';
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState('');

 const [price, setPrice]         = useState<number | null>(null);
  const [priceStatus, setPriceStatus] = useState<'pending' | 'accepted' | 'rejected' | null>(null);
  const [priceInput, setPriceInput]   = useState('');
    const [role, setRole]           = useState<'client'|'consultant'|null>(null);
const [msgsLoading, setMsgsLoading] = useState(true);
  const [info, setInfo] = useState<ReqInfo | null>(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const flatListRef = useRef<FlatList<Message>>(null);
  const { colors } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    loadingText: { marginTop: 6, color: colors.subtext },
    container: { flex: 1 },
    bubble: { marginVertical: 4, marginHorizontal: 8, padding: 10, borderRadius: 12, maxWidth: '80%' },
    bubbleMe: { alignSelf: 'flex-end', backgroundColor: colors.accent },
    bubbleOther: { alignSelf: 'flex-start', backgroundColor: colors.border },
    bubbleTextMe: { color: colors.text },
    bubbleTextOther: { color: colors.text },
    inputRow: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderColor: colors.border },
    input: { flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, borderColor: colors.border, color: colors.text },
     sendBtn: { backgroundColor: colors.accent, borderRadius: 20, paddingHorizontal: 16, justifyContent: 'center' },
     sendText: { color: colors.text, fontFamily: 'InterBold' },
    infoBar: { padding: 8, borderBottomWidth: 1, borderColor: colors.border },
    infoText: { textAlign: 'center', color: colors.subtext },
  }), [colors]);

  useEffect(() => {
    if (auth.currentUser) {
      getUserRole(auth.currentUser.uid).then(setRole);
    }
  }, []);


  useEffect(() => {
    if (!id) return;
    const q = query(
      collection(db, 'requests', id, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const arr: Message[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setMessages(arr);
  setMsgsLoading(false);

      // Scroll auto en bas
      if (flatListRef.current) {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 300);
      }
    });

    return unsub;
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'requests', id), (snap) => {
      setInfo(snap.data() as any);
      setInfoLoading(false);
    });
    return unsub;
  }, [id]);

  const uid = auth.currentUser?.uid;

  const renderItem = useCallback(({ item }: { item: Message }) => {
    const mine = item.from === uid;
    return (
      <View style={[styles.bubble, mine ? styles.bubbleMe : styles.bubbleOther]}>
        <Text style={mine ? styles.bubbleTextMe : styles.bubbleTextOther}>{item.text}</Text>
      </View>
    );
  }, [uid, styles]);


  // récupère le prix et son statut
  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'requests', id), (snap) => {
      const data = snap.data() as any;
      setPrice(data?.price ?? null);
      setPriceStatus(data?.priceStatus ?? null);
    });
    return unsub;
  }, [id]);



  const send = async () => {
    if (!id || !input.trim() || !auth.currentUser) return;

    const text = input.trim();
    setInput('');
    try {
      await addDoc(collection(db, 'requests', id, 'messages'), {
        text,
        from: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error('Send error', e);
    }
  };
 const propose = async () => {
    const val = parseFloat(priceInput);
    if (!id || isNaN(val)) return;
    setPriceInput('');
    try {
      await updateDoc(doc(db, 'requests', id), { price: val, priceStatus: 'pending' });
    } catch (e) {
      console.error('Propose error', e);
    }
  };

  const respond = async (status: 'accepted' | 'rejected') => {
    if (!id) return;
    try {
      await updateDoc(doc(db, 'requests', id), { priceStatus: status });
    } catch (e) {
      console.error('Respond error', e);
    }
  };
 const changeStatus = async (status: 'on_hold' | 'closed') => {
    if (!id) return;
    try {
      await updateDoc(doc(db, 'requests', id), { status });
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut.');
    }
  };

  const addNote = () => {
    if (!id || !auth.currentUser) return;
    Alert.prompt('Ajouter un commentaire', undefined, async (text) => {
      const t = text?.trim();
      if (!t) return;
      try {
        await addDoc(collection(db, 'requests', id, 'consultantNotes'), {
          text: t,
            consultantId: auth.currentUser!.uid,
          createdAt: serverTimestamp(),
        });
      } catch (e) {
        Alert.alert('Erreur', 'Impossible d\'ajouter le commentaire.');
      }
    });
  };

 if (msgsLoading || infoLoading) {
    return (
      <View style={styles.loading}>
           <ActivityIndicator color={colors.accent} />
        <Text style={styles.loadingText}>Chargement…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
       style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >

         {info && (
        <View style={styles.infoBar}>
          <Text style={styles.infoText}>
            Statut : {info.status ?? 'open'}
            {info.price ? ` • ${info.price}€` : ''}
          </Text>
        </View>
      )}
        {isConsultant ? (
        <View style={{ flexDirection: 'row', padding: 8, borderBottomWidth: 1, borderColor: '#ddd' }}>
          <TextInput
            placeholder="Prix"
            keyboardType="numeric"
            value={priceInput}
            onChangeText={setPriceInput}
            style={{ flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, marginRight: 8 }}
          />
          <Pressable
            onPress={propose}
            style={{ backgroundColor: '#2563eb', borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' }}
          >
             <Text style={{ color: 'white', fontFamily: 'InterBold' }}>Proposer</Text>
          </Pressable>
        </View>
      ) : priceStatus === 'pending' ? (
        <View style={{ padding: 8, borderBottomWidth: 1, borderColor: '#ddd' }}>
          <Text style={{ marginBottom: 8 }}>Prix proposé : {price}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={() => respond('accepted')}
              style={{ flex: 1, backgroundColor: '#16a34a', borderRadius: 8, padding: 8, alignItems: 'center' }}
            >
               <Text style={{ color: 'white', fontFamily: 'InterBold' }}>Accepter</Text>
            </Pressable>
            <Pressable
              onPress={() => respond('rejected')}
              style={{ flex: 1, backgroundColor: '#dc2626', borderRadius: 8, padding: 8, alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontFamily: 'InterBold' }}>Refuser</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

 {role === 'consultant' && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 8, borderBottomWidth: 1, borderColor: '#ddd' }}>
          <Pressable onPress={() => changeStatus('on_hold')} style={{ backgroundColor: '#fde68a', padding: 8, borderRadius: 8 }}>
           <Text style={{ fontFamily: 'InterBold' }}>Mettre en attente</Text>
          </Pressable>
          <Pressable onPress={() => changeStatus('closed')} style={{ backgroundColor: '#f87171', padding: 8, borderRadius: 8 }}>
            <Text style={{ color: 'white', fontFamily: 'InterBold' }}>Clore la demande</Text>
          </Pressable>
          <Pressable onPress={addNote} style={{ backgroundColor: '#93c5fd', padding: 8, borderRadius: 8 }}>
            <Text style={{ fontFamily: 'InterBold' }}>Ajouter un commentaire</Text>
          </Pressable>
        </View>
      )}


      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
       
         renderItem={renderItem}
      />

     <View style={styles.inputRow}>
        <TextInput
          placeholder="Écrire un message…"
          value={input}
          onChangeText={setInput}
          style={styles.input}
        />
        <Pressable
          onPress={send}
          style={styles.sendBtn}
        >
           <Text style={styles.sendText}>Envoyer</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
