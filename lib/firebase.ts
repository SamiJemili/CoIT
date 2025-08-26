import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeFirestore, memoryLocalCache } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';


const cfg = (Constants.expoConfig?.extra as any)?.firebase ?? {};
export const app = getApps().length ? getApps()[0] : initializeApp(cfg);

export const auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
})();

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  localCache: memoryLocalCache(),
});

export const storage = getStorage(app);
export const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
