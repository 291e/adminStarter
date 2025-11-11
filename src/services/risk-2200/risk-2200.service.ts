import axiosInstance from 'src/lib/axios';

import type {
  GetRisk2200DocumentsParams,
  GetRisk2200DocumentsResponse,
  GetRisk2200DocumentDetailParams,
  GetRisk2200DocumentDetailResponse,
  CreateRisk2200DocumentParams,
  CreateRisk2200DocumentResponse,
  TemporarySaveRisk2200DocumentParams,
  TemporarySaveRisk2200DocumentResponse,
  GetRisk2200TemporaryDocumentParams,
  GetRisk2200TemporaryDocumentResponse,
  DeleteRisk2200DocumentParams,
  DeleteRisk2200DocumentResponse,
  SendRisk2200NotificationParams,
  SendRisk2200NotificationResponse,
  ExportRisk2200DocumentsParams,
  ExportRisk2200DocumentsResponse,
  GetRisk2200DocumentInfoParams,
  GetRisk2200DocumentInfoResponse,
  GetRisk2200SampleDocumentParams,
  GetRisk2200SampleDocumentResponse,
  GetRisk2200TableDataParams,
  GetRisk2200TableDataResponse,
  GetRisk2200ItemInfoParams,
  GetRisk2200ItemInfoResponse,
  GetRisk2200ApprovalInfoParams,
  GetRisk2200ApprovalInfoResponse,
  AddRisk2200SignatureParams,
  AddRisk2200SignatureResponse,
  GetChemicalsParams,
  GetChemicalsResponse,
  GetCasNumbersParams,
  GetCasNumbersResponse,
} from './risk-2200.types';

// ----------------------------------------------------------------------

/**
 * 문서 목록 조회
 * GET /api/risk-2200/documents
 */
export async function getRisk2200Documents(
  params: GetRisk2200DocumentsParams
): Promise<GetRisk2200DocumentsResponse> {
  const response = await axiosInstance.get<GetRisk2200DocumentsResponse>(
    '/api/risk-2200/documents',
    {
      params: {
        safetyIdx: params.safetyIdx,
        itemNumber: params.itemNumber,
        filterType: params.filterType,
        searchField: params.searchField,
        searchValue: params.searchValue,
        page: params.page,
        pageSize: params.pageSize,
      },
    }
  );

  return response.data;
}

/**
 * 문서 상세 정보 조회
 * GET /api/risk-2200/documents/:documentId
 */
export async function getRisk2200DocumentDetail(
  params: GetRisk2200DocumentDetailParams
): Promise<GetRisk2200DocumentDetailResponse> {
  const response = await axiosInstance.get<GetRisk2200DocumentDetailResponse>(
    `/api/risk-2200/documents/${params.documentId}`
  );

  return response.data;
}

/**
 * 문서 등록
 * POST /api/risk-2200/documents
 */
export async function createRisk2200Document(
  params: CreateRisk2200DocumentParams
): Promise<CreateRisk2200DocumentResponse> {
  const response = await axiosInstance.post<CreateRisk2200DocumentResponse>(
    '/api/risk-2200/documents',
    params
  );

  return response.data;
}

/**
 * 문서 임시 저장
 * POST /api/risk-2200/documents/temporary
 */
export async function temporarySaveRisk2200Document(
  params: TemporarySaveRisk2200DocumentParams
): Promise<TemporarySaveRisk2200DocumentResponse> {
  const response = await axiosInstance.post<TemporarySaveRisk2200DocumentResponse>(
    '/api/risk-2200/documents/temporary',
    params
  );

  return response.data;
}

/**
 * 임시 저장된 문서 불러오기
 * GET /api/risk-2200/documents/temporary/:documentId
 */
export async function getRisk2200TemporaryDocument(
  params: GetRisk2200TemporaryDocumentParams
): Promise<GetRisk2200TemporaryDocumentResponse> {
  const response = await axiosInstance.get<GetRisk2200TemporaryDocumentResponse>(
    `/api/risk-2200/documents/temporary/${params.documentId}`
  );

  return response.data;
}

/**
 * 문서 삭제
 * DELETE /api/risk-2200/documents/:documentId
 */
export async function deleteRisk2200Document(
  params: DeleteRisk2200DocumentParams
): Promise<DeleteRisk2200DocumentResponse> {
  const response = await axiosInstance.delete<DeleteRisk2200DocumentResponse>(
    `/api/risk-2200/documents/${params.documentId}`
  );

  return response.data;
}

/**
 * 알림 발송
 * POST /api/risk-2200/documents/:documentId/notification
 */
