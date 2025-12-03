import { useState, useMemo } from 'react';
import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import { DashboardContent } from 'src/layouts/dashboard';
import { useAuthContext } from 'src/auth/hooks';
import { useQueryClient } from '@tanstack/react-query';

import ProfileCard from './components/ProfileCard';
import AccidentReportCard from './components/AccidentReportCard';
import PendingSignaturesCard from './components/PendingSignaturesCard';
import SharedDocumentsCard from './components/SharedDocumentsCard';
import EducationDetailModal from './components/EducationDetailModal';
import SharedDocumentDetailModal from 'src/sections/Chat/components/SharedDocumentDetailModal';

import {
  usePendingSignatures,
  useSharedDocuments,
  useAccidentRiskStats,
  useUserProfile,
  useEducationCompletionRate,
} from './hooks/use-dashboard-api';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function DashBoardView({ title = '대시보드', description, sx }: Props) {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  const [periodType, setPeriodType] = useState<'year' | 'month' | 'week'>('month');
  const [periodValue, setPeriodValue] = useState<string>('');
  const [pendingPage, setPendingPage] = useState(1);
  const [sharedPage, setSharedPage] = useState(1);
  const [educationDetailModalOpen, setEducationDetailModalOpen] = useState(false);
  const [selectedSharedDocumentIdx, setSelectedSharedDocumentIdx] = useState<number | null>(null);
  const [selectedSafetySystemDocumentIdx, setSelectedSafetySystemDocumentIdx] = useState<
    number | null
  >(null);

  const navigate = useNavigate();
  // 기간 계산 (periodType과 periodValue에 따라 startDate, endDate 계산)
  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (periodType === 'year') {
      const year = periodValue ? parseInt(periodValue.replace('년', '')) : now.getFullYear();
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59);
    } else if (periodType === 'month') {
      const month = periodValue ? parseInt(periodValue.replace('월', '')) - 1 : now.getMonth();
      const year = now.getFullYear();
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0, 23, 59, 59);
    } else {
      // week
      const week = periodValue ? parseInt(periodValue.replace('주차', '')) : 1;
      const year = now.getFullYear();
      const firstDay = new Date(year, 0, 1);
      const days = (week - 1) * 7;
      startDate = new Date(firstDay);
      startDate.setDate(firstDay.getDate() + days);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  const dateRange = getDateRange();

  // API 호출
  const {
    data: pendingSignaturesData,
    isLoading: pendingLoading,
    error: pendingError,
  } = usePendingSignatures();
  const {
    data: sharedDocumentsData,
    isLoading: sharedLoading,
    error: sharedError,
  } = useSharedDocuments(); // 클라이언트 사이드 페이지네이션을 위해 파라미터 제거
  const {
    data: riskStatsData,
    isLoading: riskStatsLoading,
    error: riskStatsError,
  } = useAccidentRiskStats({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });
  const { data: profileData, isLoading: profileLoading, error: profileError } = useUserProfile();
  const {
    data: educationData,
    isLoading: educationLoading,
    error: educationError,
  } = useEducationCompletionRate({ role: user?.role });

  // 에러 처리
  if (pendingError || sharedError || riskStatsError || profileError || educationError) {
    console.error('❌ Dashboard API Errors:', {
      pendingError,
      sharedError,
      riskStatsError,
      profileError,
      educationError,
    });
  }

  // 데이터 변환 (에러 처리 포함)
  // axios 인터셉터에서 data.body.data를 평탄화했으므로 직접 접근 가능
  const pendingSignatures = useMemo(() => {
    // isSuccess가 false이거나 데이터가 없으면 빈 배열 반환
    if (
      !pendingSignaturesData?.header?.isSuccess ||
      !pendingSignaturesData?.documentSignatureList ||
      !Array.isArray(pendingSignaturesData.documentSignatureList)
    ) {
      if (import.meta.env.DEV && pendingSignaturesData) {
        console.warn('⚠️ PendingSignatures: Invalid response structure', pendingSignaturesData);
      }
      return [];
    }
    // 디버깅: 실제 데이터 구조 확인
    if (import.meta.env.DEV && pendingSignaturesData.documentSignatureList.length > 0) {
      console.log('📋 DocumentSignature sample:', pendingSignaturesData.documentSignatureList[0]);
    }
    return pendingSignaturesData.documentSignatureList;
  }, [pendingSignaturesData]);

  const sharedDocuments = useMemo(() => {
    // isSuccess가 false이거나 데이터가 없으면 빈 배열 반환
    if (
      !sharedDocumentsData?.header?.isSuccess ||
      !sharedDocumentsData?.sharedDocumentList ||
      !Array.isArray(sharedDocumentsData.sharedDocumentList)
    ) {
      if (import.meta.env.DEV && sharedDocumentsData) {
        console.warn('⚠️ SharedDocuments: Invalid response structure', sharedDocumentsData);
      }
      return [];
    }
    return sharedDocumentsData.sharedDocumentList;
  }, [sharedDocumentsData]);

  // 클라이언트 사이드 페이지네이션 계산
  const pendingPageSize = 2;
  const sharedPageSize = 7;

  // 전체 데이터에서 페이지네이션 계산
  const pendingTotalPages = Math.ceil(pendingSignatures.length / pendingPageSize);
  const sharedTotalPages = Math.ceil(sharedDocuments.length / sharedPageSize);

  const pendingPageData = useMemo(() => {
    const start = (pendingPage - 1) * pendingPageSize;
    return pendingSignatures.slice(start, start + pendingPageSize);
  }, [pendingSignatures, pendingPage]);

  const sharedPageData = useMemo(() => {
    const start = (sharedPage - 1) * sharedPageSize;
    return sharedDocuments.slice(start, start + sharedPageSize);
  }, [sharedDocuments, sharedPage]);

  // 사고·위험 보고 현황 통계 (에러 처리 포함)
  // totalCount를 사고 발생 건수로 사용
  const accidentCount =
    riskStatsData?.header?.isSuccess && riskStatsData?.statistics?.totalCount
      ? riskStatsData.statistics.totalCount
      : 0;
  const riskCount =
    riskStatsData?.header?.isSuccess && riskStatsData?.statistics?.riskCount
      ? riskStatsData.statistics.riskCount
      : 0;

  // 프로필 정보 (에러 처리 포함)
  const profileName =
    profileData?.header?.isSuccess && profileData?.member?.memberName
      ? profileData.member.memberName
      : user?.displayName || '사용자';
  const profileLabel =
    profileData?.header?.isSuccess && profileData?.member?.memberRole
      ? profileData.member.memberRole
      : '관리감독자';
  const profileRoles = ['작업 현장 위험요인 파악 및 보고', '사고 발생 시 보고·조사·후속조치']; // TODO: API에서 가져오기

  // 교육 이수율 (응답 구조: educationCompletion.completionRate)
  const educationRate =
    educationData?.header?.isSuccess && educationData?.educationCompletion?.completionRate
      ? parseFloat(String(educationData.educationCompletion.completionRate))
      : 0;

  const handleViewDetail = () => {
    setEducationDetailModalOpen(true);
  };

  const handleSaveEducationDetail = () => {
    // EducationDetailModal 내부에서 이미 파일명 저장이 완료되었으므로
    // 교육 이수율 데이터를 새로고침하여 최신 정보 반영
    queryClient.invalidateQueries({ queryKey: ['educationCompletionRate'] });
    queryClient.invalidateQueries({ queryKey: ['educationDetail'] });

    if (import.meta.env.DEV) {
      console.log('✅ 교육 상세 저장 완료 - 데이터 새로고침');
    }
  };

  const handleAccidentNavigate = () => {
    // 사고 발생 현황 채팅방으로 이동
    navigate(`${paths.dashboard.operation.chat}?roomId=emergency`);
  };

  const handleRiskNavigate = () => {
    // 위험 보고 페이지로 이동
    navigate(paths.dashboard.operation.riskReport);
  };

  const handleViewDocument = (id: string, isSafetySystemDocumentIdx = false) => {
    if (!id) {
      console.warn('⚠️ Document ID is undefined or empty');
      return;
    }
    const documentIdx = Number(id);
    if (!Number.isNaN(documentIdx) && documentIdx > 0) {
      if (isSafetySystemDocumentIdx) {
        // safetySystemDocumentIdx인 경우
        setSelectedSafetySystemDocumentIdx(documentIdx);
        setSelectedSharedDocumentIdx(null);
      } else {
        // sharedDocumentIdx인 경우
        setSelectedSharedDocumentIdx(documentIdx);
        setSelectedSafetySystemDocumentIdx(null);
      }
    } else {
      console.warn('⚠️ Invalid document ID:', id);
    }
  };

  const handleCloseDocumentModal = () => {
    setSelectedSharedDocumentIdx(null);
    setSelectedSafetySystemDocumentIdx(null);
  };

  const handleViewAll = () => {
    // TODO: 공유된 문서 전체 목록 페이지로 이동
    console.log('전체 보기');
  };

  const handlePeriodTypeChange = (type: 'year' | 'month' | 'week') => {
    setPeriodType(type);
    // 기간 변경 시 통계 데이터 새로고침
    queryClient.invalidateQueries({ queryKey: ['riskReportStatistics'] });
  };

  const handlePeriodValueChange = (value: string) => {
    setPeriodValue(value);
    // 기간 값 변경 시 통계 데이터 새로고침
    queryClient.invalidateQueries({ queryKey: ['riskReportStatistics'] });
  };

  const handlePendingPageChange = (page: number) => {
    setPendingPage(page);
    // 클라이언트 사이드 페이지네이션은 데이터 새로고침 불필요
  };

  const handleSharedPageChange = (page: number) => {
    setSharedPage(page);
    // 클라이언트 사이드 페이지네이션은 데이터 새로고침 불필요
  };

  // 로딩 상태
  const isLoading =
    pendingLoading || sharedLoading || riskStatsLoading || profileLoading || educationLoading;

  return (
    <DashboardContent maxWidth="xl" sx={{ width: '100%', height: '100%' }}>
      <Typography
        variant="h4"
        sx={{
          mb: { xs: 2, sm: 3, md: 3.5 },
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
        }}
      >
        {title}
      </Typography>
      {description && (
        <Typography
          sx={{
            mt: 1,
            mb: { xs: 2, sm: 3, md: 3.5 },
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          {description}
        </Typography>
      )}
      {isLoading && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            데이터를 불러오는 중...
          </Typography>
        </Box>
      )}
      <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ width: '100%' }}>
        {/* 첫 번째 섹션: 프로필 카드 + 사고·위험 보고 현황 */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 2, sm: 2.5, md: 3 }}
          sx={{ width: '100%', alignItems: 'stretch' }}
          maxHeight={{ md: '100%', lg: 264 }}
        >
          <Box sx={{ flex: 1, maxWidth: { md: '100%', lg: 470 }, display: 'flex' }}>
            <ProfileCard
              name={profileName}
              label={profileLabel}
              roles={profileRoles}
              educationRate={educationRate}
              onViewDetail={handleViewDetail}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
            <AccidentReportCard
              periodType={periodType}
              periodValue={periodValue}
              accidentCount={accidentCount}
              riskCount={riskCount}
              onPeriodTypeChange={handlePeriodTypeChange}
              onPeriodValueChange={handlePeriodValueChange}
              onAccidentNavigate={handleAccidentNavigate}
              onRiskNavigate={handleRiskNavigate}
            />
          </Box>
        </Stack>

        {/* 두 번째 섹션: 서명 대기 문서 + 공유된 문서 */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 2, sm: 2.5, md: 3 }}
          sx={{ width: '100%', alignItems: 'stretch' }}
        >
          <Box sx={{ flex: 1, maxWidth: { md: '100%', lg: 470 }, display: 'flex' }}>
            <PendingSignaturesCard
              rows={pendingPageData}
              page={pendingPage}
              totalPages={pendingTotalPages}
              onPageChange={handlePendingPageChange}
              onViewDocument={handleViewDocument}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
            <SharedDocumentsCard
              rows={sharedPageData}
              page={sharedPage}
              totalPages={sharedTotalPages}
              onPageChange={handleSharedPageChange}
              onViewAll={handleViewAll}
            />
          </Box>
        </Stack>
      </Stack>

      <EducationDetailModal
        open={educationDetailModalOpen}
        onClose={() => setEducationDetailModalOpen(false)}
        onSave={handleSaveEducationDetail}
        user={
          user && profileData?.header?.isSuccess && profileData?.member
            ? {
                id: String(profileData.member.memberIdx || user.id || ''),
                name: profileName,
                department: '경영관리팀', // TODO: API에서 가져오기
                joinDate: '2025-10-31', // TODO: API에서 가져오기
                role: profileRoles[0] || profileLabel,
              }
            : user
              ? {
                  id: user.id || '',
                  name: profileName,
                  department: '경영관리팀', // TODO: API에서 가져오기
                  joinDate: '2025-10-31', // TODO: API에서 가져오기
                  role: profileRoles[0] || profileLabel,
                }
              : null
        }
      />

      {/* 공유 문서 상세 모달 */}
      {(selectedSharedDocumentIdx || selectedSafetySystemDocumentIdx) && (
        <SharedDocumentDetailModal
          open={!!(selectedSharedDocumentIdx || selectedSafetySystemDocumentIdx)}
          onClose={handleCloseDocumentModal}
          sharedDocumentIdx={selectedSharedDocumentIdx}
          safetySystemDocumentIdx={selectedSafetySystemDocumentIdx}
        />
      )}
    </DashboardContent>
  );
}
