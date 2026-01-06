import axiosInstance from 'src/lib/axios';

import { endpoints } from 'src/lib/axios';

import type {
  GetMembersParams,
  GetMembersResponse,
  CreateMemberDto,
  CreateMemberResponse,
  GetMyInfoResponse,
  UpdateMyInfoDto,
  UpdateMyInfoResponse,
  UpdateMemberDto,
  UpdateMemberResponse,
  DeleteMemberResponse,
  SendMessageDto,
  SendChatbotMessageDto,
  SendHelpMessageDto,
  UpdateFcmTokenDto,
  UpdatePushSettingsDto,
  CheckIdParams,
  CheckIdResponse,
} from './member.types';

// ----------------------------------------------------------------------

/**
 * 아이디 중복검사
 * POST /user/check-id
 */
export async function checkId(params: CheckIdParams): Promise<CheckIdResponse> {
  const response = await axiosInstance.post<CheckIdResponse>(endpoints.auth.checkId, params);
  return response.data;
}

/**
 * 회원 생성
 * POST /member
 */
export async function createMember(params: CreateMemberDto): Promise<CreateMemberResponse> {
  const response = await axiosInstance.post<CreateMemberResponse>(endpoints.member.base, params);
  return response.data;
}

/**
 * 회원 목록 조회
 * GET /member
 */
export async function getMembers(params: GetMembersParams): Promise<GetMembersResponse> {
  const response = await axiosInstance.get<GetMembersResponse>(endpoints.member.base, {
    params: {
      filterMemberIndexes: params.filterMemberIndexes,
      filterMemberStatuses: params.filterMemberStatuses,
      searchingDateKey: params.searchingDateKey,
      searchingStartDate: params.searchingStartDate,
      searchingEndDate: params.searchingEndDate,
      searchingKey: params.searchingKey,
      searchingVal: params.searchingVal,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      page: params.page,
      pageSize: params.pageSize,
    },
  });

  return response.data;
}

/**
 * 내 정보 조회
 * GET /member/my-info
 */
export async function getMyInfo(): Promise<GetMyInfoResponse> {
  const response = await axiosInstance.get<GetMyInfoResponse>(endpoints.member.myInfo);
  return response.data;
}

/**
 * 내 정보 수정
 * PUT /member/my-info
 */
export async function updateMyInfo(params: UpdateMyInfoDto): Promise<UpdateMyInfoResponse> {
  const response = await axiosInstance.put<UpdateMyInfoResponse>(endpoints.member.myInfo, params);
  return response.data;
}

/**
 * 회원 수정
 * PUT /member/{memberIdx}
 */
export async function updateMember(
  memberIdx: number,
  params: UpdateMemberDto
): Promise<UpdateMemberResponse> {
  const response = await axiosInstance.put<UpdateMemberResponse>(
    `${endpoints.member.base}/${memberIdx}`,
    params
  );
  return response.data;
}

/**
 * 메시지 전송
 * POST /member/message
 */
export async function sendMessage(params: SendMessageDto): Promise<void> {
  await axiosInstance.post(endpoints.member.message, params);
}

/**
 * 챗봇 메시지 전송
 * POST /member/chatbot-message
 */
export async function sendChatbotMessage(params: SendChatbotMessageDto): Promise<any> {
  const response = await axiosInstance.post(endpoints.member.chatbotMessage, params);
  return response.data;
}

/**
 * 구조신호 / 대피신호 보내기
 * POST /member/help-message
 */
export async function sendHelpMessage(params: SendHelpMessageDto): Promise<void> {
  await axiosInstance.post(endpoints.member.helpMessage, params);
}

/**
 * FCM 토큰 등록/갱신
 * PATCH /member/fcm-token
 */
export async function updateFcmToken(params: UpdateFcmTokenDto): Promise<void> {
  await axiosInstance.patch(endpoints.member.fcmToken, params);
}

/**
 * 푸시 알림 설정
 * PATCH /member/push-settings
 */
export async function updatePushSettings(params: UpdatePushSettingsDto): Promise<void> {
  await axiosInstance.patch(endpoints.member.pushSettings, params);
}

/**
 * 회원 삭제
 * DELETE /member/{memberIdx}
 */
export async function deleteMember(memberIdx: number): Promise<DeleteMemberResponse> {
  const response = await axiosInstance.delete<DeleteMemberResponse>(
    `${endpoints.member.base}/${memberIdx}`
  );
  return response.data;
}
