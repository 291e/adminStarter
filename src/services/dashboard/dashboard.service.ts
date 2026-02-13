import axiosInstance from 'src/lib/axios';

import { endpoints } from 'src/lib/axios';

import type {
  GetDocumentSignatureListResponse,
  GetSharedDocumentListParams,
  GetSharedDocumentListResponse,
  CreateSharedDocumentParams,
  CreateSharedDocumentResponse,
  UpdateSharedDocumentParams,
  UpdateSharedDocumentResponse,
  DeleteSharedDocumentParams,
  ShareDocumentToChatRoomParams,
  GetSharedDocumentDetailParams,
  GetSharedDocumentDetailResponse,
  GetSafetySystemDocumentDetailParams,
  GetSafetySystemDocumentDetailResponse,
  GetRiskReportStatisticsParams,
  GetRiskReportStatisticsResponse,
  GetMemberProfileResponse,
  GetEducationCompletionRateParams,
  GetEducationCompletionRateResponse,
  GetPrioritySettingListResponse,
  CreatePrioritySettingParams,
  CreatePrioritySettingResponse,
  UpdatePrioritySettingParams,
  UpdatePrioritySettingResponse,
  DeletePrioritySettingParams,
} from './dashboard.types';

// ----------------------------------------------------------------------

/**
 * 서명 대기 문서 목록 조회
 * GET /dashboard/document-signatures
 */
export async function getDocumentSignatureList(): Promise<GetDocumentSignatureListResponse> {
  const response = await axiosInstance.get<GetDocumentSignatureListResponse>(
    endpoints.dashboard.documentSignatures
  );
  return response.data;
}

/**
 * 공유된 문서 목록 조회
 * GET /dashboard/shared-documents
 */
export async function getSharedDocumentList(
  params?: GetSharedDocumentListParams
): Promise<GetSharedDocumentListResponse> {
  // page와 pageSize를 명시적으로 숫자로 변환
  const queryParams = params
    ? {
        ...params,
        page: params.page ? Number(params.page) : undefined,
        pageSize: params.pageSize ? Number(params.pageSize) : undefined,
      }
    : undefined;

  const response = await axiosInstance.get<GetSharedDocumentListResponse>(
    endpoints.dashboard.sharedDocuments,
    { params: queryParams }
  );
  return response.data;
}

/**
 * 공유 문서 업로드
 * POST /dashboard/shared-documents
 * 파일은 먼저 /system/upload로 업로드하고 fileUrl을 사용해야 함
 */
export async function createSharedDocument(
  params: CreateSharedDocumentParams
): Promise<CreateSharedDocumentResponse> {
  // application/json으로 요청 (swagger 스펙에 따름)
  const response = await axiosInstance.post<CreateSharedDocumentResponse>(
    endpoints.dashboard.sharedDocuments,
    params
  );
  return response.data;
}

/**
 * 공유 문서 수정
 * PUT /dashboard/shared-documents/{sharedDocumentIdx}
 */
export async function updateSharedDocument(
  params: UpdateSharedDocumentParams
): Promise<UpdateSharedDocumentResponse> {
  // sharedDocumentIdx는 URL 경로에만 포함, body에는 제외
  const { sharedDocumentIdx, ...body } = params;
  const response = await axiosInstance.put<UpdateSharedDocumentResponse>(
    `${endpoints.dashboard.sharedDocuments}/${sharedDocumentIdx}`,
    body
  );
  return response.data;
}

/**
 * 공유 문서 삭제
 * DELETE /dashboard/shared-documents/{sharedDocumentIdx}
 */
export async function deleteSharedDocument(params: DeleteSharedDocumentParams): Promise<void> {
  await axiosInstance.delete(`${endpoints.dashboard.sharedDocuments}/${params.sharedDocumentIdx}`);
}

/**
 * 공유 문서 채팅방 공유
 * POST /dashboard/shared-documents/{sharedDocumentIdx}/share
 */
