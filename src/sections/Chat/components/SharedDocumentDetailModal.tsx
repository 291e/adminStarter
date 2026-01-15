import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { Iconify } from 'src/components/iconify';
import DialogBtn from 'src/components/safeyoui/button/dialogBtn';
import {
  getSharedDocumentDetail,
  getSafetySystemDocumentDetail,
} from 'src/services/dashboard/dashboard.service';
import type {
  GetSharedDocumentDetailResponse,
  GetSafetySystemDocumentDetailResponse,
} from 'src/services/dashboard/dashboard.types';
import { fDateTime } from 'src/utils/format-time';
import ApprovalSection, { type ApprovalSignature, type ApprovalType } from './ApprovalSection';
import { tableRegistry } from 'src/sections/PDF/Risk_2200/[risk_id]/tables';
import {
  createDocumentApproval,
  addApprovalSignature,
  updateWorkerSignatureWatch,
  addWorkerSignature,
} from 'src/services/safety-system/safety-system.service';
import { CONFIG } from 'src/global-config';
import SignatureModal from 'src/sections/PDF/Risk_2200/edit/components/SignatureModal';
import { toast } from 'sonner';
import type {
  Table2400TBMData,
  Table2400TBMEducationVideoRow,
} from 'src/sections/PDF/Risk_2200/types/table-data';
import VideoPlayer from 'src/components/video-player/VideoPlayer';
import { useVodDetail } from 'src/sections/VOD/hooks/use-vod-api';
import { useMyInfo } from 'src/sections/Chat/hooks/use-my-info';
import type { WorkerSignatureStatusInfo } from 'src/services/safety-system/safety-system.types';

// ----------------------------------------------------------------------

