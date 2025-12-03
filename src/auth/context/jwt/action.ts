import { signIn as signInApi, signUp as signUpApi } from 'src/services/sign/sign.service';

import {
  signInWithCustomToken,
  setPersistence,
  browserLocalPersistence,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from 'src/config/firebase';

import { setSession } from './utils';
import { JWT_STORAGE_KEY } from './constant';

// ----------------------------------------------------------------------

export type SignInParams = {
  email: string;
  password: string;
};

export type SignUpParams = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  link?: string;
  code?: string;
};

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ email, password }: SignInParams): Promise<void> => {
  try {
    // 새로운 API 사용 (memberId는 email로 사용)
    const params = {
      memberId: email,
      password,
    };

    const res = await signInApi(params);

    // 디버깅: 응답 구조 확인
    console.log('🔍 SignIn Response:', JSON.stringify(res, null, 2));

    // 실제 응답 구조 확인 (여러 가능성 체크)
    // 타입 안전성을 위해 any로 캐스팅하여 유연하게 처리
    const resAny = res as any;
    const accessToken =
      resAny.body?.data?.accessToken ||
      resAny.body?.data?.body?.data?.accessToken ||
      resAny.body?.accessToken ||
      resAny.data?.accessToken ||
      resAny.accessToken;

    const firebaseToken =
      resAny.body?.data?.firebaseToken ||
      resAny.body?.data?.body?.data?.firebaseToken ||
      resAny.body?.firebaseToken ||
      resAny.data?.firebaseToken ||
      resAny.firebaseToken;

    if (!accessToken) {
      console.error('❌ Response structure:', res);
      console.error('❌ Available paths:', {
        'res.body?.data?.accessToken': resAny.body?.data?.accessToken,
        'res.body?.data?.body?.data?.accessToken': resAny.body?.data?.body?.data?.accessToken,
        'res.body?.accessToken': resAny.body?.accessToken,
        'res.data?.accessToken': resAny.data?.accessToken,
        'res.accessToken': resAny.accessToken,
      });
      throw new Error('Access token not found in response');
    }

    setSession(accessToken);

    if (firebaseToken) {
      try {
        await setPersistence(auth, browserLocalPersistence);
        await signInWithCustomToken(auth, firebaseToken);
      } catch (firebaseError) {
        console.error('Firebase 커스텀 토큰 로그인 실패:', firebaseError);
      }
    } else {
      console.warn(
        'Firebase 토큰을 응답에서 찾을 수 없습니다. 실시간 채팅 기능이 제한될 수 있습니다.'
      );
    }
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({
  email,
  password,
  firstName,
  lastName,
  link,
  code,
}: SignUpParams): Promise<void> => {
  // 새로운 API 사용 (초대 링크/코드가 필요)
  if (!link || !code) {
    throw new Error('초대 링크와 코드가 필요합니다.');
  }

  const params = {
    link,
    code,
    password,
    memberName: `${firstName} ${lastName}`,
    memberNameOrg: `${firstName} ${lastName}`,
  };

  try {
    const res = await signUpApi(params);

    // 실제 응답 구조 확인 (여러 가능성 체크)
    const resAny = res as any;
    const accessToken =
      resAny.body?.data?.accessToken ||
      resAny.body?.data?.body?.data?.accessToken ||
      resAny.body?.accessToken ||
      resAny.data?.accessToken ||
      resAny.accessToken;

    if (!accessToken) {
      console.error('❌ Response structure:', res);
      throw new Error('Access token not found in response');
    }

    sessionStorage.setItem(JWT_STORAGE_KEY, accessToken);
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async (): Promise<void> => {
  try {
    await Promise.all([
      setSession(null),
      firebaseSignOut(auth).catch((error) => {
        console.error('Firebase sign out failed:', error);
      }),
    ]);
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};
