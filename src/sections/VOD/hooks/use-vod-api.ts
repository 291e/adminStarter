import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  uploadVod,
  getVodDetail,
  getVodStatus,
  getVodVideoUrl,
  getVodVttUrl,
} from 'src/services/vod/vod.service';
import type { UploadVodParams } from 'src/services/vod/vod.types';

// ----------------------------------------------------------------------

/**
 * VOD 업로드 및 STT/번역 처리 Mutation Hook
 */
export function useUploadVod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UploadVodParams) => uploadVod(params),
    onSuccess: (response) => {
      const resultMessage = response?.header?.resultMessage || '비디오 업로드가 시작되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('비디오 업로드가 시작되었습니다.');
      }
      // VOD 업로드 후 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['vods'] });
    },
    onError: (error: any) => {
      if (import.meta.env.DEV) {
        console.error('❌ [useUploadVod] VOD 업로드 실패', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
        });
      }
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '비디오 업로드에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * VOD 상세 조회 Hook
 */
export function useVodDetail(vodIdx: number | null, enabled = true) {
  return useQuery({
    queryKey: ['vodDetail', vodIdx],
    queryFn: () => getVodDetail(vodIdx!),
    enabled: enabled && vodIdx !== null,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * VOD 처리 상태 폴링 Hook
 * refetchInterval을 설정하여 주기적으로 상태를 확인할 수 있습니다.
 */
export function useVodStatus(
  vodIdx: number | null,
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false | ((data: any) => number | false);
  }
) {
  const { enabled = true, refetchInterval = false } = options || {};

  return useQuery({
    queryKey: ['vodStatus', vodIdx],
    queryFn: () => getVodStatus(vodIdx!),
    enabled: enabled && vodIdx !== null,
    refetchInterval: refetchInterval,
    staleTime: 0, // 상태는 항상 최신 정보가 필요
  });
}

/**
 * VOD 비디오 스트리밍 URL 가져오기
 */
export function useVodVideoUrl(vodIdx: number | null): string | null {
  if (vodIdx === null) return null;
  return getVodVideoUrl(vodIdx);
}

/**
 * VOD VTT 파일 URL 가져오기
 */
export function useVodVttUrl(vodIdx: number | null, lang: string): string | null {
  if (vodIdx === null) return null;
  return getVodVttUrl(vodIdx, lang);
}