export async function shareDocumentToChatRoom(
  params: ShareDocumentToChatRoomParams
): Promise<void> {
  const { sharedDocumentIdx, chatRoomIdList } = params;
  if (!Array.isArray(chatRoomIdList) || chatRoomIdList.length === 0) {
    throw new Error('공유할 채팅방이 없습니다.');
  }

  let chatRoomIdxList: number[] = [];
  try {
    // 레거시 호환용: roomId -> roomIdx 매핑 가능하면 함께 전송
    const chatRoomsResponse = await axiosInstance.get(endpoints.chat.rooms, {
      params: { page: 1, pageSize: 1000 },
    });

    const candidates = [
      (chatRoomsResponse.data as any)?.chatRoomList,
      (chatRoomsResponse.data as any)?.chatRooms,
      (chatRoomsResponse.data as any)?.roomList,
      (chatRoomsResponse.data as any)?.rooms,
      (chatRoomsResponse.data as any)?.body?.chatRoomList,
      (chatRoomsResponse.data as any)?.body?.chatRooms,
      (chatRoomsResponse.data as any)?.body?.roomList,
      (chatRoomsResponse.data as any)?.body?.rooms,
      (chatRoomsResponse.data as any)?.body?.data?.chatRoomList,
      (chatRoomsResponse.data as any)?.body?.data?.chatRooms,
      (chatRoomsResponse.data as any)?.body?.data?.roomList,
      (chatRoomsResponse.data as any)?.body?.data?.rooms,
    ];
    const list = candidates.find((candidate) => Array.isArray(candidate));
    const roomList = Array.isArray(list) ? list : [];

    const roomIdToIdx = new Map<string, number>();
    roomList.forEach((room: any) => {
      const roomId = String(room?.chatRoomId || room?.roomId || '').trim();
      const roomIdx = Number(room?.chatRoomIdx);
      if (!roomId || Number.isNaN(roomIdx) || roomIdx <= 0) return;
      roomIdToIdx.set(roomId, roomIdx);
    });

    chatRoomIdxList = Array.from(
      new Set(
        chatRoomIdList
          .map((roomId) => roomIdToIdx.get(String(roomId)))
          .filter((roomIdx): roomIdx is number => typeof roomIdx === 'number' && roomIdx > 0)
      )
    );
  } catch {
    // 매핑 실패해도 chatRoomIdList 전송은 계속 시도
  }

  const payload: {
    chatRoomIdList: string[];
    chatRoomIdxList?: number[];
  } = {
    chatRoomIdList,
  };
  if (chatRoomIdxList.length > 0) {
    payload.chatRoomIdxList = chatRoomIdxList;
  }

  await axiosInstance.post(
    `${endpoints.dashboard.sharedDocuments}/${sharedDocumentIdx}/share`,
    payload
  );
}

/**
 * 공유 문서 상세 조회
 * GET /dashboard/shared-documents/{sharedDocumentIdx}
 */
export async function getSharedDocumentDetail(
  params: GetSharedDocumentDetailParams
): Promise<GetSharedDocumentDetailResponse> {
  const response = await axiosInstance.get<GetSharedDocumentDetailResponse>(
    `${endpoints.dashboard.sharedDocuments}/${params.sharedDocumentIdx}`
  );
  return response.data;
}

/**
 * 안전 시스템 문서 상세 조회
 * GET /dashboard/safety-system-documents/{safetySystemDocumentIdx}
 */
export async function getSafetySystemDocumentDetail(
  params: GetSafetySystemDocumentDetailParams
): Promise<GetSafetySystemDocumentDetailResponse> {
  const response = await axiosInstance.get<GetSafetySystemDocumentDetailResponse>(
    `${endpoints.dashboard.safetySystemDocuments}/${params.safetySystemDocumentIdx}`
  );
  return response.data;
}

/**
 * 사고·위험 보고 현황 통계 조회
 * GET /dashboard/risk-report-statistics
 */
export async function getRiskReportStatistics(
  params?: GetRiskReportStatisticsParams
): Promise<GetRiskReportStatisticsResponse> {
  const response = await axiosInstance.get<GetRiskReportStatisticsResponse>(
    endpoints.dashboard.riskReportStatistics,
    { params }
  );
  return response.data;
}

/**
 * 사용자 프로필 정보 조회
 * GET /dashboard/member-profile
 */
export async function getMemberProfile(): Promise<GetMemberProfileResponse> {
  const response = await axiosInstance.get<GetMemberProfileResponse>(
    endpoints.dashboard.memberProfile
  );
  return response.data;
}

/**
 * 교육 이수율 조회
 * GET /dashboard/education-completion-rate
 */
export async function getEducationCompletionRate(
  params?: GetEducationCompletionRateParams
): Promise<GetEducationCompletionRateResponse> {
  const response = await axiosInstance.get<GetEducationCompletionRateResponse>(
    endpoints.dashboard.educationCompletionRate,
    { params }
  );
  return response.data;
}

/**
 * 중요도 설정 목록 조회
 * GET /dashboard/priority-settings
 */
export async function getPrioritySettingList(): Promise<GetPrioritySettingListResponse> {
  const response = await axiosInstance.get<GetPrioritySettingListResponse>(
    endpoints.dashboard.prioritySettings
  );
  return response.data;
}

/**
 * 중요도 설정 등록
 * POST /dashboard/priority-settings
 */
export async function createPrioritySetting(
  params: CreatePrioritySettingParams
): Promise<CreatePrioritySettingResponse> {
  const response = await axiosInstance.post<CreatePrioritySettingResponse>(
    endpoints.dashboard.prioritySettings,
    params
  );
  return response.data;
}

/**
 * 중요도 설정 수정
 * PUT /dashboard/priority-settings/{priorityIdx}
 */
export async function updatePrioritySetting(
  params: UpdatePrioritySettingParams
): Promise<UpdatePrioritySettingResponse> {
  // priorityIdx는 URL 경로에만 포함, body에는 제외
  const { priorityIdx, ...body } = params;
  const response = await axiosInstance.put<UpdatePrioritySettingResponse>(
    `${endpoints.dashboard.prioritySettings}/${priorityIdx}`,
    body
  );
  return response.data;
}

/**
 * 중요도 설정 삭제
 * DELETE /dashboard/priority-settings/{priorityIdx}
 */
export async function deletePrioritySetting(params: DeletePrioritySettingParams): Promise<void> {
  await axiosInstance.delete(`${endpoints.dashboard.prioritySettings}/${params.priorityIdx}`);
}
