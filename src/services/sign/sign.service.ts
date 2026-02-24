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
  FindIdRequestDto,
  FindIdRequestResponseDto,
  FindIdConfirmDto,
  FindIdConfirmResponseDto,
  PasswordResetRequestDto,
  PasswordResetRequestResponseDto,
  PasswordResetConfirmDto,
  PasswordResetConfirmResponseDto,
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

/**
 * 아이디 찾기 인증 코드 요청
 * POST /user/find-id/request
 */
export async function requestFindIdCode(params: FindIdRequestDto): Promise<FindIdRequestResponseDto> {
  const response = await axiosInstance.post<FindIdRequestResponseDto>(
    endpoints.auth.findIdRequest,
    params
  );
  return response.data;
}

/**
 * 아이디 찾기 인증 코드 확인
 * POST /user/find-id/confirm
 */
export async function confirmFindIdCode(params: FindIdConfirmDto): Promise<FindIdConfirmResponseDto> {
  const response = await axiosInstance.post<FindIdConfirmResponseDto>(
    endpoints.auth.findIdConfirm,
    params
  );
  return response.data;
}

/**
 * 비밀번호 재설정 인증 코드 요청
 * POST /user/password-reset/request
 */
export async function requestPasswordResetCode(
  params: PasswordResetRequestDto
): Promise<PasswordResetRequestResponseDto> {
  const response = await axiosInstance.post<PasswordResetRequestResponseDto>(
    endpoints.auth.passwordResetRequest,
    params
  );
  return response.data;
}

/**
 * 비밀번호 재설정 인증 코드 확인 + 새 비밀번호 저장
 * POST /user/password-reset/confirm
 */
export async function confirmPasswordReset(
  params: PasswordResetConfirmDto
): Promise<PasswordResetConfirmResponseDto> {
  const response = await axiosInstance.post<PasswordResetConfirmResponseDto>(
    endpoints.auth.passwordResetConfirm,
    params
  );
  return response.data;
}
