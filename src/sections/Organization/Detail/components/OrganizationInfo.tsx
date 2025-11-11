import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import { useState } from 'react';

import { fDateTime } from 'src/utils/format-time';
import type { Member } from 'src/sections/Organization/types/member';
import type { Company } from 'src/_mock/_company';

import SubscriptionService from './SubscriptionService';

// ----------------------------------------------------------------------

type Props = {
  organization: Company | undefined;
  organizationMembers: Member[];
  onInviteMember?: () => void;
  onEditOrganization?: () => void;
};

export default function OrganizationInfo({
  organization,
  organizationMembers,
  onInviteMember,
  onEditOrganization,
}: Props) {
  const [tabValue, setTabValue] = useState(0);

  // 조직 정보가 없으면 기본값 사용
  const orgData = (organization || {
    companyIdx: 0,
    companyName: '이편한 자동화기술',
    companyType: '법인사업자',
    businessNumber: '122-56-55475',
    representativeName: '김안전',
    representativePhone: '010-0123-4567',
    representativeEmail: 'safe@safeyou.kr',
    businessCategory: '제조업',
    businessItem: '안전보건',
    address: '대전광역시 유성구 복용동로 342',
    detailAddress: '필드빌딩 2층',
    manager: '김안전',
    division: '운영사',
    lastAccessIp: '168.126.222.111',
    registrationDate: '2025-10-23 16:55:45',
    lastAccessDate: '2025-10-23 16:55:45',
  }) as Company & {
    companyType: string;
    businessNumber: string;
    representativeName: string;
    representativePhone: string;
    representativeEmail: string;
    businessCategory: string;
    businessItem: string;
    address: string;
    detailAddress: string;
    manager: string;
    division: string;
    lastAccessIp: string;
    registrationDate: string;
    lastAccessDate: string;
  };

  // 첫 번째 멤버의 정보를 기본값으로 사용 (실제로는 조직 정보에서 가져와야 함)
  const firstMember = organizationMembers[0];

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: (theme) => theme.customShadows.card,
        overflow: 'hidden',
      }}
    >
      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ px: 3 }}>
        <Tab label="조직 정보" />
        <Tab label="구독 서비스" />
      </Tabs>

      {tabValue === 0 && (
        <Box sx={{ p: 3 }}>
          {/* 첫 번째 행 */}
          <Stack direction="row" spacing={4} sx={{ mb: 3 }}>
            <Stack spacing={2} sx={{ flex: 1 }}>
              <Stack direction="row" spacing={4} alignItems="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 100 }}>
                  등록일
                </Typography>
                <Typography variant="body2">
                  {orgData.registrationDate ||
                    fDateTime(firstMember?.createAt, 'YYYY-MM-DD HH:mm:ss')}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={4} alignItems="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 100 }}>
                  접속일
                </Typography>
                <Typography variant="body2">
                  {orgData.lastAccessDate ||
                    fDateTime(firstMember?.lastSigninDate, 'YYYY-MM-DD HH:mm:ss')}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={4} alignItems="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 100 }}>
                  조직명
                </Typography>
                <Typography variant="body2">{orgData.companyName}</Typography>
              </Stack>
              <Stack direction="row" spacing={4} alignItems="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 100 }}>
                  사업자 유형
                </Typography>
                <Typography variant="body2">{orgData.companyType}</Typography>
              </Stack>
              <Stack direction="row" spacing={4} alignItems="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 100 }}>
                  대표자명
                </Typography>
                <Typography variant="body2">{orgData.representativeName}</Typography>
              </Stack>
              <Stack direction="row" spacing={4} alignItems="flex-start">
                <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 100, pt: 1 }}>
                  사업장 주소
                </Typography>
                <Stack spacing={1} sx={{ flex: 1 }}>
                  <Typography variant="body2">{orgData.address}</Typography>
                  <Typography variant="body2">{orgData.detailAddress}</Typography>
                </Stack>
              </Stack>
            </Stack>

            <Stack spacing={2} sx={{ flex: 1 }}>
              <Stack direction="row" spacing={4} alignItems="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 100 }}>
                  최근 접속 IP
                </Typography>
                <Typography variant="body2">{orgData.lastAccessIp || '-'}</Typography>
              </Stack>
              <Stack direction="row" spacing={4} alignItems="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 100 }}>
                  구분
                </Typography>
                <Typography variant="body2">{orgData.division}</Typography>
              </Stack>
              <Stack direction="row" spacing={4} alignItems="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 100 }}>
                  사업자 번호
                </Typography>
                <Typography variant="body2">{orgData.businessNumber}</Typography>
              </Stack>
              <Stack direction="row" spacing={4} alignItems="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 100 }}>
                  업태
                </Typography>
                <Typography variant="body2">{orgData.businessCategory}</Typography>
              </Stack>
              <Stack direction="row" spacing={4} alignItems="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 100 }}>
                  대표 전화번호
                </Typography>
                <Typography variant="body2">{orgData.representativePhone}</Typography>
              </Stack>
              <Stack direction="row" spacing={4} alignItems="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 100 }}>
                  대표 이메일
                </Typography>
                <Typography variant="body2">{orgData.representativeEmail}</Typography>
              </Stack>
              <Stack direction="row" spacing={4} alignItems="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 100 }}>
                  담당자
                </Typography>
                <Typography variant="body2">{orgData.manager}</Typography>
              </Stack>
            </Stack>
          </Stack>

          {/* 버튼 */}
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="contained" color="info" onClick={onInviteMember}>
              조직원 초대
            </Button>
            <Button variant="outlined" onClick={onEditOrganization}>
              조직정보 수정
            </Button>
          </Stack>
        </Box>
      )}

      {tabValue === 1 && (
        <SubscriptionService
          onUpgrade={(planId) => {
            // TODO: TanStack Query Hook(useMutation)으로 서비스 업그레이드
            // const mutation = useMutation({
            //   mutationFn: (planId: string) => upgradeSubscriptionService(organizationId, planId),
            //   onSuccess: () => {
            //     queryClient.invalidateQueries({ queryKey: ['organization', organizationId, 'subscription'] });
            //   },
            // });
            // mutation.mutate(planId);
            console.log('서비스 업그레이드:', planId);
          }}
          onCancel={() => {
            // TODO: TanStack Query Hook(useMutation)으로 서비스 취소
            // const mutation = useMutation({
            //   mutationFn: () => cancelSubscriptionService(organizationId),
            //   onSuccess: () => {
            //     queryClient.invalidateQueries({ queryKey: ['organization', organizationId, 'subscription'] });
            //   },
            // });
            // mutation.mutate();
            console.log('서비스 취소');
          }}
          onAddCard={() => {
            // TODO: 카드 추가 모달 열기 (모달 내부에서 TanStack Query Hook(useMutation) 사용)
            // const mutation = useMutation({
            //   mutationFn: (cardData: CardFormData) => addPaymentCard(organizationId, cardData),
            //   onSuccess: () => {
            //     queryClient.invalidateQueries({ queryKey: ['organization', organizationId, 'paymentCards'] });
            //   },
            // });
            console.log('카드 추가');
          }}
          onCardMenuClick={(cardId, action) => {
            // TODO: TanStack Query Hook(useMutation)으로 카드 액션 처리 (대표 카드 설정, 수정, 삭제)
            // const mutation = useMutation({
            //   mutationFn: () => {
            //     if (action === 'setPrimary') return setPrimaryCard(organizationId, cardId);
            //     if (action === 'edit') return updatePaymentCard(organizationId, cardId, cardData);
            //     if (action === 'delete') return deletePaymentCard(organizationId, cardId);
            //   },
            //   onSuccess: () => {
            //     queryClient.invalidateQueries({ queryKey: ['organization', organizationId, 'paymentCards'] });
            //   },
            // });
            // mutation.mutate();
            console.log('카드 액션:', cardId, action);
          }}
        />
      )}
    </Box>
  );
}
