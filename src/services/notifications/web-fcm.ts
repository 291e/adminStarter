import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';

import { firebaseApp } from 'src/config/firebase';
import { CONFIG } from 'src/global-config';
import { updateFcmToken } from 'src/services/member/member.service';

let initializing = false;
let initialized = false;

export async function initWebFcm(): Promise<void> {
  if (initialized || initializing) return;
  if (typeof window === 'undefined') return;

  const vapidKey = CONFIG.firebase.vapidKey;
  if (!vapidKey) {
    if (import.meta.env.DEV) {
      console.warn('[FCM] VAPID key가 설정되지 않아 웹 푸시를 건너뜁니다.');
    }
    return;
  }

  initializing = true;

  try {
    const supported = await isSupported();
    if (!supported) return;

    if (!('serviceWorker' in navigator) || !('Notification' in window)) return;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const messaging = getMessaging(firebaseApp);

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      await updateFcmToken({ fcmToken: token });
    }

    onMessage(messaging, (payload) => {
      if (import.meta.env.DEV) {
        console.debug('[FCM] foreground message', payload);
      }
    });

    initialized = true;
  } catch (error) {
    console.warn('[FCM] 초기화 실패', error);
  } finally {
    initializing = false;
  }
}
