import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Alert } from 'react-native';
import Dialog from 'react-native-dialog';
import { useLocalSearchParams } from 'expo-router';
import { auth, db } from '../../lib/firebase';
import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getUserRole } from '../../lib/roles';
import { useTheme } from '../../lib/theme';
import { parsePositiveNumber } from '../../lib/priceValidation';



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
  const [noteVisible, setNoteVisible] = useState(false);
  const [noteText, setNoteText] = useState('');
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
      priceBar: { flexDirection: 'row', padding: 8, borderBottomWidth: 1, borderColor: colors.border },
    priceInput: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, marginRight: 8, borderColor: colors.border },
    priceProposeBtn: { backgroundColor: colors.brand, borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
    priceProposeText: { color: colors.bg, fontFamily: 'InterBold' },
    pricePendingBar: { padding: 8, borderBottomWidth: 1, borderColor: colors.border },
    pricePendingText: { marginBottom: 8, color: colors.text },
    priceButtonsRow: { flexDirection: 'row', gap: 8 },
    priceAcceptBtn: { flex: 1, backgroundColor: colors.success, borderRadius: 8, padding: 8, alignItems: 'center' },
    priceRejectBtn: { flex: 1, backgroundColor: colors.danger, borderRadius: 8, padding: 8, alignItems: 'center' },
    priceActionText: { color: colors.bg, fontFamily: 'InterBold' },
    consultantBar: { flexDirection: 'row', justifyContent: 'space-around', padding: 8, borderBottomWidth: 1, borderColor: colors.border },
    onHoldBtn: { backgroundColor: colors.warning, padding: 8, borderRadius: 8 },
    onHoldText: { fontFamily: 'InterBold', color: colors.text },
    closeBtn: { backgroundColor: colors.dangerLight, padding: 8, borderRadius: 8 },
    closeText: { color: colors.bg, fontFamily: 'InterBold' },
    noteBtn: { backgroundColor: colors.info, padding: 8, borderRadius: 8 },
    noteText: { fontFamily: 'InterBold', color: colors.text },
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
    if (!id) return;
    const val = parsePositiveNumber(priceInput);
    if (val === null) {
      Alert.alert('Prix invalide', 'Veuillez entrer un nombre positif.');
      return;
    }
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

   const openNoteDialog = () => {
    setNoteText('');
    setNoteVisible(true);
  };

  const handleNoteCancel = () => {
    setNoteVisible(false);
    setNoteText('');
  };

  const addNote = async () => {
    if (!id || !auth.currentUser) return;
    const t = noteText.trim();
    if (!t) return;
    try {
      await addDoc(collection(db, 'requests', id, 'consultantNotes'), {
        text: t,
        consultantId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
      handleNoteCancel();
    } catch (e) {
      Alert.alert('Erreur', "Impossible d'ajouter le commentaire.");
    }
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
       <View style={styles.priceBar}>
          <TextInput
            placeholder="Prix"
            keyboardType="numeric"
            value={priceInput}
            onChangeText={setPriceInput}
         style={styles.priceInput}
          />
          <Pressable
            onPress={propose}
            style={styles.priceProposeBtn}
          >
             <Text style={styles.priceProposeText}>Proposer</Text>
          </Pressable>
        </View>
      ) : priceStatus === 'pending' ? (
        <View style={styles.pricePendingBar}>
          <Text style={styles.pricePendingText}>Prix proposé : {price}</Text>
          <View style={styles.priceButtonsRow}>
            <Pressable
              onPress={() => respond('accepted')}
           style={styles.priceAcceptBtn}
            >
              <Text style={styles.priceActionText}>Accepter</Text>
            </Pressable>
            <Pressable
              onPress={() => respond('rejected')}
             style={styles.priceRejectBtn}
            >
           <Text style={styles.priceActionText}>Refuser</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

{role === 'consultant' && (
        <View style={styles.consultantBar}>
          <Pressable onPress={() => changeStatus('on_hold')} style={styles.onHoldBtn}>
           <Text style={styles.onHoldText}>Mettre en attente</Text>
          </Pressable>
          <Pressable onPress={() => changeStatus('closed')} style={styles.closeBtn}>
            <Text style={styles.closeText}>Clore la demande</Text>
          </Pressable>
            <Pressable onPress={addNote} style={styles.noteBtn}>
            <Text style={styles.noteText}>Ajouter un commentaire</Text>
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
      
      <Dialog.Container visible={noteVisible}>
        <Dialog.Title>Ajouter un commentaire</Dialog.Title>
        <Dialog.Input value={noteText} onChangeText={setNoteText} />
        <Dialog.Button label="Annuler" onPress={handleNoteCancel} />
        <Dialog.Button label="Ajouter" onPress={addNote} />
      </Dialog.Container>
    </KeyboardAvoidingView>
  );
}
