import { useState, useMemo, useEffect } from 'react';
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
  useUserProfile,
  useEducationCompletionRate,
} from './hooks/use-dashboard-api';
import { useMyInfo } from 'src/sections/Chat/hooks/use-my-info';
import { useNavigate } from 'react-router';
import dayjs from 'dayjs';
import { paths } from 'src/routes/paths';

import { useRiskReports } from 'src/sections/Operation/hooks/use-operation-api';
import { useGetChatRooms } from 'src/sections/Chat/hooks/use-chat-api';
import { ref, get, query, orderByChild, startAt, endAt } from 'firebase/database';
import { database } from 'src/config/firebase';
import type { RiskReport } from 'src/services/operation/operation.types';

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
  const [educationDetailModalOpen, setEducationDetailModalOpen] = useState(false);
  const [selectedSharedDocumentIdx, setSelectedSharedDocumentIdx] = useState<number | null>(null);
  const [selectedSafetySystemDocumentIdx, setSelectedSafetySystemDocumentIdx] = useState<
    number | null
  >(null);

  const navigate = useNavigate();
  // 기간 계산 (periodType과 periodValue에 따라 startDate, endDate 계산)
  const getDateRange = () => {
    const now = dayjs();
    let start = dayjs();
    let end = dayjs();

    if (periodType === 'year') {
      const year = periodValue ? parseInt(periodValue.replace('년', '')) : now.year();
      start = dayjs().year(year).startOf('year');
      end = dayjs().year(year).endOf('year');
    } else if (periodType === 'month') {
      const month = periodValue ? parseInt(periodValue.replace('월', '')) - 1 : now.month();
      start = dayjs().month(month).startOf('month');
      end = dayjs().month(month).endOf('month');
    } else {
      // week
      const week = periodValue ? parseInt(periodValue.replace('주차', '')) : 1;
      // 해당 연도의 n주차 계산
      start = dayjs()
        .startOf('year')
        .add(week - 1, 'week')
        .startOf('week');
      end = start.endOf('week');
    }

    return {
      startDate: start.format('YYYY-MM-DD'),
      endDate: end.format('YYYY-MM-DD'),
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
  } = useSharedDocuments({
    // 전체 데이터를 가져오기 위해 큰 pageSize 사용
    page: 1,
    pageSize: 1000, // 충분히 큰 값으로 설정하여 전체 데이터 가져오기
  });
  const { data: profileData, isLoading: profileLoading, error: profileError } = useUserProfile();

  const { data: reportsData, isLoading: reportsLoading } = useRiskReports({
    page: 1,
    pageSize: 1000,
  });

  const allReports = useMemo(() => (reportsData as any)?.body?.riskReportList || [], [reportsData]);

  // 사고 발생 건수 동기화를 위한 채팅방 및 통계 조회 (Firebase 기반)
  const { data: chatRoomsData } = useGetChatRooms();
  const rooms = useMemo(() => {
    const list =
      (chatRoomsData as any)?.chatRoomList || (chatRoomsData as any)?.body?.chatRoomList || [];
    return Array.isArray(list) ? list : [];
  }, [chatRoomsData]);

  const emergencyRoom = useMemo(() => rooms.find((r: any) => r.type === 'EMERGENCY'), [rooms]);

  const [emergencyCount, setEmergencyCount] = useState(0);
  const [isEmergencyLoading, setIsEmergencyLoading] = useState(false);

  useEffect(() => {
    const db = database;
    if (!emergencyRoom?.chatRoomId || !db) {
      setEmergencyCount(0);
      return;
    }

    const fetchEmergencyCount = async () => {
      setIsEmergencyLoading(true);
      try {
        const start = dayjs(dateRange.startDate).startOf('day').valueOf().toString();
        const end = dayjs(dateRange.endDate).endOf('day').valueOf().toString();

        const messagesRef = ref(db, `chatRooms/${emergencyRoom.chatRoomId}/messages`);
        const messagesQuery = query(
          messagesRef,
          orderByChild('timestamp'),
          startAt(start),
          endAt(end)
        );

        const snapshot = await get(messagesQuery);
        let count = 0;
        snapshot.forEach((child) => {
          const val = child.val();
          if (val.messageType === 'EMERGENCY') {
            count += 1;
          }
        });
        setEmergencyCount(count);
      } catch (error) {
        console.error('Failed to fetch emergency count for dashboard:', error);
      } finally {
        setIsEmergencyLoading(false);
      }
    };

    fetchEmergencyCount();
  }, [emergencyRoom?.chatRoomId, dateRange.startDate, dateRange.endDate]);

  const { data: myInfoData } = useMyInfo(); // isSuperAdmin 정보 가져오기
  const {
    data: educationData,
    isLoading: educationLoading,
    error: educationError,
  } = useEducationCompletionRate({ role: user?.role });

  // 에러 처리
  if (pendingError || sharedError || profileError || educationError) {
    console.error('❌ Dashboard API Errors:', {
      pendingError,
      sharedError,
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

  // 공개 문서만 필터링 (SharedDocumentsCard에서 사용)
  const publicSharedDocuments = useMemo(
    () => sharedDocuments.filter((doc) => doc.isPublic === 1),
    [sharedDocuments]
  );

  // 클라이언트 사이드 페이지네이션 계산
  const pendingPageSize = 5;

  // 전체 데이터에서 페이지네이션 계산
  const pendingTotalPages = Math.ceil(pendingSignatures.length / pendingPageSize);

  const pendingPageData = useMemo(() => {
    const start = (pendingPage - 1) * pendingPageSize;
    return pendingSignatures.slice(start, start + pendingPageSize);
  }, [pendingSignatures, pendingPage]);

  // 사고·위험 보고 현황 통계 계산 (클라이언트 사이드 필터링)
  const { accidentCount, riskCount } = useMemo(() => {
    const { startDate, endDate } = dateRange;
    const start = dayjs(startDate).startOf('day');
    const end = dayjs(endDate).endOf('day');

    // 위험 보고 건수: 해당 기간 내 등록된 전체 위험 보고서 (createAt 기준)
    const filteredReports = allReports.filter((report: RiskReport) => {
      if (!report.registeredAt) return false;
      const regDate = dayjs(report.registeredAt);
      return regDate.isSameOrAfter(start) && regDate.isSameOrBefore(end);
    });

    return {
      accidentCount: emergencyCount,
      riskCount: filteredReports.length,
    };
  }, [allReports, dateRange, emergencyCount]);

  // 프로필 정보 (에러 처리 포함)
  const profileName =
    profileData?.header?.isSuccess && profileData?.member?.memberName
      ? profileData.member.memberName
      : user?.displayName || '사용자';
  const profileLabel =
    profileData?.header?.isSuccess && profileData?.member?.memberRole
      ? profileData.member.memberRole
      : '관리감독자';
  const profileThumbnail =
    profileData?.header?.isSuccess && profileData?.member?.memberThumbnail
      ? profileData.member.memberThumbnail
      : undefined;
  const profileRoles = ['작업 현장 위험요인 파악 및 보고', '사고 발생 시 보고·조사·후속조치']; // TODO: API에서 가져오기

  // 슈퍼 어드민 여부 (myInfoData에서 가져옴 - /member/my-info API)
  const profileIsSuperAdmin = !!(myInfoData as any)?.isSuperAdmin;

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
  };

  const handlePeriodValueChange = (value: string) => {
    setPeriodValue(value);
  };

  const handlePendingPageChange = (page: number) => {
    setPendingPage(page);
    // 클라이언트 사이드 페이지네이션은 데이터 새로고침 불필요
  };

  // 로딩 상태
  const isLoading =
    pendingLoading ||
    sharedLoading ||
    reportsLoading ||
    profileLoading ||
    educationLoading ||
    isEmergencyLoading;

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
              memberThumbnail={profileThumbnail}
              onViewDetail={handleViewDetail}
              isSuperAdmin={profileIsSuperAdmin}
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
              rows={publicSharedDocuments}
              onViewAll={handleViewAll}
              onDocumentClick={(doc) => {
                setSelectedSharedDocumentIdx(doc.sharedDocumentIdx);
              }}
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
                department:
                  (profileData.member as unknown as { department?: string }).department || '',
                joinedAt: (profileData.member as unknown as { joinedAt?: string | null }).joinedAt
                  ? String(
                      (profileData.member as unknown as { joinedAt?: string | null }).joinedAt
                    ).split('T')[0]
                  : null,
                role: profileRoles[0] || profileLabel,
              }
            : user
              ? {
                  id: user.id || '',
                  name: profileName,
                  department: '',
                  joinedAt: null,
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
