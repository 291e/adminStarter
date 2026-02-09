import { initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import type { Database } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const firebaseURLPatterns = [
  /^https:\/\/[\w-]+\.firebaseio\.com$/i,
  /^https:\/\/[\w-]+-default-rtdb\.[\w-]+\.firebasedatabase\.app$/i,
  /^https:\/\/[\w-]+\.firebasedatabase\.app$/i,
];

const validateDatabaseURL = (url: string): boolean => {
  if (!url) return false;
  const trimmed = url.trim();
  const isValid = firebaseURLPatterns.some((pattern) => pattern.test(trimmed));

  if (import.meta.env.DEV && !isValid) {
    console.warn('🔍 Firebase URL 검증 실패', {
      url: trimmed,
      hint: 'https://<project-id>-default-rtdb.<region>.firebasedatabase.app',
    });
  }

  return isValid;
};

const firebaseConfig = {
  apiKey: CONFIG.firebase.apiKey,
  authDomain: CONFIG.firebase.authDomain,
  databaseURL: CONFIG.firebase.databaseURL,
  projectId: CONFIG.firebase.projectId,
  storageBucket: CONFIG.firebase.storageBucket,
  messagingSenderId: CONFIG.firebase.messagingSenderId,
  appId: CONFIG.firebase.appId,
  measurementId: CONFIG.firebase.measurementId,
};

const isDatabaseUrlValid = validateDatabaseURL(CONFIG.firebase.databaseURL);

if (!isDatabaseUrlValid) {
  console.warn(
    '⚠️ Firebase Realtime Database URL이 설정되지 않았거나 유효하지 않습니다.\n' +
      '환경 변수 VITE_FIREBASE_DATABASE_URL을 설정해주세요.\n' +
      '형식: https://<project-id>-default-rtdb.<region>.firebasedatabase.app\n' +
      '또는: https://<project-id>.firebaseio.com\n' +
      `현재 값: "${CONFIG.firebase.databaseURL}"`
  );
}

let firebaseApp: FirebaseApp;
let database: Database | undefined;
let auth: Auth;
let firestore: Firestore;

try {
  firebaseApp = initializeApp(firebaseConfig);

  try {
    database = getDatabase(firebaseApp);
    if (!isDatabaseUrlValid) {
      console.warn('⚠️ 유효하지 않은 Database URL이지만 Firebase RTDB 초기화를 시도했습니다.');
    }
  } catch (dbError) {
    console.warn('⚠️ Firebase Realtime Database 초기화 실패:', dbError);
    database = undefined;
  }

  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
} catch (error) {
  console.error('❌ Firebase 초기화 실패:', error);
  throw new Error(
    'Firebase 초기화에 실패했습니다. 환경 변수를 확인해주세요.\n' +
      '필수 환경 변수:\n' +
      '- VITE_FIREBASE_API_KEY\n' +
      '- VITE_FIREBASE_AUTH_DOMAIN\n' +
      '- VITE_FIREBASE_PROJECT_ID\n' +
      '- VITE_FIREBASE_DATABASE_URL\n' +
      '- VITE_FIREBASE_STORAGE_BUCKET\n' +
      '- VITE_FIREBASE_MESSAGING_SENDER_ID\n' +
      '- VITE_FIREBASE_APPID'
  );
}

export { firebaseApp, database, auth, firestore };
