import axiosInstance from 'src/lib/axios';

import { endpoints } from 'src/lib/axios';

import type {
  InvitationDto,
  InvitationResponseDto,
  SignUpDto,
  SignUpResponseDto,
  SignInDto,
  SignInResponseDto,
  SignOutResponseDto,
} from './sign.types';

// ----------------------------------------------------------------------

/**
 * 초대 링크 및 코드 검증
 * POST /user/invitation
 */
export async function verifyInvitation(params: InvitationDto): Promise<InvitationResponseDto> {
  const response = await axiosInstance.post<InvitationResponseDto>(
    endpoints.auth.invitation,
    params
  );
  return response.data;
}

/**
 * 회원가입
 * POST /user/signup
 */
export async function signUp(params: SignUpDto): Promise<SignUpResponseDto> {
  const response = await axiosInstance.post<SignUpResponseDto>(endpoints.auth.signUp, params);
  return response.data;
}

/**
 * 로그인
 * POST /user/signin
 */
export async function signIn(params: SignInDto): Promise<SignInResponseDto> {
  const response = await axiosInstance.post<SignInResponseDto>(endpoints.auth.signIn, params);
  return response.data;
}

/**
 * 로그아웃
 * POST /user/signout
 */
export async function signOut(): Promise<SignOutResponseDto> {
  const response = await axiosInstance.post<SignOutResponseDto>(endpoints.auth.signout);
  return response.data;
}