export async function sendRisk2200Notification(
  params: SendRisk2200NotificationParams
): Promise<SendRisk2200NotificationResponse> {
  const response = await axiosInstance.post<SendRisk2200NotificationResponse>(
    `/api/risk-2200/documents/${params.documentId}/notification`
  );

  return response.data;
}

/**
 * 액션 처리 (엑셀 내보내기, 인쇄 등)
 * POST /api/risk-2200/documents/actions
 */
export async function exportRisk2200Documents(
  params: ExportRisk2200DocumentsParams
): Promise<ExportRisk2200DocumentsResponse> {
  const response = await axiosInstance.post<ExportRisk2200DocumentsResponse>(
    '/api/risk-2200/documents/actions',
    params
  );

  return response.data;
}

/**
 * PDF 다운로드용 문서 정보 조회
 * GET /api/risk-2200/documents/:documentId/info
 */
export async function getRisk2200DocumentInfo(
  params: GetRisk2200DocumentInfoParams
): Promise<GetRisk2200DocumentInfoResponse> {
  const response = await axiosInstance.get<GetRisk2200DocumentInfoResponse>(
    `/api/risk-2200/documents/${params.documentId}/info`
  );

  return response.data;
}

/**
 * 샘플 문서 조회
 * GET /api/risk-2200/sample
 */
export async function getRisk2200SampleDocument(
  params: GetRisk2200SampleDocumentParams
): Promise<GetRisk2200SampleDocumentResponse> {
  const response = await axiosInstance.get<GetRisk2200SampleDocumentResponse>(
    '/api/risk-2200/sample',
    {
      params: {
        safetyIdx: params.safetyIdx,
        itemNumber: params.itemNumber,
      },
    }
  );

  return response.data;
}

/**
 * 테이블 데이터 조회 (기본값용)
 * GET /api/risk-2200/table-data
 */
export async function getRisk2200TableData(
  params: GetRisk2200TableDataParams
): Promise<GetRisk2200TableDataResponse> {
  const response = await axiosInstance.get<GetRisk2200TableDataResponse>(
    '/api/risk-2200/table-data',
    {
      params: {
        safetyIdx: params.safetyIdx,
        itemNumber: params.itemNumber,
      },
    }
  );

  return response.data;
}

/**
 * Item 정보 조회
 * GET /api/risk-2200/item-info
 */
export async function getRisk2200ItemInfo(
  params: GetRisk2200ItemInfoParams
): Promise<GetRisk2200ItemInfoResponse> {
  const response = await axiosInstance.get<GetRisk2200ItemInfoResponse>(
    '/api/risk-2200/item-info',
    {
      params: {
        safetyIdx: params.safetyIdx,
        itemNumber: params.itemNumber,
      },
    }
  );

  return response.data;
}

/**
 * 결재 정보 조회
 * GET /api/risk-2200/documents/:documentId/approval
 */
export async function getRisk2200ApprovalInfo(
  params: GetRisk2200ApprovalInfoParams
): Promise<GetRisk2200ApprovalInfoResponse> {
  const response = await axiosInstance.get<GetRisk2200ApprovalInfoResponse>(
    `/api/risk-2200/documents/${params.documentId}/approval`
  );

  return response.data;
}

/**
 * 서명 추가
 * POST /api/risk-2200/documents/:documentId/signature
 */
export async function addRisk2200Signature(
  params: AddRisk2200SignatureParams
): Promise<AddRisk2200SignatureResponse> {
  const response = await axiosInstance.post<AddRisk2200SignatureResponse>(
    `/api/risk-2200/documents/${params.documentId}/signature`,
    {
      signatureType: params.signatureType,
      signatureData: params.signatureData,
    }
  );

  return response.data;
}

/**
 * 화학물질 목록 조회
 * GET /api/risk-2200/chemicals
 */
export async function getChemicals(params?: GetChemicalsParams): Promise<GetChemicalsResponse> {
  const response = await axiosInstance.get<GetChemicalsResponse>('/api/risk-2200/chemicals', {
    params: params?.searchQuery ? { searchQuery: params.searchQuery } : undefined,
  });

  return response.data;
}

/**
 * CAS 번호 목록 조회
 * GET /api/risk-2200/cas-numbers
 */
export async function getCasNumbers(params?: GetCasNumbersParams): Promise<GetCasNumbersResponse> {
  const response = await axiosInstance.get<GetCasNumbersResponse>('/api/risk-2200/cas-numbers', {
    params: params?.searchQuery ? { searchQuery: params.searchQuery } : undefined,
  });

  return response.data;
}
