import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getRisk2200Documents,
  getRisk2200DocumentDetail,
  createRisk2200Document,
  temporarySaveRisk2200Document,
  getRisk2200TemporaryDocument,
  deleteRisk2200Document,
  sendRisk2200Notification,
  exportRisk2200Documents,
  getRisk2200DocumentInfo,
  getRisk2200SampleDocument,
  getRisk2200TableData,
  getRisk2200ItemInfo,
  getRisk2200ApprovalInfo,
  addRisk2200Signature,
  getChemicals,
  getCasNumbers,
} from 'src/services/risk-2200/risk-2200.service';

import type {
  GetRisk2200DocumentsParams,
  GetRisk2200DocumentDetailParams,
  CreateRisk2200DocumentParams,
  TemporarySaveRisk2200DocumentParams,
  GetRisk2200TemporaryDocumentParams,
  DeleteRisk2200DocumentParams,
  SendRisk2200NotificationParams,
  ExportRisk2200DocumentsParams,
  GetRisk2200DocumentInfoParams,
  GetRisk2200SampleDocumentParams,
  GetRisk2200TableDataParams,
  GetRisk2200ItemInfoParams,
  GetRisk2200ApprovalInfoParams,
  AddRisk2200SignatureParams,
  GetChemicalsParams,
  GetCasNumbersParams,
} from 'src/services/risk-2200/risk-2200.types';

// ----------------------------------------------------------------------

/**
 * 문서 목록 조회 Hook
 */
export function useRisk2200Documents(params: GetRisk2200DocumentsParams) {
  return useQuery({
    queryKey: [
      'risk2200Documents',
      params.safetyIdx,
      params.itemNumber,
      params.filterType,
      params.searchField,
      params.searchValue,
      params.page,
      params.pageSize,
    ],
    queryFn: () => getRisk2200Documents(params),
    staleTime: 5 * 60 * 1000, // 5분
  });
}

/**
 * 문서 상세 정보 조회 Hook
 */
export function useRisk2200DocumentDetail(params: GetRisk2200DocumentDetailParams) {
  return useQuery({
    queryKey: ['risk2200DocumentDetail', params.documentId],
    queryFn: () => getRisk2200DocumentDetail(params),
    enabled: !!params.documentId,
  });
}

/**
 * 문서 등록 Hook
 */
export function useCreateRisk2200Document() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateRisk2200DocumentParams) => createRisk2200Document(params),
    onSuccess: (response) => {
      const resultMessage = response?.header?.resultMessage || '문서가 등록되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('문서가 등록되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['risk2200Documents'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '문서 등록에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 문서 임시 저장 Hook
 */
export function useTemporarySaveRisk2200Document() {
  return useMutation({
    mutationFn: (params: TemporarySaveRisk2200DocumentParams) =>
      temporarySaveRisk2200Document(params),
    onSuccess: (response) => {
      const resultMessage = response?.header?.resultMessage || '문서가 임시 저장되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('문서가 임시 저장되었습니다.');
      }
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '임시 저장에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 임시 저장된 문서 불러오기 Hook
 */
export function useRisk2200TemporaryDocument(params: GetRisk2200TemporaryDocumentParams) {
  return useQuery({
    queryKey: ['risk2200TemporaryDocument', params.documentId],
    queryFn: () => getRisk2200TemporaryDocument(params),
    enabled: !!params.documentId,
  });
}

/**
 * 문서 삭제 Hook
 */
export function useDeleteRisk2200Document() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeleteRisk2200DocumentParams) => deleteRisk2200Document(params),
    onSuccess: (_, variables) => {
      toast.success('문서가 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['risk2200Documents'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '문서 삭제에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 알림 발송 Hook
 */
export function useSendRisk2200Notification() {
  return useMutation({
    mutationFn: (params: SendRisk2200NotificationParams) => sendRisk2200Notification(params),
    onSuccess: (response) => {
      const resultMessage = response?.header?.resultMessage || '알림이 발송되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('알림이 발송되었습니다.');
      }
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '알림 발송에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 액션 처리 Hook (엑셀 내보내기, 인쇄 등)
 */
export function useExportRisk2200Documents() {
  return useMutation({
    mutationFn: (params: ExportRisk2200DocumentsParams) => exportRisk2200Documents(params),
    onSuccess: (response) => {
      const resultMessage = response?.header?.resultMessage || '문서 내보내기가 완료되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('문서 내보내기가 완료되었습니다.');
      }
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '문서 내보내기에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * PDF 다운로드용 문서 정보 조회 Hook
 */
export function useRisk2200DocumentInfo(params: GetRisk2200DocumentInfoParams) {
  return useQuery({
    queryKey: ['risk2200DocumentInfo', params.documentId],
    queryFn: () => getRisk2200DocumentInfo(params),
    enabled: !!params.documentId,
  });
}

/**
 * 샘플 문서 조회 Hook
 */
export function useRisk2200SampleDocument(params: GetRisk2200SampleDocumentParams) {
  return useQuery({
    queryKey: ['risk2200SampleDocument', params.safetyIdx, params.itemNumber],
    queryFn: () => getRisk2200SampleDocument(params),
    enabled: !!params.safetyIdx && !!params.itemNumber,
  });
}

/**
 * 테이블 데이터 조회 Hook (기본값용)
 */
export function useRisk2200TableData(params: GetRisk2200TableDataParams) {
  return useQuery({
    queryKey: ['risk2200TableData', params.safetyIdx, params.itemNumber],
    queryFn: () => getRisk2200TableData(params),
    enabled: !!params.safetyIdx && !!params.itemNumber,
  });
}

/**
 * Item 정보 조회 Hook
 */
export function useRisk2200ItemInfo(params: GetRisk2200ItemInfoParams) {
  return useQuery({
    queryKey: ['risk2200ItemInfo', params.safetyIdx, params.itemNumber],
    queryFn: () => getRisk2200ItemInfo(params),
    enabled: !!params.safetyIdx && !!params.itemNumber,
  });
}

/**
 * 결재 정보 조회 Hook
 */
export function useRisk2200ApprovalInfo(params: GetRisk2200ApprovalInfoParams) {
  return useQuery({
    queryKey: ['risk2200ApprovalInfo', params.documentId],
    queryFn: () => getRisk2200ApprovalInfo(params),
    enabled: !!params.documentId,
  });
}

/**
 * 서명 추가 Hook
 */
export function useAddRisk2200Signature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: AddRisk2200SignatureParams) => addRisk2200Signature(params),
    onSuccess: (response, variables) => {
      const resultMessage = response?.header?.resultMessage || '서명이 추가되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('서명이 추가되었습니다.');
      }
      queryClient.invalidateQueries({
        queryKey: ['risk2200ApprovalInfo', variables.documentId],
      });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '서명 추가에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 화학물질 목록 조회 Hook
 */
export function useChemicals(params?: GetChemicalsParams) {
  return useQuery({
    queryKey: ['chemicals', params?.searchQuery],
    queryFn: () => getChemicals(params),
    staleTime: 10 * 60 * 1000, // 10분
  });
}

/**
 * CAS 번호 목록 조회 Hook
 */
export function useCasNumbers(params?: GetCasNumbersParams) {
  return useQuery({
    queryKey: ['casNumbers', params?.searchQuery],
    queryFn: () => getCasNumbers(params),
    staleTime: 10 * 60 * 1000, // 10분
  });
}