// Video.js 플레이어 래퍼 컴포넌트 (자막 지원)
const VideoPlayerWithSubtitle = ({
  vodIdx,
  videoTitle,
  memberLang,
  onEnded,
}: {
  vodIdx: number;
  videoTitle: string;
  memberLang: string;
  onEnded: () => void;
}) => {
  // VOD 상세 정보 조회 (자막 언어 목록 가져오기)
  const { data: vodDetailData, isLoading: isLoadingVodDetail } = useVodDetail(vodIdx, true);

  // vttMap 추출
  const vttMap = useMemo(() => {
    if (!vodDetailData) return undefined;
    const vodDetail = vodDetailData as any;
    return vodDetail.vttMap || vodDetail.body?.vttMap || vodDetail.data?.vttMap || {};
  }, [vodDetailData]);

  // 사용 가능한 자막 언어 목록 추출
  const availableLanguages = useMemo(() => {
    if (!vttMap) return [];
    return Object.keys(vttMap).filter((lang) => vttMap[lang]);
  }, [vttMap]);

  // 비디오 URL 생성 (이미지 불러오기와 동일한 방식: CONFIG.serverUrl + videoPath)
  const videoUrl = useMemo(() => {
    if (!vodDetailData) return null;
    const vodDetail = vodDetailData as any;
    // vodDetailData에서 videoPath 직접 추출
    const videoPath = vodDetail.videoPath || vodDetail.body?.videoPath || vodDetail.data?.videoPath;

    if (!videoPath) return null;

    // 이미지 불러오기와 동일한 방식: CONFIG.serverUrl + videoPath
    const baseUrl = CONFIG.serverUrl.replace(/\/$/, '');
    const path = videoPath.startsWith('/') ? videoPath : `/${videoPath}`;
    return `${baseUrl}${path}`;
  }, [vodDetailData]);

  // 로딩 중이거나 비디오 URL이 없으면 로딩 표시
  if (isLoadingVodDetail || !videoUrl) {
    return (
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          pt: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {videoTitle}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        pt: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        {videoTitle}
      </Typography>
      <VideoPlayer
        vodIdx={vodIdx}
        videoUrl={videoUrl}
        availableLanguages={availableLanguages}
        vttMap={vttMap}
        defaultLanguage={memberLang || 'ko'}
        onEnded={onEnded}
        serverUrl={CONFIG.serverUrl}
        disableControls
      />
    </Box>
  );
};

type Props = {
  open: boolean;
  onClose: () => void;
  sharedDocumentIdx?: number | null;
  safetySystemDocumentIdx?: number | null;
};

export default function SharedDocumentDetailModal({
  open,
  onClose,
  sharedDocumentIdx: propSharedDocumentIdx,
  safetySystemDocumentIdx: propSafetySystemDocumentIdx,
}: Props) {
  // 현재 재생 중인 영상 상태
  const [playingVideoRow, setPlayingVideoRow] = useState<{
    vodIdx: number;
    workerSignatureIdx: number;
    rowIndex: number;
    videoTitle?: string;
  } | null>(null);

  // 비디오 팝업 모달 상태
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // 서명 모달 상태
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);

  // 사용자 정보 조회 (자막 언어 자동 설정용)
  const { data: myInfoData } = useMyInfo();

  // sharedDocumentIdx가 있으면 공유 문서 상세 조회, 없으면 안전 시스템 문서 상세 조회
  const isUsingSharedDocument =
    propSharedDocumentIdx !== null && propSharedDocumentIdx !== undefined;

  const {
    data: sharedDocumentDetail,
    isLoading: isLoadingShared,
    isError: isErrorShared,
    error: errorShared,
  } = useQuery<GetSharedDocumentDetailResponse>({
    queryKey: ['sharedDocumentDetail', propSharedDocumentIdx],
    queryFn: () => getSharedDocumentDetail({ sharedDocumentIdx: propSharedDocumentIdx! }),
    enabled: open && isUsingSharedDocument && propSharedDocumentIdx! > 0,
  });

  const {
    data: safetySystemDocumentDetail,
    isLoading: isLoadingSafetySystem,
    isError: isErrorSafetySystem,
    error: errorSafetySystem,
  } = useQuery<GetSafetySystemDocumentDetailResponse>({
    queryKey: ['safetySystemDocumentDetail', propSafetySystemDocumentIdx],
    queryFn: () =>
      getSafetySystemDocumentDetail({
        safetySystemDocumentIdx: propSafetySystemDocumentIdx!,
      }),
    enabled:
      open &&
      !isUsingSharedDocument &&
      propSafetySystemDocumentIdx !== null &&
      propSafetySystemDocumentIdx !== undefined &&
      propSafetySystemDocumentIdx > 0,
  });

  const isLoading = isLoadingShared || isLoadingSafetySystem;
  const isError = isErrorShared || isErrorSafetySystem;
  const error = errorShared || errorSafetySystem;

  // 응답 데이터 통합 처리
  const sharedDocument = sharedDocumentDetail?.sharedDocument;
  const originalDocument =
    sharedDocument?.originalDocument || safetySystemDocumentDetail?.originalDocument;

  const workerSignatureList = (originalDocument as any)?.workerSignatureList as
    | WorkerSignatureStatusInfo[]
    | undefined;

  // tableData 파싱 및 최신 서명 정보 병합
  const parsedTableData = useMemo(() => {
    if (!originalDocument?.tableData) return null;
    try {
      const tableData =
        typeof originalDocument.tableData === 'string'
          ? JSON.parse(originalDocument.tableData)
          : originalDocument.tableData;

      // 2400-tbm 타입이고 workerSignatureList가 있는 경우 서명 정보 업데이트
      if (
        tableData?.type === '2400-tbm' &&
        tableData?.data?.educationVideoRows &&
        workerSignatureList
      ) {
        // educationVideoRows 업데이트
        // 타입 캐스팅을 통해 Table2400TBMData 구조에 맞게 처리
        const educationVideoRows = tableData.data
          .educationVideoRows as Table2400TBMEducationVideoRow[];

        tableData.data.educationVideoRows = educationVideoRows.map((row) => {
          if (!row.participant?.memberIdx) return row;

          // 해당 대상자의 최신 서명/상태 정보 찾기
          const workerInfo = workerSignatureList.find(
            (worker) => worker.targetMemberIdx === row.participant?.memberIdx
          );

          if (workerInfo) {
            return {
              ...row,
              workerSignatureIdx: workerInfo.workerSignatureIdx, // workerSignatureIdx 주입 (중요: 이것이 없으면 404 발생)
              signature: workerInfo.signatureData || row.signature || '', // 최신 서명 이미지 사용
              // 필요한 경우 status 등 다른 정보도 업데이트 가능
            };
          }
          return row;
        });

        console.log(
          '✅ [SharedDocumentDetailModal] workerSignatureList 병합 완료:',
          tableData.data.educationVideoRows
        );
      }

      return tableData;
    } catch (parseError) {
      console.error('tableData 파싱 실패:', parseError);
      return null;
    }
  }, [originalDocument?.tableData, workerSignatureList]);

  // 날짜 포맷팅
  const registeredAt = originalDocument?.createAt
    ? fDateTime(originalDocument.createAt, 'YYYY-MM-DD HH:mm:ss')
    : null;
  const modifiedAt = (originalDocument as any)?.updatedAt
    ? fDateTime((originalDocument as any).updatedAt, 'YYYY-MM-DD HH:mm:ss')
    : null;
  const documentWrittenAt =
    (sharedDocument as any)?.documentWrittenAt ||
    (originalDocument as any)?.writtenAt ||
    (originalDocument as any)?.documentWrittenAt ||
    (originalDocument as any)?.documentDate ||
    null;
  const approvalDeadline = originalDocument?.approvalDeadline || null;

  // 문서 제목과 작성일
  const documentTitle = originalDocument?.documentName || sharedDocument?.documentName || '';

  const queryClient = useQueryClient();

  // signatureData를 올바른 형식으로 변환하는 헬퍼 함수
  // URL인 경우 그대로 반환 (ApprovalSection의 getFullFileUrl에서 처리)
  // base64인 경우만 접두사 추가
  const normalizeSignatureData = (signatureData: string | null | undefined): string | undefined => {
    if (!signatureData) return undefined;
    // 이미 data URL인 경우 (실제 base64 데이터)
    if (signatureData.startsWith('data:image/') && !signatureData.includes('data/admin/')) {
      return signatureData;
    }
    // URL인 경우 (data/admin/로 시작하거나 /로 시작하거나 http로 시작)
    if (
      signatureData.startsWith('data/admin/') ||
      signatureData.startsWith('/data/admin/') ||
      signatureData.startsWith('http') ||
      signatureData.includes('/')
    ) {
      return signatureData; // ApprovalSection의 getFullFileUrl에서 처리
    }
    // base64 문자열인 경우
    return `data:image/png;base64,${signatureData}`;
  };

  // 결재 정보 처리
  const approvalStep = originalDocument?.approvalStep || 0;
  const safetySystemDocumentIdx =
    originalDocument?.safetySystemDocumentIdx || propSafetySystemDocumentIdx || undefined;

  // approvalStep에 따라 결재 정보 매핑
  const approvalSignatures = useMemo(() => {
    const approvalList = (originalDocument as any)?.approvalList || [];
    const signatures: ApprovalSignature[] = [];

    // approvalStep에 따라 필요한 타입 결정
    const needsWriter = approvalStep >= 2;
    const needsReviewer = approvalStep >= 3;
    const needsApprover = approvalStep >= 1;

    // approvalList에서 각 단계의 첫 번째 항목 찾기
    if (needsWriter) {
      const writer = approvalList.find((item: any) => item.approvalStep === 2);
      if (writer) {
        signatures.push({
          type: 'writer',
          name: writer.memberName,
          date: writer.approvedAt ? dayjs(writer.approvedAt).format('YYYY-MM-DD') : undefined,
          signature: normalizeSignatureData(writer.signatureData),
          memberIdx: writer.targetMemberIdx,
          documentApprovalIdx: writer.documentApprovalIdx,
        });
      } else {
        signatures.push({ type: 'writer' });
      }
    }

    if (needsReviewer) {
      const reviewer = approvalList.find((item: any) => item.approvalStep === 3);
      if (reviewer) {
        signatures.push({
          type: 'reviewer',
          name: reviewer.memberName,
          date: reviewer.approvedAt ? dayjs(reviewer.approvedAt).format('YYYY-MM-DD') : undefined,
          signature: normalizeSignatureData(reviewer.signatureData),
          memberIdx: reviewer.targetMemberIdx,
          documentApprovalIdx: reviewer.documentApprovalIdx,
        });
      } else {
        signatures.push({ type: 'reviewer' });
      }
    }

    if (needsApprover) {
      const approver = approvalList.find((item: any) => item.approvalStep === 1);
      if (approver) {
        signatures.push({
          type: 'approver',
          name: approver.memberName,
          date: approver.approvedAt ? dayjs(approver.approvedAt).format('YYYY-MM-DD') : undefined,
          signature: normalizeSignatureData(approver.signatureData),
          memberIdx: approver.targetMemberIdx,
          documentApprovalIdx: approver.documentApprovalIdx,
        });
      } else {
        signatures.push({ type: 'approver' });
      }
    }

    return signatures;
  }, [originalDocument, approvalStep]);

  // approvalList를 타입별로 매핑 (documentApprovalIdx 찾기용)
  const approvalListMap = useMemo(() => {
    const approvalList = (originalDocument as any)?.approvalList || [];
    const map = new Map<ApprovalType, any>();
    approvalList.forEach((item: any) => {
      if (item.approvalStep === 1) map.set('approver', item);
      else if (item.approvalStep === 2) map.set('writer', item);
      else if (item.approvalStep === 3) map.set('reviewer', item);
    });
    return map;
  }, [originalDocument]);

  // 결재 대상자 등록 Mutation
  const createApprovalMutation = useMutation({
    mutationFn: async ({
      approvalType,
      targetMemberIdx,
      approvalStepValue,
    }: {
      approvalType: ApprovalType;
      targetMemberIdx: number;
      approvalStepValue: number;
    }) => {
      if (!safetySystemDocumentIdx) throw new Error('문서 인덱스가 없습니다.');

      // approvalStep 매핑: writer=2, reviewer=3, approver=1
      const stepMap: Record<ApprovalType, number> = {
        writer: 2,
        reviewer: 3,
        approver: 1,
      };

      await createDocumentApproval(safetySystemDocumentIdx, {
        approvalType: 'sequential',
        approvalTargetList: [
          {
            targetMemberIdx,
            approvalStep: stepMap[approvalType],
          },
        ],
      });
    },
    onSuccess: () => {
      if (propSharedDocumentIdx) {
        queryClient.invalidateQueries({
          queryKey: ['sharedDocumentDetail', propSharedDocumentIdx],
        });
      }
      if (propSafetySystemDocumentIdx) {
        queryClient.invalidateQueries({
          queryKey: ['safetySystemDocumentDetail', propSafetySystemDocumentIdx],
        });
      }
    },
  });

  // 서명 등록 Mutation
  const addSignatureMutation = useMutation({
    mutationFn: async ({
      signatureData,
      approvalStatus,
    }: {
      signatureData: string;
      approvalStatus: 'APPROVED' | 'REJECTED';
    }) => {
      if (!safetySystemDocumentIdx) throw new Error('문서 인덱스가 없습니다.');

      await addApprovalSignature(safetySystemDocumentIdx, {
        signatureData,
        approvalStatus,
      });
    },
    onSuccess: () => {
      if (propSharedDocumentIdx) {
        queryClient.invalidateQueries({
          queryKey: ['sharedDocumentDetail', propSharedDocumentIdx],
        });
      }
      if (propSafetySystemDocumentIdx) {
        queryClient.invalidateQueries({
          queryKey: ['safetySystemDocumentDetail', propSafetySystemDocumentIdx],
        });
      }
    },
  });

  // 결재 정보 업데이트 핸들러
  const handleUpdateSignature = async (
    type: ApprovalType,
    memberIdx: number,
    signatureData?: string,
    documentApprovalIdx?: number
  ) => {
    if (!safetySystemDocumentIdx) return;

    try {
      // approvalStep 매핑
      const stepMap: Record<ApprovalType, number> = {
        writer: 2,
        reviewer: 3,
        approver: 1,
      };

      // 멤버 지정 (서명이 없을 때)
      if (!signatureData) {
        await createApprovalMutation.mutateAsync({
          approvalType: type,
          targetMemberIdx: memberIdx,
          approvalStepValue: stepMap[type],
        });
      } else {
        // 서명 등록 (이미 멤버가 지정되어 있어야 함)
        // documentApprovalIdx가 있으면 사용, 없으면 approvalListMap에서 찾기
        const approvalItem = documentApprovalIdx
          ? { documentApprovalIdx }
          : approvalListMap.get(type);
        if (!approvalItem) {
          console.error('결재 정보를 찾을 수 없습니다.');
          return;
        }

        await addSignatureMutation.mutateAsync({
          signatureData,
          approvalStatus: 'APPROVED',
        });
      }

      // 서명 완료 후 쿼리 무효화하여 데이터 새로고침
      if (propSharedDocumentIdx) {
        queryClient.invalidateQueries({
          queryKey: ['sharedDocumentDetail', propSharedDocumentIdx],
        });
      }
      if (propSafetySystemDocumentIdx) {
        queryClient.invalidateQueries({
          queryKey: ['safetySystemDocumentDetail', propSafetySystemDocumentIdx],
        });
      }
    } catch (updateError) {
      console.error('결재 정보 업데이트 실패:', updateError);
    }
  };

  // 시청 완료 업데이트 Mutation
  const updateWatchMutation = useMutation({
    mutationFn: async ({
      documentIdx,
      workerSignatureIdx,
    }: {
      documentIdx: number;
      workerSignatureIdx: number;
    }) => {
      await updateWorkerSignatureWatch(documentIdx, workerSignatureIdx, {
        isCompleted: 1,
      });
    },
    onSuccess: () => {
      // 시청 완료 후 비디오 모달 닫고 서명 모달 열기
      setVideoModalOpen(false);
      setSignatureModalOpen(true);
    },
    onError: (watchError: any) => {
      toast.error(watchError?.message || '시청 완료 처리에 실패했습니다.');
    },
  });

  // 서명 등록 Mutation
  const addWorkerSignatureMutation = useMutation({
    mutationFn: async ({
      documentIdx,
      workerSignatureIdx,
      signatureData,
    }: {
      documentIdx: number;
      workerSignatureIdx: number;
      signatureData: string;
    }) => {
      await addWorkerSignature(documentIdx, workerSignatureIdx, {
        signatureData,
        description: '교육 영상 시청 완료 후 서명',
      });
    },
    onSuccess: async () => {
      toast.success('서명이 등록되었습니다.');
      setSignatureModalOpen(false);
      setPlayingVideoRow(null);

      const promises = [];

      // 문서 상세 데이터 새로고침
      if (propSharedDocumentIdx) {
        promises.push(
          queryClient.invalidateQueries({
            queryKey: ['sharedDocumentDetail', propSharedDocumentIdx],
          })
        );
      }
      if (propSafetySystemDocumentIdx) {
        promises.push(
          queryClient.invalidateQueries({
            queryKey: ['safetySystemDocumentDetail', propSafetySystemDocumentIdx],
          })
        );
      }

      // 서명 대기 문서 목록 새로고침 (대시보드) - PendingSignaturesCard 갱신용
      promises.push(queryClient.invalidateQueries({ queryKey: ['pendingSignatures'] }));
      // 공유 문서 목록 새로고침
      promises.push(queryClient.invalidateQueries({ queryKey: ['sharedDocuments'] }));

      await Promise.all(promises);
      console.log('✅ 서명 등록 후 모든 관련 쿼리 무효화 완료');
    },
    onError: (signatureError: any) => {
      toast.error(signatureError?.message || '서명 등록에 실패했습니다.');
    },
  });

  // 교육영상 재생 핸들러
  const handleEducationVideoClick = (row: any, rowIndex: number) => {
    if (!row.vodIdx) {
      toast.error('교육영상 정보가 없습니다.');
      return;
    }
    setPlayingVideoRow({
      vodIdx: row.vodIdx,
      workerSignatureIdx: row.workerSignatureIdx || 0,
      rowIndex,
      videoTitle: row.educationVideo || '교육영상',
    });
    setVideoModalOpen(true); // 비디오 팝업 모달 열기
  };

  // 영상 재생 완료 핸들러
  const handleVideoEnded = () => {
    console.log('🎬 [handleVideoEnded] 영상 재생 완료!');
    console.log('🎬 [handleVideoEnded] playingVideoRow:', playingVideoRow);
    console.log('🎬 [handleVideoEnded] safetySystemDocumentIdx:', safetySystemDocumentIdx);

    if (!playingVideoRow || !safetySystemDocumentIdx) {
      console.log('🎬 [handleVideoEnded] playingVideoRow 또는 safetySystemDocumentIdx 없음, 종료');
      return;
    }

    // workerSignatureIdx가 있으면 (0 포함) 시청 완료 처리 및 서명 모달 열기
    // undefined 또는 null이 아닌지 체크 (0도 유효한 값으로 처리)
    if (
      playingVideoRow.workerSignatureIdx !== undefined &&
      playingVideoRow.workerSignatureIdx !== null
    ) {
      console.log('🎬 [handleVideoEnded] workerSignatureIdx:', playingVideoRow.workerSignatureIdx);
      console.log('🎬 [handleVideoEnded] 시청 완료 처리 및 서명 모달 열기 시작');
      updateWatchMutation.mutate({
        documentIdx: safetySystemDocumentIdx,
        workerSignatureIdx: playingVideoRow.workerSignatureIdx,
      });
    } else {
      // workerSignatureIdx가 없어도 서명 모달은 열기
      console.log('🎬 [handleVideoEnded] workerSignatureIdx 없음, 서명 모달만 열기');
      setVideoModalOpen(false);
      setSignatureModalOpen(true);
    }
  };

  // 서명 확인 핸들러
  const handleSignatureConfirm = (signatureDataUrl: string) => {
    if (!playingVideoRow || !safetySystemDocumentIdx) return;
    addWorkerSignatureMutation.mutate({
      documentIdx: safetySystemDocumentIdx,
      workerSignatureIdx: playingVideoRow.workerSignatureIdx,
      signatureData: signatureDataUrl,
    });
  };

  // 2400-tbm 테이블 커스텀 렌더링
  const render2400TBMTable = (data: Table2400TBMData) => {
    const tableStyle = {
      width: '100%',
      border: '2px solid',
      borderColor: 'text.primary',
      borderCollapse: 'collapse',
      '& th, & td': {
        border: '1px solid',
        borderColor: 'text.primary',
        padding: '4px',
        textAlign: 'center',
        verticalAlign: 'middle',
      },
      '& th': {
        backgroundColor: 'grey.100',
        fontSize: 14,
        fontWeight: 600,
        lineHeight: '22px',
      },
      '& td': {
        fontSize: 14,
      },
    };

    return (
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* 점검내용 테이블 */}
        <Box sx={{ pb: 5, pt: 0, px: 0, width: '100%' }}>
          <Box component="table" sx={tableStyle}>
            <thead>
              <tr style={{ height: 60 }}>
                <th style={{ flex: 1 }}>점검내용</th>
                <th style={{ flex: 1 }}>결과</th>
              </tr>
            </thead>
            <tbody>
              {data.inspectionRows.map((row, index) => (
                <tr key={index} style={{ height: 48 }}>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                      {row.inspectionContent || ''}
                    </Typography>
                  </td>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                      {row.result || ''}
                    </Typography>
                  </td>
                </tr>
              ))}
            </tbody>
          </Box>
        </Box>

        {/* 교육내용 */}
        <Box sx={{ pb: 5, pt: 0, px: 0, width: '100%' }}>
          <Box component="table" sx={tableStyle}>
            <thead>
              <tr style={{ height: 60 }}>
                <th style={{ width: '100%' }}>교육내용</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ height: 144, textAlign: 'left', verticalAlign: 'top' }}>
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 400,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {data.educationContent || ''}
                  </Typography>
                </td>
              </tr>
            </tbody>
          </Box>
        </Box>

        {/* 교육영상 테이블 */}
        <Box sx={{ pb: 5, pt: 0, px: 0, width: '100%' }}>
          <Box component="table" sx={tableStyle}>
            <thead>
              <tr style={{ height: 60 }}>
                <th style={{ width: '30%' }}>대상자</th>
                <th style={{ width: '35%' }}>교육영상</th>
                <th style={{ width: '25%' }}>서명</th>
              </tr>
            </thead>
            <tbody>
              {data.educationVideoRows.map((row, index) => (
                <tr key={index} style={{ height: 48 }}>
                  <td>
                    <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                      {row.participant?.name || ''}
                    </Typography>
                  </td>
                  <td>
                    {/* vodIdx가 있고, 현재 로그인한 사용자와 대상자가 일치하는 경우에만 재생 버튼 표시 */}
                    {row.vodIdx && (myInfoData as any)?.memberIdx === row.participant?.memberIdx ? (
                      <Button
                        variant={playingVideoRow?.rowIndex === index ? 'outlined' : 'contained'}
                        startIcon={<Iconify icon="solar:play-circle-bold" width={20} />}
                        onClick={() => handleEducationVideoClick(row, index)}
                        sx={{
                          minHeight: 36,
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        {row.participant?.name || '대상자'} - {row.educationVideo || '교육영상'}{' '}
                        재생
                      </Button>
                    ) : (
                      <Typography sx={{ fontSize: 14, fontWeight: 400 }}>
                        {row.educationVideo || ''}
                      </Typography>
                    )}
                  </td>
                  <td>
                    {row.signature ? (
                      <Box
                        component="img"
                        src={
                          row.signature.startsWith('http')
                            ? row.signature
                            : `${CONFIG.serverUrl}${row.signature}`
                        }
                        alt="서명"
                        sx={{
                          maxWidth: 100,
                          maxHeight: 40,
                          objectFit: 'contain',
                        }}
                      />
                    ) : (
                      <Typography sx={{ fontSize: 14, fontWeight: 400, color: 'text.secondary' }}>
                        미서명
                      </Typography>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Box>
        </Box>
      </Box>
    );
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    setSignatureModalOpen(false);
    setPlayingVideoRow(null);
    onClose();
  };

  // 테이블 렌더링 (모든 테이블 타입 지원)
  const renderTable = () => {
    if (!parsedTableData || !parsedTableData.tableType) {
      return null;
    }

    const tableType = parsedTableData.tableType;

    // tableType에 따라 적절한 테이블 컴포넌트 렌더링
    try {
      if (tableType === '1100' && parsedTableData.rows) {
        const TableComp = tableRegistry['1-1-1100'] as any;
        return <TableComp rows={parsedTableData.rows} />;
      }
      if (tableType === '2100' && parsedTableData.data) {
        const TableComp = tableRegistry['2-1-2100'] as any;
        return <TableComp data={parsedTableData.data} />;
      }
      if (tableType === '1200-industrial' && parsedTableData.rows) {
        const TableComp = tableRegistry['1-2-1200-industrial'] as any;
        return <TableComp row={parsedTableData.rows[0]} />;
      }
      if (tableType === '1200-near-miss' && parsedTableData.row) {
        const TableComp = tableRegistry['1-2-1200'] as any;
        return <TableComp row={parsedTableData.row} />;
      }
      if (tableType === '1500' && parsedTableData.rows) {
        const TableComp = tableRegistry['1-5-1500'] as any;
        return <TableComp rows={parsedTableData.rows} />;
      }
      if (tableType === '1400' && parsedTableData.data) {
        const TableComp = tableRegistry['1-4-1400'] as any;
        return <TableComp data={parsedTableData.data} />;
      }
      if (tableType === '1300' && parsedTableData.rows) {
        const TableComp = tableRegistry['1-3-1300'] as any;
        return <TableComp rows={parsedTableData.rows} />;
      }
      if (tableType === '2300' && parsedTableData.rows) {
        const TableComp = tableRegistry['2-3-2300'] as any;
        return <TableComp rows={parsedTableData.rows} />;
      }
      if (tableType === '2200' && parsedTableData.rows) {
        const TableComp = tableRegistry['2-2'] as any;
        return <TableComp data={parsedTableData.rows} />;
      }
      if (tableType === '2400-tbm' && parsedTableData.data) {
        // 2400-tbm은 커스텀 렌더링 (교육영상 클릭 가능하게)
        return render2400TBMTable(parsedTableData.data as Table2400TBMData);
      }
      if (tableType === '2400-education' && parsedTableData.rows) {
        const TableComp = tableRegistry['2-4-2400-education'] as any;
        return (
          <TableComp
            rows={parsedTableData.rows}
            minimumEducationRows={parsedTableData.minimumEducationRows || []}
          />
        );
      }
    } catch (renderError) {
      console.error('테이블 렌더링 실패:', renderError, { tableType, parsedTableData });
      return (
        <Alert severity="warning" sx={{ my: 2 }}>
          테이블을 렌더링할 수 없습니다. (타입: {tableType})
        </Alert>
      );
    }

    return null;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          width: '95%',
          maxWidth: 1600,
          maxHeight: '95vh',
        },
      }}
    >
      <DialogTitle>
        <Typography component="div" variant="h6" sx={{ fontWeight: 600, fontSize: 18 }}>
          공유 문서 상세
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Iconify icon="solar:close-circle-bold" width={24} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ my: 2, mx: 3 }}>
            {error instanceof Error ? error.message : '문서를 불러오는 중 오류가 발생했습니다.'}
          </Alert>
        ) : originalDocument ? (
          <Stack spacing={0}>
            {/* 헤더 정보 (회색 배경) */}
            <Box
              sx={{
                bgcolor: 'grey.100',
                p: 3,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {/* 첫 번째 행: 등록일, 수정일 */}
              <Box sx={{ display: 'flex', gap: 5, width: '100%' }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ minWidth: 100, fontWeight: 600 }}>
                    등록일
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    {registeredAt || '-'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ minWidth: 100, fontWeight: 600 }}>
                    수정일
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    {modifiedAt || '-'}
                  </Typography>
                </Box>
              </Box>

              {/* 두 번째 행: 문서번호, 작성 IP */}
              <Box sx={{ display: 'flex', gap: 5, width: '100%' }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ minWidth: 100, fontWeight: 600 }}>
                    문서번호
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    {originalDocument.safetySystemDocumentIdx || '-'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ minWidth: 100, fontWeight: 600 }}>
                    작성 IP
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    -
                  </Typography>
                </Box>
              </Box>

              {/* 세 번째 행: 문서 작성일, 결재 마감일 */}
              <Box sx={{ display: 'flex', gap: 5, width: '100%' }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ minWidth: 100, fontWeight: 600 }}>
                    문서 작성일
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    {documentWrittenAt ? dayjs(documentWrittenAt).format('YYYY-MM-DD') : '-'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ minWidth: 100, fontWeight: 600 }}>
                    결재 마감일
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    {approvalDeadline || '-'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* 문서 제목, 작성일, 결재 섹션 */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 3,
                py: 3,
                gap: 3,
              }}
            >
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: 32,
                    fontWeight: 700,
                    lineHeight: '48px',
                    color: 'text.primary',
                    textAlign: 'center',
                  }}
                >
                  {documentTitle}
                </Typography>
              </Box>
              {/* 결재 섹션 */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ApprovalSection
                  signatures={approvalSignatures}
                  approvalStep={approvalStep}
                  onUpdateSignature={handleUpdateSignature}
                  safetySystemDocumentIdx={safetySystemDocumentIdx ?? undefined}
                />
              </Box>
            </Box>

            {/* 테이블 */}
            {parsedTableData && (
              <Box
                sx={{
                  px: 2,
                  pb: 3,
                  width: '100%',
                  overflowX: 'auto',
                  '& > *': {
                    width: '100% !important',
                    maxWidth: '100% !important',
                  },
                  // 테이블 컴포넌트 내부의 maxWidth 제한 제거
                  '& > div[class*="MuiBox-root"]': {
                    maxWidth: '100% !important',
                  },
                  // 테이블 자체의 너비 확장
                  '& table': {
                    width: '100% !important',
                    tableLayout: 'auto',
                  },
                }}
              >
                {renderTable()}
              </Box>
            )}
          </Stack>
        ) : (
          <Alert severity="info" sx={{ my: 2, mx: 3 }}>
            문서 정보를 찾을 수 없습니다.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 3 }}>
        <Box sx={{ flex: 1 }} />
        <DialogBtn variant="contained" onClick={handleClose} sx={{ minHeight: 36, fontSize: 14 }}>
          닫기
        </DialogBtn>
      </DialogActions>

      {/* 서명 모달 */}
      <SignatureModal
        open={signatureModalOpen}
        onClose={() => {
          setSignatureModalOpen(false);
        }}
        onConfirm={handleSignatureConfirm}
        targetLabel="근로자 서명"
      />

      {/* 비디오 팝업 모달 */}
      <Dialog
        open={videoModalOpen}
        onClose={() => {
          setVideoModalOpen(false);
          setPlayingVideoRow(null);
        }}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'black',
            borderRadius: 2,
            maxWidth: '900px',
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: 'grey.900',
            color: 'white',
            py: 1.5,
            px: 2,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {playingVideoRow?.videoTitle || '교육영상'}
          </Typography>
          <IconButton
            onClick={() => {
              setVideoModalOpen(false);
              setPlayingVideoRow(null);
            }}
            sx={{ color: 'white' }}
          >
            <Iconify icon={`mdi:close` as any} width={24} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: 'black' }}>
          {playingVideoRow && (
            <VideoPlayerWithSubtitle
              key={`video-modal-${playingVideoRow.vodIdx}`}
              vodIdx={playingVideoRow.vodIdx}
              videoTitle={playingVideoRow.videoTitle || '교육영상'}
              memberLang={(myInfoData as any)?.memberLang || 'ko'}
              onEnded={handleVideoEnded}
            />
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
