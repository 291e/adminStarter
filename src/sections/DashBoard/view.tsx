import { useState, useMemo } from 'react';
import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import { DashboardContent } from 'src/layouts/dashboard';
import { useAuthContext } from 'src/auth/hooks';
import { mockSafetySystemDocuments } from 'src/_mock/_safety-system';

import ProfileCard from './components/ProfileCard';
import AccidentReportCard from './components/AccidentReportCard';
import PendingSignaturesCard, { type PendingSignature } from './components/PendingSignaturesCard';
import SharedDocumentsCard, { type SharedDocument } from './components/SharedDocumentsCard';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

// 서명 대기 문서 변환 함수
function convertToPendingSignature(
  doc: (typeof mockSafetySystemDocuments)[0],
  index: number
): PendingSignature {
  // registeredTime을 "5:00 PM" 형식으로 변환
  const [hours, minutes] = doc.registeredTime.split(':');
  const hour24 = parseInt(hours, 10);
  const hour12 = hour24 > 12 ? hour24 - 12 : hour24 === 0 ? 12 : hour24;
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  const time = `${hour12}:${minutes} ${ampm}`;

  return {
    id: `${doc.safetyIdx}-${doc.itemNumber}-${doc.documentNumber}`,
    documentName: doc.documentName,
    author: doc.organizationName,
    date: doc.registeredAt,
    time,
  };
}

// 공유된 문서 변환 함수 (priority는 랜덤 생성)
function convertToSharedDocument(
  doc: (typeof mockSafetySystemDocuments)[0],
  index: number
): SharedDocument {
  const priorities: Array<'urgent' | 'important' | 'reference'> = [
    'urgent',
    'important',
    'reference',
  ];
  // 문서 번호에 따라 일관된 priority 할당
  const priority = priorities[index % priorities.length];

  return {
    id: `${doc.safetyIdx}-${doc.itemNumber}-${doc.documentNumber}`,
    priority,
    documentName: doc.documentName,
    writtenDate: doc.writtenAt,
    registeredDate: doc.registeredAt,
  };
}

export function DashBoardView({ title = '대시보드', description, sx }: Props) {
  const { user } = useAuthContext();
  const [periodType, setPeriodType] = useState<'year' | 'month' | 'week'>('month');
  const [periodValue, setPeriodValue] = useState<string>('');
  const [pendingPage, setPendingPage] = useState(1);
  const [sharedPage, setSharedPage] = useState(1);

  // TODO: TanStack Query Hook(useQuery)으로 서명 대기 문서 목록 가져오기
  // const { data: pendingDocs, isLoading: pendingLoading } = useQuery({
  //   queryKey: ['pendingSignatures', pendingPage],
  //   queryFn: () => fetchPendingSignatures({ page: pendingPage, pageSize: 2 }),
  // });
  // 서명 대기 문서: 처음 4개 문서 사용 (페이지당 2개)
  const pendingSignatures = useMemo(() => {
    const docs = mockSafetySystemDocuments.slice(0, 4);
    return docs.map(convertToPendingSignature);
  }, []);

  // TODO: TanStack Query Hook(useQuery)으로 공유된 문서 목록 가져오기
  // const { data: sharedDocs, isLoading: sharedLoading } = useQuery({
  //   queryKey: ['sharedDocuments', sharedPage],
  //   queryFn: () => fetchSharedDocuments({ page: sharedPage, pageSize: 7 }),
  // });
  // 공유된 문서: 처음 7개 문서 사용
  const sharedDocuments = useMemo(() => {
    const docs = mockSafetySystemDocuments.slice(0, 7);
    return docs.map(convertToSharedDocument);
  }, []);

  // 페이지네이션 계산
  const pendingPageSize = 2;
  const sharedPageSize = 7;
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

  // TODO: TanStack Query Hook(useQuery)으로 사고·위험 보고 현황 통계 가져오기
  // const { data: statistics } = useQuery({
  //   queryKey: ['accidentRiskStatistics', periodType, periodValue],
  //   queryFn: () => fetchAccidentRiskStatistics({ periodType, periodValue }),
  // });
  // 사고·위험 보고 현황 (월별 통계 - 목업)
  const accidentCount = 2;
  const riskCount = 2;

  // TODO: TanStack Query Hook(useQuery)으로 사용자 프로필 정보 가져오기
  // const { data: profile } = useQuery({
  //   queryKey: ['userProfile', user?.id],
  //   queryFn: () => fetchUserProfile(user?.id),
  // });
  // 프로필 정보 (사용자 정보에서 가져오기)
  const profileName = user?.displayName || '김철수';
  const profileLabel = '관리감독자';
  const profileRoles = ['작업 현장 위험요인 파악 및 보고', '사고 발생 시 보고·조사·후속조치'];

  // TODO: TanStack Query Hook(useQuery)으로 교육 이수율 가져오기
  // const { data: education } = useQuery({
  //   queryKey: ['educationRate', user?.id],
  //   queryFn: () => fetchEducationRate(user?.id),
  // });
  const educationRate = 60;

  const handleViewDetail = () => {
    // TODO: 교육 이수율 상세 페이지로 이동
    // navigate('/dashboard/education-report');
    console.log('상세보기 클릭');
  };

  const handleAccidentNavigate = () => {
    // TODO: 사고 발생 페이지로 이동
    // navigate('/dashboard/operation/accident-report');
    console.log('사고발생 바로가기');
  };

  const handleRiskNavigate = () => {
    // TODO: 위험 보고 페이지로 이동
    // navigate('/dashboard/operation/risk-report');
    console.log('위험보고 바로가기');
  };

  const handleViewDocument = (id: string) => {
    // TODO: API 호출로 문서 상세 정보 가져오기 및 문서 뷰어 열기
    // const { data: document } = await fetchDocumentDetail(id);
    // openDocumentViewer(document);
    console.log('문서보기:', id);
  };

  const handleViewAll = () => {
    // TODO: 공유된 문서 전체 목록 페이지로 이동
    // navigate('/dashboard/shared-documents');
    console.log('전체 보기');
  };

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
              onPeriodTypeChange={(type) => {
                setPeriodType(type);
                // TODO: 기간 변경 시 TanStack Query로 통계 데이터 새로고침
                // const queryClient = useQueryClient();
                // queryClient.invalidateQueries({ queryKey: ['accidentRiskStatistics', type, periodValue] });
              }}
              onPeriodValueChange={(value) => {
                setPeriodValue(value);
                // TODO: 기간 값 변경 시 TanStack Query로 통계 데이터 새로고침
                // const queryClient = useQueryClient();
                // queryClient.invalidateQueries({ queryKey: ['accidentRiskStatistics', periodType, value] });
              }}
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
              onPageChange={(page) => {
                setPendingPage(page);
                // TODO: 페이지 변경 시 TanStack Query로 서명 대기 문서 목록 새로고침
                // const queryClient = useQueryClient();
                // queryClient.invalidateQueries({ queryKey: ['pendingSignatures', page] });
              }}
              onViewDocument={handleViewDocument}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
            <SharedDocumentsCard
              rows={sharedPageData}
              page={sharedPage}
              totalPages={sharedTotalPages}
              onPageChange={(page) => {
                setSharedPage(page);
                // TODO: 페이지 변경 시 TanStack Query로 공유된 문서 목록 새로고침
                // const queryClient = useQueryClient();
                // queryClient.invalidateQueries({ queryKey: ['sharedDocuments', page] });
              }}
              onViewAll={handleViewAll}
            />
          </Box>
        </Stack>
      </Stack>
    </DashboardContent>
  );
}
