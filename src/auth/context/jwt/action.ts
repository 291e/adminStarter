import { signIn as signInApi, signUp as signUpApi } from 'src/services/sign/sign.service';

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
}: SignUpParams): Promise<void> => {
  // 새로운 API 사용 (초대 링크/코드가 필요하므로 임시로 처리)
  // 실제로는 초대 링크/코드를 받아서 사용해야 함
  const params = {
    link: '', // 초대 링크 필요
    code: '', // 초대 코드 필요
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
    await setSession(null);
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};
