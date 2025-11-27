import axiosInstance from 'src/lib/axios';

import { endpoints } from 'src/lib/axios';

import type {
  GetRiskReportsParams,
  GetRiskReportsResponse,
  CreateRiskReportParams,
  CreateRiskReportResponse,
  GetRiskReportParams,
  GetRiskReportResponse,
  UpdateRiskReportParams,
  UpdateRiskReportResponse,
  DeleteRiskReportParams,
  CreateRiskReportFromChatParams,
  CreateRiskReportFromChatResponse,
  RiskReport,
  RiskReportStatus,
} from './operation.types';

// ----------------------------------------------------------------------

/**
 * 위험 보고 목록 조회
 * GET /operation/risk-reports
 */
type RawRiskReport = {
  id?: string;
  riskReportIdx?: string | number;
  title?: string;
  location?: string;
  content?: string;
  companyName?: string;
  companyIdx?: number;
  reporterName?: string;
  reporterMemberIdx?: number | null;
  authorName?: string;
  authorMemberIdx?: number | null;
  status?: RiskReportStatus;
  createAt?: string;
  confirmedAt?: string | null;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  signalType?: string | null;
  sourceType?: string | null;
  description?: string | null;
  memo?: string | null;
  chatRoomId?: string | null;
  chatRoomIdx?: string | number | null;
};

export async function getRiskReports(
  params: GetRiskReportsParams
): Promise<GetRiskReportsResponse> {
  if (import.meta.env.DEV) {
    console.log('📥 [operation] 위험 보고 목록 조회 요청', params);
  }
  const response = await axiosInstance.get(endpoints.operation.riskReports, { params });
  const rawData = response.data ?? {};
  
  if (import.meta.env.DEV) {
    console.log('🔍 [getRiskReports] rawData', rawData);
  }
  
  const rawList: RawRiskReport[] = Array.isArray(rawData.riskReportList)
    ? rawData.riskReportList
    : [];

  if (import.meta.env.DEV) {
    console.log('🔍 [getRiskReports] rawList', rawList);
    if (rawList.length > 0) {
      console.log('🔍 [getRiskReports] 첫 번째 아이템', rawList[0]);
    }
  }

  const riskReports: RiskReport[] = rawList.map((item, index) => {
    const riskReportIdx = item.riskReportIdx ?? item.id ?? '';
    if (import.meta.env.DEV && index === 0) {
      console.log('🔍 [getRiskReports] 매핑 중', {
        item,
        riskReportIdx,
        'item.riskReportIdx': item.riskReportIdx,
        'item.id': item.id,
      });
    }
    return {
      id: item.id || String(riskReportIdx || ''),
      riskReportIdx: riskReportIdx, // API 응답의 riskReportIdx 또는 id 사용
    title: item.title ?? '',
    location: item.location ?? '',
    content: item.content ?? '',
    companyName: item.companyName,
    companyIdx: item.companyIdx,
    reporterName: item.reporterName,
    reporterMemberIdx: item.reporterMemberIdx ?? null,
    authorName: item.authorName,
    authorMemberIdx: item.authorMemberIdx ?? null,
    status: (item.status as RiskReportStatus) || 'PENDING',
    registeredAt: item.createAt ?? new Date().toISOString(),
    confirmedAt: item.confirmedAt ?? null,
    imageUrl: item.imageUrl ?? undefined,
    imageUrls: item.imageUrls ?? [],
    signalType: item.signalType ?? null,
    sourceType: item.sourceType ?? null,
    description: item.description ?? null,
    memo: item.memo ?? null,
    chatRoomId: item.chatRoomId ?? (item.chatRoomIdx ? String(item.chatRoomIdx) : null),
    };
  });

  const mappedResponse: GetRiskReportsResponse = {
    header: rawData.header ?? {
      isSuccess: true,
      resultCode: '0',
      resultMessage: 'SUCCESS',
      timestamp: new Date().toISOString(),
    },
    body: {
      riskReportList: riskReports,
      totalCount: rawData.totalCount ?? riskReports.length,
    },
  };

  if (import.meta.env.DEV) {
    console.log('✅ [operation] 위험 보고 목록 조회 응답', mappedResponse.body);
  }
  return mappedResponse;
}

/**
 * 위험 보고 등록
 */
export async function createRiskReport(
  params: CreateRiskReportParams
): Promise<CreateRiskReportResponse> {
  if (import.meta.env.DEV) {
    console.log('📤 [operation] 위험 보고 등록 요청', params);
  }
  const response = await axiosInstance.post<CreateRiskReportResponse>(
    endpoints.operation.riskReports,
    params
  );
  if (import.meta.env.DEV) {
    console.log('✅ [operation] 위험 보고 등록 응답', response.data);
  }
  return response.data;
}

/**
 * 위험 보고 정보 조회
 * GET /operation/risk-reports/{riskReportId}
 */
export async function getRiskReport(params: GetRiskReportParams): Promise<GetRiskReportResponse> {
  if (import.meta.env.DEV) {
    console.log('📥 [operation] 위험 보고 상세 요청', params);
  }
  const response = await axiosInstance.get<GetRiskReportResponse>(
    `${endpoints.operation.riskReports}/${params.riskReportIdx}`
  );
  if (import.meta.env.DEV) {
    console.log('✅ [operation] 위험 보고 상세 응답', response.data);
  }
  return response.data;
}

/**
 * 위험 보고 수정
 * PUT /operation/risk-reports/{riskReportId}
 */
export async function updateRiskReport(
  params: UpdateRiskReportParams
): Promise<UpdateRiskReportResponse> {
  if (import.meta.env.DEV) {
    console.log('✏️ [operation] 위험 보고 수정 요청', params);
  }
  const { riskReportIdx, ...body } = params;
  const response = await axiosInstance.put<UpdateRiskReportResponse>(
    `${endpoints.operation.riskReports}/${riskReportIdx}`,
    body
  );
  if (import.meta.env.DEV) {
    console.log('✅ [operation] 위험 보고 수정 응답', response.data);
  }
  return response.data;
}

/**
 * 위험 보고 삭제
 * DELETE /operation/risk-reports/{riskReportId}
 */
export async function deleteRiskReport(params: DeleteRiskReportParams): Promise<void> {
  if (import.meta.env.DEV) {
    console.log('🗑️ [operation] 위험 보고 삭제 요청', params);
  }
  await axiosInstance.delete(`${endpoints.operation.riskReports}/${params.riskReportIdx}`);
}

/**
 * 채팅방에서 위험 보고 생성
 * POST /operation/chat-rooms/{chatRoomId}/risk-reports
 */
export async function createRiskReportFromChat(
  params: CreateRiskReportFromChatParams
): Promise<CreateRiskReportFromChatResponse> {
  if (import.meta.env.DEV) {
    console.log('💬 [operation] 채팅 위험 보고 생성 요청', params);
  }
  const { chatRoomIdx, ...body } = params;
  const response = await axiosInstance.post<CreateRiskReportFromChatResponse>(
    `${endpoints.operation.chatRooms}/${chatRoomIdx}/risk-reports`,
    body
  );
  if (import.meta.env.DEV) {
    console.log('✅ [operation] 채팅 위험 보고 생성 응답', response.data);
  }
  return response.data;
}
