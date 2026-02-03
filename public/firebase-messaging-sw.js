/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// NOTE: 아래 Firebase 설정을 실제 값으로 채워주세요.
// 배포 환경에서 public/firebase-messaging-sw.js가 직접 제공되므로
// 빌드 시점 치환이 필요하면 별도 스크립트를 추가해야 합니다.
const firebaseConfig = self.FIREBASE_CONFIG || {
  apiKey: '',
  authDomain: '',
  projectId: '',
  databaseURL: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

if (firebaseConfig && firebaseConfig.messagingSenderId) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload?.notification?.title || payload?.data?.title || '새 메시지';
    const body = payload?.notification?.body || payload?.data?.body || '';

    self.registration.showNotification(title, {
      body,
      icon: '/favicon.ico',
    });
  });
}
