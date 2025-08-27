import { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { auth, db } from '../../lib/firebase';
import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';

interface Message {
  id: string;
  text: string;
  from: string;
  createdAt: any;
}

export default function RequestChat() {
  const { id } = useLocalSearchParams<{ id: string }>(); // id de la demande
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(true);
    const flatListRef = useRef<FlatList<Message>>(null);

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
      setLoading(false);

      // Scroll auto en bas
      if (flatListRef.current) {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 300);
      }
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

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 6 }}>Chargement…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const mine = item.from === auth.currentUser?.uid;
          return (
            <View
              style={{
                alignSelf: mine ? 'flex-end' : 'flex-start',
                backgroundColor: mine ? '#2563eb' : '#e5e7eb',
                marginVertical: 4,
                marginHorizontal: 8,
                padding: 10,
                borderRadius: 12,
                maxWidth: '80%',
              }}
            >
              <Text style={{ color: mine ? 'white' : 'black' }}>{item.text}</Text>
            </View>
          );
        }}
      />

      <View style={{ flexDirection: 'row', padding: 8, borderTopWidth: 1, borderColor: '#ddd' }}>
        <TextInput
          placeholder="Écrire un message…"
          value={input}
          onChangeText={setInput}
          style={{ flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 }}
        />
        <Pressable
          onPress={send}
          style={{ backgroundColor: '#2563eb', borderRadius: 20, paddingHorizontal: 16, justifyContent: 'center' }}
        >
          <Text style={{ color: 'white', fontWeight: '700' }}>Envoyer</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
